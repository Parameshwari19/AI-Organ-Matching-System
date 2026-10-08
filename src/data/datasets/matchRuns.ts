export type MatchRunStatus = "Completed" | "In Progress" | "Cancelled";

export interface MatchRun {
  id: string;
  organId: string;
  initiatedByStaffId: string;
  startedAt: string;
  status: MatchRunStatus;
}

/** No persisted matching runs exist in the prototype yet. */
export const matchRuns: MatchRun[] = [];
