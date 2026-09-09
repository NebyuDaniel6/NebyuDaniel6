# Decisions

Architecture Decision Records for this repository. Each entry records what was chosen, why, and what was rejected.

## ADR-001 — Document model is the source of truth

**Decision.** Creative work is represented as a typed vector `DesignDocument` (artboards, named layers, text, shapes, images). Connectors *compile* that model. SVG, PDF, PNG, and Illustrator JSX are projections.

**Why.** Illustrator is not installed here. A model-first design lets the same job execute on an SVG engine today and inside Illustrator later without rewriting the agent.

**Rejected.** Driving the GUI as the primary production path. Clicking is a fallback tool, not the architecture.

## ADR-002 — Application connector abstraction

**Decision.** `ApplicationConnector` is a first-class interface. Illustrator is the first implementation. Photoshop, Figma, Blender, etc. register the same way. The orchestrator never imports Illustrator APIs directly.

**Why.** The product requirement is a creative department, not an Illustrator macro runner.

## ADR-003 — TypeScript / Node 22 / `node:sqlite`

**Decision.** Core runtime is TypeScript on Node 22. Persistence is SQLite via the built-in `node:sqlite` module (no native addon). HTTP is Hono. Validation is Zod.

**Why.** Node 22 is present, `node:sqlite` works without compiling `better-sqlite3`, and strong typing fits tool schemas. Python cairo/PIL were not installed; adding them was unnecessary.

**Trade-off.** `node:sqlite` is still experimental in Node 22. The storage layer is isolated in `src/db/` so it can move to `better-sqlite3` or Postgres later without touching the agent.

## ADR-004 — Heuristic planner when no LLM key exists

**Decision.** LLM access is optional. If no key is configured, a deterministic planner/copy/layout path runs. Traces record `planner: heuristic`. The system never fabricates “the model said…”.

**Why.** This environment had no API keys. The product must still *do the work* (layout, type, export, QC).

## ADR-005 — Editable output over raster generation

**Decision.** Default deliverables are: canonical JSON document, SVG with named layers and live text, Illustrator JSX, PDF, and PNG. Text is not outlined unless a print skill requests it.

**Why.** “Here is a PNG” is not the differentiator. Editable structure is.

## ADR-006 — Computer control is a tool with an allowlist

**Decision.** `ComputerTool` → `DesktopController`. Disabled unless `CREATIVE_AGENT_ALLOW_COMPUTER_CONTROL=1`. Destructive or irreversible OS actions are denied.

**Why.** GUI automation is dangerous and the wrong default. Programmatic backends must be tried first.

## ADR-007 — Multi-tenant schema, single-process deploy

**Decision.** Data model is User → Organization → Brand → Project → Task → Asset → Deliverable. Deploy is one Node process + SQLite files under `data/`.

**Why.** SaaS foundation without over-engineering infrastructure before the agent works.

## ADR-008 — Quality control is a separate agent stage

**Decision.** Production cannot mark a task complete without a QC result. QC returns `pass` or `revise` with structured findings. The orchestrator may iterate a bounded number of times, then stop for human approval.

**Why.** “Generate and declare victory” is the failure mode this product exists to avoid.

## ADR-009 — Brand memory distinguishes rule strength

**Decision.** Memories are tagged `explicit_rule` | `inferred_preference` | `campaign_temporary` | `approved_concept` | `rejected_concept`. Inferences never silently become brand rules.

**Why.** Weak inferences hardening into gospel is how brand systems rot.

## ADR-010 — Preserve the GitHub profile README intro

**Decision.** The original profile greeting remains at the top of `README.md`. Product documentation lives in `/docs` and below the intro.

**Why.** This remote is a GitHub profile repository. Destroying the profile page would be an unrelated side effect.

## ADR-011 — No fake Illustrator session

**Decision.** If Illustrator is closed or missing, the connector reports `unavailable` and uses the SVG document backend. It does not write a fake `.ai` binary or a fake screenshot of Illustrator.

**Why.** Fabricated success is explicitly forbidden.

## ADR-012 — Sample brand is seed data, not core logic

**Decision.** “Aether Residences” exists only as `pnpm seed` data so the pipeline can be exercised. No customer-specific rules are compiled into the agent.

## ADR-013 — Operator UI is an operator console, not a landing page

**Decision.** The HTTP UI is a working production console (brief in, trace out, files down, approve/reject). It is not a marketing site pretending the engine exists.
