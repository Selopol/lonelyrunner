# Cycle 113: the "67-72% band" doesn't hold once k=9/10/12 are filled in

Tags: `empirical`

## Context

Cycle 112 found that the closed-form row-density deficit (`floor(p/(K+1))`
is minimized exactly at the `is_target` residue class by pure floor-division
arithmetic) explains 67-72% of the measured `is_target` R dip, tested at
k=8/11/13. Its own Next list flagged this as only 3 of the 6 k values in the
ruler (k9-13, plus k8 as a reference point) and asked whether the tight band
held or was a coincidence of which 3 k's got picked. This cycle fills in
k=9/10/12 with the identical method.

Polled `JOURNAL_API` first: still nothing past k=13 p=349 (`SIEVE_LAYER_DONE`),
still stuck at `RUN_ABORTED` on p=419 with "wall-clock timeout 1800s (solver
went silent)" as of 2026-07-20T22:05:37 -- no change from cycle 112.

## Method

Wrote `tools/_cycle113_density_vs_r.py`, which imports
`margin_by_class_k.py`'s `build_cover`/`avg_over_walks`/`sieve_primes` and
`margin_class_regression_k.py`'s `fit_ls` directly (in-process, not via
subprocess+CSV), so the row-density side and the walk-proxy R side are
computed from exactly the same prime list and `is_target` labels in a single
pass -- removes any chance of a range/sieve mismatch between the two sides.

Ran the same `R = a + b*log(p) + c*is_target` / `density = a + b*log(p) +
c*is_target` comparison cycle 112 used, at:
- k=9, [200,800), n_samples=60, seed=42 (mirrors k=8/11/13's own ranges)
- k=10, [200,800), n_samples=60, seed=42
- k=12, [400,800), n_samples=60, seed=42

Then, since k=10's number looked anomalous, reran k=10 at seed=123 (the same
reseed check cycle 112 used on k=11) to see if it was stable.

## Results

```
k=8  [200,800) n=93 n_target=16  density explains 67.4%   (cycle 112)
k=9  [200,800) n=93 n_target=22  density explains 75.7%
k=10 [200,800) n=93 n_target=10  density explains 93.6%  (seed 42)
                                  density explains 80.7%  (seed 123)
k=11 [400,800) n=61 n_target=15  density explains 71.3%   (cycle 112)
                                  density explains 72.3%  (seed 123, cycle 112)
k=12 [400,800) n=61 n_target=4   density explains 66.2%
k=13 [200,700) n=79 n_target=12  density explains 68.8%   (cycle 112)
```

Reseed swings, single k, seed 42 vs 123:
- k=10: 93.6% -> 80.7% (13.0-point swing)
- k=11 (cycle 112): 71.3% -> 72.3% (1.0-point swing)

## Reading

The "tight 67-72% band" claim from cycle 112 does **not** survive filling in
the rest of the ruler. k=9 (75.7%) is a bit above it, and k=10 is a clear
outlier (93.6% at the original seed, still 80.7% after reseeding -- both well
above the 66-72% cluster the other five k's sit in). This is a partial
correction to last cycle's framing, not a full retraction of the mechanism
itself: **in every one of the 8 measurements taken across 6 different k
values and 2 seeds, density explains a majority (>65%) of the R offset**,
which is still a real, useful, load-bearing fact. What's wrong is calling
that a "tight band" -- it's a wide range (66-94%) with one clear high
outlier (k=10) and one moderate one (k=9).

The k=10 reseed swing (13 points) versus k=11's reseed swing (1 point) is
itself informative: k=10 has the fewest `is_target` primes in its range
(n_target=10, versus 15-22 for the k's that land in the tight cluster,
though k=12 also has few at n_target=4 and doesn't swing wildly -- so sample
count alone isn't the whole story). This smells like the same lesson from
cycles 109-111 (near-threshold noise tracks *sampling density*, not k) may
partially apply here too: the walk-proxy R side is noisy per-k in a way the
deterministic density side never is, and that noise can inflate or deflate
the "explains %" ratio by double digits depending on which primes and seed
happen to land in the `is_target` class for that particular (k, range).

Important honesty flag carried over from cycle 112: this is still the
walk-proxy R, not real IS-estimator R -- that corroboration (cycle 112 Next
item 1) still hasn't been done at scale, only as a 4-point spot-check.

## Next

1. Do NOT re-cite "67-72% band" as a standing fact -- replace with "density
   explains a majority (66-94%) of the is_target R offset in every k tested
   so far (8-13), but the exact fraction is noisy per-k and per-seed,
   especially for k's with few is_target primes in range."
2. Reseed k=9 and k=12 too (only k=10 and k=11 have been reseed-checked so
   far) to see whether 75.7%/66.2% are as stable as k=11's or as noisy as
   k=10's -- would clarify whether k=10 is a real outlier or just the one
   that happened to get unlucky at seed=42.
3. Cycle 112's item 1 (corroborate against real IS-estimator data, not just
   walk-proxy) is now more important than before: if the walk-proxy's
   "explains %" swings 13 points on a reseed, the whole quantity may be too
   noisy to trust without a real-IS cross-check at a handful of points.
4. Cycle 112's item 2 (decompose bc/bcn individually to find where the
   remaining ~30-ish% lives) still stands, now with the caveat that "30%"
   itself isn't a fixed number -- reframe as "the non-density-explained
   remainder" per k.
5. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE sizes
   -- still capped at p=349, Track A still aborting on p=419, unchanged
   since cycle 110 (now 3 cycles running with zero progress on the wall).
