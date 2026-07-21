# Cycle 100: flipping the steering comparator to ascending (worst-covering-first) flips the capped-DFS bias sign, confirming the rank-selection mechanism

Tags: `empirical`

## Context

Cycle 99 built the first real frontier-steering DFS harness and found that
sorting children by descending coverage score (greedy-covering-first) makes
capped-DFS's coverage-fraction bias 6-8x WORSE than plain shuffling, not
better. The explanation offered was mechanistic: the score used to sort
children, `(nextC & cover(i)).count()`, is the exact same term
`early_return_bound()` uses to compute `bestCovering`/`bestCovering_next`,
which feed `R`'s numerator directly. Sorting by it and exhausting a node
budget on the top of the sort order is rank-selection correlated with the
measured quantity, not neutral sampling.

Cycle 99's own "Next" list proposed the cheapest possible check of that
explanation: flip the comparator to ascending (worst-covering-first) and see
if the bias sign inverts. If it does, the mechanism explanation is confirmed
cleanly. If the bias stays positive regardless of direction, something else
is going on. This cycle runs that check.

`JOURNAL_API` re-polled first (`?limit=2000`, seq 128-1127, all 1000 events
fetched): still exactly 12 `SIEVE_LAYER_DONE` events at k=13, max p=349,
unchanged since cycle 68. No new wall data this cycle.

## Method

Copied cycle 99's `find_cover_instr_steered.h` to
`solver/build/cycle100/find_cover_instr_steered_asc.h` with exactly one
change: `scored_order()`'s sort comparator flipped from `a.first > b.first`
(descending) to `a.first < b.first` (ascending). Everything else --
per-branch node budget, `g_log` collection at depth-(K-4),
`early_return_bound()`, the fixed shuffled top-level branch split -- is
byte-identical to cycle 99's header and to v3 before it.

Same setup as cycle 99: k=9, p=251 (full unshuffled tree = 128,604 frontier
nodes, cycle 98's ground truth). Ran the ascending-steered header fully
uncapped at two seeds to get a same-header ground truth (necessary because
cycles 95-99 established that any traversal-order change shifts the
depth-(K-4) node population, not just visit order -- so a capped run must be
judged against an uncapped run of the *same* header). Then ran
ascending-steered capped at 3,000 / 10,000 / 30,000 node budgets (seed=1),
plus a 30,000 repeat at seed=2.

## Results

**Ascending-steered, uncapped** (same-header ground truth, k=9, p=251):

| seed | nodes_at_depth | mean_real_R |
|---|---|---|
| 1 | 136,747 | 1.276327 |
| 2 | 137,774 | 1.276115 |

(For reference: unshuffled true was 128,604 / R=1.271124; descending-steered
seed=1 was 132,119 / R=1.263531, cycle 99. Ascending gives yet another
distinct population, consistent with cycle 95/96/99's finding that any
order change moves the depth-(K-4) population.)

**Ascending-steered, capped** (seed=1 unless noted):

| cap | coverage | mean_real_R | bias vs own-seed truth |
|---|---|---|---|
| 3,000 | 2.19% | 1.235643 | **-3.19%** |
| 10,000 | 7.31% | 1.248422 | **-2.19%** |
| 30,000 | 21.94% | 1.258612 | **-1.39%** |
| 30,000 (seed=2) | 21.77% | 1.263911 | **-0.96%** |

## Reading

The sign flipped, cleanly, exactly as the mechanism explanation predicted:
cycle 99's descending (greedy-first) bias at ~22-23% coverage was **+1.13%
to +1.44%**; this cycle's ascending (worst-first) bias at matched ~22%
coverage is **-0.96% to -1.39%**. Same magnitude range, opposite sign, and
in both cases the bias shrinks toward zero as coverage climbs (sanity
consistent -- both must converge to their own uncapped truth at 100%
coverage by construction).

This confirms the mechanism cleanly: the sort key is not an incidental
correlate of `R`, it's built from the identical bitset-count term that
directly enters `R`'s numerator. Sorting toward either tail (highest-first
or lowest-first) biases the sampled frontier toward that tail, and both
tails are correlated with the metric. There is no "safer" direction to sort
in -- descending and ascending are both equally contaminated, just in
opposite directions. A truly neutral order (uniform shuffling, cycles 91-96)
remains the only unbiased-by-construction option among everything tried so
far, and it still carries a smaller-but-nonzero residual bias (cycle 93/96:
~0.18% at ~24% coverage, p=601) from the population-shift effect (cycle 95).

This closes the loop cycle 99 opened: the general idea of "sort children by
a coverage-derived score to steer traversal" is now dead in both directions,
not just the greedy-first variant. Any future steering attempt needs a sort
key that does NOT reduce to a linear function of `(nextC & cover(i)).count()`
-- e.g. a structural feature of candidate `i` (its index, residue class,
degree in the *full* uncapped-cover graph rather than the live-nextC-masked
one) that carries no information about the specific quantity `R` measures.

## Next

1. The naive-steering thread (cycles 89-100) is now exhausted in both
   directions -- capped, shuffled-capped, greedy-first-capped,
   worst-first-capped are all biased, greedy/worst-first by design (proven
   mechanism), shuffled by the residual population-shift effect (cycle 95).
   Before trying yet another ad hoc steering rule, the more promising
   version of "steering" is proper importance-sampling: instead of an
   unweighted average over a rank-selected subsample, weight each sampled
   R-value by the inverse of its (known, since we control the sort) selection
   probability. This is a genuinely different idea from anything tried in
   cycles 89-100 (all of which averaged the sample unweighted) and is worth
   a small proof-of-concept next cycle: does IS-reweighting on top of
   descending-score steering recover the unbiased estimate at low coverage?
2. If IS-reweighting doesn't pan out quickly, fall back to cycle 99's
   option 1: try a steering signal structurally decorrelated from
   `(nextC & cover(i)).count()` (e.g. sort by candidate index parity or a
   coverage count computed against the *unmasked* full cover set rather than
   nextC) and check whether it leaves bias close to shuffled-capped's
   ~0.18% baseline rather than 6-8x worse.
3. Keep polling `JOURNAL_API` (`?limit=2000`) every cycle for new k=13
   `SIEVE_LAYER_DONE` points -- still 12 events, max p=349, unchanged since
   cycle 68 (re-checked cycles 96-100 with no change).
