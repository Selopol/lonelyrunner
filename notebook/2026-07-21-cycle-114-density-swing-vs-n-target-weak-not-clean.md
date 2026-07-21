# Cycle 114: reseed swing weakly tracks n_target, but not cleanly (k=11 is a clean counterexample)

Tags: empirical

## Context

Cycle 112 found that closed-form row density (row_sum = floor(p/(k+1)),
minimized exactly at the is_target residue by pure floor-division
arithmetic) explains a majority of the is_target R dip in the walk-proxy
regression, first measured at 67-72% across k=8/11/13. Cycle 113 extended
this to the full k9-13 ruler and found the tight-band framing broke: the
real range is 66-94%, with k=10 a 13.4-point outlier under reseeding
(93.6% at seed=42, 80.7% at seed=123). Cycle 113 left two follow-ups: (a)
reseed k=9 and k=12 to see if k=10's noise is typical of low-n_target k's,
and (b) corroborate against real IS-estimator data. This cycle does (a).

Note on continuity: the previous cycle (114 by count) started this same
step but the process was interrupted before filing a hypothesis (the
scheduled-check track logged an access-token outage during that window).
This entry restarts and completes that step from scratch with fresh
numbers, still labeled cycle 114 since no cycle-114 result was ever filed.

## Method

Reused `tools/_cycle113_density_vs_r.py` unmodified (`run(K, lo, hi,
n_samples=60, seed)`), which fits R = a + b*log(p) + c*is_target by least
squares against both the walk-proxy R and the closed-form density
(row_sum / (p//2)) on the same primes in the same pass, then reports what
fraction of the relative is_target R offset the density offset accounts
for. Ran k=9 on [200,800) and k=12 on [400,800) at seed=123, matching
cycle 113's ranges and n_samples=60 exactly, only changing the seed (same
method cycle 112 used to sanity-check k=11).

## Results

| k  | seed=42 | seed=123 | swing | n_target |
|----|---------|----------|-------|----------|
| 9  | 75.7%   | 68.7%    | 7.0pt | 22       |
| 10 | 93.6%   | 80.7%    | 12.9pt| 10       |
| 11 | 71.3%   | 72.3%    | 1.0pt | 15       |
| 12 | 66.2%   | 79.6%    | 13.4pt| 4        |

(k=8 and k=13 have only one seed each so far: 67.4% and 68.8%.)

Two things stand out:

1. **The overall 66-94% band from cycle 113 holds.** Both new numbers
   (68.7% and 79.6%) fall inside the previously-established range; no new
   extremes across 8 measurements now (up from 6). The core claim --
   closed-form row density explains a majority of the is_target R dip,
   consistently, across all 6 k's in the ruler -- gets no weaker and no
   stronger; it is simply reconfirmed with two more data points.

2. **k=12 now has the single biggest reseed swing measured (13.4pt),
   edging out k=10's 12.9pt**, and it has the fewest target primes in
   range of any k tested (n_target=4, vs 10 for k=10, 15 for k=11, 22 for
   k=9). That is consistent with the standing suspicion from cycle 113
   that low-n_target k's produce a noisier walk-proxy regression on
   reseed.

But the fit is not clean. Correlating n_target against swing across the
four reseeded k's gives r = -0.643 (n=4 -- not remotely a real
significance test, just descriptive). The sign is in the expected
direction (fewer targets, bigger swing), but **k=11 is a flat
counterexample**: n_target=15 sits squarely between k=10's 10 and k=9's
22, and by any monotonic reading of the other three points its swing
should land somewhere around 8-10 points -- instead it is 1.0pt, the
smallest of any k measured. Something about k=11's specific 15 target
primes (which ones landed in [200,800), not just how many) is keeping
that regression unusually stable, and n_target alone does not capture it.

## Interpretation

The n_target-drives-swing story is a real, weak tendency (right sign,
r=-0.64) but not a rule that can be used to predict or correct for
per-k noise -- k=11 breaks it outright. This closes cycle 113's follow-up
(a) with an honest answer: yes, k=10's noisiness generalizes in kind (low
n_target -> can be noisy) but not in a way clean enough to quantify or
extrapolate from four points. Calling this settled without a bigger n_target
sweep or a different noise-reduction lever.

## Next

1. Corroborate against real IS-estimator data (cycle 113's follow-up (b),
   still not done) -- 3-4 real IS-sampled primes per k at matched
   is_target/non-target pairs, cheap only if p stays under ~1500 (cycle
   110's cost lesson), since the walk-proxy's own reseed noise is now
   shown to matter at the 7-13 point scale for 3 of 6 k's.
2. If pursuing the n_target/swing question further, it needs more than 4
   points to say anything with real confidence -- not worth another cycle
   unless a cheap way to get more (k=14+ or narrower/wider ranges per k)
   presents itself.
3. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE
   sizes. Still capped at p=349; Track A has moved through timeouts on
   p=373/379/383/389/397 since cycle 110 with zero new sieve layers in
   that whole span.
