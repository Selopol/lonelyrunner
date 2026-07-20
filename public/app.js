/* The Lonely Runner Experiment · the page is a window into the journal */

const $ = (id) => document.getElementById(id);
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

/* ---------- helpers ---------- */
function frac(x) { return x - Math.floor(x); }
function circDist(x) { const f = frac(x); return Math.min(f, 1 - f); }
function evalFrac(s) {
  if (!s) return 1 / 14;
  const m = String(s).split("/");
  return m.length === 2 ? Number(m[0]) / Number(m[1]) : Number(s);
}

/* ---------- fig 1 + specimens state ---------- */
let mainSpec = {
  speeds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 24],
  delta: "1/14", witness_t: "1/14", seq: null, status: "TIGHT",
};

let fig1Fit = null;
let fig1Marker = null;

function drawFig1() {
  const plate = $("fig1-plate");
  plate.innerHTML = "";
  const svg = curveSVG(mainSpec.speeds, 640);
  plate.appendChild(svg);
  fig1Fit = expSumFit(mainSpec.speeds, 640);
  fig1Marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  fig1Marker.setAttribute("r", "5");
  fig1Marker.setAttribute("class", "witness-dot");
  svg.appendChild(fig1Marker);
  const path = svg.querySelector("path");
  if (!REDUCED && path.getTotalLength) {
    const L = path.getTotalLength();
    path.style.strokeDasharray = L;
    path.style.strokeDashoffset = L;
    path.style.transition = "stroke-dashoffset 6s cubic-bezier(0.22, 1, 0.36, 1)";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      path.style.strokeDashoffset = "0";
    }));
  }
  $("fig1-stamp").hidden = mainSpec.status !== "TIGHT";
  $("fig1-cap").innerHTML =
    `Fig. 1. The exponential sum of (${mainSpec.speeds.join(", ")}): a certified ` +
    `${mainSpec.status.toLowerCase()} configuration, <span class="wax">δ = ${mainSpec.delta}</span> exactly` +
    (mainSpec.seq !== null ? `, journal event №${String(mainSpec.seq).padStart(4, "0")}.` : `.`);
}
drawFig1();

/* ---------- fig 2: the track ---------- */
const canvas = $("circle");
const ctx = canvas.getContext("2d");
let t = 0, last = performance.now(), holdUntil = 0, flashAt = 0;
const BASE_RATE = 1 / 75;

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  canvas.width = w * dpr;
  canvas.height = w * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();

function drawTrack(now) {
  const dt = (now - last) / 1000;
  last = now;
  const v = mainSpec.speeds;
  const n = v.length + 1;
  const bound = 1 / n;
  const witness = evalFrac(mainSpec.witness_t);

  const dW = circDist(t - witness);
  let rate = BASE_RATE * (0.25 + Math.min(1, dW * 18));
  if (now < holdUntil) rate = 0;
  if (!REDUCED) t = frac(t + rate * dt);
  const tt = REDUCED ? witness : t;

  const w = canvas.clientWidth;
  const cx = w / 2, cy = w / 2, r = w * 0.42;
  ctx.clearRect(0, 0, w, w);

  ctx.strokeStyle = "oklch(0.25 0.02 260 / 0.9)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  const minD = Math.min(...v.map((s) => circDist(s * tt)));
  const lonely = minD >= bound - 1e-9;
  if (lonely && now > holdUntil + 500 && !REDUCED) { holdUntil = now + 2600; flashAt = now; }

  const flash = Math.max(0, 1 - (now - flashAt) / 2600);
  if (flash > 0 || REDUCED) {
    ctx.strokeStyle = `oklch(0.55 0.15 30 / ${0.2 + 0.8 * (REDUCED ? 1 : flash)})`;
    ctx.lineWidth = 4;
    const arcA = Math.PI * 2 * bound;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2 - arcA, -Math.PI / 2 + arcA);
    ctx.stroke();
  }

  ctx.fillStyle = "oklch(0.55 0.15 30)";
  ctx.beginPath();
  ctx.arc(cx, cy - r, w * 0.012, 0, Math.PI * 2);
  ctx.fill();

  for (const s of v) {
    const a = -Math.PI / 2 + frac(s * tt) * Math.PI * 2;
    const d = circDist(s * tt);
    const near = Math.max(0, 1 - d / bound);
    ctx.fillStyle = `oklch(0.25 0.02 260 / ${0.45 + 0.55 * near})`;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, w * 0.009, 0, Math.PI * 2);
    ctx.fill();
  }

  // the same t rides the exponential-sum curve in Fig. 1
  if (fig1Fit && fig1Marker) {
    let zx = 0, zy = 0;
    for (const s of v) {
      zx += Math.cos(2 * Math.PI * s * tt);
      zy += Math.sin(2 * Math.PI * s * tt);
    }
    fig1Marker.setAttribute("cx", (fig1Fit.k * zx + fig1Fit.ox).toFixed(2));
    fig1Marker.setAttribute("cy", (fig1Fit.k * zy + fig1Fit.oy).toFixed(2));
  }

  $("fig2-cap").innerHTML =
    `Fig. 2. The track itself: (${v.join(", ")}) and the observer (red). ` +
    (lonely || REDUCED
      ? `<span class="wax">Lonely: every runner ≥ 1/${n} away · certified witness t = ${mainSpec.witness_t}</span>`
      : `min distance ${minD.toFixed(4)} · loneliness needs ≥ ${bound.toFixed(4)}`);

  requestAnimationFrame(drawTrack);
}
requestAnimationFrame(drawTrack);

