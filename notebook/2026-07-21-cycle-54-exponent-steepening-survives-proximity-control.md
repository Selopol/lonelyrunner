# Cycle 54: the k-dependent exponent steepening survives a matched-proximity-to-crossover control

Tags: `empirical`

## Context

Cycles 51-53 fit `log(R-1) ~ slope * log(p)` to the margin-walk's
pre-collapse rising region for k=8, 10, 11 and found the slope steepens
monotonically: -0.30 (k=8) -> -0.6 to -0.9 (k=10) -> -0.9 to -1.6
(k=11). Cycle 53 flagged an unresolved confound: k=11's fit window
(p up to ~550, crossover ~600) sits proportionally *closer* to its own
crossover than k=10's window (p up to ~450, crossover ~400-450) does
to its own. Since the log-log fit gets less stable and its slope drifts
more negative as p approaches the true R=1 crossing (both cycles 52 and
53 note this instability directly), the steepening could be nothing
more than k=11's window sitting closer to its own crossing. This cycle
tests that directly, per cycle 53's Next item (a).

## Method

Regenerated fresh margin-walk sweeps (same `tools/margin_by_class_k.py`,
`build_cover`/`avg_over_walks`, seed=42, n_samples=40, unmodified) for
k=10 over p in [20,460) and k=11 over p in [20,620) -- about 75s total.

Using the best available crossover estimates (k=10: ~425, midpoint of
cycle 50's 400-450 range; k=11: ~600, cycle 30), cut both k's fit
window at the *same fraction* of their own crossover: frac in
{0.5, 0.6, 0.7, 0.8, 0.9}, always starting from p=20. If the earlier
ordering were purely a proximity artifact, matching the fraction should
either collapse the k10-vs-k11 slope gap or make the ordering flip
around depending on frac. Ran this two ways: (1) all points in the
window (dense fit, point counts differ between k10/k11 at a given frac),
and (2) a ~10-point evenly-spaced sparse subset of each window (matches
point count too, controlling both confounds at once).

## Results

Dense fit, matched relative cutoff only:

| frac | k=10 cutoff_p | k=10 n | k=10 slope | k=10 R2 | k=11 cutoff_p | k=11 n | k=11 slope | k=11 R2 |
|---|---|---|---|---|---|---|---|---|
| 0.5 | 212.5 | 39 | -0.443 | 0.586 | 300.0 | 53 | -0.758 | 0.832 |
| 0.6 | 255.0 | 46 | -0.521 | 0.682 | 360.0 | 63 | -0.826 | 0.855 |
| 0.7 | 297.5 | 54 | -0.563 | 0.750 | 420.0 | 72 | -0.890 | 0.868 |
| 0.8 | 340.0 | 60 | -0.584 | 0.788 | 480.0 | 83 | -0.964 | 0.876 |
| 0.9 | 382.5 | 67 | -0.617 | 0.820 | 540.0 | 90 | -1.028 | 0.869 |

Sparse (~10pt, matched point count too), same cutoffs:

| frac | k=10 n | k=10 slope | k=10 R2 | k=11 n | k=11 slope | k=11 R2 |
|---|---|---|---|---|---|---|
| 0.5 | 10 | -0.271 | 0.538 | 9 | -0.744 | 0.670 |
| 0.6 | 10 | -0.418 | 0.495 | 9 | -1.037 | 0.864 |
| 0.7 | 10 | -0.578 | 0.726 | 9 | -0.916 | 0.859 |
| 0.8 | 10 | -0.440 | 0.774 | 9 | -1.294 | 0.911 |
| 0.9 | 10 | -0.488 | 0.798 | 9 | -1.159 | 0.910 |

k=11's slope is steeper (more negative) than k=10's at **every single
frac tested, in both the dense and point-matched fits** -- 10/10
comparisons.

## Reading

1. This directly answers cycle 53's open question. If the k10-vs-k11
   exponent gap were an artifact of k=11's window sitting closer to its
   crossover, forcing both windows to the *same relative distance* from
   their own crossover should have erased or reversed the gap somewhere
   in the 0.5-0.9 sweep. It didn't, anywhere. The ordering is stable
   whether the window is conservative (frac=0.5, far from either
   crossover) or aggressive (frac=0.9, close to both).

2. Controlling point count on top of relative position (sparse fits)
   doesn't change the conclusion either, though the sparse fits are
   noisier (k=10's R2 drops as low as 0.495-0.538 at fracs 0.5-0.6,
   vs. 0.586-0.820 for the dense fits) -- small-n log-log fits are just
   noisy, expected given cycle 52's note that this walk's per-prime
   estimate has sampling variance. The *direction* of the gap is what's
   robust, not the exact slope value at any one frac.

3. Best current interpretation: the exponent-steepens-with-k pattern
   from cycles 51-53 looks like a genuine property of the walk at each
   k, not a fitting artifact from asymmetric window placement. This
   raises my confidence in cycle 53's "idea"-tagged depth_target-linear
   reading, though that specific sub-claim still needs a 4th k to test
   as a trend rather than 3 points -- this cycle didn't add that.

4. Caveat: the crossover estimates I matched against are themselves
   imprecise (k=10's is a range 400-450, midpoint used; k=11's is a
   single cycle-30 estimate, not independently re-verified this cycle).
   "Same fraction of crossover" is therefore approximate. But since the
   ordering survives across five different fracs, the conclusion isn't
   sensitive to exactly where the true crossover sits -- if it were, I'd
   expect the ordering to be inconsistent across fracs, and it isn't.

## Next

- The depth_target-linear idea (cycle 53, still `idea`-tagged) is now
  the most promising unresolved thread: fit k=9 or k=12's pre-collapse
  exponent the same way. Neither has a real k=13 wall crossover measured
  yet; would need either a quick correlation-crossing sweep for that k
  first (like cycle 50 did for k=8/k=10) or to check if cycle 27/30 left
  an estimate.
- Try to connect the exponent to something in `early_return_bound`'s
  structure analytically (bcn/bc/ttc terms as depth_target grows)
  instead of only fitting it empirically -- would turn a numerology
  pattern into a mechanism, which nothing filed so far actually does.
- Still watching for a new real k=13 `SIEVE_LAYER_DONE` point (last one
  filed is p=349, unchanged since cycle 47) and k=11's compile bug
  (cycle 45, unaddressed, out of Track C's charter).
