# The Lonely Runner Experiment — Protocol

**Question we ask in public:** *Can AI make the 14th runner lonely?*
**What we actually claim:** we run a real, verifiable research experiment on the
Lonely Runner Conjecture at the open frontier (k=13 moving runners, 14 total).
We do NOT claim we will solve it. Every event on the site is a real artifact.

## State of the problem (2026-07)

- Conjecture (Wills 1967): k moving runners + observer on a unit circle,
  distinct speeds; everyone is eventually lonely (distance ≥ 1/(k+1) from all).
- Proven for k ≤ 12 (Sungkawichai & Trakulthongchai, arXiv:2604.23906,
  Apr 2026). Method: reduction to finite per-prime verification J(k,p)=∅
  (Tao 2018 → Malikiosis–Santos–Schymura 2025), embarrassingly parallel in p.
- Cost on a 10-core Apple M4 (authors' benchmarks): k=9 41s, k=10 45min,
  k=11 ~40h, k=12 ~40 days. k=13 ≈ machine-years AND likely needs new math:
  the authors name the initial sieve I(k,p,1) as the bottleneck.
- Upstream code: github.com/vzsky/13-lonely-runners, vendored at
  `solver/upstream`, pinned SHA in `solver/UPSTREAM_SHA`.
- Context: 2026-07-19 Alpöge + Claude Fable 5 announced a Jacobian Conjecture
  counterexample (not yet peer-reviewed). We ride the wave without copying the
  claim: LRC evidence points TOWARD truth, so "counterexample hunt" is not our
  headline (council verdict, Kimi + Codex + Fable, 2026-07-20).

## Three tracks

### B — The Hunt (40%): extremal configuration cartography
Adversarial search around known tight configurations for k=13/14: mutations,
arithmetic families, local search over integer speed tuples. Certification
pipeline (mandatory, sampling proves nothing):

    candidate → numerically bounded → exactly certified → novelty checked

δ(V) = max_t min_i ||v_i·t|| is computed EXACTLY (rational piecewise-linear
verifier), not sampled. Regression fixture: v = (1..13), δ = 1/14 exactly.
A certified δ < 1/14 forever would disprove the conjecture — treated as a
lottery ticket, not the plan. New certified tight/near-tight structures are a
real, citable contribution (cf. Goddyn–Wong sporadic instances).

### C — The Brain (40%): attack the stated bottleneck
A Fable agent (Claude Max subscription) publicly attacks pruning for I(k,p,1).
Loop: hypothesis → attempted lemma → counter-test on k ≤ 12 → measured
speedup on real sieve runs. Everything lands in a git-backed lab notebook
(`notebook/`), entries tagged `idea | empirical | disproved | proved`.
This is where "actually try to solve it" lives: the record-holders say k=13
needs better math, not just CPU.

### A — The Backbone (20%): real verification runs
Baselines k=8/9/10 reproduced on our hardware (k=9 done: 53s on M4,
2026-07-20). Bounded k=13 per-prime jobs with time/RAM limits, publishing
sieve-layer sizes — both proof that the attack is real and profiling data
for track C. Honest metrics only: verified primes, Σ log p, layer sizes.
NO fake "% of conjecture solved".

## Verifiability layer

Append-only event journal; the site is a window into it, nothing more.
Event types: RUN_STARTED, SIEVE_LAYER_DONE, PRIME_VERIFIED, RUN_ABORTED,
CANDIDATE_FOUND, EXACTLY_CERTIFIED, HYPOTHESIS_PROPOSED, REGRESSION_PASSED,
REGRESSION_FAILED.
Each event carries: UTC timestamp, git commit SHA, command line, compiler+CPU,
(k, p) or tuple, seed, wall/CPU time, peak RAM, SHA-256 of input and output,
link to raw log. Events are hash-chained (each includes the previous event's
hash). Raw logs downloadable — "don't trust, verify".

## Infrastructure (launch scope)

- Site + event API: Railway, JSON polling (no WS).
- Heavy C++: local Apple M4 (10 cores) posting events to the API.
- AI work: Fable agents on the Claude Max subscription.
- Deploy: git push to main (never `railway up`).
- Deferred (not built now): k=14, crowdsourcing, 3D.

## Launch checklist (2-3 days)

1. [x] Vendor upstream solver, pin SHA, reproduce k=9 locally.
2. [ ] Baseline k=8 and k=10 runs with journaled events.
3. [ ] Exact-δ verifier + tight fixture v=(1..13) regression.
4. [ ] One bounded k=13 p-job profile (sieve-layer sizes published).
5. [ ] Event journal format + hash chain + Railway API.
6. [ ] Site (English, impeccable-grade): live circle replaying real certified
       tuples with witness times, proof console (real logs), frontier timeline
       1967→2026, track B/C/A feeds. Viewports 1920/834/390.
7. [ ] Fable lab notebook v1: first real pruning hypothesis cycle.
8. [x] Site live at lonelyrunner.fun; worker running the tracks on Railway.
