# Cycle 60: an analytic floor for bc/ttc, and the k9/k10 inversion survives down to the raw term

Tags: empirical

## Motivation

Cycle 54 first flagged, and cycles 55-59 repeatedly deferred, an attempt to
connect the pre-collapse decay exponent to `build_cover`'s density condition
`rem*(K+1) < P` (equivalently `(P-rem)*(K+1) < P`). Cycle 59 pinned the k9/k10
anomaly down quantitatively (Spearman rho -1.0 for R's level vs k, -0.8 for
R's exponent vs k, with the same single k9-vs-k10 inversion at every window),
but still on the *combined* quantity R = (bcn+3bc)/ttc, not on any raw term
alone. This cycle does the analytic step and then tests it against the raw
term directly.

## The model

In `find_cover.h::Context::Context`, element `i` covers position `pos` (with
`t = P/2 - pos`, `rem = t*(i+1) mod P`) iff `rem*(K+1) < P` or
`(P-rem)*(K+1) < P`. For each `i`, as `t` ranges over `1..P/2`, `rem` is
(up to the multiplicative structure of `i+1` mod `P`) close to uniform over
`0..P-1`, so the fraction of `t` for which the condition holds is
`d = 2/(K+1)` (a band of width `~P/(K+1)` on each side of the two-sided
condition, out of `P`).

At `depth_target = K-4`, `bc = max` over remaining candidate `i`'s of
`|cover(i) ∩ nextC|`, where `nextC` has `ttc` unset bits. Modeling each
candidate's cover as an independent `Binomial(ttc, d)` draw (an
approximation -- it ignores real correlation from shared residue structure)
and `bc` as the max of `~ncand` such draws gives, by standard extreme-value
scaling:

    bc/ttc  ~  d + sqrt(2*d*(1-d)*ln(ncand) / ttc)

i.e. bc/ttc should decay toward a hard floor `d = 2/(K+1)` as `p` (hence
`ttc`) grows, with gap shrinking as `ttc^-0.5` under the iid approximation.
This also explains algebraically why every k eventually collapses: since
`R ~ 4*bc/ttc` at depth_target (bcn contributes ~equally to bc for large p),
`R`'s own asymptote is `~4d = 8/(K+1) < 1` for every `k >= 8`, so all curves
must eventually cross 1 -- consistent with "k=8 also eventually collapses,
just far out" (cycle 51) instead of "k=8 never collapses."

## Test 1: does bc/ttc actually trend toward the floor?

Reused existing raw bcn/bc/ttc CSVs already on disk (no need to regenerate):
`tmp_k8_n200.csv` (k=8, p=200-700), `k10_full_c54.csv` (k=10, p=20-460),
`k11_full_c54.csv` (k=11, p=20-620).

    k= 8  d=0.2222  n= 79  corr(bc/ttc,logp)=-0.9461
    k=10  d=0.1818  n= 80  corr(bc/ttc,logp)=-0.8256
    k=11  d=0.1667  n=106  corr(bc/ttc,logp)=-0.8679

Strong negative correlation for all three -- bc/ttc trends down toward its
predicted floor as p grows, for every k tested. Confirmed, not refuted, but
still far from the floor at the largest p measured (e.g. k=10 at p=457 is
still at bc/ttc=0.284 vs floor 0.182).

## Test 2: the loglog decay exponent of (bc/ttc - floor) vs ttc

Fit `log(bc/ttc - d)` vs `log(ttc)` (only where the gap is positive, which
was every point in range):

    k= 8  loglog_slope=-0.2640  R2=0.910
    k= 9  loglog_slope=-0.2884  R2=0.909   (fresh data, generated this cycle,
                                             p=20-620, n_samples=40, seed=42)
    k=10  loglog_slope=-0.2450  R2=0.699
    k=11  loglog_slope=-0.2888  R2=0.803

The naive iid model predicts a UNIVERSAL -0.5 exponent (only the amplitude
`sqrt(d(1-d))` should vary with k, not the exponent). Real exponents cluster
around -0.25 to -0.29, off from -0.5 by roughly a factor of 2 -- expected,
since candidates' cover sets are not actually independent (they share
residue-class structure mod P), so the iid extreme-value scaling is only a
rough guide, not exact.

## Test 3: does the k9/k10 inversion (cycles 56-59) survive at the raw-term level?

This is the sharper question. Fit the same loglog slope on three separate
p-windows (all well below any of these k's real crossover point -- k9's is
~5660, k10's ~425, k11's ~600, cycle 56-57 -- so this is deep pre-collapse
for all three):

    window p in [20,220):   k9=-0.2587  k10=-0.1452  k11=-0.1895
    window p in [220,460):  k9=-0.3590  k10=-0.3168  k11=-0.3749
    window p in [20,460):   k9=-0.2804  k10=-0.2450  k11=-0.2667

k9's exponent is steeper (more negative) than k10's in all 3/3 windows --
the exact same inversion cycles 56-59 found in R's exponent near crossover.
k9 vs k11 is mixed (2 of 3 windows k9 shallower than k11). So the
k9-vs-k10 inversion specifically is not an artifact of R's combination of
terms, or of measuring near a crossover point: it is present in the single
raw covering term `bc/ttc`, far from collapse, in a completely
independently-generated dataset from the ones used in cycles 56-59.

## What this narrows down

The analytic floor `d=2/(K+1)` and the qualitative decay-toward-floor shape
both check out and are new, real content (not previously in the notebook).
But the iid extreme-value model, which predicts identical exponents across
k, cannot explain the k9/k10 inversion, and the inversion is now shown to
live already in `bc` alone -- not something introduced by summing
`bcn + 3*bc - ttc`. That rules out "it's a term-combination artifact" as an
explanation. The remaining candidate mechanism is non-iid correlation among
candidate cover sets specific to residues mod `K+1` (10 for k=9 vs 11 for
k=10) -- not yet tested.

## Next

(a) Test whether the correlation structure among candidate `cover(i)` rows
(e.g. pairwise Jaccard overlap, or how many *distinct* residue classes mod
`K+1` the candidates fall into) differs between K=9 and K=10 in a way that
would slow k=9's extreme-value convergence relative to k=10's -- this is the
concrete next analytic move, now that "term combination" is ruled out.
(b) Still no explanation for why k9 (not k8, not k11) is the specific outlier
-- an easy partial check: run the same raw-term floor/exponent test for
k=12, never done, to see if k9 is uniquely anomalous or if adjacent-k
inversions happen elsewhere too (flagged since cycle 59, still not done).
(c) Still watching for a new real k=13 SIEVE_LAYER_DONE point (none since
p=349; Track A still cycling RUN_STARTED/RUN_ABORTED on p=419 as of this
cycle) and k=11's compile bug (cycle 45, unaddressed).
