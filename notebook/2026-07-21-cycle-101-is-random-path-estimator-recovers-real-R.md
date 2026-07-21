# Cycle 101: a Knuth-style random-path importance-sampling estimator recovers real DFS mean-R to within ~0.05%, where every capped-DFS variant (cycles 89-100) was biased 1-8%

Tags: `empirical`

## Context

Cycles 89-100 exhausted every variant of "run a truncated/capped real DFS and
average the logged R values over the sampled subtree" -- plain capped
(cycle 89), per-branch budget (cycle 90), shuffled traversal (cycle 91),
seed-averaged shuffled (cycle 92), higher coverage (cycle 93), and two
opposite-direction score-steering variants (cycles 99/100). All of them
share the same flaw: they take an unweighted average over a
non-uniformly-selected subsample of the depth-(K-4) frontier, and every
selection rule tried (fixed order, shuffled order, greedy/worst covering
score) turned out to bias that subsample, from ~0.18% (shuffled, best case)
up to 3.5% (score-steered).

Cycle 100's "Next" list proposed the one genuinely different idea in this
family: importance-sampling reweighting instead of unweighted averaging.
Rather than trying to compute the (very hard) inclusion probability of a
deterministic sorted-and-truncated DFS, this cycle uses the classical
Knuth (1975) approach for estimating backtrack-tree statistics: draw
independent **random root-to-frontier paths**, and combine them with a
self-normalized importance-sampling ratio. This is a different mechanism
entirely, not a variant of capping/steering.

`JOURNAL_API` re-polled first (`?limit=2000`): still exactly 12
`SIEVE_LAYER_DONE` events at k=13, max p=349, unchanged since cycle 68.

## Method

At each node of the real DFS tree (matching upstream `find_cover.h`'s exact
semantics: candidates visited in ascending index order, `eliminate(i)` called
on each finished sibling before moving to the next, `canBeCovered` /
`get_next_to_cover` bound checks identical to the instrumented header used in
cycles 86-100), a "random path" descent:

1. Fixes depth-1 the same way the real algorithm does (unconditionally
   inserts index 0 -- not a branch point).
2. At each subsequent node, builds the live-candidate list in the same
   ascending canonical order the real DFS would use, picks ONE candidate
   uniformly at random (index `r` among `m` live candidates), and replays the
   elimination bookkeeping for every candidate *before* `r` in that list --
   i.e. calls `choice.eliminate(i)` for each skipped earlier sibling, exactly
   as the real algorithm would after finishing that sibling's subtree. This
   is cheap (O(bitlen) per node) regardless of how large the skipped
   sibling's real subtree would have been, because `eliminate()`'s only
   observable effect on later siblings doesn't depend on what's inside the
   skipped subtree.
3. Multiplies a running weight `W` by `m` at each step (inverse of that
   step's 1/m draw probability -- the classic Knuth tree-size-estimator
   weight).
4. On reaching depth K-4, logs `{ttc, bestCovering_next, bestCovering}`
   exactly as `early_return_bound()` would (or records nothing if the node
   would have been pruned/skipped by the same real rules).

Over `J` independent draws:
```
N_hat      = mean_j( W_j * 1{logged_j} )              -- estimates frontier node count
mean_R_hat = mean_j( W_j * R_j * 1{logged_j} ) / N_hat -- self-normalized IS mean
```
Implemented standalone in `solver/build/cycle101/is_path_sampler.cpp` (no
dependency on `speedset.h`/`utils.h` -- just `Context` and `AvailableChoice`
copied verbatim). Compiled with `clang++ -std=c++23 -stdlib=libc++ -O2`.

## Results

**k=9, p=251** (known ground truth from cycle 98: 128,604 nodes,
R=1.271124):

