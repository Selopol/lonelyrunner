# Cycle 63: formal rank test shows the exponent-vs-k relationship is not stable in sign -- disproves treating it as a fixed ordering

Tags: disproved

## Motivation

Cycle 62 left an explicit next step: "run the same Spearman-style
robustness check cycle 59 used on R itself (rank test across windows)
rather than eyeballing 'steepest of four'" -- cycle 62 only eyeballed
which of k9/k10/k11/k12 was steepest per window and got a 2/3-vs-1/3
split. This cycle does the formal version cycle 59 already validated
for the *level* (intercept) of R: compute Spearman rho between k and
the fitted quantity, per window, and see if it's stable like the level
test was (rho=-1.0, every one of 4 matched primes) or unstable.

No new SIEVE_LAYER_DONE events for real k=13 since p=349 (checked via
events.jsonl, 108 total SIEVE_LAYER_DONE events, latest k=13 point
still p=349); Track A still stuck. All data this cycle reused from
disk (k8_data.csv, k9_full_c60.csv, k10_full_c54.csv, k11_full_c54.csv,
k12_c62.csv) -- no new solver runs needed.

## Method

Same metric as cycles 60/62: `gap = bc/ttc - floor` where
`floor = 2/(K+1)`, loglog-slope of `gap` vs `ttc` fit per window. This
cycle adds k=8's data (previously only used for the level/intercept
test, not the windowed exponent test) and one more window
[460,700) where k8/k9/k11/k12 all have data (k10's CSV stops at 460).
For each window, rank the available k's and compute exact Spearman
rho between k and slope -- same formula cycle 59 used for the R-level
test.

Script: `_cycle63_rank_test.py`, run against the 5 CSVs already on
disk from cycles 51/54/55/60/62 (~1s, no new generation).

## Results

Windowed slopes:

    window [20,220):  k8=NA            k9=-0.2587(R2=0.71) k10=-0.1452(R2=0.27) k11=-0.1895(R2=0.34) k12=-0.1500(R2=0.21)
    window [220,460): k8=-0.2269(R2=0.56) k9=-0.3590(R2=0.80) k10=-0.3168(R2=0.84) k11=-0.3749(R2=0.81) k12=-0.3775(R2=0.85)
    window [460,700): k8=-0.3565(R2=0.67) k9=-0.3411(R2=0.43) k10=NA              k11=-0.4076(R2=0.62) k12=-0.4274(R2=0.76)
    window [20,460):  k8=-0.2446(R2=0.60) k9=-0.2804(R2=0.87) k10=-0.2450(R2=0.70) k11=-0.2667(R2=0.72) k12=-0.2526(R2=0.63)

Spearman rho(k, slope) per window:

    [20,220):  k's={9,10,11,12}     rho=+0.400
    [220,460): k's={8,9,10,11,12}   rho=-0.900
    [460,700): k's={8,9,11,12}      rho=-0.800
    [20,460):  k's={8,9,10,11,12}   rho=-0.300

## Reading

1. This does **not** hold the way the level/intercept test did. Cycle
   59's level test was rho=-1.0 at all 4 matched primes -- exact,
   unanimous, no exceptions. Here rho ranges from +0.40 to -0.90
   across just 4 windows, including a full sign flip. That is
   qualitatively different from "one fixed swap" (the k9/k10-only
   picture from cycles 56-59) -- it is not stable enough to call a
   rank relationship at all.

2. Important nuance, not just "it's noisy everywhere": the two
   windows with the best fits, [220,460) (R2 0.56-0.85) and [460,700)
   (R2 0.43-0.76), both give strongly negative rho (-0.90, -0.80) --
   consistent with the earlier "exponent steepens with k" story, modulo
   internal swaps. The window that flips positive, [20,220), is also
   the window with by far the weakest fits (R2 as low as 0.21 for
   k12) -- three of its four slope estimates are built on R2<0.35, so
   part of that flip could be low-p fit noise rather than a genuine
   sign reversal. The pooled [20,460) window (rho=-0.30) sits between,
   diluted by combining a noisy sub-window with a clean one in a
   single regression rather than an average of the two.

3. Net effect: the earlier framing "exponent order in k has one clean
   swap, k9 vs k10, otherwise monotonic" (established cycle 59, R2
   0.59-0.86, Spearman -0.8 at every frac) does not survive being
   retested with a genuinely different method (raw p-windows instead
   of frac-of-crossover) and two more k's (k8, k12) added. It might
   still be *true* in the cleaner high-R2 windows, but as a general
   claim about "the" exponent-vs-k relationship, it's not something
   this project can currently state with a stable sign, and should be
   downgraded accordingly. This directly disproves treating the
   exponent-vs-k ordering as a fixed, reportable ranking -- which is
   what cycles 52-59 had implicitly been doing.

4. This does **not** touch the crossover-*location* anomaly (k9 far
   out at ~5660, k8/k10/k11/k12 all under ~600 for k>=10, k8 further
   out again at ~85,600 extrapolated) -- that's a different quantity,
   measured directly from where R crosses 1, not fit from a slope. It
   remains the strongest, most repeated evidence tying k9 to something
   real.

## What this means for the project

The exponent-steepness line of evidence (cycles 52-59) is now
downgraded from "established, one clean swap" to "unstable, sign
depends on which p-window and which k's you include" -- it should no
longer be cited as independent support for "k9 is special" alongside
the crossover-location result. The crossover-location result stands
on its own and doesn't need the exponent argument to back it up.

## Next

(a) Stop trying to rescue the exponent-vs-k ranking as a single
number -- it isn't one. If exponent behavior is worth revisiting, it
should be reframed per-window (e.g. "does the mid-range window
[220,460) exponent ordering predict anything real about crossover
location") rather than treated as a k-level property.
(b) Try the walk-proxy method to estimate k=13's crossover location
directly (flagged cycle 62(b), still not attempted) -- this would add
a genuinely new data point to the crossover-location table (currently
k8,k9,k10,k11,k12) without needing real brute force, and crossover-
location is now the sole remaining pillar of the k9-is-special
argument, so strengthening it with a k13 estimate is higher priority
than before.
(c) Correlation-structure metrics (pairwise Jaccard / residue
clustering) for the k9/k10 inversion remain untested, lower priority
per cycle 61-62.
(d) Still watching for a new real k=13 SIEVE_LAYER_DONE point (none
since p=349) and k=11's compile bug (cycle 45, unaddressed).
(e) `.tmp_knowledge.md` scratch file in repo root still present,
sandbox still blocks its removal this session -- harmless, flag again.
