- 👋 Hi, I’m @NebyuDaniel6
- 👀 I’m interested in coding ...
- 🌱 I’m currently learning to code from scratch ...
- 💞️ I’m looking to collaborate on building applications and website ...
- 📫 How to reach me nebdakam6@gmail.com ...

# Creative Department

An autonomous **AI creative department**: natural-language briefs become planned, brand-aware, QC’d, **editable** deliverables. It is not a chatbot that describes design work.

Adobe Illustrator is the first application connector. This repository was started on a Linux host **without Illustrator installed**; the agent still produces real SVG (named layers, live type), Illustrator ExtendScript, PDF, and PNG, and it **reports** that Illustrator itself is unavailable.

## Quick start

```bash
pnpm install
pnpm test
pnpm seed
pnpm cli run --auto-approve --brief "Create a premium Instagram campaign for our real-estate project announcing that reservations are open. I need 1 Instagram post, 1 story, a Facebook cover, and an A4 poster."
pnpm serve
```

Operator console: `http://127.0.0.1:8787`

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Environment](docs/ENVIRONMENT.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Decisions](docs/DECISIONS.md)
- [Tools](docs/TOOLS.md)
- [Skills](docs/SKILLS.md)
- [Illustrator](docs/ILLUSTRATOR.md)
- [Security](docs/SECURITY.md)
- [Testing](docs/TESTING.md)

Optional LLM: set `OPENAI_API_KEY`. Without it, the heuristic planner runs and traces say so.
