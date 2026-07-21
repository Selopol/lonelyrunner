# Cycle 118: bc/bcn covariance ruled out as the source of the 307/311 residual; finds a real but non-explanatory correlation dip at is_target primes

Tags: disproved

## Context

Cycle 117 split the terminal `R = (bcn + 3*bc) / ttc` step into its two components and found that neither `bc/ttc` alone nor `bcn/ttc` alone localizes the 307/311 density-overshoot residual (density predicts a bigger R dip than the real IS estimator shows; frac=114.1%, the only matched-pair measurement above 100%). Whichever term overshot density flipped sign between the 307/311 pair (bc overshoots) and the 349/347 pair (bcn overshoots), with no consistent rule. Cycle 117's "Next" list proposed looking at the *joint* per-path relationship between bc and bcn -- correlation or covariance within a single sampled run -- to see if the residual is a covariance effect invisible to either marginal mean.

## Method

Built `solver/build/cycle118/is_path_sampler_cov.cpp`, a copy of cycle117's probe that additionally accumulates importance-weighted second moments (`bc^2`, `bcn^2`, `bc*bcn`) so it can report `var_bc`, `var_bcn`, `cov_bc_bcn`, and `corr(bc,bcn)` per prime. Ran it (via `tools/_cycle118_full_pairs.py`, `clang++ -O3 -march=native`, J=200,000, seed=42) for all 10 primes in cycle 115's 5 matched pairs: (223,227), (251,257), (293,283), (307,311), (349,347). Cross-checked the two flip-sign pairs (307/311 and 349/347) at a second seed (99) to rule out single-seed noise.

## Result 1: corr(bc,bcn) is flat and narrow across the whole ruler

| prime | corr(bc,bcn) |
|---|---|
| 223 | 0.2736 |
| 227 | 0.3202 |
| 251 | 0.2880 |
| 257 | 0.3248 |
| 283 | 0.3409 |
| 293 | 0.3252 |
| 307 | 0.3114 |
| 311 | 0.3234 |
| 347 | 0.3252 |
| 349 | 0.3315 |

All ten primes land in a 0.27-0.34 band. This is a much tighter spread than the density-driven differences seen in the marginal means (cycle 117's relD%/relR% were multi-percent swings; here the whole ruler moves by ~0.07 in correlation).

## Result 2: a real, direction-consistent is_target effect exists, but it does not track the residual

Every one of cycle 115's 5 pairs turns out to be (is_target prime, same-row-density non-target neighbor) -- confirmed by `p mod 14`: 223, 251, 293, 307, 349 are all `p = 13 mod 14` (is_target); 227, 257, 283, 311, 347 are not.

| pair | fracR% (cycle 117) | corr(target) | corr(non-target) | diff |
|---|---|---|---|---|
| 223/227 | 80.7 | 0.2736 | 0.3202 | -0.0465 |
| 251/257 | 54.3 | 0.2880 | 0.3248 | -0.0368 |
| 293/283 | 58.3 | 0.3252 | 0.3409 | -0.0157 |
| 307/311 | 114.1 | 0.3114 | 0.3234 | -0.0121 |
| 349/347 | 92.5 | 0.3315 | 0.3252 | +0.0063 |

In 4 of 5 pairs the is_target prime has a *lower* bc/bcn correlation than its density-matched partner, a consistent direction that reproduces at a second seed (307/311 diff -0.0121 at seed 42, -0.0079 at seed 99; 349/347 diff +0.0063 at seed 42, +0.0042 at seed 99 -- same sign both times). That is a real effect, not sampling noise.

But it does not explain the residual we're chasing: the sign flips at 349/347, which is the *well-explained* pair (fracR=92.5%, density predicts the dip almost exactly), not at 307/311, the actual anomaly (fracR=114.1%). If corr_diff sign or magnitude tracked the residual we'd expect the flip (or a magnitude spike) to land on 307/311 specifically. It doesn't -- 307/311's corr_diff (-0.0121) is unremarkable, smaller in magnitude than 3 of the 4 "normal" pairs.

## Interpretation

The joint bc/bcn relationship, like each marginal alone (cycle 117) and like the depth-1/depth-2 candidate counts (cycle 116), does not localize the 307/311 density-overshoot residual. This closes out the natural decomposition of the terminal R formula: depth-1 counts (exact, no info), depth-2 counts (collapse to density), bc marginal, bcn marginal, and now bc/bcn covariance -- all measured, none explains the anomaly. The by-product finding (is_target primes have systematically lower bc/bcn correlation than density-matched neighbors, 4/5 pairs, seed-stable) is a new, real fact worth keeping on record, but it's a separate phenomenon from the specific 307/311 residual, roughly the same size gap (~0.01-0.05 correlation) in both "well-explained" and "anomalous" pairs alike.

## Next

1. Widen past the 5 matched pairs cycle 115 picked -- there are more k=13 primes with is_target status below the p=349 sieve ceiling. Test whether 307/311 is truly an outlier pair or whether other pairs would show similar >100% fracR if measured; right now n=5 is too small to tell if 307/311 is special or just the unlucky tail of normal seed variance in a 5-sample set.
2. If 307/311 really is exceptional even against a wider set, stop decomposing the R formula further (exhausted: counts, bc, bcn, bc-bcn covariance) and instead look at whether it's a property of 307 and 311 themselves outside the sieve math -- e.g. their gap to neighboring primes, quadratic-residue structure mod small primes, or simply flag it as within-noise for a 5-pair sample and stop chasing it as a distinct phenomenon.
3. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE sizes -- still capped at p=349 as of this cycle (checked: 108 total sieve events, 9 for k=13, unchanged since cycle 68/110), Track A still stuck.