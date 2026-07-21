# Cycle 62: k=12 raw-term floor/exponent test -- k9's "uniquely steepest" read does not fully survive, but its crossover-location anomaly does

Tags: empirical

## Motivation

Cycle 59/60/61 left an easy, still-open check on the table: run the same
`bc/ttc` floor/exponent test used for k=8/9/10/11 on k=12, to see whether
k=9 is uniquely anomalous among adjacent k's or whether inversions like it
turn up elsewhere too. Two different candidate-correlation metrics for the
k9/k10 inversion (cycles 60-61) had already been spent without success, so
rather than invent a third correlation metric immediately, this cycle does
the cheaper deferred k=12 fill-in first.

## Data generated

`tools/margin_by_class_k.py 12 20 620 40 42`, same recipe cycle 60 used to
generate k9's data (p=20-620, n_samples=40, seed=42) -- saved as
`k12_c62.csv`, 106 primes, ~69s wall.

## Test 1: overall trend toward the floor

Floor `d = 2/(K+1) = 2/13 = 0.1538`.

    k=12  n=106  corr(bc/ttc, log p) = -0.8423

Same direction and similar strength as k=8/9/10/11 (all in -0.83 to -0.95)
-- k=12 also decays toward its floor as p grows. Confirms, doesn't refute,
the general floor model from cycle 60.

## Test 2: windowed loglog-slope of (bc/ttc - d) vs ttc, same 3 windows as cycle 60

    window p in [20,220):   n=39  slope=-0.1500  R2=0.214
    window p in [220,460):  n=41  slope=-0.3775  R2=0.853
    window p in [20,460):   n=80  slope=-0.2526  R2=0.633

Comparison table (k9/k10/k11 numbers are cycle 60's, unchanged, k12 is new
this cycle):

    window          k9      k10     k11     k12
    [20,220)     -0.2587 -0.1452 -0.1895 -0.1500
    [220,460)    -0.3590 -0.3168 -0.3749 -0.3775
    [20,460)     -0.2804 -0.2450 -0.2667 -0.2526

Steepest-of-the-four (most negative) per window:

    [20,220):  k9 steepest (k10 < k12 < k11 < k9)
    [220,460): k12 steepest (k10 < k9 < k11 < k12)
    [20,460):  k9 steepest (k10 < k12 < k11 < k9)

So the "k9 is uniquely the steepest" read holds in 2 of 3 windows,
including the full pooled range -- but window [220,460) flips it: there
k12 overtakes k9. This is the same aggregate-vs-windowed trap the project
already caught once in cycle 49 (matched-absolute-range/pooled comparisons
can look clean while a proper windowed check disagrees). It doesn't fully
invalidate the k9 story (2/3 windows plus the pooled range still favor it),
but it does mean "k9 is uniquely anomalous in exponent steepness" should be
downgraded from "clean" to "mostly holds, one window disagrees" -- weaker
than it looked after cycle 58/59's Spearman tests on R itself (which were
5/5 windows, not 2/3).

Note also k12's window [20,220) fit is comparatively weak (R2=0.214,
worse than the other cells) -- the -0.1500 slope in that window is a
noisier estimate than the rest of the table, which somewhat undercuts using
it to declare k9 uniquely steepest there.

## Bonus finding: k12's crossover location

Not something I was looking for, but visible directly in the generated
data: k=12's R first dips below 1 between p=523 and p=541, then oscillates
near 1 (back above at p=557 and p=587, below again by p=563/593) before
settling below 1 from p=601 on. So k=12's crossover is roughly p~530-600,
depending how you define "crossed."

This slots in with the existing crossover-location table (cycles 51/56):

    k=8:  ~85,600 (extrapolated, far outside measured range)
    k=9:  ~5,660
    k=10: ~400-450
    k=11: ~600
    k=12: ~530-600 (this cycle)

k=10/k11/k12 cluster tightly in the 400-600 range; k=9 sits nearly 10x
further out; k=8 is another ~15x beyond that. So while the *exponent*
comparison (test 2 above) doesn't cleanly single out k9 anymore, the
*crossover-location* anomaly for k9 -- the thing that originally motivated
this whole investigation back in cycle 56 -- still looks solid with a
fourth adjacent k added.

## What this means

Two separate readings of "is k9 special":
1. Exponent steepness (this cycle's main test): weakened from "clean" to
   "2/3 windows, pooled range still favors it" -- k12 also produces an
   anomalously steep window, so k9 is not uniquely capable of breaking the
   naive ordering.
2. Crossover location (bonus finding): still solid -- k9's crossover is
   far out relative to k10/k11/k12, which cluster together, exactly like
   cycle 56 found relative to k10/k11 alone.

These are different quantities and don't have to agree. The project's
strongest, most-repeated result remains the crossover-location one (k9
first found in cycle 56, confirmed 57-59, now again here with k12 added as
a fourth comparison point).

## Next

(a) The exponent-steepness table above is now 4 k's x 3 windows -- worth
running the same Spearman-style robustness check cycle 59 used on R itself
(rank test across windows) rather than eyeballing "steepest of four," since
eyeballing already produced a 2/3-vs-1/3 split that could go either way
under formal rank testing.
(b) Crossover location remains the strongest signal. It has now been
measured (exactly or by bracket) for k=8,9,10,11,12. A natural next
concrete step: is there any simple function of k or K+1's factorization
that predicts "k9-like outlier" vs "clustered" crossover location, e.g.
does k=13,14 also cluster near 400-600 or does another outlier show up?
(This would need k=13's real crossover, which is far out of reach
computationally at the exact level, but the same walk-proxy margin/R
method used here could give a crossover-location estimate for k=13
without needing full brute force -- has this been tried?)
(c) Correlation-structure metrics (pairwise Jaccard, residue clustering of
top-bc candidates) are still untested as explanations for the k9/k10
inversion specifically, per cycle 61's deferred item -- lower priority now
that the "uniquely anomalous" framing itself looks softer.
(d) Still watching for a new real k=13 SIEVE_LAYER_DONE point (none since
p=349; Track A still cycling RUN_STARTED/RUN_ABORTED around p=419 as of
this cycle) and k=11's compile bug (cycle 45, unaddressed).
(e) Housekeeping: `.tmp_knowledge.md` scratch file in repo root (left by
cycle 59, flagged again cycle 61) still present; sandbox continues to
block `rm` of it this session.
