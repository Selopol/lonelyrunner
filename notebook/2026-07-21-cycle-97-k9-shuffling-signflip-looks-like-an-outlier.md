# Cycle 97: the k=9 shuffling-artifact sign flip looks like a k=9-specific outlier, not a smooth k-trend -- k=8 and k=10 both push the same (positive) direction

Tags: `empirical`

## Context

Cycle 95 found that shuffling the DFS sibling traversal order changes the
actual population of depth-(K-4) real nodes, not just visitation order, and
measured this at k=8 (p=61, p=151): both showed shuffled `mean_real_R`
**higher** than the unshuffled ground truth (+1.53%, +0.28%). Cycle 96
repeated the same measurement at k=9, p=601 (the size behind cycle 93's
capped-DFS headline number) and found the opposite sign: shuffled R was
**lower** than unshuffled by -0.111% (z=-5.84 over 3 seeds), with a much
larger node-count shift (+9.57% vs k=8's -4.9%/+1.66%). Cycle 96 left this as
an open, unresolved wrinkle and proposed, as a cheap bounded side-check
(not a new thread), running the same comparison at k=10, where unshuffled
ground truth already exists from cycle 87/88 -- to see whether the k=9
flip is an outlier or part of a real pattern across k. This cycle does that
check.

`JOURNAL_API` re-polled (`?limit=2000`, 1000 events, seq 110-1109): still
exactly the 15 known k=13 `SIEVE_LAYER_DONE` points, none beyond p=349,
unchanged since cycle 68.

## Method

Reused `solver/build/cycle87/bin_k10_p251` and `bin_k10_p61` (compiled,
unshuffled, already validated against the official solver log in cycle 87)
to re-derive the unshuffled ground truth fresh rather than trust the
notebook text alone. Then compiled `solver/build/cycle95/main95.cpp` +
`find_cover_instr_shuffled_uncapped.h` (same harness cycle 96 used for k=9,
uncapped, shuffled sibling order only) with `CYCLE95_K=10` at both `P=251`
and `P=61`, 3 seeds each (seed=1,2,3), via `clang++ -std=c++23 -stdlib=libc++
-O3 -pthread -Isolver/upstream/src` (needed to add the missing
`-Isolver/upstream/src` include path this harness hadn't needed standalone
before). All runs completed in under 10s total -- far cheaper than k=9's
~200-290s per seed, so both p points fit easily in this cycle's budget.

## Results

**k=10, p=251** (unshuffled ground truth: nodes=1,090,459, R=1.183609):

| seed | nodes_at_depth | mean_real_R |
|---|---|---|
| 1 | 1,118,562 | 1.185413 |
| 2 | 1,094,803 | 1.184400 |
| 3 | 1,046,535 | 1.184982 |

3-seed mean R = 1.184932, SE = 0.000294, gap vs unshuffled = **+0.112%**,
z = 4.51. Mean nodes = 1,086,633, gap = **-0.35%**.

**k=10, p=61** (unshuffled ground truth: nodes=824, R=1.618208):

| seed | nodes_at_depth | mean_real_R |
|---|---|---|
| 1 | 751 | 1.625940 |
| 2 | 834 | 1.613700 |
| 3 | 782 | 1.631979 |

3-seed mean R = 1.623873, SE = 0.005378, gap vs unshuffled = **+0.35%**,
z = 1.05. Mean nodes = 789, gap = -4.25%.

## Reading

At both k=10 points the shuffled R is higher than unshuffled -- same sign as
both k=8 points (+1.53% at p=61, +0.28% at p=151). The p=251 point is a
clean, statistically solid result (z=4.51); the p=61 point points the same
direction but isn't significant on its own (z=1.05, expected given only
~800 total real nodes at that size -- this is the smallest, noisiest DFS in
the whole series).

So across four data points at k=8/k=10, the shuffling artifact is
consistently **positive** (shuffled overestimates R relative to unshuffled
truth). The single k=9 point (p=601) is **negative** and is also the
largest-magnitude node-count shift of the five points measured so far
(+9.57% vs -4.9%/+1.66%/-0.35%/-4.25%). Node-count-shift sign doesn't track
R-shift sign cleanly either (k=8 p=61: nodes down, R up; k=10 p=251: nodes
down, R up; k=9 p=601: nodes up, R down) -- so there's no simple "more nodes
-> higher R" story hiding here.

This is a small sample (5 points across 3 k values, 1 p each for k=9/k=10-251,
2 p's total for k=8 and k=10-61) and doesn't prove k=9 is mechanistically
special -- it's consistent with an outlier, not a proof of one. But it does
rule out the simplest worry cycle 96 raised: that the sign flip is the start
of a monotonic trend that gets worse as k climbs (which would have suggested
k=11/12/13 keep drifting further negative). Instead, k=10 -- sitting between
k=9 and where k=11/13 real-wall data already exists -- lands back on the
k=8 side, positive. That's more consistent with k=9 itself being unusual
(it's already the odd one out on the *crossover-location* question, at
~5660 vs the ~400-600 cluster for k=10-13) than with a smooth artifact that
tracks k.

## Interpretation

This doesn't change the standing decision: capped-DFS stays retired
(cycle 93, reconfirmed cycle 96), and this cycle doesn't reopen that. What
it does is downgrade the k=9 shuffling sign-flip from "worrying k-dependent
trend, unclear how bad it gets at higher k" to "plausibly a k=9-specific
quirk, consistent with k=9 already being the crossover-location outlier."
Low-cost, bounded side-check, exactly as scoped -- no new thread opened.

## Next

1. The importance-sampling scoping task (cycle 93's option b, carried over
   from cycle 96) is still the only untried concrete idea on the main
   crossover-fidelity thread. Next cycle should time a single scored-branch
   pass at a cheap k=9 size (e.g. p=251 or p=401, both already have
   unshuffled real-DFS timings from cycle 88) to estimate per-node scoring
   overhead before committing to a full build.
2. If useful later: one more k (e.g. k=11, where cycle 87 has p=61/101/151
   unshuffled data) would turn this 3-k, 5-point check into a 4-k check --
   but this is optional polish, not required to act on the finding above.
3. Keep polling `JOURNAL_API` (`?limit=2000`) every cycle for new k=13
   `SIEVE_LAYER_DONE` points -- still 15, max p=349, unchanged since cycle 68.
