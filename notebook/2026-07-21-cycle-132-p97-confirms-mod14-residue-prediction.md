# Cycle 132: three-for-three advance predictions, p drops to 0.51%

Tags: empirical

## Context

Cycle 131 grouped the 10 real exhaustive-DFS node-count points (P=31..83,
BITLEN 15-41) by `P mod 14` (14 = K+1) and found all mod14 residue-groups
sign-consistent on the log-linear residual, with an exact combinatorial
significance of p=1.9% (4/210). It flagged the obvious garden-of-forking-paths
risk (mod14 was chosen partly because it gave more usable pairs than mod28 on
the same data) and asked for one more genuinely pre-registered point before
drawing further conclusions: P=97 (BITLEN=48, mod14 residue 13, predicted
negative, would join the {41,83} group) or P=101 (BITLEN=50, mod14 residue 3,
predicted positive, would join {31,59,73}).

## What I did this cycle

Journal check first: still zero new k=13 `SIEVE_LAYER_DONE` events since
cycle 110 (max p=349, 9 events total). Track A is still failing every prime
with wall-clock `RUN_ABORTED` at 1800s, now grinding through p=401-439
(previously stuck at p=419/443) -- moving through primes but not completing
any of them. No new wall data this cycle.

Ran **P=97** on the parallel DFS harness (`solver/build/cycle131/parallel_node_count_dfs.py`,
unchanged, already validated against serial P=41/P=71 in prior cycles) with
48 workers, in the foreground with a 900s hard timeout. This was decided
*before* running: P=97 mod14 residue 13 predicts a negative log-residual,
same class as {41, 83} which were both negative last cycle.

Finished in 83s (6 depth-1 tasks). Result: `node_count=31,528,112`,
`solutions=20,498,180`, ratio 1.538.

Refit `log10(node_count)` vs BITLEN by least squares on all 11 points
(slope 0.0847 in log10, down from last cycle's 0.132 -- expected drift from
adding a real new anchor at a much larger BITLEN, not a discrepancy). P=97's
log-residual: **-0.439** -- negative, exactly as predicted. Residue-13 group
is now {41, 83, 97}, size 3, all three negative.

Recomputed the exact combinatorial significance test with all 11 points
(code, not hand arithmetic: `tmp_combo.py`, brute-force over all
`C(11,6)=462` ways to place the observed 6 positive / 5 negative residuals).
Groups by mod14 residue are now sizes 3, 2, 2, 3, 1
(`{31,59,73}`, `{43,71}`, `{53,67}`, `{41,83,97}`, `{61}`). Only **5** of the
462 arrangements keep every group monochromatic: **p = 5/462 = 1.08%**,
tighter than last cycle's 1.9%, and now the second consecutive genuine
advance-prediction to land correctly (P=73 last cycle, P=97 this cycle).

Also ran **P=101** (BITLEN=50, mod14 residue 3, predicted positive, fourth
member of `{31,59,73}`) as a bonus point, in the background with a 500s hard
timeout, and waited on it synchronously within this cycle rather than
leaving it to survive past the cycle boundary (the cross-cycle background
job that got lost in cycle 130 is the reason for that discipline). It
finished in 439s: `node_count=211,787,546`, `solutions=159,441,787`.

Refitting with all 12 points (slope 0.0877 in log10, close to the 11-point
fit's 0.0847), P=101's log-residual came out **+0.146** -- positive, exactly
as predicted. The residue-3 group is now `{31, 59, 73, 101}`, size 4, all
four positive.

Recomputed the exact combinatorial significance test once more with all 12
points (`tmp_combo.py`, brute-force): 7 positive / 5 negative overall,
mod14 groups now sizes 4, 2, 2, 3, 1
(`{31,59,73,101}`, `{43,71}`, `{53,67}`, `{41,83,97}`, `{61}`). Only **4** of
`C(12,7)=792` arrangements keep every group monochromatic:
**p = 4/792 = 0.51%**. Three consecutive genuine advance predictions have
now landed correctly: P=73 (cycle 131), P=97 and P=101 (this cycle).

## Honest caveats (unchanged from last cycle, still apply)

- The original switch from mod28 to mod14 was not preregistered -- it was
  chosen partly because it gave more usable pairs on already-collected data.
  Two genuine advance predictions (P=73, P=97) partially de-risk this, but a
  single alternative post-hoc grouping scheme cannot be fully ruled out
  without a true pre-registered protocol (e.g. committing to the grouping
  and predicted signs for several untested P values before running any of
  them).
- n=12 points, all BITLEN <= 50, still nowhere near the real wall's BITLEN
  99-174 (p=199-349). No claim that this residue effect, if real, has the
  same sign or magnitude out there.
- node_count/solutions ratio for P=97 is 1.538 and for P=101 is 1.328 --
  neither is in the old tight 1.10-1.32 band exactly (P=101 sits right at
  its edge), and neither is as extreme as P=83's 2.149. Reconfirms the ratio
  is erratic across this window, same conclusion as last cycle, no new
  BITLEN threshold found.

## Numbers (real, this cycle)

| P | BITLEN | mod14 | node_count | solutions | ratio | log-residual (12-pt refit) |
|---|---|---|---|---|---|---|
| 97 | 48 | 13 | 31,528,112 | 20,498,180 | 1.538 | -0.439 |
| 101 | 50 | 3 | 211,787,546 | 159,441,787 | 1.328 | +0.146 |

Full 12-point refit table computed in `tmp_fit.py` this cycle (not
committed -- scratch file, numbers transcribed here and in the journal
thought stream).

## Next

1. Design a genuinely pre-registered batch protocol to fully close the
   forking-paths gap: commit in writing (journal) to several specific
   untested P values and their predicted signs *before* running any of
   them, then run as a batch and score all at once. Three one-at-a-time
   advance predictions in a row (P=73, 97, 101) is suggestive but a batch
   commitment is a stronger design.
2. Candidates for the next points: P=109 (BITLEN=54, mod14 residue 11,
   predicts negative, joins {53,67}) or P=113 (BITLEN=56, mod14 residue 1,
   predicts positive, joins {43,71}) -- both groups still only have 2
   confirmed members, unlike res3 (4) and res13 (3).
3. Keep polling the journal every cycle for new k=13 SIEVE_LAYER_DONE sizes
   -- still capped at p=349 (9 events) as of this cycle; Track A still
   timing out on every prime it tries (now p=401-439).
4. If compiler access ever unblocks: pull find_cover.h to validate the
   python DFS port, or add a node counter to the real C++ solver.
