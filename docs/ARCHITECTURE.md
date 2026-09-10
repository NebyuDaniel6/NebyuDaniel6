# Architecture

The product is an **AI Creative Department**: a brief goes in; a planned, brand-aware, QC’d set of **editable** deliverables comes out. It is not an image chatbot.

## North star

A business user submits a natural-language request plus brand context. The system understands the brief, asks only necessary questions, loads brand memory, plans the work, selects skills and tools, produces structured artwork, reviews it, iterates, and stores what was approved.

Illustrator is the **first** professional connector, not the architecture.

## Runtime shape

```
Operator UI / CLI
        │
        ▼
   HTTP API (Hono)
        │
        ▼
 Agent Orchestrator
   ├─ Brief analyzer
   ├─ Skill selector
   ├─ Task planner
   ├─ Approval gate
   ├─ Tool executor
   ├─ QC agent
   └─ Creative memory writer
        │
        ▼
 Tool registry  ──► Application connector registry
                        ├─ Illustrator connector
                        │    ├─ svg-document backend (available here)
                        │    ├─ extendscript backend (when Illustrator exists)
                        │    └─ computer-control backend (opt-in fallback)
                        ├─ (future) Photoshop / Figma / Blender / …
                        └─ ComputerTool → DesktopController
        │
        ▼
 Brand store · Asset library · Task store · Audit / traces
        │
        ▼
 SQLite + files under data/
```

## Major components

### A. User interface

`public/` is served by the API process. It supports:

- natural-language briefs
- format / variation / output requirements
- brand and project selection
- asset upload
- approval, rejection, revision
- task + execution history
- download of SVG / PDF / PNG / JSX / canonical JSON

The UI talks only to HTTP routes. It does not contain agent logic.

### B. Agent orchestrator

`src/agent/orchestrator.ts` is a state machine, not a single prompt.

Stages: `intake` → `analyze` → `load_brand` → `select_skills` → `plan` → `await_direction_approval` → `prepare_assets` → `produce` → `qc` → `revise?` → `await_final_approval` → `export` → `remember`.

Each stage records a trace span. Failures are returned as structured errors (`illustrator_unavailable`, `missing_asset`, `missing_font`, `export_failed`, `needs_human`). Nothing is marked successful unless the corresponding tool result is `ok`.

### C. Skill system

Skills live in `/skills/<id>/skill.yaml` plus optional `instructions.md`. They are versioned, discoverable, and selected by the skill selector. The orchestrator never hard-codes “always use Illustrator”; it asks the selector which skills (and therefore which tools) apply.

### D. Brand memory

Per organization and brand: colors, type, logos, tone, restrictions, audience, competitors, templates, approved/rejected examples. Memories carry a **strength** so inferences stay inferences.

### E. Asset library

Files on disk, metadata in SQLite. Search is metadata + description. Assets are scoped to an organization and optionally a brand.

### F. Task system

A creative job is a `Task` with a finite state machine:

`planning → concept → awaiting_direction_approval → asset_preparation → production → quality_control → revision → awaiting_final_approval → export → approved | blocked | failed`

Every transition is logged.

## Design document model

`src/document/` defines artboards, layers, and nodes (text, rect, ellipse, path, image, group, clip). Layout recipes in skills + brand tokens produce a document. Exporters compile it.

Coordinate system in the model: origin top-left, Y down, units px (export backends convert as needed; Illustrator JSX converts to Illustrator’s Y-up space).

## Illustrator connector

See [ILLUSTRATOR.md](./ILLUSTRATOR.md). The connector advertises capabilities and the **active backend**. On this Linux host the active backend is `svg-document`. The ExtendScript backend is implemented and covered by tests; it is selected only when Illustrator is actually detected.

## Computer control

See tool `computer.*`. Implementation: `src/computer/`. The orchestrator may call it only if:

1. a programmatic backend cannot perform the operation, and
2. the tool is allowlisted, and
3. `CREATIVE_AGENT_ALLOW_COMPUTER_CONTROL=1`.

## Quality control

`src/qc/` evaluates technical, visual, brand, and brief criteria. Result is `pass` or `revise` with codes, severity, and suggested fixes the producer can apply (e.g. increase type size, raise contrast, pull overflowing text).

## Security

See [SECURITY.md](./SECURITY.md). Tools declare permissions and risk. Filesystem writes are confined to the data directory. Secrets are redacted from logs and traces. Destructive operations require confirmation.

## Multi-tenant foundation

Tables: users, organizations, memberships, brands, projects, tasks, assets, deliverables, memories, traces, audit events. A single local process is enough for Phase 8. Postgres can replace SQLite later without changing domain types.

## What this architecture refuses to do

- Pretend Illustrator ran
- Outline all type to hide missing fonts
- Store inferred taste as a brand law
- Mix mouse-click code into the planner
- Hard-code a single customer’s campaign rules into the engine
