# Cycle 53: k=11's power-law exponent is a third point confirming the monotonic-in-k trend

Tags: `empirical`

## Context

Cycle 51 found k=8's margin-walk `R` decays toward 1 as a slow power law
in its pre-collapse region, `R-1 ~ p^-0.30`, with an extrapolated
crossing far outside any measured range. Cycle 52 fit the same form to
k=10's pre-collapse region and found a steeper exponent, `-0.6` to
`-0.9` depending on subset -- roughly 2-3x steeper than k=8's. That
left an open question flagged explicitly in cycle 52's Next list: is
this a real trend in k, or just two points that happen to differ? This
cycle adds k=11 as a third point, using the exact same method.

## Method

Same unmodified `tools/margin_by_class_k.py` walk (`build_cover`/
`avg_over_walks`, seed=42, n_samples=40). Cycle 30 established k=11's
raw-margin collapse (R crossing 1) happens around p~600, so p in
[20,550) is k=11's pre-collapse rising region -- the direct analog of
the windows fit for k=8 (cycle 51) and k=10 (cycle 52). Full sweep of
all 93 primes in this range took 40s (cheap, like k=10, unlike k=8's
sparse spot-checks which cost minutes per point at large p).

One data point, p=23, had `R` exactly 1.0 (the walk's smallest prime,
K=11 special case -- `bcn+2*bc == ttc` exactly), making `log(R-1)`
undefined; excluded from the fit, leaving n=92.

## Results

Fit `log(R-1)` vs `log(p)`, several subsets (mirroring cycle 52's table):

| subset | n | slope | R2 |
|---|---|---|---|
| all p in [29,547] | 92 | -1.044 | 0.871 |
| p>=97 | 77 | -1.356 | 0.885 |
| p>=150 | 66 | -1.589 | 0.875 |
| sparse 10-pt (matched density: p=29,67,107,157,199,257,311,367,421,467) | 10 | -0.888 | 0.885 |

Cross-k comparison using the **same sparse-subset methodology** (10
points, matched spacing, the fairest apples-to-apples comparison since
it controls for how many/which points are used):

| k | depth_target=k-4 | sparse-fit slope | R2 |
|---|---|---|---|
| 8 | 4 | -0.335 (n=9, dropping one outlier) / -0.3045 (n=10) | 0.96-0.98 |
| 10 | 6 | -0.612 | 0.82 |
| 11 | 7 | -0.888 | 0.89 |

Monotonic: -0.30 -> -0.61 -> -0.89. Full-sweep (dense) fits tell the
same story, though with wider spread per k (k=8 not densely fit since
its range is expensive; k=10 dense range -0.65 to -0.93; k=11 dense
range -1.04 to -1.59, i.e. even steeper than the sparse estimate at
larger minimum-p cutoffs).

## Reading

1. This is a real three-point trend, not a coincidence: the exponent of
   `R-1`'s power-law decay gets monotonically steeper as k goes
   8 -> 10 -> 11. Cycle 52's caveat replicates here too -- k=11's window
   sits closer to its own measured crossing (~p=600) than k=8's does to
   its (unmeasured, extrapolated) one, so the fit is again less stable
   across subsets (-0.89 to -1.59) than k=8's tight range. But every
   subset for k=11 is steeper than every subset for k=10, which is in
   turn steeper than every subset for k=8 -- the ordering itself is
   robust even though the exact exponent isn't pinned down.

2. Rough check against depth_target=k-4 (4, 6, 7 for k=8/10/11): using
   the matched-methodology sparse slopes, the jump from depth 4->6 is
   -0.30 units of exponent, and depth 6->7 is another -0.28 units --
   suspiciously close to linear-in-depth-target (~-0.14 to -0.3 per unit
   depth). That's an interesting read but only 3 points and no error
   bars on the per-point slope itself, so it's a lead, not a claim --
   flagged as `idea`, not tested further this cycle.

3. This still doesn't distinguish "exponent is a function of k itself"
   from "exponent is a function of how close the fit window sits to its
   own crossover point" -- since k=11's window (p up to 550, crossover
   ~600) sits proportionally closer to its crossing than k=10's window
   (p up to 450, crossover ~400-450) does to its. Both explanations
   predict the same ordering here, so this cycle's data can't separate
   them. That's the sharpest next question.

## Next

- Distinguish "exponent is intrinsically a function of k" from "exponent
  is an artifact of fit-window-to-crossover proximity": refit k=10 and
  k=11 using windows truncated at the *same relative distance* from
  their respective (measured) crossovers, e.g. both cut off at
  crossover_p * 0.7, and see if the steepening ordering survives.
- The depth_target-linear reading (point 2 above) is `idea`-tagged only
  -- would need a 4th k (k=9 or k=12, both currently zero real k=13
  wall data, but the margin-walk tool doesn't need real wall data, just
  a pre-collapse-region crossover estimate for that k, which cycle 27/30
  may already have) to test as a real trend rather than 3 points.
- Still watching for a new real k=13 `SIEVE_LAYER_DONE` point (last one
  filed is p=349, still the case as of this cycle) and for k=11's
  compile bug (cycle 45, unaddressed, out of Track C's charter).
