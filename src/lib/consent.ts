/**
 * Cookie / Analytics consent layer.
 * - Stores consent in localStorage (and on profile when logged-in)
 * - Dynamically loads GA4 + Meta Pixel ONLY after analytics consent is granted
 * - Gates PostHog initialization
 */

const STORAGE_KEY = "pn_cookie_consent";

export interface ConsentState {
  analytics: boolean;
  timestamp: string;
}

type Listener = (c: ConsentState | null) => void;
const listeners = new Set<Listener>();

export function getConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

export function setConsent(analytics: boolean) {
  const state: ConsentState = { analytics, timestamp: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((l) => l(state));

  // Persist to profile if logged in
  supabase.auth.getUser().then(({ data }) => {
    const uid = data?.user?.id;
    if (uid) {
      supabase
        .from("profiles")
        .update({
          cookie_consent: analytics,
          cookie_consent_at: state.timestamp,
        } as any)
        .eq("id", uid)
        .then(() => {});
    }
  });

  if (analytics) {
    loadAnalyticsScripts();
  } else {
    disableAnalytics();
  }
}

export function subscribeConsent(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let scriptsLoaded = false;

export function loadAnalyticsScripts() {
  if (scriptsLoaded) return;
  scriptsLoaded = true;

  // Google Analytics (GA4) + Google Ads
  const gaId = "G-8BQL0434HS";
  const adsId = "AW-18057737170";
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(s);
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", gaId);
  gtag("config", adsId);

  // Meta Pixel
  /* eslint-disable */
  ;(function (f: any, b: any, e: any, v: any) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t: any = b.createElement(e);
    t.async = true;
    t.src = v;
    const s: any = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  (window as any).fbq?.("init", "1225446006239760");
  (window as any).fbq?.("track", "PageView");
  /* eslint-enable */
}

function disableAnalytics() {
  // Opt out of GA tracking
  (window as any)[`ga-disable-G-8BQL0434HS`] = true;
  // Best-effort: clear gtag, fbq stubs
  (window as any).gtag = function () {};
  (window as any).fbq = function () {};
}

export function isAnalyticsAllowed(): boolean {
  return getConsent()?.analytics === true;
}
