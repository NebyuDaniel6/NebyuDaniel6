# Where this runs

This product is **not** a remote control for the Illustrator app on your Mac.

## Two different computers

| Place | What happens |
| --- | --- |
| **Cursor Cloud Agent** (this Linux VM) | Designs, QC, SVG/PDF/PNG/JSX. **Cannot see your Mac, your mouse, or your copy of Illustrator.** |
| **Your Mac** (where Illustrator is installed) | Clone the repo, run the operator console **on the Mac**, keep Illustrator open. Then the agent drives Illustrator with **ExtendScript** (AppleScript `do javascript`), not by wiggling the mouse. |

A Cloud Agent session is an isolated remote machine. Your laptop’s cursor never moves because nothing in that session is attached to your display.

## Where is “the app”?

There is no Mac `.app` in the Dock from this repo. The UI is a local web console:

```bash
pnpm serve
# open http://127.0.0.1:8787  on the same computer that ran the command
```

If the Cloud Agent ran `pnpm serve`, that URL exists **inside the remote VM**, not on your Mac’s browser (unless you port-forward).

## Use it on your Mac with Illustrator

```bash
git clone https://github.com/NebyuDaniel6/NebyuDaniel6.git
cd NebyuDaniel6
git checkout cursor/ai-creative-department-c765   # or main once merged
pnpm install
pnpm seed
```

1. Open **Adobe Illustrator** (it must be running).
2. In Terminal on the Mac:

```bash
pnpm serve
```

3. In Safari/Chrome on the Mac: `http://127.0.0.1:8787`
4. Run a brief. After export, the agent calls:

`tell application "Adobe Illustrator" to do javascript file POSIX file "…/illustrator-job.jsx"`

You should see Illustrator come forward and build artboards. **The mouse should not roam.** That is intentional.

If Illustrator was closed, the job still writes `data/jobs/<task>/illustrator-job.jsx`. Then:

```bash
pnpm cli open-illustrator --jsx data/jobs/<task-id>/illustrator-job.jsx
```

You can also File → Scripts → Other Script… inside Illustrator and pick that `.jsx`.

Or open the `.svg` files in Illustrator — they are editable vector with named layers and live type.

## Do you always use it in the Cloud Agent?

No. Use the Cloud Agent to build and test the engine. Use **your Mac** whenever you want the real Illustrator application to execute the job.

Mouse/keyboard GUI control is a last-resort tool and is **off** unless you set `CREATIVE_AGENT_ALLOW_COMPUTER_CONTROL=1` on the machine that should receive those events (almost never your daily driver).
