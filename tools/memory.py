#!/usr/bin/env python3
"""Durable memory for the experiment.

The worker filesystem is wiped on every redeploy; the journal is not. So the
journal is the memory of record, and this tool moves knowledge in both
directions:

  restore  rebuild notebook/*.md from journal entries that carry a body
  brief    print what the experiment already knows: open question, disproved
           dead ends, measured walls, recent thoughts

Run `restore` on boot and `brief` at the start of every brain cycle, so
cycle 400 still knows what cycle 3 ruled out.
"""
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTEBOOK = os.path.join(ROOT, "notebook")


def load_events():
    api = os.environ.get("JOURNAL_API")
    if api:
        with urllib.request.urlopen(api.rstrip("/") + "/journal/events.jsonl",
                                    timeout=60) as r:
            data = r.read().decode()
    else:
        path = os.path.join(ROOT, "journal", "events.jsonl")
        if not os.path.exists(path):
            return []
        data = open(path).read()
    return [json.loads(l) for l in data.splitlines() if l.strip()]


def restore(events):
    os.makedirs(NOTEBOOK, exist_ok=True)
    written = 0
    for e in events:
        p = e.get("payload", {})
        body, name = p.get("body"), p.get("notebook")
        if not body or not name:
            continue
        safe = os.path.basename(str(name))
        if not re.match(r"^[\w.\-]+\.md$", safe):
            continue
        path = os.path.join(NOTEBOOK, safe)
        if not os.path.exists(path):
            open(path, "w").write(body)
            written += 1
    print(f"restored {written} notebook entries from the journal")


def brief(events):
    hyps, disproved, walls, thoughts, regressions = [], [], {}, [], []
    for e in events:
        p = e.get("payload", {})
        t = e["type"]
        if t == "HYPOTHESIS_PROPOSED":
            hyps.append((e["seq"], p.get("tag", "idea"), p.get("title", "")))
            if p.get("tag") == "disproved":
                disproved.append((e["seq"], p.get("title", "")))
        elif t == "REGRESSION_FAILED":
            regressions.append((e["seq"], p.get("test", "")))
        elif t == "SIEVE_LAYER_DONE" and p.get("k") == 13:
            walls[p.get("p")] = p.get("size")
        elif t == "THOUGHT":
            thoughts.append((e["seq"], p.get("text", "")))

    out = ["# What this experiment already knows", ""]
    out.append("## Measured wall, k=13 first sieve layer I(13,p,1)")
    out += [f"- p={p}: {s:,} tuples" for p, s in sorted(walls.items())] or ["- nothing measured yet"]
    out.append("")
    out.append("## Hypotheses filed (do not repeat these)")
    out += [f"- #{s} [{tag}] {t}" for s, tag, t in hyps[-12:]] or ["- none yet"]
    out.append("")
    out.append("## Dead ends (never propose again without new evidence)")
    out += [f"- #{s} {t}" for s, t in disproved] or ["- none recorded"]
    out += [f"- #{s} failed test: {t}" for s, t in regressions[-6:]]
    out.append("")
    out.append("## Recent reasoning")
    out += [f"- #{s} {t}" for s, t in thoughts[-8:]] or ["- none yet"]
    print("\n".join(out))


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "brief"
    evs = load_events()
    if cmd == "restore":
        restore(evs)
    elif cmd == "brief":
        brief(evs)
    else:
        print(__doc__)
        sys.exit(1)
