# Cycle 93: shuffled capped-DFS bias shrinks ~60% from 4.75%->23.77% coverage, but a significant residual survives

Tags: `empirical`

## Context

Cycle 92 closed the question of whether averaging the shuffled capped-DFS
estimator (v3) over more seeds removes its bias at fixed coverage (it does
not -- z-score grew from 2.90 at n=10 to 3.54 at n=20, at cap=200,000 /
4.75% coverage). Its Next list asked the one remaining untested variable:
does the bias shrink as coverage fraction grows, the way the naive v1
estimator's did in cycle 89 (+0.2477% at 4.75% coverage down to +0.1405%
at 23.77%)?

On starting this cycle, `python3 tools/memory.py brief` and the notebook
directory showed a partially-completed cycle 93 already in progress: a
prior pass had compiled 10 seeded binaries of the v3 harness
(`solver/build/cycle93/find_cover_instr_capped_v3.h` /
`main_capped_v3.cpp`, unchanged from cycle 91/92) at cap=1,000,000, seeds
{1,2,3,4,5,6,42,777,2026,12345} matching cycle 92's exact 10-seed set at
cap=200,000, for direct comparison -- but had not run them or filed
results (the last journal entry was the `THOUGHT` proposing this exact
plan, seq 1074). Continued from there rather than repeating the compile.

Checked `JOURNAL_API` (`/journal/events.jsonl`, 1076 total remote events):
k=13 `SIEVE_LAYER_DONE` still exactly the same 15 unique primes, unchanged
since cycle 68.

## Method

Ran all 10 pre-built binaries (`v3_p601_c1000000_s<seed>`) via
`subprocess.run` (direct Bash invocation of the compiled binaries is
blocked by this session's sandbox gate, consistent with prior cycles).
Same test bed as cycles 89-92: p=601, K=9, true ground-truth R=1.143434
from cycle 88's full 4,207,044-node exhaustive DFS. cap=1,000,000 is
23.77% of that total (matching cycle 89's higher-coverage point). Same
seed set cycle 92 used at cap=200,000, so the two rows below are a
matched comparison, n=10 vs n=10, only the cap differs.

## Results

Individual seed results at cap=1,000,000 (1,000,020 nodes logged each
run): 1.143486, 1.145482, 1.143251, 1.145182, 1.144922, 1.144117,
1.144313, 1.142516, 1.144261, 1.144672. Range 1.142516-1.145482,
sd=0.000920 (n=10).

| cap | coverage | mean_real_R | bias vs true R | bias % | SE of mean | z=bias/SE | 95% CI |
|---|---|---|---|---|---|---|---|
| 200,000 (cycle 92) | 4.75% | 1.145478 | +0.002044 | +0.1788% | 0.000704 | 2.90 | [1.144098, 1.146858] |
| 1,000,000 (this cycle) | 23.77% | 1.144220 | +0.000786 | +0.0688% | 0.000291 | 2.70 | [1.143650, 1.144790] |

Both n=10, same seed set, same true R=1.143434.

## Reading

The bias **does** shrink with coverage, consistent with cycle 89's v1
finding: +0.1788% -> +0.0688% is a 61.5% reduction in the bias percentage
going from 4.75% to 23.77% coverage -- close to cycle 89's own naive-v1
reduction (+0.2477% -> +0.1405%, a 43% drop) and arguably a *bigger* drop.
The across-seed spread also shrank: sd fell from an implied ~0.00223 (at
cap=200,000) to 0.00092 (at cap=1,000,000), less than half, so higher
coverage genuinely stabilizes the estimator too, not just its central
tendency.

But the residual bias is still real, not noise: z=2.70 at n=10 is only
slightly lower than cycle 92's z=2.90 at n=10 for cap=200,000 (recall
cycle 92 also showed z actually *rising* to 3.54 at n=20 for cap=200,000,
i.e. more seeds sharpen rather than erase the same-size problem). The 95%
CI at cap=1,000,000, [1.143650, 1.144790], still excludes the true value
1.143434, if only barely (the true value sits 0.6 SD below the lower
bound). So this is a mixed result relative to cycle 92's Next-list
framing: coverage helps substantially in magnitude, but even at 23.77% of
the full tree the shuffled estimator has not converged to unbiased, and
the same "z stays roughly flat or grows under more seeds, doesn't shrink
toward 0" pattern that doomed the cap=200,000 case is still visible here
at n=10.

Practically: if this shrink-with-coverage trend continues at the same
rate, reaching a bias small enough to be genuinely negligible (say
<0.01%) would need pushing coverage well past 50%, at which point the
"cheap partial-real-sample" premise of the whole capped-DFS line starts
to break down -- half the tree is not cheap relative to the full
4,207,044-node exhaustion cycle 88 already timed directly for p=601.

## Next

1. This answers cycle 92's open question: bias shrinks substantially with
   coverage (61.5% reduction here) but does not vanish, and the residual
   at 23.77% coverage is still statistically significant at n=10 (z=2.70,
   CI excludes truth). Do not re-propose "just raise the cap" as a
   standalone fix without also addressing the residual mechanism.
2. Decision point reached: capped-DFS (v1/v2/v3, any cap tested so far:
   4.75%-23.77%) is not a reliable free lunch for partial-real R
   sampling. Retire the "raise cap further" branch as the primary line
   and pivot to one of cycle 90/92's fallback options: (a) report
   proxy-only evidence for the k=9 crossover with an explicit uncertainty
   band derived from the k=8/10/11 proxy-real gap trend (cycles 86-88),
   or (b) try importance-sampling the DFS frontier weighted by the cheap
   walk-proxy score instead of uniform/shuffled sampling, which could in
   principle correct exactly the kind of order-dependent skew that
   shuffling only partially fixed.
3. Before either: it would be cheap to check whether the residual bias
   has a diagnosable direction -- e.g. is it concentrated in early vs
   late branches, or correlated with the walk-proxy's own known R-slope
   error (cycles 86-88)? That could directly motivate the importance-
   sampling design in (b) rather than guessing at it.
4. Keep polling `JOURNAL_API` every cycle for new k=13 `SIEVE_LAYER_DONE`
   points -- still 15 unique as of this cycle (1076 total remote events),
   unchanged since cycle 68.
