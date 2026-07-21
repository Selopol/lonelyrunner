# Cycle 64: k=13's margin-walk crossover clusters with k10/k11/k12, not with k9's outlier

Tags: `empirical`

## Context

Cycle 63 disproved the exponent-vs-k ordering (formal cross-window
Spearman test flips sign, +0.40 to -0.90). That leaves the
crossover-LOCATION table as the sole remaining pillar for "k9 is
special": k10 ~400-450, k11 ~600, k12 ~530-600 cluster tightly, while k9
sits ~5660 (a 10x outlier) and k8 extrapolates to ~85,600. Cycle 63's
Next item (a) proposed extending this table with a 5th point: k=13's
crossover, via the same `tools/margin_by_class_k.py` walk-proxy recipe
used for k=8 through k=12. Not yet attempted before this cycle.

## Method

Unmodified `tools/margin_by_class_k.py` (`build_cover`/`avg_over_walks`,
seed=42), K=13, depth_target=K-4=9 (the deepest depth_target tested so
far -- k=12's was 8). Three chunks to manage runtime:

- p in [20,400), n_samples=10-15
- p in [380,650), n_samples=25 (denser, to pin the crossing point)
- p in [620,900), n_samples=10 (confirm sustained collapse past the
  crossing)

Total wall time ~90s across the three runs.

## Results

R = (bcn+3bc)/ttc decays smoothly from ~1.95 at p=61 down through ~1.0
around p=450-500:

| p | margin | R |
|---|---|---|
| 383 | +0.56 | 1.014 |
| 419 | -0.84 | 0.985 |
| 461 | -1.84 | 0.973 |
| 479 | **+0.80** | **1.015** |
| 487 | **-1.64** | **0.977** |
| 503 | -3.80 | 0.943 |
| 601 | -5.92 | 0.924 |

The last positive blip is at p=479 (margin=+0.80); every point from
p=487 onward is negative and stays negative smoothly through p=887 (R
down to ~0.88), with no return to positive -- the same clean
power-law-into-sustained-collapse shape seen for k=10/k=11/k=12.
Linear interpolation between p=479 (+0.80) and p=487 (-1.64) puts the
zero-crossing at **p~482**.

## Reading

**k=13's crossover (~482) lands squarely inside the k10/k11/k12 cluster
(400-600), not anywhere near k9's outlier (~5660).** Updated table:

| k | depth_target | crossover location | source |
|---|---|---|---|
| 8 | 4 | none through p=20011, extrapolated ~85,600 | cycle 51 |
| 9 | 5 | ~5300-5900 (interp ~5660) | cycle 56 |
| 10 | 6 | ~400-450 | cycle 50 |
| 11 | 7 | ~600 | cycle 30 |
| 12 | 8 | ~530-540 | cycle 62 |
| **13** | **9** | **~482 (interp, this cycle)** | **cycle 64** |

This is now a 4-way cluster (k10, k11, k12, k13, all 400-600) against a
single 10x outlier (k9) and a single far-extrapolated non-observer (k8,
never collapses through p=20011). Extending to the *deepest*
depth_target tested so far (9, vs k12's 8) and finding it still lands in
the tight cluster is exactly the kind of evidence that would have broken
the "k9 is special" reading if it hadn't held -- it strengthens rather
than muddies the result. k9 is not "the highest-k tested value happens to
look extreme" -- it is specifically anomalous relative to its neighbors
on both sides, now including one further out (k13) than before.

## Next

- (a) Narrow k=13's crossover bracket the way cycle 56 did for k9 --
  1-2 more points between p=479 and p=487 -- if tighter precision is
  wanted; low priority, the current ~482 estimate is already precise
  enough for the clustering claim.
- (b) With 5 real crossover points now in hand (k9-k13) plus one
  extrapolated (k8), a formal test of "is k9 a statistical outlier
  relative to k10-k13" (e.g. distance from k9 to the k10-13 cluster mean
  in log-space vs the spread within the cluster) would upgrade this from
  eyeballed-outlier to a quantified claim -- not yet attempted.
- (c) Correlation-structure metrics (pairwise Jaccard / residue
  clustering of top-bc candidates) for the k9/k10 raw-term inversion
  remain untested, still lower priority.
- (d) Still watching for a new real k=13 SIEVE_LAYER_DONE point (none
  since p=349 as of this cycle -- checked, still 9 total k13 sieve
  events, last one still p=349) and k=11's compile bug (cycle 45,
  unaddressed).
