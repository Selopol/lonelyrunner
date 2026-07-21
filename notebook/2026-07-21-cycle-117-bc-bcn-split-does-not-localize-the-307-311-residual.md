# Cycle 117: splitting the terminal bc/bcn step does not localize the 307/311 density residual to a single term

Tags: disproved

## Context

Cycle 116 proved that depth-1 candidate counts are exactly constant (=row
density) and showed depth-2 candidate-count trajectories collapse to a
function of row density alone whenever two primes share row density. It
concluded that the real per-prime divergence in `mean_R_hat` -- and in
particular the 307/311 matched-pair overshoot from cycle 115 (density
predicts a *bigger* R dip than the real IS estimator shows, frac=112.3%,
the only measurement above 100% in either method) -- must live in the
terminal step: `bc`/`bcn`, computed once per path at depth `K-4` as
`R = (bcn + 3*bc) / ttc`. Cycle 116's "Next" list proposed instrumenting
`bc`, `bcn`, and `ttc` separately for the 5 matched pairs from cycle 115,
and comparing their relative offsets to `relR%`/`relD%` per pair.

## Method

Built `solver/build/cycle117/is_path_sampler_bcbcn.cpp`, a copy of
cycle116's probe extended to accumulate importance-weighted means of
`bc`, `bcn`, and `ttc` (not just the combined `R`) across the sample path.
Compiled and ran it (via `tools/_cycle117_bcbcn_probe.py`, `clang++ -O3
-march=native`, J=200,000, seed=42) for all 10 primes in cycle 115's 5
matched pairs: (223,227), (251,257), (293,283), (307,311), (349,347).

## Sanity check: instrumentation reproduces cycle 115 exactly

First recomputed `fracR% = relD% / relR%` (density gap over R gap, same
definition cycle 112-115 used) directly from the bc/bcn/ttc-derived `R` in
this new probe:

| pair | relD% | relR% | fracR% |
|---|---|---|---|
| 223/227 | -4.667 | -5.781 | 80.7 |
| 251/257 | -3.344 | -6.153 | 54.3 |
| 293/283 | -3.484 | -5.981 | 58.3 |
| 307/311 | -3.353 | -2.939 | 114.1 |
| 349/347 | -0.576 | -0.623 | 92.5 |

These match cycle 115's seed=42 table to one decimal place exactly
(cycle 115's seed-reseed paragraph lists the same seed=42 values: 80.7,
54.3, 58.3, 114.1, 92.5). Confirms the new probe's bc/bcn/ttc accounting
is consistent with the already-validated combined-R sampler.

## Result: splitting bc and bcn does not cleanly localize the residual

Computed `fracBC% = relD% / rel(bc/ttc)%` and `fracBCN% = relD% /
rel(bcn/ttc)%` -- i.e. the same "how much of density's predicted change
survives" question, applied to each of the two terminal terms
separately instead of their combination:

| pair | fracR% | fracBC% | fracBCN% |
|---|---|---|---|
| 223/227 | 80.7 | 85.4 | 71.5 |
| 251/257 | 54.3 | 54.1 | 58.8 |
| 293/283 | 58.3 | 59.2 | 57.9 |
| 307/311 | **114.1** | 120.6 | 97.5 |
| 349/347 | 92.5 | 90.2 | 117.9 |

For the anomalous 307/311 pair, `bcn/ttc` alone tracks density almost
exactly (97.5%, the closest to 100% of any single-term measurement in the
whole table), while `bc/ttc` alone overshoots density even more than the
combined R does (120.6% vs 114.1%). If the residual lived cleanly in one
term, we'd expect one of {fracBC, fracBCN} to sit near 100% (density
fully explains it) consistently across pairs, with the other absorbing
the leftover. That is not what happens: in 349/347, the pattern flips
sign -- `bc/ttc` undershoots (90.2%) while `bcn/ttc` overshoots (117.9%),
the opposite of 307/311. In the remaining three pairs, fracBC and fracBCN
stay close to each other and to fracR (within ~5 points), showing no
term-specific pull at all.

## Interpretation

The bc/bcn split, done the straightforward way, does not localize the
density residual to a single term of the R formula. Whichever term
carries the "extra pull" beyond density's prediction flips between pairs
(bc for 307/311, bcn for 349/347), and for the three non-anomalous pairs
neither term stands out. This rules out "bc alone" or "bcn alone" as a
one-line explanation for the 307/311 overshoot specifically. It does not
contradict cycle 116's conclusion that the terminal step is where real
(non-count) structure enters -- it just shows that structure isn't
cleanly separable into the bc and bcn pieces individually; whatever
drives the residual likely depends on how bc and bcn covary along the
same sample path, not on either one's marginal distribution.

## Next

1. Instead of separate means, look at the per-sample joint relationship
   between bc and bcn (e.g. correlation or covariance of bc and bcn
   within a single run) for 307/311 vs 349/347 -- the two pairs where the
   flip happens -- to see if the residual is a genuine covariance effect
   invisible to marginal means.
2. If that's still flat, widen the matched-pair set beyond the 5 from
   cycle 115 (there are more k=13 primes below 350 with is_target status
   available) to see whether the bc/bcn flip correlates with any simple
   prime property (e.g. p mod small primes, gap to next target prime)
   rather than being pair-idiosyncratic noise.
3. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE
   sizes -- still capped at p=349 as of this cycle (checked: 108 total
   sieve events, last k=13 entry unchanged since cycle 68/110), Track A
   still stuck.
