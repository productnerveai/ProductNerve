/**
 * Auto-save and restore intake progress using localStorage.
 * Persists chat messages and progress per project/phase.
 */

const AUTOSAVE_KEY_PREFIX = "pn_intake_progress_";

interface IntakeProgress {
  messages: { role: string; content: string }[];
  completedAreas: number;
  started: boolean;
  savedAt: number;
}

function getKey(projectId: string, phase: string): string {
  return `${AUTOSAVE_KEY_PREFIX}${projectId}_${phase}`;
}

export function saveIntakeProgress(
  projectId: string,
  phase: string,
  data: Omit<IntakeProgress, "savedAt">
): void {
  try {
    const key = getKey(projectId, phase);
    const payload: IntakeProgress = { ...data, savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Silent fail — localStorage might be full
  }
}

export function loadIntakeProgress(
  projectId: string,
  phase: string
): IntakeProgress | null {
  try {
    const key = getKey(projectId, phase);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: IntakeProgress = JSON.parse(raw);
    // Expire after 24 hours
    if (Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearIntakeProgress(projectId: string, phase: string): void {
  try {
    localStorage.removeItem(getKey(projectId, phase));
  } catch {
    // Silent fail
  }
}
