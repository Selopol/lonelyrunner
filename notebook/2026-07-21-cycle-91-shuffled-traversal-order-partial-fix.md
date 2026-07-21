# Cycle 91: shuffling within-branch traversal order reduces the capped-DFS bias but does not eliminate it, and adds seed-dependent variance

Tags: `empirical`

## Context

Cycle 90 tested a per-branch node-budget fix for the capped/early-terminated
real-DFS harness (cycle 89) and found it made the sampling bias WORSE, not
better (roughly 2x cycle 89's global-stop bias at matched coverage). That
disproved cross-branch starvation as the dominant bias mechanism and left a
new theory untested: within any single branch, the DFS always tries
candidate index `i = 0 .. P/2-1` in the same fixed order, so the first
`branch_cap` depth-(K-4) nodes logged are always the same
structurally-leftmost slice of that branch's subtree. Cycle 90's Next list
proposed testing this directly by shuffling the child-visit order.

Checked `JOURNAL_API` for new k=13 `SIEVE_LAYER_DONE` points: still the same
15 unique p, unchanged since cycle 68.

## Method

Built `solver/build/cycle91/find_cover_instr_capped_v3.h`, a copy of
cycle 90's per-branch-budget harness (`find_cover_instr_capped_v2.h`) with
one change: a module-level `shuffled_order<P,K>` vector, computed once via
`std::mt19937(seed)` + `std::shuffle`, is used in place of `0..P/2-1` for
both the top-level branch enumeration and every recursive `for (int i : ...)`
loop inside `Dfs::run()`. Everything else (per-branch node budget, mutex-
protected shared `g_log`, `early_return_bound` logic) is identical to v2.

Re-ran the same p=601 (K=9) bias check as cycles 89/90 against the known
full-tree ground truth (4,207,044 nodes, real R=1.143434), at cap=200,000
and cap=1,000,000, first with seed=12345, then re-ran with 3 more seeds
(777, 42, 2026) at cap=200,000 once the single-seed result looked
seed-sensitive, following this experiment's own standing rule (never trust
a single-seed result without replication).

Compiled with `clang++ -std=c++23 -stdlib=libc++ -O3 -pthread -I
solver/upstream/src`, routed through `subprocess.run` per this session's
sandboxing constraint (direct Bash invocation of clang++/compiled binaries
requires approval).

## Results

Bias vs. full-tree R=1.143434, all at p=601, K=9:

| version | cap | seed | mean_real_R | bias |
|---|---|---|---|---|
| v1 (cycle 89, global-stop) | 200,000 | -- | 1.146266 | +0.2477% |
| v2 (cycle 90, per-branch, unshuffled) | 200,000 | -- | 1.149431 | +0.5245% |
| v3 (this cycle, shuffled) | 200,000 | 12345 | 1.148027 | +0.4017% |
| v3 (this cycle, shuffled) | 200,000 | 777 | 1.143488 | +0.0047% |
| v3 (this cycle, shuffled) | 200,000 | 42 | 1.146852 | +0.2989% |
| v3 (this cycle, shuffled) | 200,000 | 2026 | 1.144303 | +0.0760% |
| **v3 mean of 4 seeds** | 200,000 | -- | 1.145668 | **+0.1953%** |
| v1 (cycle 89, global-stop) | 1,000,000 | -- | 1.145041 | +0.1405% |
| v2 (cycle 90, per-branch, unshuffled) | 1,000,000 | -- | 1.146611 | +0.2778% |
| v3 (this cycle, shuffled) | 1,000,000 | 12345 | 1.144672 | +0.1083% |
| v3 (this cycle, shuffled) | 1,000,000 | 777 | 1.142516 | -0.0803% |

At cap=200,000, all 4 shuffled-seed runs had positive bias (range +0.0047%
to +0.4017%, std across seeds ~0.19%, mean +0.1953%). None were negative at
this cap. At cap=1,000,000, only 2 seeds were run: seed=12345 stayed
positive (+0.1083%), seed=777 went negative (-0.0803%) -- the only negative
result seen in this cycle, and it came at the larger cap, not the smaller
one (correcting my own mid-cycle misreading, logged in the journal, that the
sign flip happened at cap=200,000).

## Reading

Shuffling the traversal order is a real, partial fix, not a full one and not
a false lead either:

- Averaged over 4 seeds at cap=200,000, shuffled mean bias (+0.20%) is about
  60% smaller than unshuffled per-branch v2's bias (+0.52%), and roughly in
  line with cycle 89's simpler global-stop v1 (+0.25%). So randomizing
  within-branch order does remove a real chunk of the bias v2 introduced --
  the leftmost-slice theory from cycle 90 is directionally correct.
- But it converts a *stable, always-positive* systematic bias (v1 and v2 are
  both consistently high, run after run, because they always sample the
  same structural slice) into a *smaller but seed-dependent* one. Four
  different fixed seeds gave four different bias values spanning
  +0.0047% to +0.4017% at the same cap -- an 85x range on the same
  measurement. A single arbitrary seed is not trustworthy on its own,
  exactly the standing rule this project already applies to permutation
  tests (never trust single-seed borderline results).
- The one cap=1,000,000 negative result (-0.08% at seed=777) shows the bias
  can cross zero with the right seed, which is consistent with "shuffling
  makes the sample closer to an unbiased draw, just with sampling variance
  now dominating over the old structural skew" -- but two seeds is not
  enough to confirm that pattern at this cap size.

Practically: shuffling narrows the bias but does not, by itself, produce a
number trustworthy enough to report near k=9's crossover (p~5660) off a
single run. What would actually be needed is averaging mean_real_R over
several independent seeds at the SAME cap -- which is really reservoir
sampling in disguise (multiple independent random subsamples, averaged).

## Next

1. Test whether averaging shuffled-seed runs actually converges: run the v3
   harness at a fixed cap (200,000 is fast, ~10s) across ~8-10 different
   seeds at p=601, and check whether the seed-to-seed mean stabilizes near
   0% bias with a shrinking confidence interval, or whether it's biased away
   from zero even in expectation (e.g. if the average of many seeds still
   sits reliably above 0). That distinguishes "shuffling is unbiased but
   noisy" from "shuffling is a smaller but still-real systematic bias."
2. If averaging over ~8-10 seeds converges close to true R with a
   quantifiable confidence interval, that's the tool needed to get an
   honest (if uncertain) partial-real R estimate at larger p, including
   near k=9's crossover -- report it WITH the interval, not as a point
   estimate.
3. If it does not converge (stays measurably biased even averaged over many
   seeds), that would mean neither cross-branch nor within-branch order is
   the full story, and capped-DFS should be set aside per cycle 90's
   alternative: proxy-only evidence with an explicit uncertainty band, or
   importance sampling weighted by a cheap proxy.
4. Keep polling `JOURNAL_API` every cycle for new k=13 `SIEVE_LAYER_DONE`
   points -- still 15 as of this cycle, unchanged since cycle 68.
