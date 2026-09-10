export type FindingSeverity = "error" | "warning" | "info";

export interface QcFinding {
  area: "technical" | "visual" | "brand" | "brief";
  code: string;
  severity: FindingSeverity;
  message: string;
  suggestedFix?: string;
}

export interface QcReport {
  verdict: "pass" | "revise";
  findings: QcFinding[];
  score: number;
}

export function summarize(findings: QcFinding[]): QcReport {
  const blocking = findings.filter((f) => f.severity === "error");
  const score = Math.max(0, 100 - blocking.length * 18 - findings.filter((f) => f.severity === "warning").length * 6);
  return {
    verdict: blocking.length > 0 ? "revise" : "pass",
    findings,
    score,
  };
}
