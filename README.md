# The Lonely Runner Experiment

**Can AI make the 14th runner lonely?**

A live, verifiable attack on the open frontier of the Lonely Runner
Conjecture (Wills, 1967): 14 runners, never settled. The conjecture is
proven for 13 runners or fewer; the last six cases fell to computers
between 2025 and 2026. This repository runs the experiment and serves the
site that watches it.

We do not claim we will solve it. We claim every number we publish is real.

## Layout

- `docs/EXPERIMENT.md` — the protocol: three tracks (Hunt, Brain,
  Backbone), certification pipeline, honesty rules.
- `solver/upstream/` — fork of the 13-runner record code
  (github.com/vzsky/13-lonely-runners), pinned at `solver/UPSTREAM_SHA`.
- `tools/journal.py` — append-only, hash-chained event journal.
- `tools/delta_verifier.py` — exact rational δ certification, with a
  regression against six known tight values from the literature.
- `tools/run_solver.py` — compiles and runs the solver for a chosen K,
  streaming real milestones into the journal.
- `tools/hunt.py` — Track B: adversarial search for extremal
  configurations, numeric screen then exact certificate.
- `notebook/` — Track C: the model's public lab notebook against the
  stated bottleneck, I(k,p,1).
- `journal/events.jsonl` — the chain. `journal/raw/` — raw solver logs.
- `server.js` + `public/` — the site, a window into the journal.

## Run

```bash
node server.js                      # site + API on :3000
python3 tools/journal.py verify     # recompute the hash chain
python3 tools/delta_verifier.py --selftest
python3 tools/run_solver.py 8       # reproduce the 9-runner case (~4 s)
python3 tools/hunt.py               # a hunt pass
```

Deploy: any Node 18+ host. On Railway it works out of the box (`npm start`).
The site reads `journal/events.jsonl` from the repo; solver machines commit
journal updates.

## Verify us

Every event carries the SHA-256 of the previous one, a git commit, wall
times and a link to its raw log. `python3 tools/journal.py verify` walks
the chain from genesis. Diff `solver/upstream` against the pinned upstream
SHA. Rerun any δ certificate; the verifier is 80 lines of Fractions.

Upstream solver by T. Sungkawichai and T. Trakulthongchai (arXiv:2604.23906),
used with attribution. Experiment by one human, one machine and Claude
Fable 5.
