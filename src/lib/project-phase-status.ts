// import { supabase } from "@/integrations/supabase/client";

export type ProjectPhaseKey = "phase1" | "phase2" | "phase3";

const PHASE_STATUS_COLUMNS: Record<ProjectPhaseKey, "phase1_status" | "phase2_status" | "phase3_status"> = {
  phase1: "phase1_status",
  phase2: "phase2_status",
  phase3: "phase3_status",
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const isPhaseComplete = (status?: string | null) => status === "complete" || status === "locked";

export async function fetchProjectPhaseStatus(projectId: string, phase: ProjectPhaseKey) {
  const statusColumn = PHASE_STATUS_COLUMNS[phase];
  // const { data, error } = await supabase
  //   .from("projects")
  //   .select(statusColumn)
  //   .eq("id", projectId)
  //   .maybeSingle();

  // if (error) {
  //   throw error;
  // }

  // return (data as Record<string, string | null> | null)?.[statusColumn] ?? null;
}

export async function waitForProjectPhaseStatus(
  projectId: string,
  phase: ProjectPhaseKey,
  options?: {
    attempts?: number;
    delayMs?: number;
    predicate?: (status: string | null) => boolean;
  },
) {
  const attempts = options?.attempts ?? 4;
  const delayMs = options?.delayMs ?? 350;
  const predicate = options?.predicate ?? isPhaseComplete;

  let latestStatus: string | null = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    // latestStatus = await fetchProjectPhaseStatus(projectId, phase);

    if (predicate(latestStatus)) {
      return latestStatus;
    }

    if (attempt < attempts - 1) {
      await delay(delayMs);
    }
  }

  return latestStatus;
}

export async function lockPhaseAndConfirm(projectId: string, phase: ProjectPhaseKey) {
  const statusColumn = PHASE_STATUS_COLUMNS[phase];
  // const { data, error } = await supabase
  //   .from("projects")
  //   .update({ [statusColumn]: "locked" })
  //   .eq("id", projectId)
  //   .select(statusColumn)
  //   .maybeSingle();

  // if (error) {
  //   throw error;
  // }

  // const updatedStatus = (data as Record<string, string | null> | null)?.[statusColumn] ?? null;

  // if (isPhaseComplete(updatedStatus)) {
  //   return updatedStatus;
  // }

  return waitForProjectPhaseStatus(projectId, phase, { predicate: isPhaseComplete });
}