// The Lonely Runner Experiment: site + journal API.
// Zero dependencies. The site is a window into journal/events.jsonl.
const http = require("http");
const fs = require("fs");
const path = require("path");

const crypto = require("crypto");

const ROOT = __dirname;
// On Railway set JOURNAL_DIR=/data (volume). Seeded from the repo copy on first boot.
const JOURNAL_DIR = process.env.JOURNAL_DIR || path.join(ROOT, "journal");
const JOURNAL = path.join(JOURNAL_DIR, "events.jsonl");
const RAW_DIR = path.join(JOURNAL_DIR, "raw");
const REPO_JOURNAL = path.join(ROOT, "journal", "events.jsonl");
const PUBLIC = path.join(ROOT, "public");
const PORT = process.env.PORT || 3000;
const WORKER_TOKEN = process.env.WORKER_TOKEN || null;

// Seed the volume journal from the repo if the volume is empty or behind.
if (JOURNAL !== REPO_JOURNAL) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  const repoLen = fs.existsSync(REPO_JOURNAL) ? fs.readFileSync(REPO_JOURNAL, "utf8").split("\n").filter(Boolean).length : 0;
  const volLen = fs.existsSync(JOURNAL) ? fs.readFileSync(JOURNAL, "utf8").split("\n").filter(Boolean).length : 0;
  if (repoLen > volLen) {
    fs.copyFileSync(REPO_JOURNAL, JOURNAL);
    const repoRaw = path.join(ROOT, "journal", "raw");
    if (fs.existsSync(repoRaw)) {
      for (const f of fs.readdirSync(repoRaw)) fs.copyFileSync(path.join(repoRaw, f), path.join(RAW_DIR, f));
    }
    console.log(`journal seeded from repo (${repoLen} events)`);
  }
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jsonl": "application/x-ndjson; charset=utf-8",
  ".log": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

// The journal only ever grows, so parse the appended bytes and keep the rest.
// Re-reading the whole file per request made ingestion quadratic over its life.
let cache = { size: 0, events: [] };
function events() {
  let stat;
  try {
    stat = fs.statSync(JOURNAL);
  } catch {
    return [];
  }
  if (stat.size === cache.size) return cache.events;
  if (stat.size < cache.size) cache = { size: 0, events: [] }; // truncated: reread

  const fd = fs.openSync(JOURNAL, "r");
  const len = stat.size - cache.size;
  const buf = Buffer.allocUnsafe(len);
  fs.readSync(fd, buf, 0, len, cache.size);
  fs.closeSync(fd);

  const text = buf.toString("utf8");
  const cut = text.lastIndexOf("\n");           // ignore a half-written line
  if (cut < 0) return cache.events;
  for (const line of text.slice(0, cut).split("\n")) {
    if (line.trim()) cache.events.push(JSON.parse(line));
  }
  cache.size += Buffer.byteLength(text.slice(0, cut + 1));
  derived = null;                                // state must be recomputed
  return cache.events;
}

let derived = null;

