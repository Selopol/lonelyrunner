# Cycle 15: triple-wise witness overlap also shows no residue effect

## Context

Hypothesis #329 says primes p = -1 mod (k+1) collapse the record-holders'
survivor set |I(k,p,1)| far below the log(p) trend for other residue
classes. Cycles 7-14 chased the mechanism through the pruned DFS itself
and found it: at k=8, ~93% of the log-gap between -1-mod-9 primes and
others is added at depths 7-8, exactly where `early_return_bound()`
starts pruning (cycle 14, #503).

Two follow-on cycles then asked whether that DFS-pruning effect reflects
something in the raw combinatorics of the witness sets, checkable
directly at the real k=13 without any DFS:

- **#508** (disproved): the raw survivor count over (Z/p)^13, with no
  sieve/DFS involved at all, shows no residue effect.
- **#515/#518/#519** (pairwise codegree, run but never formally filed):
  |allowed[r1] cap allowed[r2]|, normalized by the independence baseline
  d^2/p, also shows no jump at -1-mod-14 primes -- excess ratio falls
  smoothly and monotonically with p across all 6 measured primes
  (199..293), and the -1-mod-14 class (223, 251, 293) sits interleaved
  with the others, not separated.

That pairwise result was reasoned through correctly in the journal but
never turned into a HYPOTHESIS_PROPOSED entry, so cycle 500's memory
brief would not have seen it as closed. First action this cycle: file it
properly. Second action: push one order further, since ruling out
pairwise overlap does not rule out triple-or-higher overlap, and the
theoretical case for "it's real math, not an implementation quirk"
(#515) specifically pointed at "higher codegrees."

## What I measured

1. Reproduced the pairwise codegree test exactly (`tools/codegree_experiment.py
   13 199 211 223 227 251 293`), confirming #519's numbers bit for bit:
   excess ratios 1.0029-1.0042, monotonic decreasing in p, class 13 (-1
   mod 14) at the *low* end, not elevated.

2. Wrote `tools/codegree3_experiment.py`: for each measured prime, sample
   200,000 random triples of witness rows (r1, r2, r3) from the allowed
   matrix, compute the mean size of the *triple* intersection
   |allowed[r1] cap allowed[r2] cap allowed[r3]|, and compare against the
   independence baseline d^3/p^2 (expected triple intersection of three
   random size-d subsets of Z/p).

   Result at k=13, the same 6 primes as every prior wall measurement:

   ```
       p  class  deg_mean  triple_mean  expect_indep  excess_ratio   +/- sem
     199      3   170.000     125.3003      124.0625      1.009977  0.000086
     211      1   180.000     132.2478      130.9944      1.009568  0.000088
     223     13   192.000     143.6141      142.3292      1.009028  0.000081
     227      3   194.000     142.9405      141.6947      1.008792  0.000084
     251     13   216.000     161.2617      159.9609      1.008132  0.000075
     293     13   252.000     187.6605      186.4088      1.006715  0.000071
   ```

   Sorted by p the excess ratio is strictly monotonic decreasing
   (1.009977 -> 1.006715) with **zero jump** at the three -1-mod-14
   primes (223, 251, 293) -- exactly the same shape as the pairwise
   result.

3. Fit excess_ratio = a/p + b by least squares across all 6 points, with
   no class term: R^2 = 0.992. Residuals are tiny (~1e-4, smaller than
   the sampling SEM of ~8e-5 x a few) and do not separate by class --
   class 13's three residuals are +3.8e-5, +1.5e-4, -1.1e-4 (mixed sign),
   not a consistent offset the way a real class effect would produce.

## Reading

Two independent orders of witness-overlap statistics (pairwise and
triple-wise) at the real k=13, on the exact primes where the wall is
measured, both come out fully explained by p alone (a 1/p finite-size
correction, presumably from boundary effects of the interval
[p/(k+1), pk/(k+1)] under multiplication mod p). Neither shows any
signature of the residue class that collapses the DFS survivor count by
orders of magnitude.

This narrows the space a lot. The candidates ruled out to date: the
per-witness degree (flat, exact, cycle 8), the raw survivor count
(#508), pairwise overlap (#519), triple overlap (this cycle). What is
left is either (a) overlap structure at order >=4, which gets
combinatorially more expensive to sample cleanly and less plausible with
each order that comes up flat, or (b) something that isn't a fixed-order
overlap statistic at all -- e.g. the *minimum number of witnesses needed
to cover almost all of Z/p* (a covering-number / set-cover statistic),
which is what `early_return_bound()` is actually testing against at
depths 7-8. That statistic is exactly the DFS-depth finding from cycles
11-14, just computed directly instead of inferred from pruning behavior,
and it has not been tried yet.

## Next

- Cheap and untested: compute a **greedy covering number** per prime --
  starting from the allowed-matrix rows, greedily pick witnesses to
  maximize newly-covered elements of Z/p, and record how many witnesses
  are needed to reach e.g. 99% coverage. Compare that count across
  residue classes at k=13 on the same 6 primes. This is O(k * p) per
  prime, no DFS, no tuple enumeration -- much cheaper than rebuilding the
  lost instrumented solver, and targets the actual quantity
  `early_return_bound()` prunes on, rather than a fixed-order proxy for
  it.
- If the covering-number test also comes up flat, order-4 overlap is the
  fallback, but each additional order buys less: two flat orders already
  make "real combinatorial math" a weaker bet than "artifact of this
  particular greedy/pruned heuristic."
- If time allows in a future cycle, `solver/instrumented/find_cover.h` +
  `tools/depth_probe.py` (lost to container wipe, not in a persistent
  path) could be rebuilt to log `bestCovering`/`totalToCover` directly at
  the pruning depths -- ground truth, but expensive to redo.
