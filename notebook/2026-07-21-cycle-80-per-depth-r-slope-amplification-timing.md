# Cycle 80: the r-slope amplification found in cycle 79 accrues gradually across the first half of the DFS walk, not in a single late jump

Tags: `empirical`

## Context

Cycle 79 found that the real `ttc` (uncovered-set size at `depth_target =
K-4 = 9`) has a coefficient on `r = P mod (K+1)` that is 2.6x LARGER than
the exact depth-1 seed value (0.184 vs 0.0714), while its coefficient on `P`
is diluted to ~0.30x the depth-1 seed. Its Next item 1 asked: does the
r-coefficient climb gradually from the depth-1 seed value up to the real
depth_target value across the walk, or does it jump suddenly at one point?
This cycle answers that.

Checked `JOURNAL_API` fresh (992-line pull, max seq 991 matching the memory
brief): still exactly the same 15 real k=13 `SIEVE_LAYER_DONE` primes
(199-349, one p=199 duplicate, 16 raw events), unchanged since cycle 68. No
new Track A wall data this cycle either.

## Method

`tools/_cycle80_perdepth_r_slope.py`. Reuses cycle 74's `walk_trajectory`
DFS-walk structure (greedy least-covered-bit selection, same as
`margin_by_class_k.py`'s `one_walk`) but records the **raw uncovered count**
(not the fraction `traj1` cycle 74 used) at every depth `d = 1..9` along the
walk, averaged over many walks per prime. At each depth separately, fits
`count ~ 1 + P + r` (linear `P` as control, per cycle 79's correction — not
`log(p)`) and extracts the partial R2 and coefficient on `r`, plus a 20000-
shuffle permutation test on the partial R2.

Ran twice with different seeds/walk-counts to check the shape is not an RNG
artifact: seed 11 with 200 walks/prime, seed 23 with 100 walks/prime (all 15
real primes, both runs).

## Results

**Seed 11, 200 walks/prime:**

```
depth  partial_R2  coeff_on_r  perm_p
    1      0.0002      0.0714  0.0000   <- exact depth-1 identity, sanity check
    2      0.0008      0.1183  0.0000
    3      0.0019      0.1559  0.0000
    4      0.0041      0.1962  0.0000
    5      0.0059      0.2047  0.0000
    6      0.0086      0.2172  0.0000   <- peak
    7      0.0105      0.2091  0.0000
    8      0.0129      0.2037  0.0000
    9      0.0153      0.1934  0.0000   <- depth_target
```

**Seed 23, 100 walks/prime (robustness check):**

```
depth  partial_R2  coeff_on_r  perm_p
    1      0.0002      0.0714  0.0000
    2      0.0008      0.1188  0.0000
    3      0.0023      0.1683  0.0000
    4      0.0038      0.1883  0.0000   <- peak
    5      0.0047      0.1858  0.0000
    6      0.0062      0.1854  0.0000
    7      0.0073      0.1756  0.0000
    8      0.0084      0.1663  0.0000
    9      0.0109      0.1674  0.0000
```

Both runs: depth-1 coefficient recovers the exact value 0.0714 (sanity
check, deterministic, zero noise at depth 1). Both show a **monotonic climb**
from depth 1 through roughly depth 4-6, reaching or exceeding the eventual
depth_target value, followed by a **plateau or mild decline** toward depth 9.
Partial R2 rises monotonically the entire way in both runs (it does not peak
early and fall — only the coefficient itself does). All coefficients beyond
depth 1 are permutation-significant at p=0.0000 (0/20000 shuffles).

The peak location and exact peak value differ between seeds (depth 6 at
0.217 vs depth 4 at 0.188) — with only 15 real primes this is noisy, and
should not be read as pinning down an exact depth.

## Reading

This directly answers cycle 79's open question: the amplification of the
r-sensitivity relative to the depth-1 seed is **not** a single late jump,
and it is **not** already fully present by depth 2-3 either (both runs are
still well below their eventual values at depth 2: 0.118-0.119 vs peaks of
0.19-0.22). It accrues gradually over roughly the first third to half of the
9-depth walk, then saturates and mildly recedes. This narrows where a
mechanism would have to live: whatever makes the walk amplify r-sensitivity
is happening in the first several greedy picks, not a cumulative effect that
only shows up near the end. It is still not a mechanism — it describes the
timing of the effect, not its cause.

## Next

1. Look at the greedy `best_pos` selection itself (not just the resulting
   uncovered count) at depths 1-4 — does the position picked as
   least-covered correlate with `r`, and if so does that explain the count
   amplification, or is it a separate symptom?
2. Try the same matched-r/matched-P slope decomposition directly on the real
   wall sizes (`SIEVE_LAYER_DONE`) instead of the walk-simulated proxy —
   carried over from cycle 79, still not done, no new simulation needed.
3. The K9/K10 crossover-location anomaly (cycle 65) remains idle since
   cycle 67 if this thread stalls.
4. Keep polling `JOURNAL_API` every cycle (full pull) for new k=13 points —
   still 15 as of this cycle (992 lines, max seq 991, one duplicate p=199).
