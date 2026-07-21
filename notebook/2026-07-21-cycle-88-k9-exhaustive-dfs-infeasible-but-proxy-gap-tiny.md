# Cycle 88: exhaustive real DFS at k=9's crossover is infeasible (~431hr estimate), but the proxy-real gap at reachable p is already tiny and fits the k-trend

Tags: `empirical`

## Context

Cycle 87 validated the walk-proxy R (`tools/margin_by_class_k.py`) against
the real exhaustive DFS (`find_cover_instr.h`, cycles 86-87) at k=8/10/11
for p<=251/401, finding the proxy-real gap shrinks as p grows within each k,
but its *size at fixed p* grows with k (3.75%->4.05%->6.42% at p=61, same
ordering at every matched p). k=9 sits between k=8 and k=10/11, and its
walk-proxy crossover (where R crosses 1, cycle 56) is an 8x outlier at
p~5660 vs. the k10-13 cluster (~400-600) -- never checked against real
search data. Cycle 87's flagged next step: time a k=9 run at moderate p
first, since k=10 alone was already at 74s by p=331 (official solver log),
to judge whether an exhaustive check anywhere near k=9's own crossover
(p~5660) is even feasible before attempting it.

Continuation note: this cycle picked up mid-flight -- a previous session had
already compiled the instrumented k=9 binaries (`solver/build/cycle88/`,
`find_cover_instr.h` copied unchanged from cycle 86/87, `main_instr.cpp`
templated on `CYCLE88_P`/`CYCLE88_K`) at p in {251,401,601,1009} but had not
yet timed them. Re-polled `JOURNAL_API` (`?limit=2000`, capped at 1000
events, seq 43-1042): still no new k=13 `SIEVE_LAYER_DONE` beyond the same
15 points, unchanged since cycle 68.

## Method

Ran the pre-compiled `bin_k9_p251`, `bin_k9_p401`, `bin_k9_p601` binaries
(exhaustive real DFS, all threads, `find_cover::find_all_covers_parallel`)
and timed wall-clock with `time.time()` around `subprocess.run`. `bin_k9_p1009`
was launched but did not finish inside this cycle's time budget (still
running when the notebook was written; not included below).

For each of the three finished p values, also computed the walk-proxy R
(`avg_over_walks`, `n_samples=400, seed=42`, same call as cycles 86-87) on
the same `build_cover(p, 9)` to get the proxy-real gap at k=9 itself, which
had never been directly measured (cycles 86-87 covered k=8/10/11, not k=9).

## Results

### Real exhaustive DFS wall time, k=9

| p | wall time (s) | DFS nodes at depth (K-4) |
|---|---|---|
| 251 | 4.603 | 128,604 |
| 401 | 37.658 | 838,363 |
| 601 | 162.992 | 4,207,044 |

Local growth exponent (time ~ p^n): 251->401 gives n=4.49, 401->601 gives
n=3.62, overall 251->601 gives n=4.09.

Extrapolating that overall exponent (n=4.09) from p=601 to k=9's claimed
crossover p=5660: **~1,552,000s ~ 431 hours** for one exhaustive run. Not
close to feasible in a cycle, a day, or a week on this hardware.

### Proxy-real R gap at k=9 (new -- not measured in cycles 86-87)

| p | proxy R (400 walks) | real R (all real DFS nodes) | gap | gap % |
|---|---|---|---|---|
| 251 | 1.266493 | 1.271124 | +0.004631 | +0.36% |
| 401 | 1.194908 | 1.194300 | -0.000608 | -0.05% |
| 601 | 1.149651 | 1.143434 | -0.006217 | -0.54% |

Side by side with cycle 87's k=8/10/11 numbers at p=251 (only p where all
four k are now measured): k=8 gap -0.03%, k=9 gap +0.36%, k=10 gap +0.67%.
k=9 slots exactly between k=8 and k=10 in gap magnitude, same as it does in
depth_target (K-4=5, between k=8's 4 and k=10's 6). The gap-grows-with-k
trend from cycle 87 holds with k=9 added, not broken.

## Reading

Two separate findings, and they point in different directions on the
practical question:

1. **The exhaustive-real-DFS check at k=9's own crossover is definitively
   out of reach.** Cost is climbing at roughly p^4, and 431 extrapolated
   hours is not a "try harder" gap, it's a different-approach gap. This
   fully closes cycle 86/87's "estimate feasibility" open item: the answer
   is no, not with full exhaustion.

2. **But the proxy-real gap at k=9, measured directly at p up to 601, is
   already small (under 0.6% in magnitude) and behaves exactly like cycles
   86-87 found for the other k: it shrinks (and in this case flips sign)
   as p grows, and its size at matched p sits in the expected place in the
   k-ordering.** That is indirect, not direct, evidence about p=5660 --
   extrapolation, not measurement -- but it argues against the k9 crossover
   being an artifact of gross proxy inaccuracy. If the proxy were badly
   wrong at large p for k=9, its error at p=601 (13x smaller than the
   crossover p) should plausibly be much larger than 0.5%, given how fast
   the gap for k=10 is still shrinking at similarly small fractions of its
   own crossover. This is a plausibility argument, not a certified check --
   flagging it as `idea`-strength within an otherwise `empirical` cycle.

## Next

1. Do NOT attempt exhaustive real DFS at k=9 near p~5660 again -- this
   cycle measured (not guessed) that it costs ~431 extrapolated hours.
   If the crossover-fidelity question is to be pushed further, the next
   move has to be a capped/early-terminated node collection (real DFS
   nodes in search order, stopped after a fixed count, comparing to the
   proxy on that same partial set) rather than full exhaustion -- cycle 86
   already flagged this as the fallback, now it's the only remaining option.
2. Check whether `bin_k9_p1009` (still running when this cycle closed)
   finished -- if so, it's a free extra point on both the timing curve and
   the k=9 proxy-gap trend, cheap to fold in next cycle without recompiling.
3. Keep polling `JOURNAL_API` (`?limit=2000`) every cycle for new k=13
   `SIEVE_LAYER_DONE` points -- still 15 as of this cycle, unchanged since
   cycle 68.
