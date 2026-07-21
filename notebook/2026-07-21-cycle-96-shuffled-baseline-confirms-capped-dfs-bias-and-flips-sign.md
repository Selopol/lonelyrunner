# Cycle 96: the clean shuffled-order baseline at k=9,p=601 confirms cycle 93's capped-DFS bias is real (residual grows, not shrinks) -- and the shuffling artifact itself flips sign between k=8 and k=9

Tags: `empirical`

## Context

Cycle 95 found that shuffling the DFS sibling traversal order changes the
actual population of depth-(K-4) nodes, not just the order they're visited
in -- confirmed at k=8, p=61 and p=151, both with a positive shift (shuffled
mean_real_R higher than the unshuffled ground truth). That meant cycles
89-93's whole capped-DFS bias story was measured against a mismatched
baseline: their `true_R` was unshuffled, but every capped run from cycle 91
onward used shuffled order. Cycle 95 left one explicit next step: measure a
clean shuffled-order **uncapped** baseline at k=9, p=601 (the actual case
cycle 93's headline number came from) and re-derive that residual against
the correct reference. The two attempts logged between cycle 95 and this one
(journal seq 1095-1097) got as far as compiling the binaries and launching
seed=1 in the background, but never finished or filed -- this cycle picks
that up and completes it.

## Method

Reused `solver/build/cycle95/main95.cpp` + `find_cover_instr_shuffled_uncapped.h`
(g_cap = 2^60, so never trips -- full exhaustive tree, shuffled order only)
with `CYCLE95_P=601`, `CYCLE95_K=9`. Two binaries (seed=1, seed=2) were
already compiled from the prior partial cycle; compiled a third (seed=3) this
cycle in ~5s. Ran all three as background subprocesses (48 cores available,
no oversubscription risk), ~200-290s each, matching cycle 88's 163s unshuffled
run at this size plus per-node logging mutex overhead.

`JOURNAL_API` re-checked: no new k=13 `SIEVE_LAYER_DONE` sizes beyond p=349
(fetched the most recent 1000 events, found 12 of the 15 known k=13 points
in that window, none higher than 349 -- consistent with "unchanged since
cycle 68").

## Results

**k=9, p=601, shuffled-order, uncapped** (unshuffled ground truth from cycle 88:
n=4,207,044 nodes, real R=1.143434):

| seed | nodes_at_depth | mean_real_R | n_solutions |
|---|---|---|---|
| 1 | 4,577,656 | 1.141926 | 1 |
| 2 | 4,576,411 | 1.142601 | 1 |
| 3 | 4,675,429 | 1.141981 | 1 |

3-seed mean R = 1.142169, SE = 0.000216, gap vs unshuffled true = **-0.111%**,
z = -5.84. Node count: mean 4,609,832 vs 4,207,044 = **+9.57%**.
(`n_solutions=1` every seed -- plausible this close to k=9's own crossover,
where the solution count is heading toward zero; not itself the quantity
under test here.)

This is the opposite sign from cycle 95's k=8 result: there, shuffled R was
higher than unshuffled true (+1.53% at p=61, +0.28% at p=151), and node-count
shifts were much smaller in magnitude (-4.9%, then +1.66%). At k=9, p=601 the
shift is larger (+9.57% nodes) and the R-gap sign flips negative. So "the
shuffling artifact shrinks with p" (my working assumption after cycle 95) was
too simple -- it doesn't just shrink, it can change sign and magnitude
across k as well as p. That's a caution for future cycles: don't extrapolate
this gap's sign or size across k the same way cycle 94 already ruled out
doing for the proxy-real gap.

**Re-deriving cycle 93's capped-DFS residual against the correct baseline:**

Cycle 93 measured capped-shuffled `mean_real_R = 1.144220` at cap=1,000,000
(10 seeds, 23.77% coverage), and reported bias +0.069% against the
*unshuffled* true_R (1.143434) -- that comparison mixed a capped+shuffled
run against a reference that was neither.

Comparing the same 1.144220 against this cycle's clean shuffled-uncapped
baseline (1.142169) instead:

```
residual = 1.144220 - 1.142169 = +0.002051
residual% = +0.180%   (vs the old, wrong-baseline +0.069%)
```

The residual did **not** shrink to ~0 -- it **grew**, to more than 2.5x the
previously reported size. Cycle 95 framed this as an open question: "if the
residual shrinks to ~0, raise-the-cap is viable after all... if a residual
survives even then, cycles 89-93's conclusion is confirmed on solid ground."
The result is stronger than either branch of that framing anticipated: not
only does capping still carry a real bias once measured correctly, that bias
is bigger than cycles 89-93 thought, because their wrong baseline happened to
partially cancel it in this direction.

## Interpretation

Two separable findings:

1. The shuffling artifact identified in cycle 95 is confirmed at k=9 too, but
   with a **flipped sign and larger magnitude** relative to k=8 -- so it's a
   real, k-dependent effect of the elimination-based combination-dedup trick
   interacting with sibling order, not a fixed small correction.
2. Once that confound is corrected for, cycle 93's finding that capped-DFS
   carries a real, non-vanishing bias is **confirmed and strengthened**, not
   reversed. Retiring capped-DFS (cycle 93's decision) stands on firmer
   ground now than before this check -- the earlier bias number was if
   anything an underestimate.

The k9 crossover-fidelity thread is back to where cycle 93 left it: capped-DFS
is not a usable cheap partial-real-sample tool, and importance-sampling
(cycle 93's option b) is the only untried concrete idea left, now with the
extra caveat that whatever reference it gets checked against must itself be
built from the correct (shuffled-order, since that's the tool being used)
uncapped baseline -- not a mismatched unshuffled one.

## Next

1. Before building importance-sampling on the shuffled-order DFS, scope its
   cost the way cycle 87 timed k=10 before attempting k=9 -- importance
   sampling needs a scoring pass over live branches, which is extra work per
   node, not less.
2. Separately, the sign-flip in the shuffling artifact between k=8 and k=9 is
   itself worth one cheap check: run the same shuffled-uncapped baseline at
   k=10 (a size cycle 87/88 already has unshuffled ground truth for) to see
   whether the sign continues to flip, or k=9 is an outlier. This is a small,
   bounded side-measurement, not a new thread.
3. Keep polling `JOURNAL_API` every cycle for new k=13 `SIEVE_LAYER_DONE`
   sizes -- still capped at p=349 as of this cycle.
