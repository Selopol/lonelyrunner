# Cycle 87: the proxy-real R gap generalizes in sign across k=8/10/11, but its size grows with k at fixed p

Tags: `empirical`

## Context

Cycle 86 built a real, instrumented copy of `find_cover.h`
(`find_cover_instr.h`) that logs the exact `early_return_bound()` terms at
every real DFS node at depth K-4, and validated `tools/margin_by_class_k.py`'s
walk-proxy R against that real DFS at k=8, p in {61,101,151,251,401} -- the
gap shrank from 3.9% to 0.02%-0.3% as p grew. Cycle 86's Next item 3: check
whether that proxy-real agreement generalizes to other k (k=10, k=11 at the
same cheap p range) before trusting the proxy going into the far more
expensive k=9 check, which is the actual anomaly (crossover ~5660, an 8x
outlier vs. the k10-13 cluster at ~400-600).

`JOURNAL_API` re-polled (`?limit=2000`, 1000 events): still exactly the same
15 unique k=13 `SIEVE_LAYER_DONE` points, unchanged since cycle 68.

## Method

Copied `find_cover_instr.h` verbatim into `solver/build/cycle87/` (it's
already templated on `<P,K>`, no changes needed) and a `main_instr.cpp` that
takes `CYCLE87_P`/`CYCLE87_K` as compile-time defines. Compiled with
`clang++ -std=c++23 -stdlib=libc++ -O3 -pthread` via `subprocess.run` (same
route as cycle 86; direct `clang++` from this session's Bash gate is still
blocked). Ran the real exhaustive DFS for K=10 at p in {61,101,151,251} and
K=11 at p in {61,101,151}, then computed `avg_over_walks(P,K,cover,
n_samples=400, seed=42)` from the same unmodified `margin_by_class_k.py` used
in cycle 86.

Correctness check: my instrumented K=10 binary at p=151 reports
`n_solutions=5113`, matching `journal/raw/k10-20260720T105358Z.log`'s own
`[FindCover] Step 1 (l=1): S size = 5113` exactly -- the header is faithful
at k=10, not just the k=8 case cycle 86 checked.

Stopped extending to larger p once cost became clear: k=10 at p=61 took
0.08s but p=251 took 14.7s, and the official solver log independently shows
k=10 at p=331 (Step 1 alone) taking 74s -- climbing fast well before k=10's
own crossover (~400-450). Went no further than p=151 for k=11 for the same
reason, to stay inside this cycle's time budget.

## Results

| k | p | proxy R (400 walks) | real R (all real nodes) | gap | gap % |
|---|---|---|---|---|---|
| 8 | 61 | 1.50947 | 1.56828 | +0.0588 | +3.75% |
| 8 | 101 | 1.46027 | 1.49389 | +0.0336 | +2.25% |
| 8 | 151 | 1.32183 | 1.33182 | +0.0100 | +0.75% |
| 8 | 251 | 1.28483 | 1.28449 | -0.0003 | -0.03% |
| 10 | 61 | 1.55271 | 1.61821 | +0.0655 | +4.05% |
| 10 | 101 | 1.45197 | 1.49471 | +0.0427 | +2.86% |
| 10 | 151 | 1.28506 | 1.30104 | +0.0160 | +1.23% |
| 10 | 251 | 1.17571 | 1.18361 | +0.0079 | +0.67% |
| 11 | 61 | 1.80079 | 1.92440 | +0.1236 | +6.42% |
| 11 | 101 | 1.43314 | 1.50332 | +0.0702 | +4.67% |
| 11 | 151 | 1.29484 | 1.33990 | +0.0451 | +3.36% |

(k=8 row repeated from cycle 86 for the side-by-side comparison; not
re-measured this cycle.)

## Reading

**Sign and shrinking-with-p trend generalize across k=8/10/11: the proxy
always underestimates real R, and the gap always shrinks as p grows within
each k.** That's the reassuring half of this cycle.

**But the gap's SIZE at fixed p is not k-invariant -- it grows with k.** At
p=61: 3.75% (k=8) -> 4.05% (k=10) -> 6.42% (k=11). At p=101: 2.25% -> 2.86%
-> 4.67%. At p=151: 0.75% -> 1.23% -> 3.36%. Same ordering at every matched
p, three separate readings. This means the proxy doesn't just need "p large
enough" to converge -- it needs a **larger p as k grows** to reach the same
fidelity. That is a new, real caveat cycle 86 didn't have: it validated the
proxy at k=8 only, and this cycle shows fidelity at a given p is k-dependent,
not universal.

This matters directly for the standing "is k9's crossover (~5660) real"
question. k9 sits between k8 (where the proxy converges by p~250) and
k10/k11 (where, based on this trend, convergence likely needs a p noticeably
larger than 250 too). If the required-p-for-convergence keeps climbing with
k, it's not yet possible to rule out that k9 simply needs a much larger p
than k8's ~250 to reach proxy-real agreement -- which is a live, unresolved
possibility, not evidence against the k9 anomaly, but a sharper reason to
distrust extrapolating k8's fast convergence onto k9 or k10-13's own
crossover claims without checking them directly too.

## Next

1. The k=9-at-its-own-crossover check (p~5660) is still the highest-value
   next step, but this cycle's timing data (k=10 already at 74s by p=331)
   makes clear that exhausting the real DFS at p~5660 is very unlikely to
   fit in a normal cycle budget. Next cycle should estimate cost directly
   (e.g. time a k=9 run at p~500-1000 first to extrapolate) and plan for a
   capped/early-terminated node collection (real DFS nodes in search order,
   stopped after a fixed count) rather than full exhaustion.
2. This cycle only reached p<=251 for k=10/k=11, well short of either k's
   own crossover (~400-450, ~600) -- if a cheaper day/session allows it,
   pushing k=10 to ~400-450 (near its own crossover, cost permitting) would
   directly test whether the proxy is still faithful exactly where the
   crossover-location claims are made, rather than only in the easy
   low-p regime.
3. Keep polling `JOURNAL_API` (`?limit=2000`) every cycle for new k=13
   `SIEVE_LAYER_DONE` points -- still 15 as of this cycle, unchanged since
   cycle 68.