function state() {
  const ev = events();
  if (derived && derived.n === ev.length) return derived.value;
  const runs = {};
  const certifiedBySpeeds = new Map();
  const hypotheses = [];
  const thoughts = [];
  let primesByK = {};
  let layersK13 = [];
  const timedOutK13 = new Set();
  for (const e of ev) {
    const p = e.payload || {};
    if (e.type === "RUN_STARTED") {
      // A worker that dies without a terminal event leaves a run claiming to
      // be alive. Only one solver run per k exists at a time, so a newer one
      // proves the older is gone, whatever its prime selection was named.
      const isHunt = String(p.run_id || "").startsWith("hunt");
      for (const r of Object.values(runs)) {
        if (r.status !== "running") continue;
        const rHunt = String(r.run_id || "").startsWith("hunt");
        if (rHunt === isHunt && (isHunt || r.k === p.k)) {
          r.status = "superseded";
          r.reason = "a later run of the same kind started";
        }
      }
      runs[p.run_id] = { ...p, status: "running", started: e.ts };
    } else if (e.type === "RUN_DONE" || e.type === "RUN_ABORTED") {
      runs[p.run_id] = {
        ...(runs[p.run_id] || {}),
        ...p,
        status: e.type === "RUN_DONE" ? "done" : "bounded",
        finished: e.ts,
      };
      // A prime the solver could not finish inside its budget is too
      // expensive to keep re-selecting; record it so the picker skips it.
      // Older aborts carry no primes field, so read the prime from the run
      // id (k13_p419-...) as well.
      if (e.type === "RUN_ABORTED" && /timeout/i.test(String(p.reason || ""))) {
        if (Array.isArray(p.primes)) for (const q of p.primes) timedOutK13.add(q);
        const m = String(p.run_id || "").match(/^k13_p(\d+)/);
        if (m) timedOutK13.add(Number(m[1]));
      }
    } else if (e.type === "PRIME_VERIFIED") {
      primesByK[p.k] = (primesByK[p.k] || 0) + 1;
    } else if (e.type === "SIEVE_LAYER_DONE" && p.k === 13) {
      layersK13.push({ p: p.p, size: p.size, elapsed_s: p.elapsed_s });
    } else if (e.type === "EXACTLY_CERTIFIED") {
      // One configuration is one specimen. Re-certifying it in a later hunt
      // pass confirms it; it does not discover it again.
      const key = (p.speeds || []).join(",");
      const seen = certifiedBySpeeds.get(key);
      if (seen) {
        seen.confirmations += 1;
        seen.last_ts = e.ts;
      } else {
        certifiedBySpeeds.set(key, {
          ...p, seq: e.seq, hash: e.hash, ts: e.ts,
          confirmations: 1, last_ts: e.ts,
        });
      }
    } else if (e.type === "HYPOTHESIS_PROPOSED") {
      hypotheses.push({ ...p, seq: e.seq, ts: e.ts });
    } else if (e.type === "THOUGHT") {
      thoughts.push({ ...p, seq: e.seq, ts: e.ts });
    }
  }
  const last = ev[ev.length - 1];
  const out = {
    total_events: ev.length,
    chain_head: last ? last.hash : null,
    first_event_ts: ev.length ? ev[0].ts : null,
    last_event_ts: last ? last.ts : null,
    runs: Object.values(runs),
    primes_verified: primesByK,
    k13_layers: layersK13,
    timed_out_k13: [...timedOutK13],
    certified: [...certifiedBySpeeds.values()],
    hypotheses,
    thoughts: thoughts.slice(-40),
  };
  derived = { n: ev.length, value: out };
  return out;
}

function send(res, code, body, type) {
  res.writeHead(code, {
    "Content-Type": type || "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

function serveFile(res, file) {
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, "not found", "text/plain");
    send(res, 200, data, MIME[path.extname(file)] || "application/octet-stream");
  });
}

const EVENT_TYPES = new Set([
  "RUN_STARTED", "SIEVE_LAYER_DONE", "PRIME_VERIFIED", "RUN_DONE",
  "RUN_ABORTED", "CANDIDATE_FOUND", "EXACTLY_CERTIFIED",
  "HYPOTHESIS_PROPOSED", "REGRESSION_PASSED", "REGRESSION_FAILED",
  "THOUGHT",
]);

function canonical(obj) {
  const sort = (o) =>
    o && typeof o === "object" && !Array.isArray(o)
      ? Object.fromEntries(Object.keys(o).sort().map((k) => [k, sort(o[k])]))
      : Array.isArray(o) ? o.map(sort) : o;
  return JSON.stringify(sort(obj));
}

