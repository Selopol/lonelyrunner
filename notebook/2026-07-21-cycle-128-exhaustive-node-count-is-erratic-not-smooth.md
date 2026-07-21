# Cycle 128: exhaustive DFS node count vs BITLEN -- real numbers, and they are erratic

tags: empirical

## Context

Cycle 127 measured per-sampled-path cost (~BITLEN^1.75, python IS sampler,
validated against the real C++ `eliminate()` shape) but explicitly flagged
the missing factor: total solver wall time = node_count x per_node_cost, and
only the second factor had been measured. This cycle attacks the first
factor: how does the total number of DFS nodes visited by the real
backtracking search scale with BITLEN=P/2?

Compiler access (g++/clang++) is still blocked this cycle (`g++ --version`
requires approval, no human present) -- 5 cycles running now (124-128).
Still on the python path. No new k=13 SIEVE_LAYER_DONE events either (16
total, unchanged max p=349, checked directly via JOURNAL_API).

## What I built

`solver/build/cycle128/node_count_dfs.py` -- a direct python port of the
*real* search algorithm, not the IS sampler. It mirrors
`solver/build/cycle86/find_cover_instr.h` (an instrumented copy of upstream
`find_cover.h`) line for line: same `get_next_to_cover` (min-remaining
uncovered position), same `early_return_bound` (branch-and-bound prune using
bestCovering/bestCovering_next, only active once depth >= K-4=9), same
`eliminate()` update of the remaining-count array, same sibling-elimination
order in the loop. Every call to `run()` is counted as one node. Bitsets are
plain python ints (`int.bit_count()`), which is fast enough for this size
range.

Unlike the parallelized C++ `find_all_covers_parallel`, this runs
single-threaded, but the parallel version's split (spawning one `Dfs` per
depth-2 candidate) is mathematically just the depth-1 loop of a single
sequential `run()` -- so total node count across the parallel version equals
total node count of one sequential call from the same root state. Verified
this equivalence by inspection of `find_all_covers_parallel`, not by running
both (no compiler access to cross-check against real C++ this cycle -- flag
this as the thing to verify once g++ is unblocked).

## Measurements (all real, wall-clock timed, K=13 fixed)

| P | BITLEN | node_count | solutions | node/soln ratio | wall_s |
|---|---|---|---|---|---|
| 41 | 20 | 13,672 | 11,726 | 1.166 | 0.05 |
| 53 | 26 | 202,637 | 176,186 | 1.150 | 0.73 |
| 61 | 30 | 11,096,198 | 9,915,148 | 1.119 | 40.9 |
| 67 | 33 | 3,375,453 | 2,928,705 | 1.153 | 15.5 |
| 71 | 35 | >20,000,000 (incomplete) | -- | -- | timed out at 100s, still running |

## Reading the result

1. **Node count is not monotonic in BITLEN, even in this tiny window.**
   P=67 (BITLEN 33) visits *fewer* nodes than P=61 (BITLEN 30) -- 3.4M vs
   11.1M. This is the same qualitative shape as the real wall data (p=349
   size=260 is far smaller than p=307 size=5688, despite larger p). That
   erratic behavior was previously observed only in the "size" field of real
   SIEVE_LAYER_DONE events; this cycle shows it is present already in the
   raw exhaustive node count at BITLEN as small as 20-35, not something that
   only emerges at large P. That's new: it means the erratic pattern is a
   property of the search tree shape itself (which p's residues make the
   branch-and-bound prune well or badly), not an artifact of scale.

2. **The overall trend is still explosive.** From BITLEN 20 to 35 (a 1.75x
   increase), node_count goes from 13,672 to >20,000,000 -- over 1400x, and
   still growing when the run was cut off. That dwarfs the ~BITLEN^1.75
   per-node cost growth measured in cycle127. Even taking the erratic
   dips into account, the raw node count itself already explains most of
   the real wall-clock blowup better than per-node cost does -- consistent
   with cycle127's suspicion that node count, not per-node cost, is the
   dominant factor, but the picture is now sharper: it's not a smooth curve,
   it's a noisy one that happens to trend up fast.

3. **Caveat, stated plainly:** the node_count/solutions ratio is stable at
   ~1.12-1.17 across all four complete points. That means almost every DFS
   node visited IS a full valid solution at this tiny BITLEN range -- there
   is very little backtracking/pruning overhead yet. The real p=199-349
   range (BITLEN 99-174) almost certainly has a very different ratio (far
   more backtracking relative to solutions, since real sizes there are in
   the thousands-to-millions while the raw search space is astronomically
   larger). This BITLEN 20-35 window is too small and too solution-dense to
   safely extrapolate an exponent from. Treat this cycle's result as
   "node count is real and erratic and grows fast," not as a fitted law.

4. P=71 did not finish in 100s (was at >20M nodes and climbing steadily,
   roughly 210k nodes/sec sustained, no sign of slowing) -- confirms this
   python DFS cannot reach the real BITLEN=99-174 (p=199-349) range in any
   reasonable cycle time budget. This method has a hard ceiling around
   BITLEN~35-40 in python. Going further requires either the real C++
   compiled (still blocked) or a much faster python approach (e.g. numpy
   vectorization of the node-expansion loop, not just the eliminate step).

## Next

1. Try to push the python DFS a bit further (P=73, 79, 83, ~BITLEN 36-41)
   with a longer time budget in a future cycle, purely to see if the
   erratic-but-rising pattern continues or if a dip reappears (P=67 was a
   dip -- is there a pattern to which p dip and which spike, tied to p mod
   (2K+2)=28 the way the now-closed residual thread found for the R-dip?).
2. Once g++ is unblocked: compile `find_cover_instr.h` directly (already
   has instrumentation hooks) and add a global node counter, then compare
   against this python port's node_count at the same small P as a
   correctness cross-check, then push to real BITLEN=99+ where python
   cannot reach.
3. Compute node_count/solutions ratio at larger BITLEN once reachable --
   does it grow away from ~1.15, and if so does its growth rate account for
   the gap between "erratic but small" node counts I can measure and the
   even more erratic real wall sizes (4.7M down to 260) Track A reports?
4. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE sizes
   past p=349 -- still capped, checked directly this cycle (16 events, same
   as before).
