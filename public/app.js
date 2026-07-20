/* The Lonely Runner Experiment · everything on screen traces to the journal */

const $ = (id) => document.getElementById(id);
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

/* ---------- scroll reveals ---------- */
const io = new IntersectionObserver(
  (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("seen")),
  { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
);
document.querySelectorAll(".fade").forEach((el) => io.observe(el));

/* ---------- circle: replay certified configurations ---------- */
const canvas = $("circle");
const ctx = canvas.getContext("2d");

// Fallback until the journal answers: the canonical tight configuration.
let cert = {
  speeds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  delta: "1/14",
  witness: 1 / 14,
  witness_str: "1/14",
  label: "canonical tight configuration",
  ref: "fixture",
};
let certPool = [cert];
let certIdx = 0;

function frac(x) {
  return x - Math.floor(x);
}
function circDist(x) {
  const f = frac(x);
  return Math.min(f, 1 - f);
}

let t = 0; // track time
let last = performance.now();
const BASE_RATE = 1 / 75; // one lap of track-time per 75s
let holdUntil = 0;
let lonelyFlash = 0;

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  canvas.width = w * dpr;
  canvas.height = w * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();

function chalkCircle(cx, cy, r) {
  ctx.save();
  ctx.strokeStyle = "oklch(0.93 0.006 165 / 0.85)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "oklch(0.93 0.006 165 / 0.18)";
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 0.8, 0.3, Math.PI * 1.7);
  ctx.stroke();
  ctx.restore();
}

function draw(now) {
  const dt = (now - last) / 1000;
  last = now;

  const v = cert.speeds;
  const n = v.length + 1; // runners incl. observer
  const bound = 1 / n;

  // time warp: slow to a crawl near the certified witness moment
  const distW = circDist(t - cert.witness);
  let rate = BASE_RATE * (0.25 + Math.min(1, distW * 18));
  if (now < holdUntil) rate = 0;
  if (!REDUCED) t = frac(t + rate * dt);

  const w = canvas.clientWidth;
  const cx = w / 2, cy = w / 2, r = w * 0.4;
  ctx.clearRect(0, 0, w, w);
  chalkCircle(cx, cy, r);

  // observer ticks
  ctx.fillStyle = "oklch(0.45 0.012 170)";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  const minD = Math.min(...v.map((s) => circDist(s * t)));
  const lonely = minD >= bound - 1e-9;
  if (lonely && now > holdUntil + 500 && !REDUCED) {
    holdUntil = now + 2600;
    lonelyFlash = now;
  }

  // exclusion arc around the observer (angle 0 at top)
  const arcA = Math.PI * 2 * bound;
  const flash = Math.max(0, 1 - (now - lonelyFlash) / 2600);
  if (flash > 0 || REDUCED) {
    ctx.save();
    ctx.strokeStyle = `oklch(0.78 0.13 75 / ${0.25 + 0.75 * (REDUCED ? 1 : flash)})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2 - arcA, -Math.PI / 2 + arcA);
    ctx.stroke();
    ctx.restore();
  }

  // observer
  const oa = -Math.PI / 2;
  ctx.fillStyle = "oklch(0.78 0.13 75)";
  ctx.beginPath();
  ctx.arc(cx + Math.cos(oa) * r, cy + Math.sin(oa) * r, w * 0.011, 0, Math.PI * 2);
  ctx.fill();

  // runners
  for (const s of v) {
    const a = -Math.PI / 2 + frac(s * (REDUCED ? cert.witness : t)) * Math.PI * 2;
    const d = circDist(s * (REDUCED ? cert.witness : t));
    const near = Math.max(0, 1 - d / bound);
    ctx.fillStyle = `oklch(0.93 0.006 165 / ${0.55 + 0.45 * near})`;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, w * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }

  // caption
  const cap = $("stage-caption");
  const tag = lonely || REDUCED
    ? `<span class="d">lonely: every runner ≥ 1/${n} away · certified witness t = ${cert.witness_str}</span>`
    : `min distance ${minD.toFixed(4)} · needs ≥ ${ (1 / n).toFixed(4) }`;
  cap.innerHTML =
    `(${v.join(", ")}) · δ = <span class="d">${cert.delta}</span> · ${cert.label}<br>${tag}`;

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// rotate through certified configurations
setInterval(() => {
  if (certPool.length > 1) {
    certIdx = (certIdx + 1) % certPool.length;
    cert = certPool[certIdx];
    t = 0;
  }
}, 45000);

/* ---------- journal polling ---------- */
let lastSeq = -1;

function fmtPayload(e) {
  const p = e.payload || {};
  switch (e.type) {
    case "RUN_STARTED":
      return p.machine ? `${p.run_id} on ${p.machine}` : `${p.run_id}`;
    case "PRIME_VERIFIED":
      return `k=${p.k} p=${p.p} · J(k,p)=∅ · ${p.elapsed_s}s`;
    case "SIEVE_LAYER_DONE":
      return `k=${p.k} p=${p.p} · I(k,p,1) size ${p.size}`;
    case "RUN_DONE":
      return p.screened
        ? `${p.run_id} · screened ${p.screened} · certified ${p.exact_certified} · tight ${p.tight_found}`
        : `${p.run_id} · ${p.wall_s}s`;
    case "RUN_ABORTED":
      return `${p.run_id} · ${p.reason || ""} · ${p.wall_s}s`;
    case "CANDIDATE_FOUND":
      return `(${(p.speeds || []).join(",")})`;
    case "EXACTLY_CERTIFIED":
      return `(${(p.speeds || []).join(",")}) · δ = ${p.delta} · ${p.status}`;
    case "HYPOTHESIS_PROPOSED":
      return `${p.title || ""} [${p.tag || "idea"}]`;
    case "REGRESSION_PASSED":
      return p.test || "";
    default:
      return "";
  }
}

function appendConsole(evts) {
  const el = $("console");
  const stick = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  for (const e of evts) {
    const ln = document.createElement("div");
    ln.className = "ln";
    const raw = e.payload && e.payload.raw_log
      ? ` <a href="/${e.payload.raw_log.replace("journal/", "")}" class="hash">[raw]</a>`
      : "";
    ln.innerHTML =
      `<span class="seq">#${String(e.seq).padStart(4, "0")}</span> ` +
      `<span class="t-${e.type}">${e.type}</span> ` +
      `${fmtPayload(e)}${raw} ` +
      `<span class="hash">${e.hash.slice(0, 8)}</span>`;
    el.appendChild(ln);
    lastSeq = e.seq;
  }
  if (stick) el.scrollTop = el.scrollHeight;
}

