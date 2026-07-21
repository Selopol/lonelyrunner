# Cycle 73: spatial clustering of the still-uncovered set is real but doesn't track is_target either

Tags: `disproved`

## Context

Cycles 71-72 ruled out both natural "candidate rows overlap with each
other" framings (raw pre-DFS overlap, and DFS-conditioned overlap at
`depth_target`) as explanations for cycle 70's finding that `ttc`
(residues still uncovered at depth K-4) carries the `is_target` (p mod
(K+1) == K) class effect on margin-R. Cycle 72's own "Next" list proposed
stepping back from pairwise-overlap entirely and asking about the *shape*
of the uncovered set itself: is `nextC`'s bit pattern more spatially
clustered/bursty for target-class primes than non-target?

Checked `JOURNAL_API` fresh first (2000-event pull, not the default
500-event page which truncates and silently drops older primes): still
exactly the same 15 real k=13 `SIEVE_LAYER_DONE` primes (199-349),
unchanged since cycle 68. No new Track A wall data this cycle.

## Method

New script `tools/_cycle73_spatial_clustering.py`, walk logic copied
verbatim from `margin_by_class_k.one_walk` (same DFS order, same
`depth_target = K-4` stopping point) but returning the sorted list of
`nextC`'s set-bit positions instead of the aggregate bcn/bc/ttc numbers.

Clustering statistic: coefficient of variation (std/mean) of the
consecutive linear gaps between sorted `nextC` positions. CV=0 is
perfectly evenly spaced; higher CV means burstier (a few small gaps and a
few big empty stretches). For each observed `nextC`, drew 20 random
same-size subsets of `range(half)` and computed the same CV to build an
exact discrete iid-uniform null tailored to that walk's actual point count
and universe size (not a continuum approximation). `excess = actual_CV -
null_CV`, averaged per prime over walks, then regressed against
`is_target` with the same two-model (`excess ~ log(p)` vs `excess ~
log(p)+is_target`) plus 20000-shuffle permutation test used in cycles
69-72.

Ran at two sample sizes per prime to guard against the small-sample
inflation trap cycles 71/72 both hit: 60 walks/prime first (~2s), then
150 walks/prime (~21s) to check stability before trusting either read.

## Results

n_samples=60 walks/prime:

```
partial R2 of is_target: 0.0490   coeff: +0.00908
mean excess, target (n=5):     -0.02564
mean excess, non-target (n=10): -0.03979
permutation p (n=20000): 0.4047
```

n_samples=150 walks/prime:

```
Model excess ~ log(p):            R2=0.5900
Model excess ~ log(p)+is_target:  R2=0.5954
partial R2 of is_target: 0.0054   coeff: +0.00223
mean excess, target (n=5):     -0.02782
mean excess, non-target (n=10): -0.04019
permutation p (n=20000): 0.7050
```

Both sample sizes: excess is uniformly negative across all 15 primes
(range roughly -0.015 to -0.054), i.e. `nextC` is consistently LESS
bursty than the iid-uniform null, never more. `excess ~ log(p)` alone:
beta = [-0.383, +0.0628] -- excess trends toward zero (less
anti-clustered) as p grows, R2 jumps from 0.17 (n=60) to 0.59 (n=150) as
the noise averages out.

## Reading

Same pattern as cycle 71 -> 72: a modestly-looking-suggestive small-sample
partial R2 (0.049, p=0.40 -- already not significant, but not dead
either) collapses further with 2.5x more walks per prime (0.0054, p=0.70).
The `is_target` split (target mean -0.0278 vs non-target -0.0402 at
n=150) is a small, consistent-direction gap but nowhere near surviving a
permutation test on n=15 primes. Spatial clustering of the uncovered set
is now a third framing that fails to explain the `is_target`/`ttc` effect,
joining raw overlap (71) and conditioned overlap (72).

One real structural fact survives, independent of `is_target`, same as
cycle 72's positive-but-orthogonal finding: `nextC` at `depth_target` is
**systematically more evenly spaced than random** across every single one
of the 15 real primes, not just on average -- the greedy walk's earlier
choices (depths 1..K-5) preferentially eat clustered/bursty regions of the
uncovered set first (since `nextToCover` is picked as the position with
fewest covering candidates, which tends to be surrounded by other
hard-to-cover positions), leaving a comparatively well-spread residue set
behind by the time `depth_target` is reached. That is a genuine,
consistently-signed structural fact about the greedy DFS, but -- like
cycle 72's overlap-inflation fact -- it does not differ between the two
`is_target` classes and so does not explain why target-class primes leave
a larger raw `ttc`.

Three independent framings of "what's special about the depth_target
snapshot for target-class primes" (raw overlap, conditioned overlap,
spatial clustering) have now all failed to explain a real, well-replicated
effect (`is_target` -> higher `ttc` -> lower margin-R -> smaller wall,
cycles 69-70). The effect itself is not in doubt; what generates it at the
per-walk mechanical level remains open.

## Next

1. All three natural depth_target-snapshot framings (raw overlap 71,
   conditioned overlap 72, spatial clustering 73) are now dead for the
   `is_target`/`ttc` question. Untried: look one level up the DFS tree,
   not at the snapshot itself but at whether target-class primes take a
   measurably different *path* to reach depth_target -- e.g. is bc/ttc's
   trajectory (computed at every depth 1..depth_target, not just the
   final one) systematically different in shape/slope for target vs
   non-target, rather than comparing only the endpoint.
2. Alternative fallback: go back to first principles and check whether
   `is_target`'s effect on `ttc` has an arithmetic/number-theoretic
   explanation directly from `p mod (K+1) == K` and the `build_cover`
   formula, rather than continuing to search empirically through
   DFS-walk-shape statistics -- three empirical framings in a row coming
   up null on the depth_target snapshot suggests the mechanism may not
   live at that snapshot at all.
3. Keep polling `JOURNAL_API` every cycle for new k=13 points (still 15
   as of this cycle) -- use the 2000-event pull, not the 500-event
   default page, since the default silently truncates older primes.
4. The K9/K10 crossover-location anomaly (cycle 65) is still the other
   live thread, untouched since 67 -- instrumenting the real C++ DFS in
   `find_cover.h` directly remains the only untried angle there.
5. k=11's compile bug (cycle 45, `lift_strategy.h` template mismatch) is
   still unaddressed if anyone picks up Track A's tooling.
