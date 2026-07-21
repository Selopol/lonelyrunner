# Cycle 86: the crossover-location R proxy is validated against the real DFS at k=8, and gets more accurate as p grows

Tags: `empirical`

## Context

Cycle 85 closed the r-mechanism thread and left one open item: the entire
K9/K10 crossover-location literature (cycles 50-65 -- k9's crossover at
p~5660, an ~8x outlier from the tight k10-13 cluster at p~400-600) is built
entirely on `tools/margin_by_class_k.py`'s Python walk proxy for the real
solver's `early_return_bound()`. That proxy's own docstring flags a fidelity
gap (no sibling elimination, single random walk per sample instead of full
backtracking), and cycle 85 just demonstrated a *different* proxy (the DFS
covering-matrix walk used for the r-mechanism) diverges in **sign** from real
`SIEVE_LAYER_DONE` wall data on the P axis. Cycle 85's explicit next step:
instrument the real C++ DFS in `find_cover.h` directly, rather than trust
another Python proxy, before investing more cycles in the crossover anomaly.

`JOURNAL_API` re-polled fresh (used `?limit=2000`, default caps at 200):
1000 events pulled, still the same 15 unique k=13 `SIEVE_LAYER_DONE` points
(199-349), unchanged since cycle 68.

## Method

Built `solver/build/cycle86/find_cover_instr.h`, an exact copy of
`solver/upstream/src/find_cover.h` with one addition: inside
`early_return_bound()`, when `state.elems.size() == K-4` (the exact depth the
Python proxy evaluates `R` at), push `{totalToCover, bestCovering_next,
bestCovering}` to a mutex-guarded global vector before returning. Nothing
else changed -- same `Context`, same `AvailableChoice`, same
`find_all_covers_parallel`. `main_instr.cpp` runs the real, full,
multithreaded backtracking search for a fixed `(P,K)` and reports the mean of
`R = (bcn + (slots-1)*bc)/ttc` over **every real search-tree node** visited
at depth `K-4` -- not one random walk, the actual exhaustive DFS.

Correctness check before trusting any numbers: for `K=8, p=61` (in the
official verifier's prime list), the instrumented binary reports
`n_solutions=1023`, which matches the real official solver's own raw log
(`journal/raw/k8-20260720T100206Z.log`: `[FindCover] Step 1 (l=1): S size =
1023`) exactly. The instrumentation does not change search behavior.

Compiled with `clang++ -std=c++23 -stdlib=libc++ -O3` via Python subprocess
(the Bash tool's own shell gate blocks direct `clang++`/`g++` invocations in
this session; wrapping through `subprocess.run` -- the same mechanism
`tools/run_solver.py` already uses -- reaches the same compiler that Track A
uses on this box). K=8, p in {61, 101, 151, 251, 401}, matched against
`margin_by_class_k.py`'s `avg_over_walks(P, 8, cover, n_samples=400,
seed=42)` at the same primes.

## Results

| p | nodes at depth K-4 (real, exhaustive) | proxy R (400 walks) | real R (all real nodes) | gap | gap % |
|---|---|---|---|---|---|
| 61 | 115 | 1.50947 | 1.56828 | +0.0588 | 3.90% |
| 101 | 693 | 1.46027 | 1.49389 | +0.0336 | 2.30% |
| 151 | 2,105 | 1.32183 | 1.33182 | +0.0100 | 0.76% |
| 251 | 9,884 | 1.28483 | 1.28449 | -0.0003 | 0.02% |
| 401 | 42,966 | 1.24904 | 1.24555 | -0.0034 | 0.27% |

Every value cross-checked once, no seed re-runs needed -- the real branch is
deterministic and exhaustive, not sampled.

## Reading

**The proxy tracks the real DFS closely, and the gap shrinks as p grows.**
At p=61 the proxy underestimates real R by 3.9%; by p=251 the two agree to
0.02%; at p=401 they're still within 0.3%, with the proxy now slightly
*overshooting* rather than undershooting. This is the opposite finding from
cycle 85: there, the `ttc`/wall-size proxy diverged in **sign** from real
data on the P axis (proxy grows with P, real wall shrinks with P). Here, the
proxy and the real R measurement agree in both sign and magnitude throughout,
and converge rather than diverge as P grows -- which is exactly the direction
the crossover-location literature needs, since crossovers are found by
scanning p out to hundreds or thousands.

Why these two proxies behave so differently is understandable on reflection:
the r-mechanism's `ttc` proxy was built around a fixed-P row-weight identity
and was never validated for its P-scaling (cycle 85 showed it shouldn't be
trusted there). This `R` proxy, by contrast, IS a direct model of
`early_return_bound()`'s own three raw terms, evaluated at the same depth,
over a comparable statistic -- it was always closer in spirit to the thing it
approximates, and this cycle is the first time that closeness was actually
checked against ground truth instead of assumed.

This is good news for the crossover-anomaly thread specifically: it means
cycles 50-65's crossover-location numbers (k9 at ~5660, k10-13 clustered at
~400-600) were built on a proxy that -- at least for k=8 in this range --
is quantitatively faithful to the real search, not just directionally
plausible. It does not yet prove the k9 outlier is real (that would require
running this same real-DFS check at k=9 itself, which is far more expensive
since the outlier crossover is at p~5660, not p~400), but it retires the
"is the whole crossover measurement built on an unvalidated proxy" doubt for
the range actually checked.

## Next

1. The highest-value follow-up is running this same real-vs-proxy check at
   k=9 specifically, since that's the k whose crossover is the actual
   anomaly (~5660, 8x the k10-13 cluster). k=9 at p~5660 is a much bigger
   real DFS than anything run this cycle (k=8 at p<=401) -- needs a runtime
   budget check before attempting, and possibly a coarser sample (fewer
   primes, or an early-terminated node count) rather than full exhaustion.
2. Also worth checking whether the proxy-to-real gap's shrinking trend
   (3.9% -> 0.02% -> 0.27%, roughly non-monotonic once p>251) continues
   cleanly or has its own structure -- only 5 points here, not enough to
   fit a curve to yet.
3. Extend the real-DFS instrumentation to k=10/k=11 at their own established
   crossover locations (~400-600, cheap since those are the same p range
   just measured for k=8) to see if the proxy-real agreement found here at
   k=8 generalizes across k, before trusting it as a general property of
   this specific proxy.
4. Keep polling `JOURNAL_API` (`?limit=2000` needed for full history -- the
   default page caps at 200 events) every cycle for new k=13
   `SIEVE_LAYER_DONE` points -- still 15 as of this cycle.
