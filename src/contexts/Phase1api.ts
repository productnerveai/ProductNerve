// services/phase1Api.ts
// Centralised API client for all Phase 1 backend endpoints

const BASE = "/api/phase1";

// ─────────────────────────────────────────────
// Generic fetch helper
// ─────────────────────────────────────────────
async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });

  const json = await res.json().catch(() => ({ success: false, error: "Invalid JSON response" }));

  if (!res.ok) {
    return { success: false, error: json.error || `HTTP ${res.status}` };
  }

  return json;
}

// ─────────────────────────────────────────────
// INTAKE
// ─────────────────────────────────────────────

/** GET /api/phase1/intake/:projectId — get or create intake record */
export async function getIntake(projectId: string) {
  return apiFetch(`${BASE}/intake/${projectId}`);
}

/** POST /api/phase1/intake/:projectId/submit — submit initial venture idea */
export async function submitInitialIdea(
  projectId: string,
  payload: {
    idea_description?: string;
    problem_statement?: string;
    target_users?: string;
    target_market?: string;
    monetization_model?: string;
    founder_background?: string;
    core_assumptions?: string;
  }
) {
  return apiFetch(`${BASE}/intake/${projectId}/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** POST /api/phase1/intake/:projectId/generate-questions — generate AI follow-up questions */
export async function generateFollowUpQuestions(projectId: string) {
  return apiFetch(`${BASE}/intake/${projectId}/generate-questions`, {
    method: "POST",
  });
}

/** POST /api/phase1/intake/:projectId/follow-up — submit follow-up responses */
export async function submitFollowUpResponses(
  projectId: string,
  responses: Record<string, string>
) {
  return apiFetch(`${BASE}/intake/${projectId}/follow-up`, {
    method: "POST",
    body: JSON.stringify(responses),
  });
}

/** POST /api/phase1/intake/:projectId/complete — mark intake complete */
export async function completeIntake(projectId: string) {
  return apiFetch(`${BASE}/intake/${projectId}/complete`, { method: "POST" });
}

/** GET /api/phase1/intake/:projectId/conversation — get conversation history */
export async function getConversation(projectId: string) {
  return apiFetch(`${BASE}/intake/${projectId}/conversation`);
}

/** PATCH /api/phase1/intake/:projectId/status — update intake status */
export async function updateIntakeStatus(
  projectId: string,
  status: "not_started" | "in_progress" | "follow_up_pending" | "completed" | "failed"
) {
  return apiFetch(`${BASE}/intake/${projectId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ─────────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────────

/** GET /api/phase1/scoring/:projectId — get scoring status */
export async function getScoringStatus(projectId: string) {
  return apiFetch(`${BASE}/scoring/${projectId}`);
}

/** POST /api/phase1/scoring/:projectId/start — trigger async scoring */
export async function startScoring(projectId: string) {
  return apiFetch(`${BASE}/scoring/${projectId}/start`, { method: "POST" });
}

/** GET /api/phase1/scoring/:projectId/results — get completed results */
export async function getScoringResults(projectId: string) {
  return apiFetch(`${BASE}/scoring/${projectId}/results`);
}

/** POST /api/phase1/scoring/:projectId/rerun — re-run scoring */
export async function rerunScoring(projectId: string) {
  return apiFetch(`${BASE}/scoring/${projectId}/rerun`, { method: "POST" });
}

/** GET /api/phase1/scoring/:projectId/summary — lightweight dashboard summary */
export async function getScoringSummary(projectId: string) {
  return apiFetch(`${BASE}/scoring/${projectId}/summary`);
}

// ─────────────────────────────────────────────
// FILES
// ─────────────────────────────────────────────

export interface FileRequest {
  fileId?: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

/** POST /api/phase1/files/:projectId/upload-urls — get presigned upload URLs */
export async function getUploadUrls(projectId: string, files: FileRequest[]) {
  return apiFetch(`${BASE}/files/${projectId}/upload-urls`, {
    method: "POST",
    body: JSON.stringify({ files }),
  });
}

/** PUT to presigned URL — upload file directly to storage */
export async function uploadFileToStorage(
  uploadUrl: string,
  file: File
): Promise<boolean> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  return res.ok;
}

/** POST /api/phase1/files/:projectId/confirm-upload — confirm upload completion */
export async function confirmUpload(
  projectId: string,
  fileInfos: Array<{
    fileName: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    category?: string;
  }>
) {
  return apiFetch(`${BASE}/files/${projectId}/confirm-upload`, {
    method: "POST",
    body: JSON.stringify({ fileInfos }),
  });
}

/** GET /api/phase1/files/:projectId — list files with download URLs */
export async function getFiles(projectId: string) {
  return apiFetch(`${BASE}/files/${projectId}`);
}

/** DELETE /api/phase1/files/:projectId/:fileId — delete a file */
export async function deleteFile(projectId: string, fileId: string) {
  return apiFetch(`${BASE}/files/${projectId}/${fileId}`, { method: "DELETE" });
}

/** GET /api/phase1/files/:projectId/:fileId/download — get download URL */
export async function getFileDownloadUrl(projectId: string, fileId: string) {
  return apiFetch(`${BASE}/files/${projectId}/${fileId}/download`);
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

/** GET /api/phase1/dashboard/:projectId — full dashboard data */
export async function getDashboardData(projectId: string) {
  return apiFetch(`${BASE}/dashboard/${projectId}`);
}

/** GET /api/phase1/dashboard/:projectId/summary — executive summary */
export async function getExecutiveSummary(projectId: string) {
  return apiFetch(`${BASE}/dashboard/${projectId}/summary`);
}

/** GET /api/phase1/dashboard/:projectId/layers — layer breakdown */
export async function getLayerBreakdown(projectId: string) {
  return apiFetch(`${BASE}/dashboard/${projectId}/layers`);
}

/** GET /api/phase1/dashboard/:projectId/risks — risk analysis */
export async function getRiskAnalysis(projectId: string) {
  return apiFetch(`${BASE}/dashboard/${projectId}/risks`);
}

/** GET /api/phase1/dashboard/:projectId/routes — strategic routes */
export async function getStrategicRoutes(projectId: string) {
  return apiFetch(`${BASE}/dashboard/${projectId}/routes`);
}

/** GET /api/phase1/dashboard/:projectId/assumptions — assumptions + gaps */
export async function getAssumptionsAndGaps(projectId: string) {
  return apiFetch(`${BASE}/dashboard/${projectId}/assumptions`);
}

/** GET /api/phase1/dashboard/:projectId/validation-report — full validation report */
export async function getValidationReport(projectId: string) {
  return apiFetch(`${BASE}/dashboard/${projectId}/validation-report`);
}

/** GET /api/phase1/dashboard/:projectId/history — scoring version history */
export async function getScoringHistory(projectId: string) {
  return apiFetch(`${BASE}/dashboard/${projectId}/history`);
}

/** GET /api/phase1/dashboard/:projectId/export — export data for PDF */
export async function getExportData(projectId: string) {
  return apiFetch(`${BASE}/dashboard/${projectId}/export`);
}

// ─────────────────────────────────────────────
// TRANSITION
// ─────────────────────────────────────────────

/** GET /api/phase1/transition/:projectId/status — transition readiness */
export async function getTransitionStatus(projectId: string) {
  return apiFetch(`${BASE}/transition/${projectId}/status`);
}

/** POST /api/phase1/transition/:projectId/lock — lock Phase 1 */
export async function lockPhase1(projectId: string, reason?: string) {
  return apiFetch(`${BASE}/transition/${projectId}/lock`, {
    method: "POST",
    body: JSON.stringify({ confirm_lock: true, reason }),
  });
}

/** POST /api/phase1/transition/:projectId/unlock — unlock Phase 1 */
export async function unlockPhase1(projectId: string, reason: string) {
  return apiFetch(`${BASE}/transition/${projectId}/unlock`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

/** POST /api/phase1/transition/:projectId/proceed — transition to Phase 2 */
export async function proceedToPhase2(projectId: string) {
  return apiFetch(`${BASE}/transition/${projectId}/proceed`, {
    method: "POST",
    body: JSON.stringify({ confirm_proceed: true }),
  });
}

/** GET /api/phase1/transition/:projectId/summary — Phase 1 completion summary */
export async function getPhase1Summary(projectId: string) {
  return apiFetch(`${BASE}/transition/${projectId}/summary`);
}

// ─────────────────────────────────────────────
// POLLING HELPER
// ─────────────────────────────────────────────

/**
 * Poll getScoringStatus until status is "completed" or "failed".
 * Resolves with the final status string.
 */
export async function pollScoringUntilDone(
  projectId: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<"completed" | "failed" | "timeout"> {
  const { intervalMs = 3000, timeoutMs = 180_000 } = opts;
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve) => {
    const tick = async () => {
      if (Date.now() > deadline) {
        resolve("timeout");
        return;
      }

      const res = await getScoringStatus(projectId);
      const status = res.data?.scoring_status ?? res.data?.intake_status;

      if (status === "completed") {
        resolve("completed");
      } else if (status === "failed") {
        resolve("failed");
      } else {
        setTimeout(tick, intervalMs);
      }
    };

    tick();
  });
}