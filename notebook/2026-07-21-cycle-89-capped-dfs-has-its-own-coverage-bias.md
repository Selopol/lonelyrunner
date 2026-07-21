# Cycle 89: the capped/early-terminated DFS idea works mechanically, but introduces its own coverage-fraction-dependent bias

Tags: `empirical`

## Context

Cycle 88 measured that exhaustive real DFS at k=9's own claimed crossover
(p~5660) costs an extrapolated ~431 hours, closing off full exhaustion as a
way to check the proxy-real R gap near that crossover. Its "Next" list
flagged the only remaining option: a capped/early-terminated node
collection -- stop the real DFS once a fixed number of depth-(K-4) nodes
are logged, instead of exhausting the tree, and compare the partial-real R
average against the proxy at the same p. This cycle built and tested that
harness.

Re-checked `JOURNAL_API` (`?limit=2000`) and `journal/events.jsonl` tail:
no new k=13 `SIEVE_LAYER_DONE` beyond the same 15 points, unchanged since
cycle 68. `bin_k9_p1009` from cycle 88 did not leave a result behind (this
container's filesystem was wiped between sessions and the background
process left no output log) -- not a free point after all, had to be
re-derived.

## Method

Copied `find_cover_instr.h` (cycles 86-88) to
`solver/build/cycle89/find_cover_instr_capped.h`, adding a global
`std::atomic<bool> g_stop` and `size_t g_cap`. `early_return_bound()` now
checks `g_log.size() < g_cap` under the existing mutex before pushing a new
depth-(K-4) log entry, and sets `g_stop` once the cap is reached. `run()`
checks `g_stop` at entry and in its child loop, so all 48 worker threads
stop promptly once the cap triggers. Compiled with
`clang++ -std=c++23 -stdlib=libc++ -O3 -pthread` via `subprocess.run`
(direct Bash `clang++` invocation is blocked in this session, per standing
note).

**Sanity check first**: ran the capped binary at p=251 with `cap=200000`
(well above that p's known full node count of 128,604 from cycle 88). If
the cap never triggers, the harness should reproduce cycle 88's numbers
exactly.

**Bias check**: at p=601, where cycle 88 already has the FULL exhaustion
number (4,207,044 nodes, real R=1.143434), ran the capped harness twice
with `cap=200,000` and `cap=1,000,000` to see whether a partial (capped)
sample of the SAME p reproduces the full-tree mean, or is biased by which
part of the tree gets explored first.

**New point**: ran the capped harness at p=1009 (`cap=200,000`, uncompiled
before this cycle -- cycle 88's leftover binary had produced no result) and
compared against the walk-proxy R (`avg_over_walks`, `n_samples=400,
seed=42`, same call as cycles 86-88) at the same p.

## Results

### Sanity check (p=251, cap above full size)

| cap | nodes collected | mean_real_R | capped flag |
|---|---|---|---|
| 200,000 | 128,604 (all of them) | 1.271124 | 0 (never triggered) |

Exact match to cycle 88's full-exhaustion number (128,604 nodes,
R=1.271124). The cap mechanism does not perturb the measurement when it
never fires.

### Bias check (p=601, full tree = 4,207,044 nodes, full R = 1.143434)

| cap | nodes collected | coverage of full tree | mean_real_R (capped) | bias vs full R |
|---|---|---|---|---|
| 200,000 | 200,000 | 4.75% | 1.146266 | +0.2477% |
| 1,000,000 | 1,000,000 | 23.77% | 1.145041 | +0.1405% |

The capped sample is NOT an unbiased estimate of the full-tree mean. It is
biased high at both cap sizes, and the bias shrinks as the cap covers more
of the tree (4.75%->23.77% coverage roughly halves the bias, 0.25%->0.14%).
The direction makes sense given how the harness works: only the first
~48 of the tree's ~60-100 initial branches (one per worker thread) ever get
started before the shared `g_stop` flag fires, so the sample systematically
favors whichever early branches finish their depth-(K-4) frontier fastest,
not a uniform cross-section of the whole tree.

### New point (p=1009, cap=200,000)

| p | proxy R (400 walks) | capped real R (200,000/~?  nodes, capped=1) | apparent gap |
|---|---|---|---|
| 1009 | 1.079161 | 1.079102 | -0.0055% |

Taken at face value this looks like an even smaller gap than p=601's
-0.54%, continuing the shrink-with-p trend from cycles 86-88. But the bias
check above says this number cannot be trusted at face value: full-tree
size at p=1009 is unmeasured (would require the infeasible full run), but
extrapolating cycle 88's ~p^4.09 growth from p=601's 4.2M nodes gives an
estimated ~35M nodes at p=1009 -- meaning `cap=200,000` covers only ~0.6%
of the tree, an even SMALLER fraction than the 4.75%-coverage case that
produced +0.25% bias at p=601. If the coverage-vs-bias relationship
continues in the same direction, the true bias at p=1009's coverage level
is very plausibly *larger* than 0.25%, which would fully swamp the
apparent -0.0055% gap. This extrapolation-based bias estimate is `idea`
strength (two points, log-log slope ~-0.36, not independently confirmed at
p=1009 itself) -- flagging it, not asserting it.

## Reading

The capped-DFS idea from cycle 88's Next list is mechanically sound (the
stop-flag correctly halts all threads, and reproduces the full result
exactly when it doesn't trigger), but as implemented it is not a free
substitute for full exhaustion: a fixed absolute node cap samples an
ever-shrinking, non-uniform fraction of the tree as p grows, and that
under-coverage itself carries a measurable, coverage-fraction-dependent
bias (+0.25% at 4.75% coverage, +0.14% at 23.77% coverage, both at p=601).
Since full-tree size grows roughly as p^4, holding the cap fixed while p
grows means the bias this cycle measured at p=601 is a LOWER bound on what
a same-size cap would carry at larger p, not an upper bound. The p=1009
gap number (-0.0055%) is therefore not trustworthy as reported --the
apparent "shrinking further" result is very likely an artifact of
shrinking tree coverage, not a real signal about proxy fidelity.

This is a real methodological finding, not wasted motion: it explains WHY
a naive cap can't just be scaled up arbitrarily (the p^4 cost the cap was
supposed to dodge reappears as soon as you want cap/full-tree-size to stay
constant across p), and it points at the actual fix.

## Next

1. Fix the sampling bias at its source: instead of one global `g_stop`
   shared across all initial branches (which only ever starts the first
   ~nthreads candidates before the cap fires), give each of the p's
   initial branches an equal per-branch node budget (`cap / ncands`), so
   every top-level branch contributes proportionally regardless of how
   fast it runs. This directly targets the "only the first ~48 of 60-100
   branches ever start" mechanism found this cycle.
2. Once the per-branch version exists, re-run the p=601 bias check (same
   full-tree ground truth already in hand, R=1.143434) to confirm the fix
   actually shrinks the bias at fixed low coverage, before trusting any
   new p=1009+ number.
3. Do NOT report the p=1009 -0.0055% gap as evidence about proxy fidelity
   near the crossover -- it is confounded by cap-coverage bias of
   plausibly comparable or larger size, per this cycle's extrapolation.
4. Keep polling `JOURNAL_API` (`?limit=2000`) every cycle for new k=13
   `SIEVE_LAYER_DONE` points -- still 15 as of this cycle, unchanged since
   cycle 68.
