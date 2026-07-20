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
    ctx.strokeStyle = `oklch(0.46 0.09 165 / ${0.2 + 0.8 * (REDUCED ? 1 : flash)})`;
    ctx.lineWidth = 4;
    const arcA = Math.PI * 2 * bound;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2 - arcA, -Math.PI / 2 + arcA);
    ctx.stroke();
  }

  ctx.fillStyle = "oklch(0.46 0.09 165)";
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

  $("scope-cap").innerHTML =
    `(${v.join(",")})` +
    (lonely || REDUCED
      ? ` · <span class="wax">lonely · t = ${mainSpec.witness_t}</span>`
      : ` · min dist ${minD.toFixed(4)} / ${bound.toFixed(4)}`);

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
    const conf = c.confirmations > 1
      ? `<br>re-certified ${c.confirmations} times` : "";
    cap.innerHTML =
      `(${c.speeds.join(",")})<br>` +
      `δ = <span class="wax">${c.delta}</span> · ${c.status} · <a href="#ledger">№${String(c.seq).padStart(4, "0")}</a><br>` +
      `${c.hash.slice(0, 12)}${conf}`;
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
    case "THOUGHT": return `“${(p.text || "").slice(0, 90)}${(p.text || "").length > 90 ? "…" : ""}”`;
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
  // The journal grows forever; the browser should not. Keep a readable tail
  // and send anyone who wants the rest to the downloadable chain.
  while (el.children.length > 400) el.removeChild(el.firstChild);
  if (stick) el.scrollTop = el.scrollHeight;
}

/* the stage stream prints the newest entries, newest first */
function streamPrint(evts) {
  const stream = $("stream");
  for (const e of evts) {
    const ln = document.createElement("div");
    ln.className = "sl";
    ln.innerHTML =
      `<span class="seq">№${String(e.seq).padStart(4, "0")}</span> ` +
      `<span class="${/CERTIF|CANDID|HYPOTH/.test(e.type) ? "wax" : ""}">${e.type}</span> ` +
      fmtPayload(e);
    stream.prepend(ln);
  }
  while (stream.children.length > 10) stream.removeChild(stream.lastChild);
}

/* ---------- coin bar: shown only if the operator configured it ---------- */
fetch("/api/config").then((r) => r.json()).then((c) => {
  if (!c.ticker && !c.ca) return;
  const bar = $("coinbar");
  bar.hidden = false;
  $("coin-ticker").textContent = c.ticker || "";
  const ca = $("coin-ca");
  if (c.ca) {
    ca.textContent = c.ca;
    ca.addEventListener("click", () => {
      navigator.clipboard.writeText(c.ca);
      const was = ca.textContent;
      ca.textContent = "copied";
      setTimeout(() => (ca.textContent = was), 1200);
    });
  } else {
    ca.hidden = true;
  }
  const links = [];
  if (c.url) links.push(`<a href="${c.url}" rel="noopener">buy</a>`);
  if (c.x_url) links.push(`<a href="${c.x_url}" rel="noopener">X</a>`);
  $("coin-links").innerHTML = links.join("");
}).catch(() => {});

/* ---------- the thinking line ---------- */
/* Real reasoning written by the model while working on this problem. Each
   line is a journal event; nothing here is generated in the browser. */
let thoughts = [];
let shown = null;
let typeTimer = null;

function agoText(ts) {
  const m = Math.round((Date.now() - Date.parse(ts)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

function thoughtMeta(th) {
  return `№${String(th.seq).padStart(4, "0")} · ${agoText(th.ts)}` +
    (th.cycle ? ` · cycle ${th.cycle}` : "");
}

function typeThought(th) {
  shown = th;
  const el = $("think-text");
  clearInterval(typeTimer);
  el.classList.remove("done");
  const text = th.text || "";
  if (REDUCED) {
    el.textContent = text;
    el.classList.add("done");
  } else {
    let i = 0;
    el.textContent = "";
    typeTimer = setInterval(() => {
      i += 2;
      el.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(typeTimer);
        el.classList.add("done");
      }
    }, 26);
  }
  $("think-meta").textContent = thoughtMeta(th);
}

// The age has to tick on its own; a reader should never need to reload to
// learn that the newest thought is now a minute older.
setInterval(() => {
  if (shown) $("think-meta").textContent = thoughtMeta(shown);
}, 10000);

function setThoughts(list) {
  thoughts = list;
  if (!thoughts.length) {
    $("think-text").textContent = "no reasoning recorded yet";
    $("think-text").classList.add("done");
    $("think-meta").textContent = "";
    document.querySelector(".think-label").textContent = "THE BRAIN IS IDLE";
    return;
  }
  // Do not claim live thinking when the newest thought has gone cold.
  const STALE_MIN = 20;
  const coldMin = (Date.now() - Date.parse(thoughts[thoughts.length - 1].ts)) / 60000;
  document.querySelector(".think-label").textContent =
    coldMin > STALE_MIN ? "THE BRAIN IS IDLE" : "FABLE IS THINKING";
  // Always the newest thought: rotating back to an old one made the line
  // look like it had jumped backwards in time.
  const newest = thoughts[thoughts.length - 1];
  if (!shown || shown.seq !== newest.seq) typeThought(newest);
}

/* HAPPENING NOW: real runs with a live clock, honest quiet state */
let nowState = null;
function renderNow() {
  const s = nowState;
  if (!s) return;
  // A run whose worker died leaves no terminal event. Never claim it is still
  // going: past this age it is stale, not live.
  const STALE_MS = 3 * 60 * 60 * 1000;
  const running = s.runs.filter(
    (r) => r.status === "running" && r.started && Date.now() - Date.parse(r.started) < STALE_MS
  );
  const lines = [];
  for (const r of running.slice(-3)) {
    const mins = Math.max(0, Math.round((Date.now() - Date.parse(r.started)) / 60000));
    const what = String(r.run_id || "").startsWith("hunt")
      ? `hunting extremal configurations`
      : r.k >= 13
      ? `probing the open 14-runner case`
      : `reproducing the solved ${r.k + 1}-runner case`;
    lines.push(`<span class="wax">●</span> ${what}\n  ${r.run_id}\n  running <span class="wax">${mins} min</span> on ${r.machine || "the machine"}`);
  }
  const hyp = s.hypotheses[s.hypotheses.length - 1];
  if (hyp) lines.push(`<span class="wax">●</span> Fable, latest hypothesis:\n  ${hyp.title} <span class="dim">[${hyp.tag || "idea"}]</span>`);
  const th = (s.thoughts || [])[(s.thoughts || []).length - 1];
  if (th && (Date.now() - Date.parse(th.ts)) / 60000 > 20) {
    lines.push(`<span class="dim">○ the brain is not reasoning right now\n  last thought ${agoText(th.ts)}</span>`);
  }
  if (!running.length) {
    const ago = s.last_event_ts
      ? Math.round((Date.now() - Date.parse(s.last_event_ts)) / 60000) : null;
    lines.push(`<span class="dim">the lab is quiet · last activity ${ago === null ? "never" : ago < 1 ? "just now" : ago + " min ago"}</span>`);
  }
  $("now-runs").innerHTML = lines.join("\n");
}
setInterval(renderNow, 1000);

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

  nowState = s;
  renderNow();
  setThoughts(s.thoughts || []);

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
    renderState(st);
    if (ev.length) { appendLedger(ev); streamPrint(ev); }
  } catch {
    $("now-runs").innerHTML = `<span class="dim">journal unreachable, retrying…</span>`;
  }
}
poll();
setInterval(poll, 8000);
