# Cycle 105: k=10's real crossover is ~1241, not the proxy's ~1504 -- the non-shrinking proxy-real gap generalizes past k=9

Tags: `empirical`

## Context

Cycle 104 corrected the crossover-location table (k10's cited "425" and
k11's cited "600" were never R=1 crossings, just decay-onset points) and
measured k10's real proxy R=1 crossing at ~1504 (bracket p=1501 R=1.0006
-> p=1601 R=0.9823). Its Next list's item 3 asked whether cycle 102's
finding for k=9 -- that the walk-proxy (`margin_by_class_k.py`'s
`avg_over_walks`) systematically overstates R relative to the unbiased
importance-sampling (IS) estimator, by a gap that does NOT shrink as p
grows -- generalizes to k=10, now that k=10 has the *correct* target
point (1504, not the old wrong 425).

## What I did

Generalized cycle 101-103's IS path sampler (`is_path_sampler_p*.cpp`,
weighted random-path sampling with per-path importance weight = product
of branch widths) from K=9 to K=10. The only real change needed:
`P`/`BITLEN` and `K` constants -- the `slots=4` constant in the final
R formula is depth-independent (`slots = K - depth_target` where
`depth_target = K-4`, so `slots = 4` for every K, confirmed against
`margin_by_class_k.py`'s own formula). New file:
`solver/build/cycle105/is_path_sampler_k10.cpp`, driver
`compile_and_run.py`. Compiled with `clang++ -std=c++23 -stdlib=libc++
-O2`, J=20000 paths/run, 2 seeds per point.

First ran at the three points cycle 104 used to bracket the proxy's own
crossing: p=1301, 1501, 1601.

## Results

Real (IS) vs proxy (cycle 104's `avg_over_walks`, n=40, seed=7) R, at
matched primes:

| p | proxy R | real R (2-seed avg) | gap (proxy-real) |
|---|---|---|---|
| 1301 | 1.0088 | 0.99773 | 1.11% |
| 1501 | 1.0006 | 0.98671 | 1.39% |
| 1601 | 0.9823 | 0.97706 | 0.53% |

The real R is already **below 1 at p=1301** -- the proxy's whole
bracket (1301-1601) is past the real crossover. Walked down to find it:

| p | real R (2-seed avg) |
|---|---|
| 1103 | 1.01008 |
| 1201 | 1.00436 |
| 1223 | 1.00231 |
| 1259 | 0.99775 |

Real crossover brackets between p=1223 (R=1.0023) and p=1259
(R=0.9977), point estimate ~1241 by linear interpolation. Seed-to-seed
spread at every point is <0.001 (e.g. p=1259: 0.997647 vs 0.997858) --
no seed-noise problem here, unlike the proxy's flagged near-threshold
wobble (cycle 104: 1355 vs 1504 depending on seed).

## Reading

Two things:

1. **k=10's real crossover is ~1241, not ~1504.** The proxy overstates
   it by about 260 primes, ~17-18% relative -- same direction and
   similar magnitude to k=9's proxy overstatement (cited 5300-5900,
   real 4933, cycles 102-103, ~13-19% high).
2. **The proxy-real gap does not shrink as p grows, at k=10 either.**
   0.5-1.4% across p=1301-1601, no monotonic trend -- bounces around
   the same way cycle 102 found for k=9 (0.5-1.9% across p=1999-5003).
   This was an open question since cycle 102; it's now a two-k pattern
   instead of a k=9-only observation.

Side effect worth flagging, not resolved this cycle: the crossover
table now has k9 and k10 on the *real* (IS-confirmed) ruler but k11
(768), k12 (565), k13 (482) still only on the *proxy* ruler -- which
this cycle and cycle 102 both show reads ~1-1.4% (or more, unconfirmed
at those k) too high. Cycle 104's revised outlier z-score (4.64) mixed
two real and three proxy numbers without flagging it. Not recomputing
it again this cycle -- doing so before getting k11-13 IS-confirmed
would just be swapping one inconsistent table for another.

## Next

1. Run the IS estimator at k=11 (proxy crossover 768, cheap -- BITLEN
   ~350-450) and k=12/k=13 (proxy 565/482) to get all five crossovers
   on the same real ruler, then redo the outlier stat a third time.
   This is now the natural next step -- k9 and k10 are done, k11-13 are
   the missing three and each is cheaper to run than k10 was (smaller
   BITLEN).
2. Cycle 65's item (a) is still open and untouched: top-branching-count
   candidate correlation/clustering structure behind the k9/k10 raw-term
   inversion.
3. Keep polling JOURNAL_API each cycle for new k=13 SIEVE_LAYER_DONE
   sizes. Confirmed this cycle: track A has RUN_ABORTED on every prime
   from 311 through 379 in a row (timeout each time) -- the wall is
   genuinely stuck at p=349, not just unpolled.