/* ---------- specimens shelf ---------- */
function renderShelf(certified) {
  const shelf = $("shelf");
  shelf.innerHTML = "";
  const tights = certified.filter((c) => c.status === "TIGHT" || c.status === "COUNTEREXAMPLE");
  for (const c of tights) {
    const cell = document.createElement("div");
    cell.className = "specimen";
    cell.appendChild(curveSVG(c.speeds, 300));
    const cap = document.createElement("p");
    cap.className = "scap mono";
    cap.innerHTML =
      `(${c.speeds.join(",")})<br>` +
      `δ = <span class="wax">${c.delta}</span> · ${c.status} · <a href="#ledger">№${String(c.seq).padStart(4, "0")}</a><br>` +
      `${c.hash.slice(0, 12)}`;
    cell.appendChild(cap);
    shelf.appendChild(cell);
  }
}

/* ---------- ledger + rail ---------- */
let lastSeq = -1;

function fmtPayload(e) {
  const p = e.payload || {};
  switch (e.type) {
    case "RUN_STARTED": return p.machine ? `${p.run_id} on ${p.machine}` : `${p.run_id}`;
    case "PRIME_VERIFIED": return `k=${p.k} p=${p.p} · J(k,p)=∅ · ${p.elapsed_s}s`;
    case "SIEVE_LAYER_DONE": return `k=${p.k} p=${p.p} · I(k,p,1) size ${p.size}`;
    case "RUN_DONE":
      return p.screened
        ? `${p.run_id} · screened ${p.screened} · certified ${p.exact_certified} · tight ${p.tight_found}`
        : `${p.run_id} · ${p.wall_s}s`;
    case "RUN_ABORTED": return `${p.run_id} · ${p.reason || ""} · ${p.wall_s}s`;
    case "CANDIDATE_FOUND": return `(${(p.speeds || []).join(",")})`;
    case "EXACTLY_CERTIFIED": return `(${(p.speeds || []).join(",")}) · δ = ${p.delta} · ${p.status}`;
    case "HYPOTHESIS_PROPOSED": return `${p.title || ""} [${p.tag || "idea"}]`;
    case "REGRESSION_PASSED": case "REGRESSION_FAILED": return p.test || "";
    default: return "";
  }
}

function appendLedger(evts) {
  const el = $("console");
  const stick = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  for (const e of evts) {
    const ln = document.createElement("div");
    ln.className = "ln";
    const raw = e.payload && e.payload.raw_log
      ? ` <a href="/${e.payload.raw_log.replace("journal/", "")}" class="hash">[raw]</a>` : "";
    ln.innerHTML =
      `<span class="seq">№${String(e.seq).padStart(4, "0")}</span> ` +
      `<span class="t-${e.type}">${e.type}</span> ${fmtPayload(e)}${raw} ` +
      `<span class="hash">${e.hash.slice(0, 8)}</span>`;
    el.appendChild(ln);
    lastSeq = e.seq;
  }
  if (stick) el.scrollTop = el.scrollHeight;
}

