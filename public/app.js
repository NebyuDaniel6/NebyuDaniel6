const state = { lastTaskId: null, pollTimer: null };

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api(path, opts) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function selectedFormats() {
  return [...document.querySelectorAll('input[name="format"]:checked')].map((el) => el.value);
}

function setBusy(busy, label) {
  const btn = document.getElementById("run");
  btn.disabled = busy;
  btn.textContent = busy ? "Working…" : "Make the campaign";
  if (label) document.getElementById("task-meta").textContent = label;
}

function showError(err) {
  document.getElementById("task-meta").textContent = `Failed · ${err}`;
  document.getElementById("qc").innerHTML = `<p class="muted">${err}</p>`;
}

function terminal(snap) {
  const status = snap.task?.status;
  return (
    snap.error ||
    snap.waitingFor ||
    status === "approved" ||
    status === "failed" ||
    status === "blocked"
  );
}

function fileUrl(f) {
  return `/api/files?path=${encodeURIComponent(f)}`;
}

function renderSnapshot(snap) {
  const task = snap.task;
  if (!task) return;
  state.lastTaskId = task.id;
  const app = snap.targetApp || task.policy?.studio?.targetApp || "illustrator";
  const elapsed = snap.running ? "working" : task.status;
  document.getElementById("task-meta").textContent = `${elapsed} · ${app} · ${task.id}`;
  const hostNote = [];
  if (snap.error) {
    hostNote.push(`<p class="muted">${snap.error.message || snap.error}</p>`);
  }
  if (snap.illustratorRuntime) {
    hostNote.push(`<p class="muted">${snap.illustratorRuntime.message}</p>`);
  }
  if (snap.photoshopRuntime && app === "photoshop") {
    hostNote.push(`<p class="muted">${snap.photoshopRuntime.message}</p>`);
  }
  const trace = document.getElementById("trace");
  trace.innerHTML = (snap.trace?.spans || [])
    .map((s) => `<li>${s.ok ? "✓" : "✕"} ${s.name}${s.detail?.planner ? ` (${s.detail.planner})` : ""}</li>`)
    .join("");
  const qc = snap.qc;
  const qcEl = document.getElementById("qc");
  if (qc) {
    qcEl.innerHTML = `${hostNote.join("")}<p>QC ${qc.verdict.toUpperCase()} · score ${qc.score}</p>
      <ul class="findings">${(qc.findings || [])
        .map((f) => `<li class="${f.severity}">${f.area} / ${f.code}: ${f.message}</li>`)
        .join("")}</ul>`;
  } else qcEl.innerHTML = hostNote.join("");
  const box = document.getElementById("approvals");
  if (snap.waitingFor) {
    box.classList.remove("hidden");
    document.getElementById("approval-copy").textContent =
      snap.waitingFor === "direction"
        ? `Proposed direction: ${snap.plan?.concept || "See plan."}`
        : "Final work is ready for approval.";
  } else box.classList.add("hidden");
  const files = snap.files || (snap.deliverables || []).map((d) => d.path);
  const previews = document.getElementById("previews");
  const images = files
    .filter((f) => /\.(svg|png|jpg|jpeg)$/i.test(f))
    .map((f) => {
      const src = fileUrl(f);
      return `<figure><img src="${src}" alt=""><figcaption>${f.split("/").pop()}</figcaption></figure>`;
    });
  const downloads = files
    .filter((f) => /\.(jsx|pdf|json)$/i.test(f))
    .map((f) => {
      const name = f.split("/").pop();
      return `<a class="file-link" href="${fileUrl(f)}" download="${name}">${name}</a>`;
    });
  previews.innerHTML = `${downloads.length ? `<div class="downloads">${downloads.join(" ")}</div>` : ""}${images.join("")}`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function pollUntilDone(taskId) {
  const started = Date.now();
  while (Date.now() - started < 90_000) {
    const snap = await api(`/api/tasks/${taskId}`);
    renderSnapshot(snap);
    const secs = Math.round((Date.now() - started) / 1000);
    if (!terminal(snap)) {
      document.getElementById("task-meta").textContent = `${snap.task.status} · ${secs}s · ${taskId}`;
    }
    if (terminal(snap)) return snap;
    await sleep(400);
  }
  throw new Error("Still running after 90s. Uncheck extra formats (A4 is large) and try again. Open Illustrator separately — this page no longer waits for it.");
}

async function runJob() {
  const file = document.getElementById("photo").files[0];
  if (file && file.size > 4 * 1024 * 1024) {
    showError("Photo must be under 4 MB.");
    return;
  }
  let photoBase64;
  let photoFilename;
  let photoMime;
  if (file) {
    photoBase64 = await fileToBase64(file);
    photoFilename = file.name;
    photoMime = file.type;
  }
  const body = {
    brief: document.getElementById("brief").value,
    businessName: document.getElementById("business").value,
    primaryColor: document.getElementById("primary").value,
    accentColor: document.getElementById("accent").value,
    fontStyle: document.getElementById("font").value,
    designStyle: document.getElementById("style").value,
    targetApp: document.getElementById("app").value,
    formats: selectedFormats(),
    photoFromPrompt: document.getElementById("photo-idea").checked && !file,
    photoBase64,
    photoFilename,
    photoMime,
    autoApprove: document.getElementById("auto").checked,
  };
  setBusy(true, "Starting…");
  try {
    const started = await api("/api/jobs", { method: "POST", body: JSON.stringify(body) });
    if (started.error) throw new Error(started.error);
    state.lastTaskId = started.task.id;
    renderSnapshot(started);
    if (terminal(started) && started.task.status !== "planning") {
      return;
    }
    await pollUntilDone(started.task.id);
  } catch (e) {
    showError(e.message || e);
  } finally {
    setBusy(false);
  }
}

async function decide(decision) {
  if (!state.lastTaskId) return;
  setBusy(true, "Continuing…");
  try {
    const snap = await api(`/api/tasks/${state.lastTaskId}/decision`, {
      method: "POST",
      body: JSON.stringify({ decision }),
    });
    if (snap.running || (snap.task && !terminal(snap))) {
      await pollUntilDone(snap.task.id);
      return;
    }
    renderSnapshot(snap);
  } catch (e) {
    showError(e.message || e);
  } finally {
    setBusy(false);
  }
}

document.getElementById("run").addEventListener("click", () => runJob());
document.getElementById("approve").addEventListener("click", () => decide("approve"));
document.getElementById("reject").addEventListener("click", () => decide("reject"));

(async function init() {
  try {
    const health = await api("/api/connectors");
    const illo = health.illustrator?.message || "Illustrator unknown";
    document.getElementById("connector-status").textContent = `${health.illustrator?.backend || "—"} · ${illo}`;
  } catch (err) {
    document.getElementById("connector-status").textContent = String(err);
  }
})();
