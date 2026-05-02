/**
 * Shared utilities for scoring engine components.
 * Provides HTML response detection, safe JSON parsing, and fetch helpers.
 */

/**
 * Safely fetch a scoring endpoint, guarding against HTML responses and timeouts.
 * Returns { ok, data, error }.
 */
export async function safeScoringFetch(
  url: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; data: any; error: string | null }> {
  try {
    const resp = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(body),
    });

    const contentType = resp.headers.get("content-type") || "";
    const rawText = await resp.text();

    // Guard: detect HTML response (server error page, redirect, etc.)
    if (!contentType.includes("application/json") || /^\s*</.test(rawText)) {
      console.error("Scoring returned non-JSON response:", rawText.slice(0, 200));
      return {
        ok: false,
        data: null,
        error: "Server returned an unexpected response. Please try again.",
      };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error("Failed to parse scoring JSON:", rawText.slice(0, 200));
      return {
        ok: false,
        data: null,
        error: "Invalid response format from scoring engine.",
      };
    }

    if (!resp.ok) {
      return {
        ok: false,
        data: parsed,
        error: parsed?.error || `Scoring failed (HTTP ${resp.status})`,
      };
    }

    return { ok: true, data: parsed, error: null };
  } catch (e: any) {
    console.error("Scoring fetch error:", e);
    return {
      ok: false,
      data: null,
      error: e.message || "Network error during scoring.",
    };
  }
}