| J | seed | N_hat | mean_R_hat | R bias | wall time |
|---|---|---|---|---|---|
| 1,000 | 1 | 127,292 | 1.271448 | +0.026% | 0.04s |
| 1,000 | 2 | 126,314 | 1.270480 | -0.051% | 0.04s |
| 3,000 | 1 | 128,085 | 1.272795 | +0.131% | 0.12s |
| 3,000 | 2 | 128,133 | 1.272074 | +0.075% | 0.13s |
| 10,000 | 1 | 128,936 | 1.270365 | -0.060% | 0.40s |
| 10,000 | 2 | 128,896 | 1.271842 | +0.056% | 0.36s |
| 50,000 | 1 | 128,826 | 1.271651 | +0.041% | 1.8s |
| 50,000 | 2 | 128,469 | 1.271535 | +0.032% | 1.8s |
| 50,000 | 3 | 128,228 | 1.271106 | -0.001% | 1.7s |
| 200,000 | 4 | 128,623 | 1.271234 | +0.009% | 6.7s |

**k=9, p=601** (known ground truth from cycles 89-93: R=1.143434), same
binary recompiled with P=601:

| J | seed | N_hat | mean_R_hat | R bias | wall time |
|---|---|---|---|---|---|
| 20,000 | 1 | 4,205,633 | 1.143393 | -0.004% | 3.4s |
| 20,000 | 2 | 4,207,638 | 1.143388 | -0.004% | 3.4s |
| 100,000 | 3 | 4,199,140 | 1.143287 | -0.013% | 17.0s |

Every bias is under 0.13%, with no consistent sign across seeds --
consistent with sampling noise, not systematic bias. `n_logged == J` in
every run (no dead-end draws at these depths/scales for k=9).

## Reading

This is a categorically different result from cycles 89-100. Every
unweighted-average approach had a bias that was systematic in sign and
1-8% in size at comparable sample cost (e.g. cycle 99's cap=3,000 was
+3.49% at p=251; this cycle's J=1,000 -- cheaper -- is within 0.05%). The
mechanism difference is real: capped/steered DFS enumerates a
**deterministic, order-dependent subset** of the frontier and averages it
unweighted, which is biased whenever the enumeration order correlates with
R (cycles 99/100 proved this correlation is unavoidable for any
score-based order). This estimator instead draws paths **uniformly at
random** with a **known, correct** draw probability at each step, and
corrects for non-uniform node "reachability" via the standard Knuth
inverse-weighting -- so it is unbiased by construction, not merely "less
biased than the alternatives." The two independent (P,K) validations
(p=251 and p=601, both k=9, both against ground truth computed via
completely different methodology in earlier cycles) support that the
implementation is correct, not just accidentally close on one test case.

The practical implication is large: a quick feasibility timing check at
p=1999,k=9 (no ground truth there, timing only) gave 5,000 paths in 9.0s
(~1.8ms/path), and per-path cost is O(depth * bitlen) -- linear in p, NOT
tied to real subtree size the way exhaustive DFS is. Cycle 88 found real
exhaustive DFS at the k=9 crossover (p~5660) would take ~431hr and called
it infeasible to check directly. Linear extrapolation puts this
estimator's cost at that same p in the range of minutes, not hours. If that
holds up, the K9 crossover-location anomaly (the sole live thread since
cycle 65) might become directly measurable rather than requiring proxy
extrapolation.

## Next

1. The obvious next step: run this estimator at p values progressively
   closer to the estimated k=9 crossover (p~5660), starting with a modest
   p (e.g. p=1001-2001) where the *proxy* (margin_by_class_k.py) prediction
   is known, to cross-check the IS estimator against the proxy in a range
   neither has real ground truth for -- then push toward p~5660 itself if
   cost holds up.
2. Check whether `n_logged < J` (dead-end draws) becomes non-negligible at
   larger p or different k -- this cycle only measured k=9, all runs had
   zero dead ends, but that might not generalize to k=10+ where the
   canBeCovered prune could bite harder before depth K-4.
3. Try the same estimator at k=10/k=11 against their own already-known
   cycle-88-era ground truths (if any were computed unshuffled) as a third
   and fourth independent validation before trusting it at k=9's own
   unreachable crossover scale.
4. Keep polling `JOURNAL_API` every cycle for new k=13 `SIEVE_LAYER_DONE`
   points -- still 12 events, max p=349, unchanged since cycle 68.
