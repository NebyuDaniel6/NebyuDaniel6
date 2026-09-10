import type { RunSnapshot } from "../agent/orchestrator.ts";

export const STUDIO_VERSION = "0.2.3-studio";

export function publicSnapshot(snap: RunSnapshot) {
  const studio = snap.task.policy?.studio;
  return {
    version: STUDIO_VERSION,
    task: {
      id: snap.task.id,
      status: snap.task.status,
      title: snap.task.title,
      policy: {
        direction: snap.task.policy.direction,
        final: snap.task.policy.final,
        studio: studio
          ? {
              businessName: studio.businessName,
              primaryColor: studio.primaryColor,
              accentColor: studio.accentColor,
              fontStyle: studio.fontStyle,
              designStyle: studio.designStyle,
              targetApp: studio.targetApp,
              formats: studio.formats,
            }
          : undefined,
      },
    },
    files: snap.files ?? [],
    qc: snap.qc ?? null,
    plan: snap.plan
      ? { planner: snap.plan.planner, concept: snap.plan.concept, copy: snap.plan.copy }
      : null,
    trace: {
      taskId: snap.trace.taskId,
      toolsUsed: snap.trace.toolsUsed,
      result: snap.trace.result,
      spans: (snap.trace.spans ?? []).map((s) => ({
        name: s.name,
        ok: s.ok,
        detail: s.detail?.planner ? { planner: s.detail.planner } : undefined,
      })),
    },
    illustratorRuntime: snap.illustratorRuntime,
    photoshopRuntime: snap.photoshopRuntime,
    targetApp: snap.targetApp,
    waitingFor: snap.waitingFor,
    error: snap.error,
  };
}
