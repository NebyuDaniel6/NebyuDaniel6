const state = { lastTaskId: null, photo: null };

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

function renderSnapshot(snap) {
  const task = snap.task;
  state.lastTaskId = task.id;
  const app = snap.targetApp || "illustrator";
  document.getElementById("task-meta").textContent = `${task.status} · ${app} · ${task.id}`;
  const hostNote = [];
  if (snap.illustratorRuntime) {
    hostNote.push(
      `<p class="muted">${snap.illustratorRuntime.ok ? "Illustrator on this computer opened the job." : snap.illustratorRuntime.message}</p>`,
    );
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
  const previews = document.getElementById("previews");
  const files = snap.files || [];
  previews.innerHTML = files
    .filter((f) => /\.(svg|png|jpg|jpeg)$/i.test(f))
    .map((f) => {
      const src = `/api/files?path=${encodeURIComponent(f)}`;
      return `<figure><img src="${src}" alt=""><figcaption>${f.split("/").pop()}</figcaption></figure>`;
    })
    .join("");
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

async function runJob() {
  const file = document.getElementById("photo").files[0];
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
  document.getElementById("task-meta").textContent = "Running…";
  const snap = await api("/api/jobs", { method: "POST", body: JSON.stringify(body) });
  renderSnapshot(snap);
}

async function decide(decision) {
  if (!state.lastTaskId) return;
  const snap = await api(`/api/tasks/${state.lastTaskId}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision }),
  });
  renderSnapshot(snap);
}

document.getElementById("run").addEventListener("click", () => runJob().catch((e) => alert(e.message)));
document.getElementById("approve").addEventListener("click", () => decide("approve"));
document.getElementById("reject").addEventListener("click", () => decide("reject"));

(async function init() {
  try {
    const health = await api("/api/connectors");
    const illo = health.illustrator?.message || "Illustrator unknown";
    const ps = health.photoshop?.message || "";
    document.getElementById("connector-status").textContent = `${health.illustrator?.backend || "—"} · ${illo} ${ps}`;
  } catch (err) {
    document.getElementById("connector-status").textContent = String(err);
  }
})();