/* the margin rail prints the newest entries like a plotter */
function railPrint(evts) {
  const rail = $("rail");
  if (!rail || !getComputedStyle(rail).display || getComputedStyle(rail).display === "none") return;
  for (const e of evts.slice(-4)) {
    const ln = document.createElement("div");
    ln.className = "rl";
    ln.innerHTML = `№${String(e.seq).padStart(4, "0")} · <span class="${/CERTIF|CANDID|HYPOTH/.test(e.type) ? "wax" : ""}">${e.type}</span><br>${fmtPayload(e)}`;
    rail.appendChild(ln);
    if (e.type === "EXACTLY_CERTIFIED") {
      const note = document.createElement("div");
      note.className = "rl rl-note";
      note.textContent = "tight!";
      rail.appendChild(note);
    }
  }
  while (rail.children.length > 14) rail.removeChild(rail.firstChild);
}

/* ---------- state render ---------- */
function renderState(s) {
  const ago = s.last_event_ts
    ? Math.round((Date.now() - Date.parse(s.last_event_ts)) / 60000) : null;
  $("mast-live").textContent =
    `VOL. I · LIVE · №${String(Math.max(s.total_events - 1, 0)).padStart(4, "0")}`;

  const tights = s.certified.filter((c) => c.status === "TIGHT");
  const primes13 = s.primes_verified[13] || 0;
  const wall = s.k13_layers.length
    ? `I(13,${s.k13_layers[0].p},1) = ${s.k13_layers[0].size.toLocaleString("en")}`
    : "probing";
  $("abs-live").innerHTML =
    `<span class="wax">${s.total_events}</span> chained events · ` +
    `<span class="wax">${tights.length}</span> certified tight · ` +
    `wall measured: <span class="wax">${wall}</span> · ` +
    `last activity ${ago === null ? "never" : ago < 1 ? "just now" : ago + " min ago"}`;

  const lastEv = s.total_events ? `№${String(s.total_events - 1).padStart(4, "0")}` : "";
  $("ticker").innerHTML = s.last_event_ts
    ? `${lastEv} · latest: <span class="wax">${s.latest_type || ""}</span> ${s.latest_summary || ""} · chain head ${s.chain_head ? s.chain_head.slice(0, 16) : ""}…`
    : "the journal is quiet";

  const huntRuns = s.runs.filter((r) => String(r.run_id || "").startsWith("hunt"));
  const screened = huntRuns.reduce((a, r) => a + (r.screened || 0), 0);
  $("hunt-live").innerHTML =
    `configurations screened  <span class="wax">${screened}</span>\n` +
    `certified tight          <span class="wax">${tights.length}</span>\n` +
    `counterexamples          <span class="dim">0 so far</span>`;

  const hyp = s.hypotheses;
  $("brain-live").innerHTML = hyp.length
    ? `hypotheses filed  <span class="wax">${hyp.length}</span>\n` +
      hyp.slice(-3).map((h) => `  [${h.tag || "idea"}] ${h.title}`).join("\n")
    : `<span class="dim">first hypothesis cycle in progress…</span>`;

  const solverRuns = s.runs.filter((r) => !String(r.run_id || "").startsWith("hunt"));
  $("backbone-live").innerHTML = solverRuns
    .map((r) => {
      const primes = s.primes_verified[r.k] || 0;
      const st = r.status === "running" ? `<span class="wax">running</span>`
        : r.status === "bounded" ? `<span class="dim">bounded probe</span>`
        : `done in ${r.wall_s}s`;
      return `k=${r.k}  primes verified <span class="wax">${primes}</span>  ${st}`;
    }).join("\n") +
    (s.k13_layers.length
      ? `\nthe wall: ${s.k13_layers.map((l) => `I(13,${l.p},1)=${l.size.toLocaleString("en")}`).join(" · ")}`
      : "");

  $("chain-head").textContent = s.chain_head ? s.chain_head.slice(0, 16) + "…" : "…";

  renderShelf(s.certified);
  const best = tights[tights.length - 1];
  if (best && JSON.stringify(best.speeds) !== JSON.stringify(mainSpec.speeds)) {
    mainSpec = best;
    drawFig1();
  } else if (best && mainSpec.seq === null) {
    mainSpec = best;
    drawFig1();
  }
}

async function poll() {
  try {
    const [st, ev] = await Promise.all([
      fetch("/api/state").then((r) => r.json()),
      fetch(`/api/events?since=${lastSeq}&limit=400`).then((r) => r.json()),
    ]);
    if (ev.length) {
      const lastE = ev[ev.length - 1];
      st.latest_type = lastE.type;
      st.latest_summary = fmtPayload(lastE);
    }
    renderState(st);
    if (ev.length) { appendLedger(ev); railPrint(ev); }
  } catch {
    $("ticker").textContent = "journal unreachable, retrying…";
  }
}
poll();
setInterval(poll, 8000);
