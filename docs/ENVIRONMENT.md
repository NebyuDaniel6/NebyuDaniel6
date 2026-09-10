# Environment

Recorded from the machine that produced this repository snapshot. Re-run `pnpm doctor` to refresh. **Do not treat this as a guarantee that Adobe applications are present.**

## Operating system

| Fact | Value |
| --- | --- |
| OS | Ubuntu 24.04.4 LTS (Noble Numbat) |
| Kernel | Linux 6.12.94+ x86_64 |
| Display | `DISPLAY=:1` (Xvfb/VNC present) |
| User | `ubuntu` |
| Disk | ~254G, mostly free |

This is a **Linux** host. Adobe Illustrator, Photoshop, InDesign, Premiere Pro, and After Effects are not distributed as Linux desktop applications. Any claim that those apps can be driven here via GUI or ExtendScript would be fabricated.

## Runtimes found

| Runtime | Version | Path / notes |
| --- | --- | --- |
| Node.js | 22.14.0 (`PATH`) / 22.22.2 (nvm) | `/exec-daemon/node`, nvm |
| npm | 10.9.7 | |
| pnpm | 10.33.3 | used for this project |
| yarn | present | unused |
| Python | 3.12.3 | `/usr/bin/python3` |
| Go | 1.22.2 | unused |
| Rust | 1.83.0 | unused |
| OpenJDK | 21.0.10 | unused |
| gcc/g++/make/cmake | present | native addons possible |

Built-in `node:sqlite` works (experimental warning). No application-level database server is required.

## Package managers

- apt / apt-get / dpkg
- pnpm / npm / yarn
- pip (system Python)

## Creative applications

| Application | Installed? | Automation available? |
| --- | --- | --- |
| Adobe Illustrator | **No** | None. No binary, no CEP/UXP host, no AppleScript, no COM. |
| Adobe Photoshop | **No** | None |
| Adobe InDesign | **No** | None |
| Premiere Pro | **No** | None |
| After Effects | **No** | None |
| Figma desktop | **No** | None |
| Blender | **No** | None |
| Canva | **No** | None |
| Inkscape | **No** | Not installed |
| GIMP | **No** | None |
| ImageMagick | **No** | `convert` / `magick` missing |

**Honest production path on this host:** generate a structured vector document, compile it to editable SVG + Illustrator ExtendScript (`.jsx`) + PDF + PNG. When a macOS/Windows machine with Illustrator is later connected, the same document model can be executed inside Illustrator.

## Libraries that *are* present and used

| Library | Use |
| --- | --- |
| cairo / pango / harfbuzz / fontconfig / librsvg | system text/vector stack (not Python-bound) |
| ffmpeg 6.1.1 | computer-control screenshots via `x11grab` |
| xdotool 3.20160805.1 | computer-control fallback (click/type/key/focus) |
| Xvfb | headless display |
| google-chrome | PNG fallback rasterizer if `@resvg/resvg-js` fails |
| sqlite3 3.45.1 | CLI; app uses `node:sqlite` |
| Inter, Public Sans, Source Sans 3, JetBrains Mono, Noto | licensed system fonts we may embed |

Python `cairo` and `PIL` modules are **not** installed. They are not required.

## Computer control

Available as a **tool**, not mixed into agent reasoning:

- `xdotool` can focus windows, click, type, send keys
- `ffmpeg -f x11grab` can capture the screen
- `wmctrl` is **not** installed
- `scrot` is **not** installed

No Illustrator (or other design-app) window exists to control. The computer-control backend reports that honestly.

## Environment variables

Names observed (values not logged):

`AGENT_TRANSCRIPTS`, `CARGO_HOME`, `CURSOR_AGENT`, `CURSOR_AGENT_SOCKET`, `CURSOR_CONVERSATION_ID`, `CURSOR_REQUEST_ID`, `CURSOR_RIPGREP_PATH`, `DISPLAY`, `FORCE_COLOR`, `GH_TELEMETRY`, `GIT_*`, `HOME`, `LANG`, `LC_ALL`, `NO_COLOR`, `NVM_*`, `PATH`, `PWD`, `RUSTUP_HOME`, `RUST_VERSION`, `SHELL`, `TERM`, `USER`, `VNC_DPI`, `VNC_RESOLUTION`

**No API keys, tokens, or model credentials were present** at inspection time.

Optional variables the app reads (never printed):

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | optional LLM (OpenAI-compatible) |
| `OPENAI_BASE_URL` | optional base URL |
| `ANTHROPIC_API_KEY` | optional LLM |
| `CREATIVE_AGENT_LLM_MODEL` | model id |
| `CREATIVE_AGENT_DATA_DIR` | data directory (default `./data`) |
| `CREATIVE_AGENT_PORT` | HTTP port (default `8787`) |
| `ILLUSTRATOR_PATH` | override Illustrator binary path on Mac/Windows |
| `CREATIVE_AGENT_ALLOW_COMPUTER_CONTROL` | must be `1` to enable GUI fallback |

When no LLM key is configured, the agent uses the **heuristic planner**. It does not pretend an LLM ran.

## Manual install blockers (not done here)

These cannot be installed in this Linux environment in a supported way:

1. **Adobe Illustrator** (macOS or Windows license + app)
2. Other Adobe desktop apps
3. Figma desktop / Blender (optional future connectors; not required for Phase 7)

Optional later (not required for the current engine):

- Inkscape (additional SVG editor backend)
- ImageMagick
- Licensed brand fonts beyond the system set

## Repository at inspection

The git remote was `github.com/NebyuDaniel6/NebyuDaniel6` with a GitHub profile `README.md` and no application code. This product is built from that empty starting point. The original profile intro is preserved at the top of `README.md`.
