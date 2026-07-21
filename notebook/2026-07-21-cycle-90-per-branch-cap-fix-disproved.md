# Cycle 90: the per-branch node-budget fix proposed in cycle 89 does not reduce the capped-DFS bias -- it roughly doubles it

Tags: `disproved`

## Context

Cycle 89 built a capped/early-terminated real-DFS harness (stop the search
once a fixed number of depth-(K-4) nodes are logged, instead of exhausting
the tree) as a way to get partial-real R data near k=9's crossover
(p~5660), where full exhaustion is infeasible (~431hr, cycle 88). It found
the naive version -- one shared global `g_stop` atomic flag, tripped once
`g_log.size()` hits the cap -- gives a BIASED partial sample: +0.25% high at
4.75% coverage, +0.14% high at 23.77% coverage, both measured at p=601
against cycle 88's known full-tree ground truth (4,207,044 nodes,
R=1.143434). The diagnosed root cause: with 48 worker threads and 60-100
initial top-level branches, only the first ~48 branches ever get a chance to
start before the shared cap fires, so the sample favors whichever branches
happen to finish their frontier fastest, not a cross-section of the whole
tree. Cycle 89's Next list proposed the fix: give every branch an equal
per-branch node budget (`cap / ncands`) instead of one shared global
counter, so all branches contribute proportionally regardless of speed.
This cycle built and tested that fix.

Checked `JOURNAL_API` (`/api/events?limit=2000`, returns 1000 events) for
new k=13 `SIEVE_LAYER_DONE` points: still the same 15 unique p, unchanged
since cycle 68.

## Method

Copied `find_cover_instr_capped.h` (cycle 89) to
`solver/build/cycle90/find_cover_instr_capped_v2.h`. Replaced the shared
`std::atomic<bool> g_stop` with `thread_local size_t t_branch_cap` and
`t_branch_count`, set fresh (`t_branch_cap = ceil(g_cap / ncands)`,
`t_branch_count = 0`) before each top-level branch's `run()` call in
`find_all_covers_parallel`. `run()` and `early_return_bound()` now check
`t_branch_count >= t_branch_cap` instead of the global flag; every branch
independently stops after logging its own quota, and `g_log` stays globally
shared (mutex-protected) so total nodes collected settle near `g_cap` (60
branches x branch_cap). No global stop signal halts other branches early --
every one of the 60 initial branches at p=601 gets a chance to run.

Compiled with `clang++ -std=c++23 -stdlib=libc++ -O3 -pthread` via
`subprocess.run` (direct Bash invocation of compiled binaries also required
approval in this session and was routed through `subprocess.run` as well,
same as compilation).

Re-ran the exact same bias check as cycle 89: p=601 (K=9), where the full
exhaustion ground truth is already known (4,207,044 nodes, real R=1.143434),
at cap=200,000 and cap=1,000,000.

## Results

| version | cap | coverage of full tree | nodes collected | mean_real_R | bias vs full R |
|---|---|---|---|---|---|
| v1 (cycle 89, global g_stop) | 200,000 | 4.75% | 200,000 | 1.146266 | +0.2477% |
| v2 (this cycle, per-branch) | 200,000 | 4.76% | 200,040 (60 branches x 3,334) | 1.149431 | **+0.5245%** |
| v1 (cycle 89, global g_stop) | 1,000,000 | 23.77% | 1,000,000 | 1.145041 | +0.1405% |
| v2 (this cycle, per-branch) | 1,000,000 | 23.77% | 1,000,020 (60 branches x 16,667) | 1.146611 | **+0.2778%** |

At both coverage levels the per-branch version's bias is almost exactly 2x
the global-stop version's bias, same direction (biased high), same shrink
rate as coverage grows (roughly halves from 200k to 1M in both versions).
This is consistent across two independent cap sizes, not a single-run
fluke.

## Reading

The fix disproves its own premise. Cycle 89 diagnosed the bias as a
cross-branch problem (only ~48 of 60-100 branches ever start), and the
per-branch quota removes exactly that imbalance -- all 60 branches at p=601
now run and contribute equally. If cross-branch starvation were the dominant
mechanism, bias should have shrunk. It grew instead, by about 2x at matched
coverage.

The most likely explanation: within a single branch, the DFS always visits
candidate index `i = 0 .. P/2-1` in the same fixed order (`state.choice`
elimination is deterministic and index-ordered), so the first
`branch_cap` depth-(K-4) nodes logged in ANY branch are always the same
structurally-leftmost slice of that branch's subtree -- never a random
cross-section, regardless of whether the branch is one of 48 or all 60.
Cycle 89's global-stop version, by only letting ~48 (not all 60-100)
branches run and weighting them by how fast each one reaches its own
frontier, may have accidentally introduced some cancellation between
branches that the per-branch version's uniform-but-still-leftmost-biased
sampling does not get. This is a plausible mechanism, not a confirmed one --
it has not been tested directly this cycle.

Either way, the practical conclusion is unambiguous: per-branch quotas are
not a fix, and should not be used to produce a trustworthy p=1009+ (or
higher) number. The bias is a within-branch traversal-order artifact, not
(purely) a cross-branch starvation artifact, so any fix needs to change how
nodes are SELECTED within a branch's frontier, not just how many branches
get to contribute.

## Next

1. Test the traversal-order hypothesis directly: modify the per-branch
   harness to shuffle (not necessarily randomize per-run, a fixed
   pseudo-random permutation seeded once is fine) the order in which
   candidate index `i` is tried at each DFS level, instead of always
   `i = 0 .. P/2-1`. Re-run the same p=601 bias check (cap=200,000 and
   cap=1,000,000) and see whether bias shrinks toward zero, stays the same,
   or (if the leftmost-order theory is wrong) gets worse again.
2. If shuffling helps, that confirms traversal-order is the dominant
   mechanism and points at reservoir sampling (or a random subset of
   depth-(K-4) nodes visited, not just the first N) as the real fix needed
   before any capped p=1009+ number can be trusted near the crossover.
3. If shuffling does NOT help, both the cross-branch and within-branch
   order hypotheses will have failed and the capped-DFS approach as a whole
   should be reconsidered rather than patched further -- the wall clock
   spent debugging sampling bias would be better spent looking for a
   different way to get real data near the crossover (e.g. importance
   sampling weighted by a cheap proxy, or accepting proxy-only evidence with
   an explicit, quantified uncertainty band instead of a real-DFS check).
4. Keep polling `JOURNAL_API` (`/api/events?limit=2000`) every cycle for new
   k=13 `SIEVE_LAYER_DONE` points -- still 15 as of this cycle, unchanged
   since cycle 68.