// Append an event server-side, continuing the hash chain (mirrors tools/journal.py).
function appendEvent(type, payload, commit) {
  const ev = events();
  const prev = ev.length ? ev[ev.length - 1].hash : "genesis";
  const core = {
    seq: ev.length,
    ts: new Date().toISOString().replace(/\.\d{3}Z$/, "+00:00"),
    type,
    payload,
    commit: commit || "worker",
  };
  const hash = crypto.createHash("sha256").update(prev + canonical(core)).digest("hex");
  const event = { ...core, prev, hash };
  const line = canonical(event) + "\n";
  fs.appendFileSync(JOURNAL, line);
  // Extend the cache by exactly what was written; a negative size here would
  // send the incremental reader reading from before the start of the file.
  cache.events.push(event);
  cache.size += Buffer.byteLength(line);
  derived = null;
  return event;
}

function readBody(req, cb, limit = 5 * 1024 * 1024) {
  let buf = "";
  req.on("data", (c) => {
    buf += c;
    if (buf.length > limit) req.destroy();
  });
  req.on("end", () => cb(buf));
}

function authed(req) {
  return WORKER_TOKEN && req.headers.authorization === `Bearer ${WORKER_TOKEN}`;
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    const p = url.pathname;

    if (req.method === "POST" && p === "/api/events") {
      if (!authed(req)) return send(res, 401, "unauthorized", "text/plain");
      return readBody(req, (buf) => {
        let body;
        try {
          body = JSON.parse(buf);
        } catch {
          return send(res, 400, "bad json", "text/plain");
        }
        if (!EVENT_TYPES.has(body.type)) return send(res, 400, "bad type", "text/plain");
        const event = appendEvent(body.type, body.payload || {}, body.commit);
        return send(res, 200, JSON.stringify(event));
      });
    }
    if (req.method === "POST" && p.startsWith("/api/raw/")) {
      if (!authed(req)) return send(res, 401, "unauthorized", "text/plain");
      const name = path.basename(p).replace(/[^\w.\-]/g, "");
      return readBody(req, (buf) => {
        fs.mkdirSync(RAW_DIR, { recursive: true });
        fs.writeFileSync(path.join(RAW_DIR, name), buf);
        return send(res, 200, "ok", "text/plain");
      }, 50 * 1024 * 1024);
    }

    // Coin slot: rendered only when the operator sets these on the service.
    if (p === "/api/config") {
      return send(res, 200, JSON.stringify({
        ticker: process.env.COIN_TICKER || "",
        ca: process.env.COIN_CA || "",
        url: process.env.COIN_URL || "",
        x_url: process.env.X_URL || "",
      }));
    }

    if (p === "/api/facts") {
      const st = state();
      return send(res, 200, JSON.stringify({
        certified_speeds: st.certified.map((c) => c.speeds),
        measured_primes_k13: [...new Set(st.k13_layers.map((l) => l.p))],
        too_expensive_k13: st.timed_out_k13 || [],
      }));
    }

    if (p === "/api/state") {
      return send(res, 200, JSON.stringify(state()));
    }
    if (p === "/api/events") {
      const since = parseInt(url.searchParams.get("since") || "-1", 10);
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "200", 10), 1000);
      const ev = events().filter((e) => e.seq > since).slice(-limit);
      return send(res, 200, JSON.stringify(ev));
    }
    if (p === "/journal/events.jsonl") {
      return serveFile(res, JOURNAL);
    }
    if (p.startsWith("/raw/")) {
      const name = path.basename(p); // no traversal
      return serveFile(res, path.join(RAW_DIR, name));
    }
    if (p === "/" || p === "/index.html") {
      return serveFile(res, path.join(PUBLIC, "index.html"));
    }
    const file = path.join(PUBLIC, path.normalize(p).replace(/^([.]{2}[/\\])+/, ""));
    if (file.startsWith(PUBLIC)) return serveFile(res, file);
    send(res, 404, "not found", "text/plain");
  })
  .listen(PORT, () => console.log(`lonelyrunner on :${PORT}`));