function renderState(s) {
  // status line
  const ago = s.last_event_ts
    ? Math.round((Date.now() - Date.parse(s.last_event_ts)) / 60000)
    : null;
  $("statusline").innerHTML =
    `<span class="live-dot"></span>${s.total_events} chained events · ` +
    `last activity ${ago === null ? "never" : ago < 1 ? "just now" : ago + " min ago"} · ` +
    `chain head ${s.chain_head ? s.chain_head.slice(0, 12) : "…"}`;

  // hunt
  const tights = s.certified.filter((c) => c.status === "TIGHT");
  const huntRuns = s.runs.filter((r) => String(r.run_id || "").startsWith("hunt"));
  const screened = huntRuns.reduce((a, r) => a + (r.screened || 0), 0);
  $("hunt-live").innerHTML =
    `configurations screened  <span class="hi">${screened}</span>\n` +
    `certified tight          <span class="hi">${tights.length}</span>\n` +
    tights.map((c) => `  (${c.speeds.join(",")}) δ=<span class="hi">${c.delta}</span>`).join("\n") +
    `\ncounterexamples          <span class="dim">0 so far</span>`;

  // brain
  const hyp = s.hypotheses;
  $("brain-live").innerHTML = hyp.length
    ? `hypotheses filed  <span class="hi">${hyp.length}</span>\n` +
      hyp.slice(-3).map((h) => `  <span class="hi">${h.tag || "idea"}</span> ${h.title}`).join("\n")
    : `<span class="dim">first hypothesis cycle in progress…</span>`;

  // backbone
  const solverRuns = s.runs.filter((r) => !String(r.run_id || "").startsWith("hunt"));
  $("backbone-live").innerHTML = solverRuns
    .map((r) => {
      const primes = s.primes_verified[r.k] || 0;
      const st = r.status === "running"
        ? `<span class="hi">running</span>`
        : r.status === "bounded"
        ? `<span class="dim">bounded probe</span>`
        : `done in ${r.wall_s}s`;
      return `k=${r.k}  primes verified <span class="hi">${primes}</span>  ${st}`;
    })
    .join("\n") +
    (s.k13_layers.length
      ? `\nk=13 sieve layers measured: ${s.k13_layers.map((l) => `p=${l.p}:${l.size}`).join(" ")}`
      : "");

  $("chain-head").textContent = s.chain_head ? `head ${s.chain_head.slice(0, 16)}…` : "";

  // feed certified tuples into the circle
  const pool = tights.map((c) => ({
    speeds: c.speeds,
    delta: c.delta,
    witness: eval_frac(c.witness_t),
    witness_str: c.witness_t,
    label: `certified tight · event #${c.seq}`,
    ref: c.hash,
  }));
  if (pool.length) certPool = pool;
}

function eval_frac(s) {
  if (!s) return 1 / 14;
  const m = String(s).split("/");
  return m.length === 2 ? Number(m[0]) / Number(m[1]) : Number(s);
}

async function poll() {
  try {
    const [st, ev] = await Promise.all([
      fetch("/api/state").then((r) => r.json()),
      fetch(`/api/events?since=${lastSeq}&limit=400`).then((r) => r.json()),
    ]);
    renderState(st);
    if (ev.length) appendConsole(ev);
  } catch {
    $("statusline").textContent = "journal unreachable, retrying…";
  }
}
poll();
setInterval(poll, 8000);
