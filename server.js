// The Lonely Runner Experiment: site + journal API.
// Zero dependencies. The site is a window into journal/events.jsonl.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const JOURNAL = path.join(ROOT, "journal", "events.jsonl");
const PUBLIC = path.join(ROOT, "public");
const PORT = process.env.PORT || 3000;

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

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    const p = url.pathname;

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
      return serveFile(res, path.join(ROOT, "journal", "raw", name));
    }
    if (p === "/" || p === "/index.html") {
      return serveFile(res, path.join(PUBLIC, "index.html"));
    }
    const file = path.join(PUBLIC, path.normalize(p).replace(/^([.]{2}[/\\])+/, ""));
    if (file.startsWith(PUBLIC)) return serveFile(res, file);
    send(res, 404, "not found", "text/plain");
  })
  .listen(PORT, () => console.log(`lonelyrunner on :${PORT}`));
