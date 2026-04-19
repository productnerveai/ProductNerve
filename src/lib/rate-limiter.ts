/**
 * Client-side rate limiter using localStorage.
 * Tracks AI calls per user to prevent abuse.
 */

const RATE_LIMIT_KEY = "pn_ai_rate_limits";
const MAX_AI_CALLS_PER_MINUTE = 10;
const MAX_AI_CALLS_PER_HOUR = 60;
const REGEN_KEY_PREFIX = "pn_regen_count_";

interface RateBucket {
  calls: number[];
}

function getBucket(): RateBucket {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { calls: [] };
    return JSON.parse(raw);
  } catch {
    return { calls: [] };
  }
}

function saveBucket(bucket: RateBucket) {
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(bucket));
}

export function checkRateLimit(): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const bucket = getBucket();

  // Clean old entries (older than 1 hour)
  bucket.calls = bucket.calls.filter((ts) => now - ts < 3600000);

  const lastMinute = bucket.calls.filter((ts) => now - ts < 60000).length;
  const lastHour = bucket.calls.length;

  if (lastMinute >= MAX_AI_CALLS_PER_MINUTE) {
    return { allowed: false, reason: "Too many requests. Please wait a minute before trying again." };
  }
  if (lastHour >= MAX_AI_CALLS_PER_HOUR) {
    return { allowed: false, reason: "Hourly limit reached. Please try again later." };
  }

  return { allowed: true };
}

export function recordAICall() {
  const bucket = getBucket();
  bucket.calls.push(Date.now());
  saveBucket(bucket);
}

/**
 * Regeneration tracking — max 1 regen per phase per project.
 */
export function getRegenCount(projectId: string, phase: string): number {
  try {
    const val = localStorage.getItem(`${REGEN_KEY_PREFIX}${projectId}_${phase}`);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementRegenCount(projectId: string, phase: string) {
  const current = getRegenCount(projectId, phase);
  localStorage.setItem(`${REGEN_KEY_PREFIX}${projectId}_${phase}`, String(current + 1));
}

export function canRegenerate(projectId: string, phase: string): boolean {
  return getRegenCount(projectId, phase) < 1;
}
