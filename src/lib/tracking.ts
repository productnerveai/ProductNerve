/**
 * UTM Tracking & Attribution System for Product Nerve AI
 *
 * - Captures UTM params from URL on landing
 * - Persists first-touch & last-touch in localStorage + cookies
 * - Generates session IDs
 * - Tracks events with full attribution context
 * - Sends data via the external Supabase tracking script
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
type UtmKey = typeof UTM_KEYS[number];
type UtmData = Partial<Record<UtmKey, string>>;

const STORAGE_FIRST_TOUCH = 'pn_utm_first_touch';
const STORAGE_LAST_TOUCH = 'pn_utm_last_touch';
const STORAGE_SESSION_ID = 'pn_session_id';
const STORAGE_SESSION_START = 'pn_session_start';
const STORAGE_PAGE_COUNT = 'pn_session_pages';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const DEBUG_KEY = 'pn_tracking_debug';

// ─── Helpers ──────────────────────────────────────────────

function isDebug(): boolean {
  try {
    return localStorage.getItem(DEBUG_KEY) === 'true';
  } catch {
    return false;
  }
}

export function enableTrackingDebug(on = true) {
  try { localStorage.setItem(DEBUG_KEY, String(on)); } catch {}
}

function debugLog(label: string, data?: unknown) {
  if (isDebug()) {
    console.log(`%c[PN Tracking] ${label}`, 'color:#0F555A;font-weight:bold', data ?? '');
  }
}

function normalize(val: string): string {
  return val.toLowerCase().replace(/\s+/g, '_').replace(/-+/g, '_');
}

function setCookie(name: string, value: string, days = 90) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getDeviceType(): string {
  return /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
}

function getBrowserOS() {
  const ua = navigator.userAgent;
  let browser = 'unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  let os = 'unknown';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';

  return { browser, os };
}

// ─── UTM Capture ──────────────────────────────────────────

function captureUtmsFromUrl(): UtmData | null {
  const params = new URLSearchParams(window.location.search);
  const utms: UtmData = {};
  let found = false;
  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) {
      utms[key] = normalize(val);
      found = true;
    }
  }
  return found ? utms : null;
}

function storeUtms(utms: UtmData) {
  try {
    // Always update last-touch
    const lastTouch = JSON.stringify(utms);
    localStorage.setItem(STORAGE_LAST_TOUCH, lastTouch);
    setCookie(STORAGE_LAST_TOUCH, lastTouch);
    debugLog('Last-touch UTMs stored', utms);

    // First-touch: only if not already set
    if (!localStorage.getItem(STORAGE_FIRST_TOUCH) && !getCookie(STORAGE_FIRST_TOUCH)) {
      const firstTouch = JSON.stringify(utms);
      localStorage.setItem(STORAGE_FIRST_TOUCH, firstTouch);
      setCookie(STORAGE_FIRST_TOUCH, firstTouch);
      debugLog('First-touch UTMs stored', utms);
    }
  } catch {}
}

export function getFirstTouchUtms(): UtmData {
  try {
    const raw = localStorage.getItem(STORAGE_FIRST_TOUCH) || getCookie(STORAGE_FIRST_TOUCH);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLastTouchUtms(): UtmData {
  try {
    const raw = localStorage.getItem(STORAGE_LAST_TOUCH) || getCookie(STORAGE_LAST_TOUCH);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ─── Session ──────────────────────────────────────────────

function getOrCreateSession(): string {
  try {
    const existing = sessionStorage.getItem(STORAGE_SESSION_ID);
    const lastActivity = sessionStorage.getItem(STORAGE_SESSION_START);
    const now = Date.now();

    if (existing && lastActivity && now - Number(lastActivity) < SESSION_TIMEOUT_MS) {
      sessionStorage.setItem(STORAGE_SESSION_START, String(now));
      return existing;
    }

    const newId = generateId();
    sessionStorage.setItem(STORAGE_SESSION_ID, newId);
    sessionStorage.setItem(STORAGE_SESSION_START, String(now));
    sessionStorage.setItem(STORAGE_PAGE_COUNT, '0');
    debugLog('New session started', newId);
    return newId;
  } catch {
    return generateId();
  }
}

function incrementPageCount() {
  try {
    const count = Number(sessionStorage.getItem(STORAGE_PAGE_COUNT) || '0');
    sessionStorage.setItem(STORAGE_PAGE_COUNT, String(count + 1));
  } catch {}
}

export function getSessionInfo() {
  return {
    session_id: getOrCreateSession(),
    pages_visited: Number(sessionStorage.getItem(STORAGE_PAGE_COUNT) || '0'),
    session_start: sessionStorage.getItem(STORAGE_SESSION_START) || null,
  };
}

// ─── Event Sending ────────────────────────────────────────

interface TrackEventOptions {
  event: string;
  user_id?: string | null;
  properties?: Record<string, unknown>;
}

let eventQueue: TrackEventOptions[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function buildPayload(opts: TrackEventOptions) {
  const { browser, os } = getBrowserOS();
  const firstTouch = getFirstTouchUtms();
  const lastTouch = getLastTouchUtms();

  return {
    event: opts.event,
    user_id: opts.user_id || null,
    session_id: getOrCreateSession(),
    timestamp: new Date().toISOString(),
    referrer: document.referrer || null,
    page_url: window.location.href,
    page_path: window.location.pathname,
    device_type: getDeviceType(),
    browser,
    os,
    utm_first_touch: firstTouch,
    utm_last_touch: lastTouch,
    ...firstTouch, // flat UTM fields for convenience
    ...opts.properties,
  };
}

function sendEvent(payload: Record<string, unknown>) {
  debugLog(`Event: ${payload.event}`, payload);

  // Use the external tracking script if available (window.tracker or similar)
  // Also use navigator.sendBeacon for reliability
  try {
    const url = 'https://ukljrermmssndohozbjn.supabase.co/functions/v1/sdk?project_id=1497561f-92b8-40ac-855a-6217cb9b351b';
    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}

function flushQueue() {
  const batch = eventQueue.splice(0);
  for (const item of batch) {
    sendEvent(buildPayload(item));
  }
}

export function trackEvent(event: string, properties?: Record<string, unknown>, userId?: string | null) {
  const opts: TrackEventOptions = { event, user_id: userId, properties };
  eventQueue.push(opts);

  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flushQueue, 100); // micro-batch
}

// ─── Page View ────────────────────────────────────────────

export function trackPageView(userId?: string | null) {
  incrementPageCount();
  trackEvent('page_view', { page_title: document.title }, userId);
}

// ─── Init ─────────────────────────────────────────────────

let initialized = false;

export function initTracking() {
  if (initialized) return;
  initialized = true;

  // Capture UTMs from current URL
  const utms = captureUtmsFromUrl();
  if (utms) {
    storeUtms(utms);
    debugLog('UTMs captured from URL', utms);
  }

  // Ensure session exists
  getOrCreateSession();

  debugLog('Tracking initialized', {
    firstTouch: getFirstTouchUtms(),
    lastTouch: getLastTouchUtms(),
    session: getSessionInfo(),
  });
}

// ─── Attribution for Signup ───────────────────────────────

export function getAttributionData() {
  return {
    first_touch: getFirstTouchUtms(),
    last_touch: getLastTouchUtms(),
    referrer: document.referrer || null,
    landing_page: localStorage.getItem('pn_landing_page') || null,
  };
}

export function captureLandingPage() {
  try {
    if (!localStorage.getItem('pn_landing_page')) {
      localStorage.setItem('pn_landing_page', window.location.href);
    }
  } catch {}
}
