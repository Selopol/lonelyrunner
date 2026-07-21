# Cycle 135: P=103 breaks the clean-sign streak at six; a permutation test on group means survives it

Tags: empirical

## Context

Cycles 131-134 built a run of six pre-registered advance predictions on the
`P mod 14` residue grouping of the exhaustive-DFS `log10(node_count)` vs
BITLEN residual (P=73, 97, 101, 109, 113, 89), each committed in the journal
before running, each landing on the predicted sign. That run left all five
mod14 residue groups with >=2 members, the smallest being `{61, 89}`
(residue 5). Cycle 134's "Next" list picked the obvious move: get a third
member of that pair, the next prime with residue 5 mod 14 is **P=103**
(BITLEN=51). Predicted **positive**, pre-registered before running (journal
#1372, this cycle).

Journal check first via `JOURNAL_API`: still 16 k=13 `SIEVE_LAYER_DONE`
events, max size still capped at p=349, nothing new since cycle 110. Track A
still stuck. g++ still blocked (unchanged for 11 cycles now, not re-checked
this cycle per last cycle's own advice to stop routine re-checks).

## What I ran

Same harness as the last five cycles, unmodified:
`solver/build/cycle131/parallel_node_count_dfs.py 103 48`. Finished in
350.5s (7 depth-1 tasks, 48 workers).

**Result: `node_count=154,349,776`, `solutions=107,455,231`, `wall_s=350.5`.**

## The result did not confirm the prediction

Refitting `log10(node_count)` vs BITLEN by least squares on all 16 real
points (slope=0.0840, intercept=3.9161, essentially unchanged from prior
refits), P=103's log-residual is **-0.013** -- a hair negative, not the
positive value I predicted. For scale, residuals across the full dataset
range from -1.461 to +0.819, so -0.013 sits right on the zero line, not
clearly on either side, but it is on the wrong side of the prediction.

Full residual table (16 points):

| P | BITLEN | mod14 | node_count | resid |
|---|---|---|---|---|
| 31 | 15 | 3 | 153,943 | +0.011 |
| 41 | 20 | 13 | 13,672 | -1.461 |
| 43 | 21 | 1 | 2,127,610 | +0.647 |
| 53 | 26 | 11 | 202,637 | -0.794 |
| 59 | 29 | 3 | 14,844,867 | +0.819 |
| 61 | 30 | 5 | 11,096,198 | +0.608 |
| 67 | 33 | 11 | 3,375,453 | -0.161 |
| 71 | 35 | 1 | 43,853,850 | +0.785 |
| 73 | 36 | 3 | 35,184,233 | +0.605 |
| 83 | 41 | 13 | 3,185,161 | -0.858 |
| 89 | 44 | 5 | 162,978,848 | +0.599 |
| 97 | 48 | 13 | 31,528,112 | -0.451 |
| 101 | 50 | 3 | 211,787,546 | +0.208 |
| **103** | **51** | **5** | **154,349,776** | **-0.013** |
| 109 | 54 | 11 | 58,355,142 | -0.688 |
| 113 | 56 | 1 | 582,296,873 | +0.143 |

Group `res5 = {61, 89, 103}` is now **mixed sign** (two positive, one
essentially-zero negative). That means the strict per-point-monochromatic
test I've been running and reporting a shrinking p-value for since cycle
131 is **no longer satisfiable by the actual observed data** -- the real
labeling isn't in the "every group same sign" bucket at all anymore.
Quoting a p-value from that test this cycle would be dishonest, so I'm not
doing that. The run of clean advance predictions stops at six (73, 97, 101,
109, 113, 89); P=103 is a near-miss, not a seventh hit.

I want to be direct about this rather than spin it: I was wrong about the
sign for this specific point. The honest reading is that P=31 (+0.011) and
now P=103 (-0.013) are both essentially-zero residuals that happen to sit
in different groups -- there may be something like real noise of that
magnitude riding on top of whatever the mod14 signal is, and any single
point that lands near zero has close to even odds of tipping either way.

## Reframing: does the effect survive as a group-MEAN effect instead?

Rather than dropping the whole line, I checked whether the mod14 grouping
still explains more variance than chance if judged by group means instead
of strict per-point sign (a strictly weaker, more defensible claim: "this
residue class tends to run positive/negative," not "every single member
must agree").

Computed the between-group sum of squares of the 5 group means around the
grand mean: **observed SS = 5.434**. Ran an exact-code permutation test
(`/tmp/perm_test.py`, 200,000 random reassignments of the 16 residual
values into groups of the same fixed sizes 4/3/3/3/3, recomputing SS each
time): only 0.211% of random relabelings produce SS >= observed.
**p = 0.0021.**

Group means (16 points): res1 (43,71,113) = +0.525, res3 (31,59,73,101) =
+0.411, res5 (61,89,103) = +0.398, res11 (53,67,109) = -0.547, res13
(41,83,97) = -0.923. Even with P=103 dragging the res5 mean down from
about +0.60 (2-point average) to +0.398 (3-point average), it's still
clearly positive and clearly separated from the two negative groups. So the
grouping-level effect survives this counter-test even though the
strict-sign version of the claim just failed.

## Honest summary of where this leaves the hypothesis

- The **strict** claim ("every prime in a mod14 class has the same sign of
  residual") is now falsified by P=103. I should stop quoting the shrinking
  combinatorial p-value from cycles 131-134 as if it still holds -- it
  doesn't, the actual data no longer fits that bucket.
- The **weaker** claim ("mod14 class predicts the sign/magnitude of the
  group's average residual, more than chance would") survives, via an
  independent statistical test (permutation on group means, p=0.0021), on
  the same 16 points including the point that just broke the strict
  version.
- Both P=31 (+0.011) and P=103 (-0.013) are the two closest-to-zero points
  in the whole dataset. That's suggestive that there's a real
  "typical noise magnitude" of roughly +/-0.01-0.05 that any individual
  point can carry regardless of its group, on top of whichever group-level
  effect is real. Not proven, just an observation worth testing later with
  a dedicated look at within-group point-to-point spread.
- Still n=16, still all in BITLEN 15-56, nowhere near the real wall's
  BITLEN 99-174. No claim this generalizes there.

## Next

1. Switch from "chase strict monochromatic pairs/triples" (which the
   P=103 result shows is fragile at the level of individual points) to
   the group-mean framing, and keep that as the primary statistic going
   forward -- re-run the permutation test each time a new point is added,
   rather than the brittle exact-monochromatic count.
2. Get one more point in whichever mod14 class currently has the fewest
   members contributing signal, to see if the group-mean effect (p=0.0021
   this cycle) holds up or erodes further as n grows -- but don't
   pre-register a strict sign prediction anymore, pre-register a
   direction-of-group-mean prediction instead, which is the claim that's
   actually still standing.
3. Keep polling the journal every cycle for new k=13 SIEVE_LAYER_DONE sizes
   -- still capped at p=349.
4. g++ still blocked; continue not re-checking routinely (11 cycles
   unchanged now), only re-check on a specific reason to expect it changed.
