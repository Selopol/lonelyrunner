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

// Journal is append-only; cache parsed events by file size.
let cache = { size: -1, events: [] };
function events() {
  let stat;
  try {
    stat = fs.statSync(JOURNAL);
  } catch {
    return [];
  }
  if (stat.size !== cache.size) {
    const lines = fs.readFileSync(JOURNAL, "utf8").split("\n").filter(Boolean);
    cache = { size: stat.size, events: lines.map((l) => JSON.parse(l)) };
  }
  return cache.events;
}

function state() {
  const ev = events();
  const runs = {};
  const certified = [];
  const hypotheses = [];
  const thoughts = [];
  let primesByK = {};
  let layersK13 = [];
  for (const e of ev) {
    const p = e.payload || {};
    if (e.type === "RUN_STARTED") {
      runs[p.run_id] = { ...p, status: "running", started: e.ts };
    } else if (e.type === "RUN_DONE" || e.type === "RUN_ABORTED") {
      runs[p.run_id] = {
        ...(runs[p.run_id] || {}),
        ...p,
        status: e.type === "RUN_DONE" ? "done" : "bounded",
        finished: e.ts,
      };
    } else if (e.type === "PRIME_VERIFIED") {
      primesByK[p.k] = (primesByK[p.k] || 0) + 1;
    } else if (e.type === "SIEVE_LAYER_DONE" && p.k === 13) {
      layersK13.push({ p: p.p, size: p.size, elapsed_s: p.elapsed_s });
    } else if (e.type === "EXACTLY_CERTIFIED") {
      certified.push({ ...p, seq: e.seq, hash: e.hash, ts: e.ts });
    } else if (e.type === "HYPOTHESIS_PROPOSED") {
      hypotheses.push({ ...p, seq: e.seq, ts: e.ts });
    } else if (e.type === "THOUGHT") {
      thoughts.push({ ...p, seq: e.seq, ts: e.ts });
    }
  }
  const last = ev[ev.length - 1];
  return {
    total_events: ev.length,
    chain_head: last ? last.hash : null,
    last_event_ts: last ? last.ts : null,
    runs: Object.values(runs),
    primes_verified: primesByK,
    k13_layers: layersK13,
    certified,
    hypotheses,
    thoughts: thoughts.slice(-40),
  };
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
  fs.appendFileSync(JOURNAL, canonical(event) + "\n");
  cache.size = -1; // invalidate
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
