# Tools

The agent discovers tools from the registry. It does not receive a hard-coded laundry list inside a single prompt.

## Interface

Each tool declares:

- `name`
- `description`
- `inputSchema` / `outputSchema` (Zod)
- `permissions`
- `application` (optional)
- `risk` (`low` | `medium` | `high` | `destructive`)

Invocations are persisted to `tool_invocations` with redacted payloads.

## Built-in tools

| Name | Risk | Notes |
| --- | --- | --- |
| `brand.get` | low | Load profile |
| `brand.update` | high | Replace profile |
| `brand.remember` | medium | Strength-tagged memory |
| `asset.search` | low | Metadata search |
| `asset.get` | low | Single asset |
| `asset.ingest` | medium | Store bytes in `data/assets` |
| `filesystem.read` | low | Confined to `data/` |
| `filesystem.write` | medium | Confined to `data/` |
| `illustrator.create_document` | medium | Connector |
| `illustrator.inspect` | low | Document state |
| `illustrator.export` | medium | svg/png/jpg/pdf/jsx/json |
| `illustrator.save_source` | medium | json+svg+jsx |
| `computer.identify_application` | low | Window title |
| `computer.screenshot` | low | ffmpeg x11grab |
| `computer.click` | high | Disabled unless `CREATIVE_AGENT_ALLOW_COMPUTER_CONTROL=1` |
| `computer.type` | high | Same gate |
| `computer.key` | high | Same gate |

Destructive tools require `confirmDestructive` on the tool context. Writes outside `data/` throw.

List at runtime: `pnpm cli tools` or `GET /api/tools`.
