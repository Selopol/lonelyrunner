# Cycle 109: quantifying the near-threshold R oscillation -- it grows with k, but sampling density is a confound

Tags: `empirical`

## Context

Cycle 108 completed the real (IS-estimator-confirmed) crossover ruler
for k=9-13 and flagged, but did not measure, a "general near-threshold
oscillation" visible in the k=13 sweep: R flips sign between almost
every adjacent sampled prime in the crossover region, more so than at
k=9-12. Its Next list item 3 asked for a direct quantification using
data already collected (no new runs): compute the adjacent-pair swing
`|R(p_i+1)-R(p_i)|` relative to the distance from R=1, across all five
k's existing sweep tables, and check whether the noise-to-signal ratio
grows with k the way the crossover measurements themselves suggest
(smaller BITLEN -> fewer configurations -> more combinatorial
variance is the working guess).

Polled `JOURNAL_API` first: Track A is still stuck on the k=13 real
wall (last `SIEVE_LAYER_DONE` still p=349), still aborting repeatedly
on p=419 (most recent poll: three separate RUN_STARTED/RUN_ABORTED
cycles on p=419 back to back, all "wall-clock timeout"/"time limit").
Nothing new on the real wall this cycle.

## Method

Pulled the five sweep tables straight from the journal via
`JOURNAL_API` (cycles 102/105/106/107/108's `HYPOTHESIS_PROPOSED`
bodies) -- all real IS-estimator R values already published, no new
compiles or runs:

- k=9: 4 points, p=1999-5003 (cycle 102)
- k=10: 5 points, p=1103-1301 (cycle 105, near-crossover cluster)
- k=11: 7 points, p=701-809 (cycle 106, 2-seed avg)
- k=12: 9 points, p=449-601 (cycle 107, 2-seed avg)
- k=13: 16 points, p=389-541 (cycle 108, 2-seed avg)

For each k's table, fit a straight line in `log(p)` from the first to
the last sampled point (the macro trend cycle 33/74 predicts should
govern the R decline). For every adjacent pair of sampled primes,
computed the local slope `(R_b - R_a)/(log p_b - log p_a)`, subtracted
the table's trend slope, and took `|residual| / |trend slope|` -- this
is the noise-to-signal ratio: how many "trend-units" the local wiggle
represents. Computed it both including and excluding pairs touching an
`is_target` prime (p mod (K+1) == K), since that dip is already a
separately-confirmed effect (cycles 106-108) and would otherwise
inflate the general-oscillation number with a different, known
mechanism. Script: `/tmp/quantify_osc2.py` (pure post-hoc arithmetic on
published numbers, not re-run against the solver).

## Results

| k | pairs | mean gap (primes) | ratio (all pairs) | ratio (excl. is_target pairs) |
|---|---|---|---|---|
| 9 | 3 | 1001.3 | 0.11 | 0.11 |
| 10 | 4 | 49.5 | 0.68 | 0.68 |
| 11 | 6 | 18.0 | 3.80 | 1.10 |
| 12 | 8 | 19.0 | 3.45 | 2.98 |
| 13 | 15 | 10.1 | 10.89 | 8.58 |

Excluding is_target pairs, the ratio climbs monotonically across all
five points: 0.11 -> 0.68 -> 1.10 -> 2.98 -> 8.58. This is not just a
k9-vs-rest split, it is one-directional at every step.

## The confound, and a partial check

The mean gap between sampled primes also shrinks with k in this
existing data (1001 -> 49.5 -> 18 -> 19 -> 10.1), because k9's sweep
(cycle 102) used coarse ~1000-prime steps while k13's (cycle 108) used
steps as small as 2-14. That is not a coincidence -- larger k has
smaller BITLEN, is cheaper to run, and later cycles sampled it more
densely for exactly that reason. Coarse sampling averages out any
local wiggle a finer sweep would reveal, so part of the rising ratio
could be a resolution artifact, not a k effect.

Partial check: k=11 and k=12 have almost identical mean sampling gaps
(18.0 vs 19.0), so they are the one pair in this table not confounded
by density. They still show a real step up once is_target pairs are
excluded: 1.10 (k11) vs 2.98 (k12). Same density, different noise
level -- that is evidence the growth survives underneath the density
confound, at least for this one adjacent pair of k values. It is not
proof across the whole k9-13 range, since k9/k10 vs k11-13 are not
density-matched at all.

## Reading

The oscillation cycle 108 flagged by eyeball is real and measurable:
by the trend-residual definition here, it is a small fraction of the
macro trend at k9 (0.11x) and larger than the macro trend itself by
k13 (8.6x, excluding the separately-known is_target effect). That is
consistent with the working "smaller BITLEN -> more combinatorial
variance" hypothesis, and the one density-matched comparison available
(k11 vs k12) supports it surviving independent of sampling density.
But the overall five-point trend is confounded by exactly the variable
that would also explain it (denser sampling at higher k), so this
should be reported as "consistent with, not proof of" the growing-
noise hypothesis. It also has a direct practical consequence already
used in cycle 108's method: near this threshold, a crossover estimate
from only 2-3 points is unreliable at k12-13, and needs several points
past the first sign flip to confirm it is sustained.

## Next

1. The confound needs a direct test, not another read of existing
   data: resample k=9 near its real crossover (p~4933, cycle 103) at
   the same density k13 used (gaps ~10-30 rather than ~1000). If the
   noise-to-signal ratio there stays near 0.1-0.3 even at fine
   resolution, the k-growth is real, not a sampling artifact. If it
   jumps toward the k11-13 range once sampled finely, the whole
   "noise grows with k" reading collapses to "noise is revealed by
   dense sampling everywhere, k9 was just never sampled densely
   enough to see it." Cheap: J=200000 IS runs at k=9 are the same cost
   structure already used in cycles 102-103, just more of them in a
   narrow window.
2. The is_target dip's magnitude-vs-k question is still open from
   cycle 108 (1.4-1.6% at k11, 1.58% at k12, 2.3-2.9% at k13, looks
   like it's growing, not flat) -- a fresh angle for a mechanism is
   still needed, not a rerun of raw overlap / conditioned overlap /
   spatial clustering (dead ends #941/#947/#954).
3. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE
   sizes -- still capped at p=349, Track A repeatedly timing out on
   p=419.
