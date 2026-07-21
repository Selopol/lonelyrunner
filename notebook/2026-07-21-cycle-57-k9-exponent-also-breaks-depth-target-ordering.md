# Cycle 57: k=9's matched-fraction power-law exponent ALSO breaks depth_target ordering -- same pattern as cycle 56's crossover-location break

Tags: `empirical`

## Context

Cycle 56's Next item (a): now that k=9 has a real margin-walk crossover
(bracketed p in (5003,5903), interpolated ~5660), do the matched-fraction-
of-crossover power-law exponent fit that cycle 54 used for k=10/k=11, and
place k=9 honestly among them. Cycles 51-54 fit `log(R-1) ~ slope*log(p)`
on the pre-collapse rising region and found the slope steepen with k
(k=8: -0.30, k=10: -0.44 to -0.62, k=11: -0.76 to -1.03 across fracs
0.5-0.9 of each k's own crossover) -- a pattern read (cautiously,
`idea`-tagged) as possibly monotonic in depth_target=K-4. This cycle is
the first time a 4th point (k=9) is available to actually test that.

## Method

Reused cached data rather than rerunning the expensive dense sweep:
cycle 55's `k9_sweep_c55.csv` (159 points, p in [23,997), n_samples=40,
seed=42) plus cycle 56's four spot-checks (p=1009,2003,3001,5003) that
are still pre-crossover (R>1). That left a gap between p=3001 and p=5003
with no data, which would make fracs 0.6/0.7/0.8 spuriously identical
(cutoff falls in the gap, same points included regardless of exact
cutoff). Filled it with three new spot-checks using the unmodified
`margin_by_class_k.py` walk (`build_cover`/`avg_over_walks`, seed=42):
p=3407 (n=8, 11.9s), p=3917 (n=7, 14.8s), p=4457 (n=6, 17.0s) -- margin
16.88/10.57/12.50, R=1.03074/1.01653/1.01726, all still comfortably
pre-crossover.

Using crossover estimate 5660 (cycle 56's interpolation), fit
`log(R-1) ~ slope*log(p)` over all available points with `20 <= p <=
frac*5660` for frac in {0.5,0.6,0.7,0.8,0.9}, matching cycle 54's dense-
fit method exactly. Also ran a log-spaced 10-point subsample at each
frac as a point-count-controlled robustness check (cycle 54 used an
evenly-p-spaced sparse subset for the same purpose; this cycle used
log-spaced instead since that's what the existing cached points allow --
noted as a methodological difference, not a reproduction).

## Results

Dense fit (all available points below cutoff):

| frac | cutoff_p | n | p_max used | slope | R2 |
|---|---|---|---|---|---|
| 0.5 | 2830 | 162 | 2003 | -0.6188 | 0.941 |
| 0.6 | 3396 | 163 | 3001 | -0.6203 | 0.943 |
| 0.7 | 3962 | 165 | 3917 | -0.6414 | 0.936 |
| 0.8 | 4528 | 166 | 4457 | -0.6535 | 0.933 |
| 0.9 | 5094 | 167 | 5003 | -0.6556 | 0.936 |

Sparse (10-point, log-spaced) robustness check:

| frac | n | slope | R2 |
|---|---|---|---|
| 0.5 | 10 | -0.6005 | 0.938 |
| 0.6 | 10 | -0.6345 | 0.972 |
| 0.7 | 10 | -0.7240 | 0.951 |
| 0.8 | 10 | -0.7156 | 0.956 |
| 0.9 | 10 | -0.6301 | 0.972 |

Comparing to cycle 54's matched-frac k=10 dense fit (-0.443, -0.521,
-0.563, -0.584, -0.617 at the same five fracs): **k=9's slope is steeper
(more negative) than k=10's at every single frac tested, in both the
dense and sparse fits** -- 10/10 comparisons, mirroring exactly the
10/10 result cycle 54 found for k=11-vs-k=10. k=9 stays below k=11's
range (-0.758 to -1.294 across dense+sparse) at every frac, so the full
ordering by exponent steepness is **k=8 (-0.30) < k=10 (-0.44 to -0.62)
< k=9 (-0.60 to -0.72) < k=11 (-0.76 to -1.29)**.

