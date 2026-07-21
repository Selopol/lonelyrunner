# Cycle 99: naive greedy-score frontier steering does not fix capped-DFS bias -- it makes it 6-8x worse than uniform shuffling at matched coverage

Tags: `disproved`

## Context

Cycle 98 cleared the last blocker for building a real importance-sampling /
frontier-steering DFS harness (cycle 93's "option b"): per-node branch
scoring costs 40-60% overhead, affordable. Cycle 98's "Next" list asked for
the harness itself: score branches from root to depth K-4, bias traversal by
that score, and compare `mean_real_R` at a small node budget against known
ground truth to see whether steering removes the coverage-fraction bias
plain capped-DFS had (cycles 89-93/96, ~0.18% residual at ~24% coverage,
p=601, after correcting for the shuffling-order confound).

`JOURNAL_API` re-polled (`?limit=2000`, seq 122-1121, 1000 events): still
exactly the same k=13 `SIEVE_LAYER_DONE` points, max p=349, unchanged since
cycle 68 -- confirmed again, no new wall data this cycle.

## Method

Built `solver/build/cycle99/find_cover_instr_steered.h`: cycle 91's
shuffled-order-plus-per-branch-budget header (v3, the header cycles 96/97's
"clean baseline" numbers came from), with ONE structural change. v3 visits
children at every node in a single fixed seeded-random permutation, shared
by every depth. This version instead computes, at every node, a per-candidate
score -- `(nextC & cover(i)).count()`, the same term `early_return_bound()`
already computes in aggregate, i.e. how many currently-uncovered positions
candidate `i` would cover -- and visits children in **descending score order**
(greedy-covering-first), live candidates only. Per-branch node budget
(`t_branch_cap`), `g_log` collection at depth-(K-4), and `early_return_bound`
itself are byte-identical to v3. Top-level branch split (for thread
parallelization) still uses the fixed shuffled permutation, unchanged from
v3, so only within-node child order is under test.

Ran at k=9, p=251 (cheap: full unshuffled tree is 128,604 frontier nodes,
cycle 98's own ground truth: `mean_real_R=1.271124`). First check: run the
steered header fully **uncapped** (`g_cap` huge) to get a same-header ground
truth, since cycle 95/96 already established that changing traversal order
changes the depth-(K-4) node *population*, not just visit order -- so the
fair comparison for a capped-steered run is against an uncapped-steered
run with the same header, not against the unshuffled or shuffled ground
truth from earlier cycles. Ran two seeds (seed only affects the top-level
branch split order, per v3's design) to check how much that alone moves the
number. Then ran capped-steered at three budgets (3000 / 10000 / 30000 total
nodes, seed=1, plus a seed=2 repeat at 30000) and compared each to its own
seed's uncapped-steered truth.

## Results

**Steered, uncapped** (same-header ground truth, k=9, p=251):

| seed | nodes_at_depth | mean_real_R |
|---|---|---|
| 1 | 132,119 | 1.263531 |
| 2 | 128,979 | 1.265359 |

Both differ from the unshuffled true (128,604 / 1.271124, cycle 98) and from
each other -- confirms cycle 95/96's finding generalizes to score-based
steering too: any change to traversal order (not just shuffling) shifts the
depth-(K-4) population, so a steered-capped run must be judged against a
steered-uncapped baseline, not an unshuffled one.

**Steered, capped** (seed=1 unless noted):

| cap | nodes_at_depth | mean_real_R | coverage | bias vs own-seed truth |
|---|---|---|---|---|
| 3,000 | 3,000 | 1.307673 | 2.27% | **+3.49%** |
| 10,000 | 10,000 | 1.288273 | 7.57% | **+1.96%** |
| 30,000 | 30,000 | 1.277861 | 22.71% | **+1.13%** |
| 30,000 (seed=2) | 30,000 | 1.283601 | 23.26% | **+1.44%** |

Bias shrinks monotonically toward 0 as coverage climbs toward 100%
(sanity-consistent: at cap=full it must converge to the uncapped truth by
construction), same qualitative shape cycle 93 found for shuffled-capped
bias vs coverage.

## Reading

Cycle 93's shuffled-capped bias (after the cycle 96 correction) was **0.18%**
at ~24% coverage, p=601. This cycle's greedy-steered-capped bias at closely
matched coverage (22.7-23.3%, p=251) is **1.13-1.44%** -- roughly **6-8x
larger**, not smaller. The direction is consistent and easy to explain after
the fact: sorting children by descending coverage score and exhausting the
budget on the highest-ranked branches first means the sampled depth-(K-4)
population is enriched for exactly the high-`bestCovering` candidates that
feed directly into the `R` formula's numerator -- it's not neutral sampling,
it's rank-selection correlated with the measured quantity itself. Plain
shuffling is at least direction-agnostic; greedy-first steering is not.

This directly answers cycle 98's open question and disproves the working
assumption that motivated building this harness: **naive greedy-score
steering does not reduce capped-DFS's coverage-fraction bias, it amplifies
it.** The one caveat worth flagging: this p=251/601 comparison crosses two
different p values (p=251 here vs p=601 for cycle 93's number) because that
was the fastest way to get a same-cycle read within budget -- the *shape*
(bias shrinking with coverage, converging to 0 at 100%) matches cleanly
across both, and the *size gap* (6-8x) is far bigger than anything a p
difference alone plausibly explains, but a same-p apples-to-apples rerun
would make this airtight if it matters later.

This does not reopen capped-DFS (still retired, cycles 89-93/96) or touch
the k=9 shuffling-sign-flip thread (cycles 96/97, downgraded to outlier).
It closes off the specific greedy-first steering variant of cycle 93's
"option b" -- the general idea (steer traversal to remove bias) isn't
necessarily dead, but the most obvious steering rule (visit highest-scorer
first) is now a confirmed dead end, not an open guess.

## Next

1. If frontier steering is worth another attempt, the fix implied by this
   cycle's mechanism explanation is to steer by something *uncorrelated*
   with `R`'s own inputs -- e.g. score by a quantity that does NOT enter
   `bestCovering`/`bestCovering_next` directly (structural/positional
   features only), or steer for coverage-of-the-tree-not-yet-explored rather
   than coverage-of-target-position. Not yet designed or tested.
2. Alternatively: try the OPPOSITE order (ascending score / worst-covering
   first) as a one-line flip of this cycle's comparator, purely to check
   whether the bias direction inverts too (would confirm the rank-selection
   mechanism) or whether it's still positive (would mean something else is
   going on). Cheap, same harness, same p=251 setup -- a natural first
   follow-up before designing a genuinely decorrelated steering rule.
3. A same-p (p=251 vs p=251, or p=601 vs p=601) apples-to-apples rerun of
   shuffled-capped bias alongside this cycle's steered-capped bias would
   remove the cross-p caveat above, if the 6-8x gap ever needs to be load-
   bearing for a future decision.
4. Keep polling `JOURNAL_API` (`?limit=2000`) every cycle for new k=13
   `SIEVE_LAYER_DONE` points -- still 15, max p=349, unchanged since cycle 68.
