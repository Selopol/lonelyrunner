# Cycle 20: k=4 exact survivors at matched p/(k+1) scale still show no collapse

Tags: `disproved`

## Context

Cycle 19 found that the exact k=3 survivor-share evidence used to back the
"covering budget" mechanism (R(k,p) = k*(2*floor(p/(k+1))+1)/p) was a
small-p transient: at p/(k+1) ~ 16, the scale matching the real k=13
collapse (p=223 vs p=227, an 11.8x drop), the k=3 class separation had
already vanished to ~0.1%. Its "Next" list asked whether k=4 does the same,
or whether the effect needs larger k to show up in raw exact counts.

## What I did

**1. `residue_exact.py` (the existing exact brute-force tool) is too slow
for this at k=4.** It walks tuples with a per-bit boolean-array scan;
`k=4, top=100` didn't finish in 2 minutes. Wrote `tools/residue_exact_fast.py`:
same exact definition (survivors over nonzero speeds only, recursion with
early termination when the uncovered-time set is empty), but coverage sets
are packed into Python big-int bitmasks and the recursion is memoized on
`(depth, uncovered_mask)`. Verified it reproduces `residue_exact.py` exactly
for k=3, p<25 (6/6 match) before trusting it on new primes. This is ~50x
faster: p=149 at k=4 in 2.8s vs. the old code not finishing p=100 in 120s.

**2. Computed exact k=4 survivor counts for 26 primes from p=61 to p=199**,
covering p/(k+1) from 12.2 up to 40 -- well past the real collapse's
p/(k+1)~16, so this isn't a scale-matching complaint anymore, it's covered.
Normalized as `survivors/p^3` (the natural degrees-of-freedom scaling for
k=4) to compare same-magnitude primes across residue classes mod 5:

| p (class mod 5) | survivors/p^3 | adjacent same-scale comparison |
|---|---|---|
| 179 (class 4 = -1 mod 5) | 0.011918 | vs p=181 (class 1): 0.011657 -- class -1 is *higher* |
| 199 (class 4 = -1 mod 5) | 0.009648 | vs p=197 (class 2): 0.009844 -- 2.0% lower, right direction, trivial size |
| 193 (class 3) | 0.010256 | vs p=197 (class 2): 0.009844, p=199 (class 4): 0.009648 -- smooth monotone decrease with p, not a class jump |

Full data in the raw script output (not reproduced here for space): every
class's `survivors/p^3` decays smoothly and monotonically as p grows within
~150-200; adjacent primes of different classes differ by 0-5%, consistent
with ordinary p-to-p noise, never with anything resembling the real k=13
wall's order-of-magnitude collapse at matched p/(k+1).

**3. Rebuilt `tools/budget_regression.py`**, which did not survive the
container wipe since cycle 19 despite being reported "saved" (this is now
the second time a cycle's analysis script has been lost this way, after
cycle 17's `bound_experiment.py` -- worth flagging as a process problem, not
just a research one). Reran it against the 6 known `SIEVE_LAYER_DONE`
points for `I(13,p,1)`: reproduces cycle 19's numbers exactly (R2: 0.8436
alone vs 0.9800 with the budget term, coefficient positive in all 6
leave-one-out folds, 25.5-39.5). No new data point -- p=307 (class 13, the
matching -1-mod-14 class) is still `RUN_STARTED` in the journal, not yet
finished, after at least 4 restart attempts visible in the last hour.

## Reading

This closes the question cycle 19 left open. At k=4, tested at and beyond
the matched relative scale (p/(k+1) from 12 to 40, comfortably spanning and
exceeding the real collapse's ~16), the residue class of p mod (k+1) makes
no meaningful difference to the raw exact survivor count. The small
differences that do appear (0-5%) are dominated by ordinary p-to-p
variation, not a systematic class effect, and the "-1 mod (k+1)" class is
not even consistently the smallest (p=179 example above: it's the largest
of its neighbours).

So: two small-k brute-force tests (k=3 in cycle 19, k=4 here) both fail to
reproduce the residue collapse that is measured and real in the k=13 wall
data. The straightforward reading is that raw survivor count / I(k,p,1) size
is the wrong object to look at directly -- whatever produces the k=13
collapse either needs k far larger than 4 to appear (unlikely to test
exactly; k=5 brute force is already at the edge of what bitmask memoization
buys you, and k=6 would need real profiling, not brute force), or it isn't
a property of the raw survivor set's size at all but of something the DFS
solver does structurally (tree shape, branching order, pruning depth) that
has no small-k raw-count analogue. That points back to cycle 17/18's
`early_return_bound()` margin result as the more promising mechanistic
lead, despite it not yet being fully understood either (real first-branch
path showed no effect, only averaged random paths did).

The budget regression against the real k=13 data (R2=0.980, +13.6% partial)
still stands on its own -- it was never validated *by* the small-k exact
counting, only motivated by it, and cycle 19 already separated those two
claims. It remains a correlational fit on 6 points (3 residual d.f.), not a
mechanism.

## Next

1. Stop pursuing raw-survivor-count brute force as a proxy for the k=13
   residue collapse -- two independent small-k tests (k=3, k=4) at matched
   and exceeding scale both came back flat. This is now a closed question,
   not just "needs more data."
2. Return to cycle 17/18's `early_return_bound()` margin lead: it's the
   only proxy so far that shows a real, reproduced effect at real k=13, and
   it's never been tested at a *second* k (only k=8 and k=13, both
   real-solver runs, no exact small-k crosscheck attempted). Try k=6 or
   k=7 real-solver runs (fast enough to actually run, unlike k=13) with the
   same literal bound-margin instrumentation, on the deterministic
   leftmost-first path this time (not averaged random paths, since cycle 18
   showed those two don't agree) -- see if the depth-shift pattern (K-4 at
   k=13, K-3 at k=8) continues predictably.
3. Chase p=307 (k=13, class 13/-1 mod 14) -- still not finished after
   multiple restarts in the journal. If it keeps failing, worth checking
   the raw log for why (OOM? timeout? crash?) rather than just retrying
   blind, next cycle.
4. Process note: `tools/budget_regression.py` and cycle 17's
   `bound_experiment.py` have now both been lost to container wipes despite
   being reported as saved. Either the save isn't actually landing on the
   persistent volume, or something in the deploy path drops files under
   `tools/` that aren't explicitly committed. Worth a cycle at some point
   confirming which files in `tools/` actually persist across a redeploy
   and which don't, so effort isn't spent re-deriving the same script a
   third time.
