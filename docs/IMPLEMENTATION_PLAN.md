# Implementation plan

Built against the environment in [ENVIRONMENT.md](./ENVIRONMENT.md). Prerequisites that are **missing** are called out; work continues on the backends that *do* exist.

## Blockers (cannot be cleared on this host)

| Blocker | Impact | Mitigation |
| --- | --- | --- |
| Adobe Illustrator not installed; Linux cannot run it | Cannot execute live Illustrator JSX or inspect a live `.ai` document | svg-document backend + JSX compiler; detect + switch when a Mac/Windows Illustrator host exists |
| No LLM API keys | LLM planner/copy unavailable | Heuristic planner; traces say so |
| No Photoshop / Figma / Blender | Later connectors idle | Interfaces only; not faked |

## Phase 1 — Environment, architecture, core agent, skills

- [x] Inspect OS, runtimes, apps, secrets-by-name
- [x] Architecture, environment, decisions docs
- [x] Skill YAML loader + registry
- [x] Orchestrator state machine
- [x] Heuristic brief analyzer + planner (LLM client stub wired, unused without keys)

## Phase 2 — Brand memory + asset library

- [x] Multi-tenant schema
- [x] Brand profile + typed memories
- [x] Asset ingest, metadata, search
- [x] Sample seed brand (data, not core)

## Phase 3 — Tool registry + task execution

- [x] Standardized tool interface (schema, permissions, risk)
- [x] Discovery (agent lists tools; tools are not baked into one prompt)
- [x] Task FSM + execution logs
- [x] Permission boundaries

## Phase 4 — Illustrator connector

- [x] Connector interface + registry
- [x] Environment detection
- [x] svg-document backend: create document, artboards, text, type, color, shapes, paths, place/resize/align/group/clip, layers, export PNG/JPG/PDF, save source, reopen, inspect
- [x] ExtendScript compiler for the same operations (executed only when Illustrator is present)
- [ ] Live Illustrator round-trip — **blocked** on app install

## Phase 5 — Computer-control fallback

- [x] DesktopController abstraction
- [x] xdotool + ffmpeg screenshot backend
- [x] Disabled by default; capability probe reports windows without claiming design-app control

## Phase 6 — Quality-control agent

- [x] Technical, visual, brand, brief checks
- [x] Structured PASS / REVISE
- [x] Bounded automatic revision

## Phase 7 — End-to-end workflow

- [x] CLI `run` and HTTP operator console
- [x] Brief → plan → (approval) → produce → QC → export → memory
- [x] Auto-approve vs require-approval policies per stage

## Phase 8 — Multi-brand / multi-tenant foundation

- [x] Org/brand/project scoping in the data model and API
- [ ] Hosted SaaS, auth provider, object storage — **out of scope** until the agent is the bottleneck

## Phase 9 — Additional creative applications

Not started. Connector slots exist. Do not implement Photoshop/Figma/Blender until Phase 7 is real — which, on this host, means the svg-document path plus honest Illustrator detection, not a fake Adobe session.

## Definition of done for this iteration

1. `pnpm test` passes.
2. `pnpm doctor` reports the real environment.
3. `pnpm seed` then `pnpm run -- …` produces SVG, PDF, PNG, JSX, and JSON for a sample brief.
4. QC can fail a document and force revision.
5. Missing Illustrator is reported, not hidden.
6. Docs match the code.
