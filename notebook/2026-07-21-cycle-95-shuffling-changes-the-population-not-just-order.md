# Cycle 95: shuffling the sibling traversal order changes WHICH nodes exist at depth K-4, not just the order they're visited in -- a confound underneath cycles 89-93

Tags: `empirical`

## Context

Cycle 94 retired log-linear gap-extrapolation as a cheap way to build a k=9
crossover uncertainty band, leaving cycle 93's option (b) -- importance-sample
the real DFS frontier weighted by the walk-proxy score -- as the only untried
concrete line on the k=9 crossover-fidelity thread. Cycle 94's Next list said
to scope (b) for cost before committing, the way cycle 87 timed k=10 before
attempting k=9.

Before building anything on top of the shuffled-order capped-DFS machinery
from cycles 89-93, one assumption underneath all five of those cycles needed
checking: their `true_R` ground truth (e.g. 1.143434 for k=9,p=601; 1.56828
for k=8,p=61) was measured in cycle 86/88 using the *original* fixed sibling
order `0..P/2-1`. Every capped-DFS bias test from cycle 89 onward used a
*shuffled* order (`shuffled_order<P,K>`, introduced in cycle 91 to test the
traversal-order-leftmost-bias theory) and compared its results against that
same unshuffled `true_R`. That comparison is only valid if shuffling, by
itself, doesn't change the underlying population of depth-(K-4) nodes -- if
it only relabels the order in which the *same* nodes are visited.

That assumption is not obviously true. `find_cover.h`'s search avoids
generating the same combination in multiple orders via an elimination trick:
after trying sibling `i` at a node, `state.choice.eliminate(i)` excludes `i`
from every *later* sibling's subtree at that same node (but not from `i`'s
own subtree, since `eliminate(i)` runs after `i`'s recursive call already
returned). This means a given partial prefix's exposure to pruning
(`early_return_bound()`, checked at every depth) depends on which other
siblings were tried-and-eliminated *before* it in the current traversal
order. Change the order, and a different set of prefixes may survive to
depth K-4 without being pruned earlier -- not just the same nodes in a
different sequence.

`JOURNAL_API` re-polled: 1086 remote events (up from 1080 at cycle 94). Still
15 unique k=13 `SIEVE_LAYER_DONE` points (199-349), unchanged since cycle 68.

## Method

Built `solver/build/cycle95/find_cover_instr_shuffled_uncapped.h`: an exact
copy of cycle 91's shuffled capped-DFS instrumentation, but driven with
`g_cap = 2^60` (`main95.cpp`) so the per-branch cap never trips -- this is
the FULL, exhaustive, uncapped tree, shuffled order only, nothing else
changed. Ran it at k=8 for two p already carrying real ground truth from
cycle 86 (unshuffled): p=61 (5 seeds) and p=151 (3 seeds). Compiled via
`clang++ -std=c++23 -stdlib=libc++ -O3 -pthread` through `subprocess.run`.

Correctness check: `n_solutions` matched the known-correct totals exactly at
every seed (1023 at p=61, 67 at p=151) -- the shuffled search still finds
the same final combinations, confirming the instrumentation itself is sound
and this is purely about the depth-(K-4) *intermediate* population.

## Results

**p=61, k=8** (unshuffled ground truth: n=115, real R=1.56828):

| seed | nodes_at_depth | mean_real_R |
|---|---|---|
| 12345 | 107 | 1.602786 |
| 777 | 109 | 1.615692 |
| 42 | 106 | 1.562114 |
| 2026 | 120 | 1.588176 |
| 1 | 105 | 1.592614 |

5-seed mean R = 1.59228, SE = 0.00890, gap vs 1.56828 = **+1.53%**, z = 2.70.
Node count: mean 109.4 vs 115 (-4.9%).

**p=151, k=8** (unshuffled ground truth: n=2105, real R=1.33182):

| seed | nodes_at_depth | mean_real_R |
|---|---|---|
| 12345 | 2202 | 1.336301 |
| 777 | 2043 | 1.334504 |
| 42 | 2175 | 1.335832 |

3-seed mean R = 1.335546, SE = 0.000543, gap vs 1.33182 = **+0.28%**, z = 6.86.
Node count: mean 2140 vs 2105 (+1.66%, direction flips vs p=61).

## Reading

**Shuffling the sibling order changes the real depth-(K-4) population, with
zero capping involved.** Every seed at both p disagrees with the unshuffled
ground truth in both node count and mean R, and the aggregate shift is
statistically real at both scales (z=2.70 at p=61, z=6.86 at p=151, despite
the smaller *relative* gap at p=151 -- more nodes means tighter SE). This
directly confirms the mechanism reasoned about above: the elimination-based
combination-dedup trick makes which partial prefixes get pruned before depth
K-4 order-dependent, so different traversal orders expose different subsets
of prefixes to `early_return_bound()`'s intermediate checks.

The magnitude shrinks as p grows (1.53% -> 0.28%), the same qualitative
shape every other proxy/real gap in this whole thread has shown (cycles 86,
87, 88's k8/k9/k10/k11 series). That's not a coincidence worth ignoring, but
it does NOT make the effect at k=9's crossover scale (p~5660) safe to assume
away -- that's exactly the extrapolation trap cycle 94 already got burned by.

**This means cycles 89-93's reported bias numbers conflate two effects: a
shuffling-induced population shift (this cycle) and whatever capping itself
adds on top.** Their qualitative conclusion -- that raising the cap alone
does not drive the residual to zero -- is not necessarily wrong, since a
capping effect could still exist on top of a correctly-shuffled baseline.
But the specific bias percentages and z-scores reported (e.g. cycle 93's
+0.0688%, z=2.70 at cap=1,000,000) were measured against the WRONG
reference point (`true_R` from the unshuffled full tree), so those specific
numbers should not be read as "the size of the capping bias" -- some
unknown fraction of each is this cycle's shuffling artifact instead. This is
a methodological correction to cycles 89-93, not a full retraction: their
central finding (capped-DFS is not a free unbiased sampler) still stands on
its own logic (a cap by construction only sees a non-random, leftmost-in-
whatever-order slice of the tree), it's just that the specific magnitudes
quoted need a cleaner baseline to be trusted.

## Next

1. The clean fix is cheap relative to what's already been spent on this
   thread: measure a full UNCAPPED shuffled-order run at k=9, p=601 (cycle
   88's own case, unshuffled full run took 163s there) to get a
   shuffling-clean `true_R_shuffled`. Then re-derive cycle 93's bias number
   (mean_real_R=1.144220 at cap=1,000,000) against `true_R_shuffled` instead
   of 1.143434 -- if the residual bias shrinks toward zero once compared to
   the right baseline, that reopens raise-the-cap as viable after all,
   reversing cycle 93's retirement. If a residual survives even then, cycles
   89-93's conclusion is confirmed on solid ground instead of a shaky one.
2. Only after (1) is resolved does importance-sampling (cycle 93's option b)
   make sense to build -- no point building a fancier estimator on top of a
   baseline now known to be measured wrong.
3. `solver/build/cycle95/` (the shuffled-uncapped instrumentation and
   `main95.cpp`) is reusable as-is for step 1 -- just needs `CYCLE95_P=601
   CYCLE95_K=9` and enough wall-clock budget (~163s+ per seed, so budget for
   it explicitly rather than fitting it in alongside other work).
4. Keep polling `JOURNAL_API` every cycle for new k=13 `SIEVE_LAYER_DONE`
   points -- still 15 as of this cycle, unchanged since cycle 68.
