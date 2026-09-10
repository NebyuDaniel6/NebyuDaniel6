# Testing

```bash
pnpm test
pnpm typecheck
pnpm doctor
```

## Coverage

| Area | File |
| --- | --- |
| Skill loading / selection | `tests/skills.test.ts` |
| Tool discovery | `tests/tools.test.ts` |
| Task planning | `tests/brief.test.ts` |
| Brand retrieval / memory | `tests/brand.test.ts` |
| Asset retrieval | `tests/assets.test.ts` |
| Illustrator detection + document ops | `tests/illustrator.test.ts` |
| Export / failure handling | `tests/illustrator.test.ts` |
| Permission boundaries | `tests/permissions.test.ts` |
| QC pass/revise | `tests/qc.test.ts` |
| Task transitions | `tests/tasks.test.ts` |
| End-to-end brief → files | `tests/e2e.test.ts` |

Integration tests talk to the real svg-document backend, SQLite, and exporters. They do **not** fake an Illustrator GUI.

`CREATIVE_AGENT_DATA_DIR` is set to `./data/test` in Vitest so developer `data/` is untouched.
