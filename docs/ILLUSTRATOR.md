# Illustrator connector

Illustrator is the first `ApplicationConnector`. It is not the whole product.

## Detection (honest)

`src/connectors/illustrator/detect.ts` looks for:

- `ILLUSTRATOR_PATH`
- `illustrator` on `PATH`
- Standard macOS `.app` locations
- A running process named illustrator

On this Linux host: **not installed, not running**. AppleScript and COM are unavailable.

## Backends

| Backend | When used | What it actually does |
| --- | --- | --- |
| `svg-document` | Default here | Typed document model → SVG (named layers, live text), JSON source, PNG/JPEG, PDF, ExtendScript `.jsx` |
| `extendscript` | Illustrator installed **and** running on macOS/Windows | Executes the compiled JSX via `osascript` (macOS). Windows COM is stubbed until a Windows host is detected. |
| `computer-control` | Only if `CREATIVE_AGENT_ALLOW_COMPUTER_CONTROL=1` **and** Illustrator is the focused app | Screenshot / identify. Will not click if the foreground app is not Illustrator. |

## Capabilities (model)

create document, size, artboards, text (create/edit), fonts, sizes, colors, shapes, paths, place/resize/position images, align/distribute/group, clipping masks, named layers, export PNG/JPG/PDF, save editable source, reopen, inspect.

On this host those operations run against the document model. They are not simulated screenshots of Illustrator.

## ExtendScript

`src/document/export/jsx.ts` compiles the same document to Illustrator JavaScript (`#target illustrator`). Open that file on a machine with Illustrator to rebuild native text frames and layers.

If Illustrator is closed, `run_extendscript` returns `illustrator_closed` or `illustrator_unavailable`. It does not pretend the script ran.

## File types

| File | Role |
| --- | --- |
| `document.json` | Canonical source |
| `*.svg` | Editable vector (open in Illustrator / Figma / Inkscape) |
| `illustrator-job.jsx` | Native rebuild script |
| `*.png` / `*.jpg` | Raster proof |
| `campaign.pdf` | Print/share proof |

A binary proprietary `.ai` is **not** written here. Generating a fake `.ai` header would be dishonest. JSX + SVG are the real editable artifacts until a licensed Illustrator host compiles them to `.ai`.
