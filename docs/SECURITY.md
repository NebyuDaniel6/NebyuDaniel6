# Security

## Boundaries

- Tools are allowlisted. High-risk tools outside the list are denied.
- `filesystem.*` resolves paths and rejects anything outside `data/`.
- `computer.click` / `type` / `key` require `CREATIVE_AGENT_ALLOW_COMPUTER_CONTROL=1`.
- Destructive risk requires `confirmDestructive`.
- Irreversible brand overwrites are `brand.update` (high).

## Secrets

- Environment values whose names look like keys/tokens are never logged.
- `src/lib/redact.ts` strips `sk-` and `ghp_` patterns from log lines.
- LLM keys are only read inside `src/agent/llm.ts` and never attached to traces.
- `GET /api/doctor` reports whether keys are *present*, not their values.

## Audit

`audit_log` and `tool_invocations` record actor, action, tool, risk, success, and redacted payloads. Task transitions are in `task_events`.

## Human gates

Direction and final approval default to **require** unless the caller passes `autoApprove` or the policy is set to `auto`. The product does not autonomously overwrite brand laws from weak inferences.