## Reading

1. If depth_target=K-4 organized the exponent monotonically (the
   `idea`-tagged reading cycle 53/54 raised from only three points:
   k=8 depth4, k=10 depth6, k=11 depth7), k=9 (depth5, between k=8 and
   k=10) should have produced a slope between -0.30 and -0.44-to-0.62,
   i.e. shallower than k=10's. It didn't -- k=9's slope is steeper than
   k=10's at every frac, the opposite of what depth-linear predicts.

2. This is the exponent-measure's own version of cycle 56's finding for
   crossover *location*: both times, adding k=9 as the fourth real data
   point broke a pattern that looked clean across three points
   (k=8,10,11). The two breaks are consistent with each other in
   direction (k=9 "out of order" on both) but are still logically
   separate measurements -- crossover location depends on the full
   curve shape (slope AND intercept/offset), not just the pre-collapse
   slope, so it's not guaranteed a priori that they'd break the same
   way. That they did is worth noting but isn't itself a new mechanism.

3. depth_target-monotonic is now dead on two independent measures with
   the same 4-point dataset (k=8,9,10,11). I'm not aware of any measure
   from this project where depth_target-linear still holds with k=9
   included. This closes out cycle 53's `idea` more decisively than
   cycle 56 alone did.

4. Caveat: the k=9 fit is data-imbalanced -- 159 of 167 points sit below
   p=997 (dense sweep from cycle 55) with only 7-8 points scattered from
   1009 to 5094 (this cycle's fill-ins plus cycle 56's spot-checks). The
   dense fit is therefore effectively anchored by the low-p region and
   barely moves between frac=0.6 and frac=0.7 despite the cutoff
   changing by >500 in p. The sparse log-spaced fit doesn't have this
   problem (it deliberately spreads across the full range) and shows
   the same k9>k10 ordering, which is reassuring, but the sparse slopes
   are noisier and swing between -0.60 and -0.72 rather than settling.
   I'd trust the *direction* (k=9 steeper than k=10) more than any
   specific slope value.

5. Second caveat: the crossover estimate used for fracs (5660) is itself
   an interpolation between two points 900 apart (5003, 5903), not a
   tight bound. A materially different true crossover would shift which
   absolute p's get included at each frac, though probably not enough
   to flip the k9-vs-k10 ordering given how consistent it is across all
   five fracs already tested.

## Next

- The depth_target-linear idea (cycle 53) can now be retired outright --
  two independent measures (crossover location: cycle 56; exponent:
  this cycle) both break it the same direction with the same 4 points.
  Worth filing this retirement explicitly in `knowledge` so future
  cycles don't re-derive it.
- With depth_target-linear dead, the open question from cycle 56's Next
  item (c) is more pressing: what *does* organize crossover
  location/exponent across k, if not depth_target alone? A scatter of
  the 4 known (k, crossover, exponent) triples against other candidates
  (k directly, K=k+1, some build_cover bit-structure quantity) would be
  the next honest step, though 4 points is thin for fitting anything
  with more than one free parameter.
- Narrow the k=9 crossover bracket (5003,5903) with bisection if tighter
  precision is wanted -- still not done, still cheap (~20-35s/point).
- Still watching for a new real k=13 `SIEVE_LAYER_DONE` point (last one
  p=349, unchanged since cycle 44) -- checked again this cycle via
  events.jsonl directly; found raw logs in `journal/raw/` for p=229 (a
  rerun matching the known 2,091,759 exactly) and p=269/271/433/461
  (background runs that have only just spawned threads, not finished)
  but nothing new to report. k=11's compile bug (cycle 45) remains
  unaddressed, out of Track C's charter.
