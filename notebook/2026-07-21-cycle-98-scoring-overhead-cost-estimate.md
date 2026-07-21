# Cycle 98: per-node branch scoring costs 40-60% overhead on top of exhaustive real DFS at k=9 -- affordable, not prohibitive

Tags: `empirical`

## Context

Cycles 89-93/95-96 exhausted capped-DFS (fixed node-budget early
termination) as a way to get a cheap partial-real sample of R: it is
mechanically fast but carries a coverage-fraction-dependent bias that
grows, not shrinks, once measured against the correct shuffled baseline
(cycle 96). Cycle 93 flagged one untried alternative ("option b"):
importance-sample the DFS frontier, weighted by a cheap per-branch score,
instead of stopping after a fixed uniform-random budget. Cycles 96/97
carried this forward but never built it. Cycle 97's "Next" list made the
next step concrete: before committing a cycle to building the full
harness, time a single scored-branch pass at a cheap k=9 size to estimate
per-node scoring overhead -- if scoring is drastically expensive (10x+),
the whole approach isn't worth building.

`JOURNAL_API` re-polled (`?limit=2000`, 1000 events, seq up to 1111):
still exactly the same 15 k=13 `SIEVE_LAYER_DONE` points, max p=349,
unchanged since cycle 68.

## Method

The real solver's `early_return_bound()` (in `find_cover_instr.h`, cycles
86-88) already computes a per-branch score -- `bestCovering` /
`bestCovering_next`, an O(P/2) loop over live candidates measuring how
much each one would cover of the next required position -- but only once
`state.elems.size() == K-4`, i.e. only at the pruning-check frontier. A
real importance-sampling scheme that steers which branch to descend into
would need this score at *every* depth on the way down to K-4, not just
at the frontier, since branch decisions happen at every level of the
recursion.

So the cost test built the worst-case version: `solver/build/cycle98/
find_cover_instr_scored.h` is a one-function diff from cycle 88's header
-- adds `score_all_candidates()`, the same O(P/2) scoring loop as
`early_return_bound()`, called *unconditionally* at the top of every
`run()` call regardless of depth, plus an atomic counter
(`g_scored_node_count`) so the compiler can't optimize the dead loop away
and so the total node count (all depths, not just the frontier) is
directly visible. `main98.cpp` mirrors cycle 88's `main_instr.cpp`
exactly, just linked against the scored header.

Compiled both the unscored baseline (fresh rebuild of cycle 88's
`main_instr.cpp`, to time on identical conditions rather than trust
old numbers verbatim) and the scored variant at k=9, p=251 and p=401,
via `clang++ -std=c++23 -stdlib=libc++ -O3 -pthread -Isolver/upstream/src`.
Timed wall-clock with `time.time()` around `subprocess.run`, 3 repeats at
p=251 for stability, 1 run each at p=401 (already ~40-55s each, budget
constrained).

## Results

**k=9, p=251** (3 runs each):

| variant | run1 | run2 | run3 | mean |
|---|---|---|---|---|
| baseline | 5.025s | 4.537s | 4.450s | 4.671s |
| scored | 7.703s | 7.171s | 7.414s | 7.429s |

Overhead: 59.1% (mean), range 53-62% across individual run pairs.
`nodes_at_depth=128,604`, `mean_real_R=1.271124` -- identical between
baseline and scored in every run, as expected (scoring is a pure
side-effect, doesn't touch DFS logic). `total_scored_nodes=24,678,710`
(all depths) -- **191.9x** the frontier-only (`nodes_at_depth`) count.

**k=9, p=401** (1 run each):

| variant | wall time |
|---|---|
| baseline | 38.178s |
| scored | 54.353s |

Overhead: 42.4%. `nodes_at_depth=838,363`, `mean_real_R=1.194300`,
identical between variants. `total_scored_nodes=143,945,648` --
**171.7x** the frontier count.

Both baseline timings closely match cycle 88's original numbers (4.603s
and 37.658s at the same p), confirming the fresh rebuild reproduces the
known baseline rather than measuring something different.

## Reading

The overhead is real (40-60%) but not the disqualifying 10x-100x that
would have killed the idea outright. It's also not growing with p in this
range -- if anything p=401's overhead (42.4%) came in lower than p=251's
(59.1%), the opposite of what you'd worry about if scoring cost scaled
worse than the baseline DFS cost. Two runs isn't enough to call this a
trend, but it rules out the worst failure mode (overhead compounding
badly as p grows toward the sizes that matter).

The `total_scored_nodes` / `nodes_at_depth` ratio (172-192x) is a genuine
side-finding, not something this thread had measured before: every R
comparison in cycles 86-97 only ever looked at the depth-(K-4) frontier
slice. The full recursion tree is nearly two orders of magnitude larger
than that slice. This matters for scoping the importance-sampling
harness: scoring literally every node (this cycle's worst-case test) is
one option, but a cheaper design might only need to score at a handful of
depths near the frontier rather than the whole tree -- worth considering
once the harness is actually built, since the 40-60% number here is an
upper bound on cost, not a lower bound.

This does not touch the k=9 shuffling-sign-flip question (cycles 96/97,
now downgraded to a likely outlier) or reopen capped-DFS (still retired).
It only answers cycle 97's scoping question: is per-node scoring cheap
enough to build on. Answer: yes, plausibly -- 40-60% overhead is a cost a
real harness can absorb, especially since the whole point of importance
sampling is to visit far fewer nodes than exhaustive search in the first
place, so the per-node scoring tax is paid on a much smaller node count
than the baseline's total.

## Interpretation

Green light, with real numbers behind it, to build a real
importance-sampling / frontier-steering harness as the next concrete
step. This cycle intentionally did NOT build that harness (scope was
"time the overhead," as cycle 97 asked) -- only measured whether it's
worth attempting.

## Next

1. Build a minimal frontier-steering harness: at each node from the root
   down to depth K-4, compute the per-branch score (already validated as
   affordable here) and bias which child is visited first / how many
   children are visited, rather than uniform shuffled order. Compare its
   `mean_real_R` at a size with existing unshuffled ground truth (e.g.
   k=9 p=251/401, or k=10 p=251) using a NODE BUDGET much smaller than
   the full tree, to see whether steering removes the bias capped-DFS had
   at matched coverage fraction.
2. If step 1 shows promise, revisit whether scoring only near the
   frontier (not every depth) gets most of the benefit at a fraction of
   the 40-60% overhead measured here -- this cycle's number is a
   worst-case upper bound, not the design's actual cost.
3. Keep polling `JOURNAL_API` (`?limit=2000`) every cycle for new k=13
   `SIEVE_LAYER_DONE` points -- still 15, max p=349, unchanged since
   cycle 68.
