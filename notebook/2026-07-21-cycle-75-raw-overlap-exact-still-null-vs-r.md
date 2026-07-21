# Cycle 75: redid cycle 71's raw pairwise overlap with continuous r instead of binary is_target — still null, but only after fixing a sampling-noise trap the original sampled estimator was hiding

Tags: `disproved`

## Context

Cycle 74 found that continuous `r = P mod (K+1)` beats binary `is_target`
(`r == K`) as a predictor everywhere it was tested: the deterministic
depth-1 identity, simulated `ttc` at `depth_target`, and real k=13 wall
size directly. Its Next list flagged cycles 71-73's three null snapshot
framings (raw overlap, DFS-conditioned overlap, spatial clustering) as
worth redoing with `r` in place of `is_target`, since all three were only
ever tested against the weaker binary split. This cycle redid the first
and cheapest: cycle 71's raw (pre-DFS) pairwise row-overlap metric.

`JOURNAL_API` checked fresh (2000-event pull): still exactly the same 15
real k=13 `SIEVE_LAYER_DONE` primes, unchanged since cycle 68. No new
Track A wall data this cycle either.

## Method

Started by literally swapping `is_target` for `rvals[i] = p % (K+1)` in
cycle 71's regression, reusing its exact `raw_pair_stats` (400 sampled
pairs per prime, `random.Random(42)`) unchanged
(`tools/_cycle75_raw_overlap_vs_r.py`).

## Results: first pass looked like a resurrection, then didn't

That first pass gave: `excess ~ log(p) + r` partial R2 = **0.469**,
permutation p = **0.0078** (20000 shuffles of `r` across primes) — a much
bigger and more significant number than cycle 71's null `is_target` result
(partial R2 0.139, p = 0.186) or anything else in this whole thread. It
looked like exactly the resurrection cycle 74 predicted might be sitting in
this data.

It wasn't. Rerunning the identical regression at the same `N_PAIRS=400`
with different RNG seeds (`tools/_cycle75_robustness_check.py`) gave:

```
n_pairs=400 seed=42   partial_R2=0.4687  perm_p=0.0078
n_pairs=400 seed=7    partial_R2=0.0224  perm_p=0.6002
n_pairs=400 seed=123  partial_R2=0.0647  perm_p=0.3863
n_pairs=2000 seed=42  partial_R2=0.0001  perm_p=0.9793
n_pairs=2000 seed=7   partial_R2=0.0153  perm_p=0.6716
n_pairs=2000 seed=123 partial_R2=0.2224  perm_p=0.0614
n_pairs=5000 seed=42  partial_R2=0.0016  perm_p=0.8687
n_pairs=5000 seed=7   partial_R2=0.3436  perm_p=0.0250
n_pairs=5000 seed=123 partial_R2=0.0457  perm_p=0.3540
```

No consistency at all across seeds or sample sizes — the p=0.0078 result
was pure sampling noise in cycle 71's Jaccard estimator (which samples 400
random pairs per prime to *estimate* the mean pairwise Jaccard), not a
property of `r`. This is a new, more basic version of the cycles 71-73
noise-collapse trap: those were about walk-count sample size diluting a
*real* effect; this one is about the base statistic itself being noisy
enough that even a single seed can manufacture a p<0.01 result from nothing.

## Fix: compute the exact statistic, not a sample

Since `half = P // 2 <= 174` for all 15 real k=13 primes, the full pair
count is only 4,851 to 15,051 — cheap enough to compute the **exact** mean
Jaccard over every pair, with no RNG and no seed dependence at all
(`tools/_cycle75_exact_overlap_vs_r.py`). Result:

```
Model E (excess ~ log(p)):            R2=0.8874
Model T (excess ~ log(p)+is_target):  R2=0.8892  partial R2=0.0019  perm_p=0.66
Model R (excess ~ log(p)+r):          R2=0.8898  partial R2=0.0024  perm_p=0.62
```

With sampling noise removed, `excess` (actual minus expected-under-iid
Jaccard) is almost entirely explained by `log(p)` alone (R2=0.887, up from
0.011 on the noisy version) — the exact statistic is far cleaner than the
sampled one ever was. Both `is_target` and `r` add essentially nothing on
top: partial R2 0.002-0.0024, permutation p 0.6-0.66. Neither framing finds
anything here.

## Reading

Cycle 71's null verdict on raw pairwise overlap holds — and now on a much
better-behaved statistic than the original sampled one. The `r`-substitution
did not resurrect this framing the way it strengthened the depth-1 and
depth_target ttc results in cycle 74; raw overlap genuinely carries no
signal about either `is_target` or `r`, exact computation settles it.
Practical lesson for the rest of this thread: `avg_top_jaccard` (cycle 66,
reused in cycle 72's conditioned-overlap framing) is also a sampled
estimator (`N_SAMPLES=60` walks) — before trusting any real effect there,
the same seed-robustness check should be run, since this cycle shows a
single-seed p<0.01 can appear from a purely noisy statistic with no real
effect underneath.

## Next

1. Redo cycle 72 (DFS-conditioned overlap) with continuous `r` — but first
   run the same multi-seed robustness check on `avg_top_jaccard` itself at
   its current sample size, since this cycle shows that check needs to
   happen before trusting any single-seed regression result, not after.
2. Redo cycle 73 (spatial clustering of nextC) with continuous `r`, same
   caveat.
3. The depth-1 closed-form identity (cycle 74) still has an unfinished
   analytic step: derive `traj1(P) ~ 1 - 2/(K+1) + 2r/((K+1)P)` for `P >> K`
   and check the predicted r-slope against the fitted empirical coefficient.
4. K9/K10 crossover-location anomaly (cycle 65) — still untouched since 67;
   instrumenting the real C++ DFS in `find_cover.h` remains the only
   untried angle.
5. Keep polling `JOURNAL_API` every cycle for new k=13 points (still 15 as
   of this cycle, confirmed via fresh 2000-event pull) — use the 2000-event
   pull, not the 500-event default page.
