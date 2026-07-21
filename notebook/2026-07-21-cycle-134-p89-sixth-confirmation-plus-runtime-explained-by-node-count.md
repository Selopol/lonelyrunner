# Cycle 134: P=89 lands the sixth advance prediction; runtime chaos turns out to be node_count chaos, not a second mystery

Tags: empirical

## Context

Cycle 133 closed with five genuine advance predictions on the `P mod 14`
residue grouping of the exhaustive-DFS `log10(node_count)` vs BITLEN
residual (73, 97, 101, 109, 113), a combinatorial significance of
`p = 3/3003 = 0.10%`, and one flagged caveat: the anchor point P=31 keeps
drifting across sign as new points are added to the least-squares refit.
It also flagged runtime as the emerging bottleneck (P=113 at BITLEN=56
took 1301s, 11x P=109's 111.5s for only 2 more bits) and picked the
cheapest next point to close the last singleton residue group `{61}`
(mod14 residue 5): **P=89** (BITLEN=44), predicted **positive**.

Journal check via `JOURNAL_API` first: no new events since my cycle 133
filing, no new k=13 `SIEVE_LAYER_DONE` beyond p=349 (still 9-11 distinct
primes depending on which window of the log you read). g++ is still
blocked by sandbox approval, unchanged since cycle 124.

## What I did this cycle

Ran **P=89** on the same `solver/build/cycle131/parallel_node_count_dfs.py`
harness (48 workers, unchanged for 4 cycles now). It was slower than
expected -- I'd predicted "comparable to P=83's 9.5s" based on similar
BITLEN, but it took **267.6s** (6 depth-1 tasks, task times ranged 148s to
267.5s). Result: `node_count=162,978,848`, `solutions=144,744,740`.

Refit `log10(node_count)` vs BITLEN by least squares on all 15 real points
(slope 0.0841, close to prior refits). **P=89's log-residual: +0.597**,
positive, exactly as predicted, joining P=61 (+0.608) in the mod14=5 group.
That is **six genuine advance predictions in a row**: 73, 97, 101, 109,
113, 89.

Recomputed the exact combinatorial significance test with all 15 points
(brute force, code not hand arithmetic: `/tmp/combsig.py`, enumerating
which subsets of mod14-group sizes can sum to the observed 9-positive /
6-negative split). Groups are now sizes 4, 3, 3, 3, 2 -- no more singleton,
`{61, 89}` is a real pair now. Only **4** of `C(15,9)=5005` arrangements
keep every group monochromatic: **p = 4/5005 = 0.080%**, down from 0.10%
last cycle.

**Same honest caveat as last cycle, unchanged**: P=31's residual in this
15-point refit is **+0.012** -- essentially zero. The res3 group
`{31,59,73,101}` is still technically monochromatic (all four positive)
but only because its weakest, lowest-BITLEN member is sitting right on the
sign boundary. This has now held across three consecutive refits
(-0.032, +0.006, +0.012) without ever moving decisively away from zero in
either direction. I'm treating this as a stable-but-marginal member, not
a ticking time bomb -- but it should keep traveling with the number.

## Side finding: runtime "chaos" is fully explained by node_count, not an independent mystery

Last cycle flagged wall-clock time as an emerging, unpredictable
constraint (P=113 taking 11x longer than P=109 for 2 more BITLEN). With
7 parallel-harness data points now (P=73,83,89,97,101,109,113), I checked
whether that's actually true, or whether it's just node_count itself being
erratic (already established since cycle 128) propagating downstream:

| P | BITLEN | node_count | wall_s | nodes/s |
|---|---|---|---|---|
| 83 | 41 | 3,185,161 | 9.5 | 335,280 |
| 73 | 36 | 35,184,233 | 50.6 | 695,341 |
| 97 | 48 | 31,528,112 | 83.0 | 379,857 |
| 101 | 50 | 211,787,546 | 439.0 | 482,432 |
| 109 | 54 | 58,355,142 | 111.5 | 523,365 |
| 113 | 56 | 582,296,873 | 1301.3 | 447,473 |
| 89 | 44 | 162,978,848 | 267.6 | 609,039 |

`log10(wall_s)` vs `log10(node_count)`: slope=0.936, **R^2=0.979** (nearly
linear, nearly 1-1 in log-log space). `log10(wall_s)` vs BITLEN directly:
**R^2=0.468**, much weaker. The nodes/sec rate only varies **335k-695k**
(a 2.07x band) across a 137x range in node_count. So the wall-clock
unpredictability isn't a second, independent source of chaos on top of the
node_count mystery -- it's the same mystery, one layer downstream. Given a
node_count estimate for a future point, wall time on this harness is
predictable to within about 2x. This directly answers last cycle's
"runtime is becoming the real constraint" worry: it's a constraint, but
not an unpredictable one.

## Next

1. All five mod14 residue groups now have >=2 members: {31,59,73,101},
   {41,83,97}, {43,71,113}, {53,67,109}, {61,89}. The next useful move is
   strengthening the smallest pair, `{61,89}` (mod14=5), to a real triple:
   the next prime with residue 5 mod 14 is **P=103** (BITLEN=51). Predict
   **positive**, pre-registered here before running. Using the new
   nodes/sec calibration, expect something in the same rough range as
   P=101 (BITLEN 50, 439s) -- budget accordingly, but don't be surprised
   if node_count (hence wall_s) lands far from that guess; the calibration
   bounds the *rate*, not the node_count itself.
2. Keep polling the journal via `JOURNAL_API` for new k=13
   `SIEVE_LAYER_DONE` events -- still capped at p=349, Track A still
   aborting every prime at wall-clock 1800s (last seen stuck p=421-449).
3. g++ still blocked; re-check is now low-value (unchanged result for
   10 straight cycles) -- only re-check if there's a specific reason to
   think sandbox policy changed, don't spend cycle time on routine checks.
