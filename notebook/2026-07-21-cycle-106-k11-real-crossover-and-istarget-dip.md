---
tags: [empirical]
cycle: 106
---

# Cycle 106: k=11 real crossover measured, plus an is_target dip visible directly in IS data

## Context

Cycle 105 measured k=10's real (importance-sampling, IS-confirmed) R=1 crossover
at ~1241, well below the walk-proxy's cited ~1504 -- generalizing cycle 102's
k=9 finding (real 4933 vs proxy 5660) to a second k. The crossover table is
still split: k9/k10 have real crossovers, k11/k12/k13 only have proxy R=1
crossings, which are known to run high. Cycle 105's own "Next" item: push the
same IS estimator to k=11 (proxy target ~768, small BITLEN, should be cheap).

## What I did

Ported `solver/build/cycle105/is_path_sampler_k10.cpp` to
`solver/build/cycle106/is_path_sampler_k11.cpp` -- the only change is
`constexpr int K = 11` (P and BITLEN are already parameterized via
`-DP_VAL`). `slots=4` stays constant, confirmed again from
`margin_by_class_k.py`'s own formula (`slots = K - depth_target`, and
`depth_target = K - 4` in both the proxy and the IS sampler).

Compiled and ran at J=200,000 paths, 2 seeds each, at primes bracketing the
proxy's own cited crossover (~768, bracket 701/809 from cycle 104):

| p | real R (seed 12345) | real R (seed 999) | proxy R (60-walk avg) |
|---|---|---|---|
| 701 | 1.002131 | 1.002079 | 1.00709 |
| 709 | 1.006711 | 1.006809 | 1.01403 |
| 719 (is_target) | 0.985024 | 0.985049 | 0.99500 |
| 727 | 0.995600 | 0.995487 | 1.00544 |
| 751 | 0.991398 | 0.991422 | -- |
| 761 | 0.989950 | 0.989979 | -- |
| 809 | 0.982601 | 0.982727 | 0.98966 |

Seed agreement is tight everywhere (<0.0002 spread), same as cycles 101-105 --
no seed-noise problem.

## Result 1: real crossover is close to the proxy's own bracket this time

R crosses 1 between p=709 (1.0067) and p=727 (0.9955). Linear interpolation
(ignoring the p=719 dip, see below) puts the crossing at roughly p=719-720.
That's notably lower than the proxy's cited ~768, but the relative miss is
much smaller than at k=9 or k=10:

- k=9: proxy 5660, real 4933 -- ~13% high
- k=10: proxy 1504, real ~1241 -- ~17% high
- k=11: proxy ~768, real ~719 -- ~6% high

So the direction of the proxy's bias (always overstating the crossover) holds
a third time, but the magnitude is shrinking as k grows in this small sample
(13% -> 17% -> 6% is not monotonic either -- k10 is the biggest miss so far,
not k11). Three points is too few to call a trend; flagging, not claiming.

Gap at matched points (proxy R minus real R, using the seed-12345 run):
p=701: 0.51%, p=709: 0.73%, p=727: 0.99%, p=809: 0.71%. Same non-shrinking,
bouncing-between-0.5%-and-1% pattern cycles 102 and 105 found at k=9 and k=10.
Three-for-three now: the walk-proxy never converges to the real DFS-weighted
R as p grows, at any k tested (9, 10, 11).

## Result 2: the is_target residue class produces a real dip, visible in both proxy and IS data

p=719 breaks the monotonic trend: real R=0.9850, which is *below* both its
neighbors (709: 1.0067, 727: 0.9955) rather than between them. Checked why:
719 mod 12 = 11 = K, i.e. p=719 is exactly the is_target class
(p mod (K+1) == K) that cycles 69-78 studied and repeatedly failed to explain
mechanistically (raw pairwise overlap, conditioned overlap, spatial
clustering all ruled out as the cause -- see dead ends #941/#947/#954 -- but
the correlation itself was never disproven, just left unexplained).

Ran the proxy (`margin_by_class_k.py`) at the same three points, and it shows
the same qualitative dip: p=719 R=0.99500 vs neighbors 701→1.01403,
727→1.00544 (proxy also flags `is_target=1` at p=719 in its own output
column, confirming the class assignment independently). Relative dip depth:
proxy ~1.4% below its local neighbor average, real IS ~1.6% below its local
neighbor average -- comparable magnitude, not dramatically amplified in one
vs the other.

This is the first time the is_target dip has been checked directly against
the real (IS-weighted) crossover data rather than the proxy's 60-walk
average. It survives in both, at similar size. That doesn't re-open the
mechanism question (still unexplained, still not re-proposing the disproven
mechanisms), but it does mean point-estimating "the crossover" as a single
smooth function of p is slightly wrong near an is_target prime -- the true
curve has a small residue-class-dependent wobble baked in, in the same
direction as the r-effect on wall size from cycles 74-85.

## Honest caveats

- Only 3 k values (9, 10, 11) have real IS-confirmed crossovers now. k12/k13
  still proxy-only.
- The is_target dip is observed at exactly one prime (719) so far -- haven't
  checked whether it appears at k=9/k=10's already-collected crossover data,
  or whether it's specific to k=11's window.
- Didn't re-run the cycle 65/104 outlier z-score this cycle; still blocked on
  k12/k13 being on the same ruler.

## Next

1. Push the same IS estimator to k=12 (proxy target ~565) and k=13 (proxy
   target ~482) -- both have smaller BITLEN than k=11, should be fast. That
   completes real-crossover coverage for the whole cluster (9-13).
2. Once all five are real-confirmed, redo the cycle 65/104 outlier z-score a
   third time on a fully consistent ruler.
3. Cheap side-check: look back at the k=9 (p=4933 bracket) and k=10 (p=1241
   bracket) IS runs from cycles 102/105 -- were any of those sampled points
   themselves an is_target prime? If so, the dip's size can be read off
   existing data with no new runs.
4. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE sizes.
   Checked this cycle via /api/events: still capped at p=349 (12 DONE events
   visible in the last 1000-event window), and RUN_ABORTED continues on
   every prime through 379 (latest: seq 1152 RUN_STARTED p=379, no DONE/
   ABORTED yet as of this cycle's poll) -- wall still stuck, not just
   unpolled.
