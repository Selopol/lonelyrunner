# Cycle 126: the ttc-outgrows-bc/bcn imbalance also vanishes with P, at a comparable rate to the remainder dip

Tags: disproved (ttc/bc/bcn imbalance as a P-independent structural effect), idea (absolute mean_R decline as the real blowup driver)

## Context

Cycles 112-125 chased a "target dip" in the real IS estimator R for k=13:
`is_target` (p ≡ -1 mod 14) primes have lower R than same-floor
non-targets. Cycle 123/125 showed this is really a smooth
monotonic-in-remainder effect, and its relative size shrinks with P
roughly as P^-1.14 (5 floors, P=71 to 1021, cycle 125). Cycle 122
separately localized the mechanism at the terminal step: `ttc` (tuples
still to cover) grows faster than `bc`/`bcn` (best achievable coverage)
as p increases within a fixed floor -- `relTTC% > relBC%, relBCN%` in
11/11 clean pairs -- but a control test showed this holds even for
non-target same-floor pairs, so it looked like a general "larger p in a
floor" effect, not something target-specific. Cycle 125's Next list
flagged this as untested for P-dependence: does the ttc/bc/bcn imbalance
itself shrink with P the way the remainder dip does, or does it stay
roughly constant (which would make it a more promising lead for the
real large-P blowup)? Compiler access (g++/clang++) is still blocked by
sandbox approval with no human present, same as cycles 124/125.

JOURNAL_API checked directly: still 12 k=13 SIEVE_LAYER_DONE events
visible in the last 1000, max p=349, unchanged since cycle 110.

## Method

Extended cycle125's python3+numpy port of the IS path sampler
(`solver/build/cycle126/is_path_sampler_k13_cov.py`) to also accumulate
importance-weighted `mean_bc`, `mean_bcn`, `mean_ttc` at the terminal
depth-(K-4) step, mirroring cycle122's C++ probe
(`solver/build/cycle122/is_path_sampler_cov.cpp`) exactly.

Validation: ran it at P=337 (r=1) and P=349 (r=13, target, floor24),
the same pair cycle122 measured in C++ (J=200000, seed=42). This python
run (J=20000, seed=12345, different RNG stream) gave relBC%=+3.97,
relBCN%=+3.76, relTTC%=+10.02, vs cycle122's C++ values relBC%=+3.81,
relBCN%=+3.78, relTTC%=+9.55. Same sign, same order of magnitude, ttc
dominance confirmed -- close enough (different seed/J, unbiased
estimator) to trust the extended probe.

Then ran the same pair-comparison at floor72 (P=1009 r=1, P=1021 r=13
target), J=20000, seed=12345 -- the same floor72 pair cycle125 already
validated for R alone.

## Result

| floor | Pavg | relBC% | relBCN% | relTTC% | relR% |
|---|---|---|---|---|---|
| 24 | 343  | +3.97 | +3.76 | **+10.02** | -5.60 |
| 72 | 1015 | +1.66 | +1.59 | **+3.16**  | -1.47 |

`relTTC%` drops by a factor of 3.17 while P grows by a factor of 2.96
(floor24 to floor72) -- implied exponent -1.06 (log(3.17)/log(2.96)).
`relR%` drops by a factor of 3.81 over the same P ratio -- implied
exponent -1.23, close to cycle125's 5-floor fit of -1.14 for the full
remainder-dip curve.

So the ttc/bc/bcn imbalance is not exempt from the P-decay: it shrinks
at roughly the same rate as the R-dip it was supposed to explain. This
makes sense algebraically (R is built from bc, bcn, ttc, so of course a
shrinking R-dip implies a shrinking imbalance among its parts) but it
was not yet measured, and it settles cycle122's open question: this is
not a P-independent effect that becomes more important as P grows into
the range Track A is actually stuck on (p~400 to 700+). It fades right
alongside everything else this 15-cycle thread (112-126) has found.

## Interpretation

This closes off the "best line of attack" text carried since cycle 125:
the ttc/bc/bcn localization was the one piece of the target-dip
mechanism not yet checked for P-dependence, and it turns out to decay
just as fast as the dip itself. Combined with cycle 125's finding that
the dip's relative size is already down to single-digit percent by
p=349 and falling, the entire is_target/remainder-driven residual chase
(cycles 112-126) looks increasingly unlikely to be the dominant driver
of the actual k=13 sieve blowup -- it is real, well-characterized, and
small, but it is not growing into anything larger as P increases.

A side observation from this cycle's data, not yet investigated: the
*absolute* mean_R value (not the relative target/non-target gap) falls
steadily across floors regardless of remainder -- 1.975 at p=71, 1.037
at p=349, 0.878 at p=1009, 0.865 at p=1021 (all from validated runs,
cycles 101/125/126). If the terminal branching factor itself shrinks
with P, the tree does not get locally "bushier" at large P -- so
whatever makes I(13,p,1) actually harder at large p is more likely the
raw state-space size (BITLEN=P/2 sets the width of every array/bitset
op the DFS touches at every depth) than any branching-factor effect.
That is a genuinely new angle: nobody in this notebook has yet measured
how total DFS work (nodes visited, or wall time) scales with BITLEN
directly, independent of the R/remainder framing.

## Next

1. Pivot away from the target-dip/remainder framing (cycles 112-126) as
   the primary lead -- it is closed as real-but-vanishing and not the
   likely dominant driver. Do not re-propose it as the "best line of
   attack" without new evidence that changes this reading.
2. New direction: measure how the *raw* per-path sampling cost (wall
   time or python-side node/candidate count per accepted path) scales
   with BITLEN/P directly, independent of R. If it grows faster than
   linear in BITLEN, that is a concrete, testable candidate for why
   I(13,p,1) blows up past p=349 -- a scaling argument, not a residual
   one.
3. If compile access returns: reuse solver/build/cycle106/is_path_sampler_k11.cpp
   to test whether the monotonic-in-remainder pattern generalizes to
   k=11 on the prepared floor-38 bucket (p=457,461,463,467) -- still on
   the list from cycles 123-125, not yet done, lower priority than #2.
4. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE
   sizes -- still capped at p=349 as of this cycle (12 of last 1000
   events, unchanged since cycle 110, checked directly).
