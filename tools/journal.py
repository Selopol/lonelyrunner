#!/usr/bin/env python3
"""Append-only hash-chained event journal for the Lonely Runner Experiment.

Every event: {seq, ts, type, payload, commit, prev, hash}
hash = sha256(prev_hash + canonical_json(core)) where core excludes prev/hash.
Journal file: journal/events.jsonl (one JSON object per line).

Usage:
  journal.py append TYPE '{"json": "payload"}'
  journal.py verify
"""
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOURNAL = os.path.join(ROOT, "journal", "events.jsonl")

EVENT_TYPES = {
    "RUN_STARTED", "SIEVE_LAYER_DONE", "PRIME_VERIFIED", "RUN_DONE",
    "RUN_ABORTED", "CANDIDATE_FOUND", "EXACTLY_CERTIFIED",
    "HYPOTHESIS_PROPOSED", "REGRESSION_PASSED", "REGRESSION_FAILED",
    "THOUGHT",
}


def _canonical(obj):
    return json.dumps(obj, sort_keys=True, separators=(",", ":"))


def _git_commit():
    try:
        return subprocess.run(
            ["git", "-C", ROOT, "rev-parse", "--short", "HEAD"],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
    except Exception:
        return "unknown"


def _read_all():
    if not os.path.exists(JOURNAL):
        return []
    with open(JOURNAL) as f:
        return [json.loads(line) for line in f if line.strip()]


def append(event_type, payload):
    if event_type not in EVENT_TYPES:
        raise ValueError(f"unknown event type: {event_type}")
    # Worker mode: if JOURNAL_API is set, the web service owns the chain.
    api = os.environ.get("JOURNAL_API")
    if api:
        import urllib.request
        req = urllib.request.Request(
            api.rstrip("/") + "/api/events",
            data=json.dumps({"type": event_type, "payload": payload,
                             "commit": _git_commit()}).encode(),
            headers={"Content-Type": "application/json",
                     "Authorization": f"Bearer {os.environ.get('JOURNAL_TOKEN', '')}"},
            method="POST")
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    events = _read_all()
    prev = events[-1]["hash"] if events else "genesis"
    core = {
        "seq": len(events),
        "ts": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "type": event_type,
        "payload": payload,
        "commit": _git_commit(),
    }
    h = hashlib.sha256((prev + _canonical(core)).encode()).hexdigest()
    event = {**core, "prev": prev, "hash": h}
    os.makedirs(os.path.dirname(JOURNAL), exist_ok=True)
    with open(JOURNAL, "a") as f:
        f.write(_canonical(event) + "\n")
    return event


def verify():
    events = _read_all()
    prev = "genesis"
    for i, e in enumerate(events):
        core = {k: e[k] for k in ("seq", "ts", "type", "payload", "commit")}
        h = hashlib.sha256((prev + _canonical(core)).encode()).hexdigest()
        if e["seq"] != i:
            return False, f"seq mismatch at {i}"
        if e["prev"] != prev:
            return False, f"prev mismatch at seq {i}"
        if e["hash"] != h:
            return False, f"hash mismatch at seq {i}"
        prev = e["hash"]
    return True, f"{len(events)} events, chain intact"


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "verify"
    if cmd == "append":
        e = append(sys.argv[2], json.loads(sys.argv[3]))
        print(_canonical(e))
    elif cmd == "verify":
        ok, msg = verify()
        print(("OK: " if ok else "BROKEN: ") + msg)
        sys.exit(0 if ok else 1)
    else:
        print(__doc__)
        sys.exit(1)
