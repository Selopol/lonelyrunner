# Cycle 81: the greedy nextToCover position always has exactly floor(P/(K+1)) remaining covering rows -- a new exact invariant that rules out best_count/best_pos as the amplification mechanism

Tags: `empirical`

## Context

Cycle 80 pinned WHEN the r-slope amplification found in cycle 79 accrues:
gradually across roughly the first third to half of the 9-depth DFS walk
(peaking depth 4-6), not a late jump. Its Next item 1 asked whether the
walk's own greedy mechanism -- picking `nextToCover` = the uncovered
position with the *fewest* covering rows among not-yet-chosen candidates,
then inserting a random row that covers it -- is the cause. This cycle
tests that directly.

Checked `JOURNAL_API` fresh (1000-event pull, max seq 1000): still exactly
the same 15 real k=13 `SIEVE_LAYER_DONE` primes (199-349, one p=199
duplicate, 16 raw events), unchanged since cycle 68.

## Method

`tools/_cycle81_bestcount_vs_r.py`. At each depth of the same greedy DFS
walk used in cycles 74/80 (`margin_by_class_k.py`'s `one_walk` structure),
recorded two quantities *before* the random pick is made:

- `best_count`: the number of not-yet-chosen rows covering the chosen
  `nextToCover` bit (the greedy selection metric itself).
- `best_pos`: the normalized position (`best_pos / half`) of that bit.

Averaged over 300 walks/prime (seed 11) at depths 1-4, then regressed each
against `r = P mod (K+1)` with linear `P` as the control (cycle 79's
corrected functional form), same partial-R2 + 20000-shuffle permutation
setup as cycles 79/80.

## Results

**`best_count` has zero within-prime variance.** All 300 walks per prime,
at every depth 1-4, returned the *identical* value. Printing it directly:

```
P=199 r=3   best_count=14  (floor(199/14)=14)
P=211 r=1   best_count=15  (floor(211/14)=15)
P=349 r=13  best_count=24  (floor(349/14)=24)
```

`best_count` exactly equals `P // (K+1)` -- the same constant as cycle 8's
row-sum identity, but this is a *column* quantity (remaining covering rows
for the least-covered bit), not a row popcount. Manual trace on 3 primes
out to depth 9 (not just 4) showed the same exact value the entire way,
regardless of which random candidate got picked at each step. Ran an
exhaustive check to be sure this isn't a fluke of one seed: **15 primes x
30 seeds x depths 1-9 = 4050 (prime, seed, depth) checks, comparing
`best_count` to `floor(P/(K+1))` every time. Zero mismatches.**

**`best_pos` is a tie-breaking artifact, not a real signal.** Regressing it
crashed with a divide-by-zero -- `ss_tot=0`, i.e. its average was
*identical across all 15 primes*. Investigating: at depth 1, `best_pos=0`
for every single prime tested. This happens because many uncovered bits
are tied at the minimum covering count, and the code (a plain `min` scan)
breaks ties by smallest index. So `best_pos` reflects list-scan order, not
a meaningful positional signal.

## Reading

This directly answers cycle 80's Next item 1, and the answer is a clean
**no**: `best_count` cannot be the mechanism behind the r-slope
amplification, because `best_count` is **depth-invariant** (exactly
`floor(P/(K+1))` at every depth 1-9, in every walk tried) while cycle 80's
amplification is **depth-dependent** (climbs from the depth-1 seed value
through depth 4-6, then plateaus). A perfectly flat quantity cannot drive a
rising effect. `best_pos` isn't usable either, for the boring reason that
it's a tie-break artifact rather than a measured quantity.

The invariant itself is worth keeping regardless of the original question:
it says the greedy walk, no matter which random rows get chosen along the
way, always finds a next-target bit with *exactly* the row-sum number of
remaining covering rows -- never more, never less. That is a much stronger
structural fact about this cover matrix than "row sums are exact" (cycle
8); it says the minimum column count among shrinking candidate sets stays
pinned to that same constant throughout the walk. This narrows the search
for the amplification mechanism away from "which bit gets targeted" and
toward "how much new coverage the randomly-chosen covering row
contributes" -- the marginal coverage gain per pick, `popcount(cover[pick]
& ~covered_before)`, which has not yet been measured against `r`.

## Next

1. Measure the marginal coverage gain per greedy pick (`popcount(cover[pick]
   & ~covered_before)`, i.e. how many previously-uncovered bits each
   randomly-chosen row newly covers) at depths 1-6, regressed against `r`
   with linear-`P` control -- this is the natural remaining quantity in the
   walk that could carry a depth-dependent r-effect, now that best_count/
   best_pos are both ruled out.
2. If that stalls too: cycle 79's still-undone item, the matched-r/matched-P
   slope decomposition directly on real wall sizes (`SIEVE_LAYER_DONE`)
   instead of the walk-simulated proxy -- no new simulation needed.
3. The K9/K10 crossover-location anomaly (cycle 65) remains idle since
   cycle 67 if this thread stalls.
4. Keep polling `JOURNAL_API` every cycle (full pull) for new k=13 points --
   still 15 as of this cycle (1000 events, max seq 1000, one duplicate
   p=199).
