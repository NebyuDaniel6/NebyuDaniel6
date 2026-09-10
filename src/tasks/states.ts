export type TaskStatus =
  | "planning"
  | "concept"
  | "awaiting_direction_approval"
  | "asset_preparation"
  | "production"
  | "quality_control"
  | "revision"
  | "awaiting_final_approval"
  | "export"
  | "approved"
  | "blocked"
  | "failed";

export const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  planning: ["concept", "blocked", "failed"],
  concept: ["awaiting_direction_approval", "asset_preparation", "blocked", "failed"],
  awaiting_direction_approval: ["asset_preparation", "failed"],
  asset_preparation: ["production", "blocked", "failed"],
  production: ["quality_control", "failed"],
  quality_control: ["revision", "awaiting_final_approval", "failed"],
  revision: ["production", "awaiting_final_approval", "failed"],
  awaiting_final_approval: ["export", "revision", "failed"],
  export: ["approved", "failed"],
  approved: [],
  blocked: ["planning"],
  failed: ["planning"],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return TRANSITIONS[from].includes(to);
}
