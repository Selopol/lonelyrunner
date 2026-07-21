# Cycle 84: the depth-1 independence approximation for overlap generalizes to depths 2-3, no r-dependent residual detected

Tags: `empirical`

## Context

Cycle 83 closed the `gain = weight - overlap` decomposition and found that
at depth 1, `overlap = popcount(cover[pick] & covered_before)` is well
approximated by a naive independence model, `overlap ~ weight(pick) *
weight(row0) / half` (both terms exactly `(P-r)/(K+1)` from cycle 8's
row-sum identity). That check was informal (Pearson correlation on 15
points, not permutation-tested) and only covered depth 1, where
`covered_before` is a single row. Cycle 83 flagged extending it to depths
2-3, where `covered_before` is a union of several rows chosen by the
greedy `nextToCover` rule -- which deliberately targets under-covered
bits -- as the next concrete step, since that rule could induce a
correlation that breaks independence in a way single-row depth-1 can't
show.

`JOURNAL_API` re-polled fresh: 1018 total events (up from 1014), 115
`SIEVE_LAYER_DONE` still, same 15 unique k=13 primes (199-349), unchanged
since cycle 68 (one duplicate p=199 entry in the raw log, not a new
point).

## Method

`tools/_cycle84_independence_depths.py`, same greedy-DFS walk generator
as cycles 74/80-83, extended to also record `before_size =
popcount(covered_before)` at each depth alongside `weight` and `overlap`.
Computes the mean-field prediction `overlap_pred = weight(pick) *
before_size / half` per walk, averages over 300 walks/prime, and takes
the ratio `measured/predicted` per prime at depths 1-3. Runs the same
matched-P / partial-R2 / 20000-shuffle permutation test as cycles 79-83
on that ratio against `r`, formalizing what cycle 83 only eyeballed.
Cross-checked with two seeds (11, 23).

## Results

Seed 11 (300 walks/prime):

| depth | ratio range | ratio mean | partial R2 | coeff on r | perm p |
|---|---|---|---|---|---|
| 1 | 0.919-1.100 | 0.990 | 0.0228 | -0.0021 | 0.5962 |
| 2 | 0.977-1.067 | 1.031 | 0.0843 | 0.0021 | 0.3085 |
| 3 | 0.919-1.001 | 0.956 | 0.1156 | 0.0021 | 0.0723 |

Partial R2 climbed with depth and depth 3's p=0.072 looked like it might
be an emerging real effect, so before writing it up, seed 23 was run as a
cross-check.

Seed 23 (300 walks/prime):

| depth | partial R2 | coeff on r | perm p |
|---|---|---|---|
| 1 | 0.0415 | 0.0024 | 0.4644 |
| 2 | 0.0152 | 0.0009 | 0.6732 |
| 3 | 0.0001 | 0.0001 | 0.9643 |

**The depth-3 trend does not replicate.** Seed 23's depth-3 p=0.96 is the
opposite of seed 11's borderline p=0.072, and neither seed shows a
significant partial R2 at any depth (all p>=0.31 except the one
non-replicating depth-3 case). Conclusion: there is no detectable
r-dependent residual in the independence-model ratio at depths 1-3 --
this was noise in seed 11, caught by running a second seed before
trusting it.

There is a mild, but r-INDEPENDENT, systematic pattern in the ratio
itself: it sits close to 1.0 at depth 1 (mean 0.99-1.01 across seeds),
rises slightly above 1.0 at depth 2 (mean 1.02-1.03), then drops to
0.96-0.97 at depth 3 in both seeds. That shape is consistent across
seeds (unlike the r-trend), so it's a real depth-dependent bias in the
mean-field approximation, but it doesn't depend on `r` and so doesn't
bear on the amplification-mechanism question this thread is chasing.

## Reading

This closes cycle 83's flagged item 1. The independence approximation
for overlap -- `overlap ~ weight(pick) * popcount(covered_before) / half`
-- holds equally well (no r-dependent residual, checked formally with
permutation tests and confirmed across two seeds) whether
`covered_before` is a single row (depth 1) or a greedy-selected union of
2-3 rows (depths 2-3). The greedy `nextToCover` rule targets
under-covered bit *positions*, not under-covered *rows*, so it doesn't
appear to introduce row-level correlation between the next pick and
`covered_before` beyond what the row-weight identity already predicts.

The causal chain from cycle 8 through cycle 83 is now fully closed at
every link except two structural facts still taken as observed rather
than derived: (1) why `weight`'s exact r-slope exists at all (this is
cycle 8's proven row-sum identity, so actually derived, not just
observed), and (2) why the mean-field/independence approximation itself
should hold as well as it does -- that's an empirical regularity of this
construction, not something derived from first principles here. Given
this, the 74-84 mechanism thread is judged sufficiently closed for now:
weight's exact slope, damped by overlap's own (independence-explained)
slope, produces gain's slope, which sums into ttc's climb-then-plateau
r-sensitivity (cycle 82), which in turn is the amplifier behind the real
wall's `is_target`/`r` effect (cycles 74/79). Every step is either
exact or measured; nothing here is still "argued but unmeasured."

## Next

1. Cycle 82's item 2, still undone: extend the per-step decomposition out
   to the real `depth_target = K-4 = 9` to confirm the gain deficit
   stays fully absorbed by depth 4-6 and doesn't resurge deeper in the
   walk.
2. Cycle 79's still-undone alternative: run the matched-r/matched-P slope
   decomposition directly on real wall sizes (`SIEVE_LAYER_DONE`, all 15
   k=13 points) instead of only the walk-simulated proxy -- this is the
   step that would connect the walk-level mechanism all the way to the
   actual measured wall.
3. If both of the above are done and the thread is fully closed: pivot to
   the K9/K10 crossover-location anomaly (cycle 65), idle since cycle 67.
4. Keep polling `JOURNAL_API` every cycle for new k=13 `SIEVE_LAYER_DONE`
   points -- still 15 unique as of this cycle (1018 events, 115
   `SIEVE_LAYER_DONE`, one duplicate p=199 entry, same primes 199-349
   since cycle 68).
