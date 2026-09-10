- 👋 Hi, I’m @NebyuDaniel6
- 👀 I’m interested in coding ...
- 🌱 I’m currently learning to code from scratch ...
- 💞️ I’m looking to collaborate on building applications and website ...
- 📫 How to reach me nebdakam6@gmail.com ...

# Creative Department

A **local-business design studio** (subscription product): anyone can describe what they need, pick **color**, **accent color**, **font style**, **design style**, **Illustrator or Photoshop**, and **upload a picture** or take a **photo idea from the prompt**. It is not a one-brand org/brand/project console.

Natural-language briefs become planned, QC’d, **editable** deliverables. Org/brand/project exist only as internal storage.

**This Cloud Agent is not your Mac.** It cannot move your mouse or control the Illustrator copy on your laptop. See [Where this runs](docs/WHERE_THIS_RUNS.md).

On Linux (including Cursor Cloud) it produces SVG, ExtendScript (`.jsx`), Photoshop JSX, PDF, and PNG, and it **reports** that Adobe apps are unavailable. Run the same project **on your Mac with Illustrator or Photoshop open** to rebuild native documents. **Each format is its own Illustrator artboard** (coordinates are offset — artwork is not stacked on artboard 1). Photoshop gets **one document per format**.

## Quick start (on the computer that should do the work)

```bash
pnpm install
pnpm test
pnpm cli run --auto-approve --business "Harbor Bakery" --color "#1F3D34" --accent "#D4A017" --font friendly --style warm --app illustrator --formats instagram-post,instagram-story --photo-from-prompt --brief "Saturday tasting is on. Instagram post and story. Book a table."
pnpm serve
```

Studio UI: `http://127.0.0.1:8787` **on that same computer**. There is no Organization / Brand / Project picker.

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

**Cannot find `illustrator-job.jsx`?** It is not on `main` and not in `data/` on GitHub. Use the PR branch example: [examples/aether-reservations/illustrator-job.jsx](https://github.com/NebyuDaniel6/NebyuDaniel6/blob/cursor/ai-creative-department-c765/examples/aether-reservations/illustrator-job.jsx).
