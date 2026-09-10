const state = { orgs: [], lastTaskId: null };

async function api(path, opts) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

async function refreshWorld() {
  const orgs = await api("/api/orgs");
  state.orgs = orgs;
  const orgSel = document.getElementById("org");
  orgSel.innerHTML = orgs.map((o) => `<option value="${o.id}">${o.name}</option>`).join("");
  fillChildren();
}

function fillChildren() {
  const org = state.orgs.find((o) => o.id === document.getElementById("org").value) || state.orgs[0];
  const brand = document.getElementById("brand");
  const project = document.getElementById("project");
  if (!org) {
    brand.innerHTML = "";
    project.innerHTML = "";
    return;
  }
  brand.innerHTML = (org.brands || []).map((b) => `<option value="${b.id}">${b.name}</option>`).join("");
  project.innerHTML = (org.projects || []).map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
}

function renderSnapshot(snap) {
  const task = snap.task;
  state.lastTaskId = task.id;
  document.getElementById("task-meta").textContent = `${task.status} · ${task.id}`;
  const hostNote = snap.illustratorRuntime
    ? `<p class="muted">${snap.illustratorRuntime.ok ? "Illustrator on this computer opened the job." : snap.illustratorRuntime.message}</p>`
    : "";
  const trace = document.getElementById("trace");
  trace.innerHTML = (snap.trace?.spans || [])
    .map((s) => `<li>${s.ok ? "✓" : "✕"} ${s.name}${s.detail?.planner ? ` (${s.detail.planner})` : ""}</li>`)
    .join("");
  const qc = snap.qc;
  const qcEl = document.getElementById("qc");
  if (qc) {
    qcEl.innerHTML = `${hostNote}<p>QC ${qc.verdict.toUpperCase()} · score ${qc.score}</p>
      <ul class="findings">${(qc.findings || [])
        .map((f) => `<li class="${f.severity}">${f.area} / ${f.code}: ${f.message}</li>`)
        .join("")}</ul>`;
  } else qcEl.innerHTML = hostNote;
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

async function runJob() {
  const body = {
    orgId: document.getElementById("org").value,
    brandId: document.getElementById("brand").value,
    projectId: document.getElementById("project").value,
    brief: document.getElementById("brief").value,
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

document.getElementById("org").addEventListener("change", fillChildren);
document.getElementById("run").addEventListener("click", () => runJob().catch((e) => alert(e.message)));
document.getElementById("seed").addEventListener("click", async () => {
  await api("/api/seed", { method: "POST", body: "{}" });
  await refreshWorld();
});
document.getElementById("approve").addEventListener("click", () => decide("approve"));
document.getElementById("reject").addEventListener("click", () => decide("reject"));

(async function init() {
  try {
    const health = await api("/api/connectors");
    const msg = health.illustrator?.message || "Connector unknown";
    document.getElementById("connector-status").textContent = `${health.illustrator?.backend || "—"} · ${msg}`;
    await api("/api/seed", { method: "POST", body: "{}" });
    await refreshWorld();
  } catch (err) {
    document.getElementById("connector-status").textContent = String(err);
  }
})();
