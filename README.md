- 👋 Hi, I’m @NebyuDaniel6
- 👀 I’m interested in coding ...
- 🌱 I’m currently learning to code from scratch ...
- 💞️ I’m looking to collaborate on building applications and website ...
- 📫 How to reach me nebdakam6@gmail.com ...

# Creative Department

An autonomous **AI creative department**: natural-language briefs become planned, brand-aware, QC’d, **editable** deliverables. It is not a chatbot that describes design work.

**This Cloud Agent is not your Mac.** It cannot move your mouse or control the Illustrator copy on your laptop. See [Where this runs](docs/WHERE_THIS_RUNS.md).

Adobe Illustrator is the first application connector. On Linux (including Cursor Cloud) it produces SVG, ExtendScript (`.jsx`), PDF, and PNG, and it **reports** that Illustrator itself is unavailable. Run the same project **on your Mac with Illustrator open** to rebuild native documents.

## Quick start (on the computer that should do the work)

```bash
pnpm install
pnpm test
pnpm seed
pnpm cli run --auto-approve --brief "Create a premium Instagram campaign for our real-estate project announcing that reservations are open. I need 1 Instagram post, 1 story, a Facebook cover, and an A4 poster."
pnpm serve
```

Operator console: `http://127.0.0.1:8787` **on that same computer**.

On a Mac with Illustrator running, a successful job will activate Illustrator and run `illustrator-job.jsx` (no mouse). If Illustrator was closed:

```bash
pnpm cli open-illustrator --jsx data/jobs/<task-id>/illustrator-job.jsx
```

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Where this runs](docs/WHERE_THIS_RUNS.md)
- [Environment](docs/ENVIRONMENT.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Decisions](docs/DECISIONS.md)
- [Tools](docs/TOOLS.md)
- [Skills](docs/SKILLS.md)
- [Illustrator](docs/ILLUSTRATOR.md)
- [Security](docs/SECURITY.md)
- [Testing](docs/TESTING.md)

Optional LLM: set `OPENAI_API_KEY`. Without it, the heuristic planner runs and traces say so.
