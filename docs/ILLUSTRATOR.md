# Illustrator connector

Illustrator is the first `ApplicationConnector`. It is not the whole product.

**A Cloud Agent on Linux cannot control Illustrator on your Mac.** See [WHERE_THIS_RUNS.md](./WHERE_THIS_RUNS.md).

## Detection (honest)

`src/connectors/illustrator/detect.ts` looks for:

- `ILLUSTRATOR_PATH`
- `illustrator` on `PATH`
- Standard macOS `.app` locations
- A running process whose name contains `illustrator`

On the Cloud Agent Linux host: **not installed, not running**. AppleScript and COM are unavailable.

## How Illustrator is driven (not the mouse)

The intended Mac path is **ExtendScript**, not GUI clicking:

```
tell application "Adobe Illustrator"
  activate
  do javascript file POSIX file "/path/to/illustrator-job.jsx"
end tell
```

You should see Illustrator come to the front and create artboards. The pointer should stay still.

Mouse control (`computer.click`) is a separate, dangerous fallback and is **disabled** unless `CREATIVE_AGENT_ALLOW_COMPUTER_CONTROL=1` on **that same machine**.

## Backends

| Backend | When used | What it actually does |
| --- | --- | --- |
| `svg-document` | Default on Linux / when Illustrator is missing | Typed document model → SVG (named layers, live text), JSON source, PNG/JPEG, PDF, ExtendScript `.jsx` |
| `extendscript` | Illustrator installed **and** running on this Mac | After export, runs the compiled JSX via `osascript`. `pnpm cli open-illustrator --jsx …` does the same. |
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
