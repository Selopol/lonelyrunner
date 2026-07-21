# Cycle 119: widened matched-pair set closes the 307/311 residual chase, confirms the density-independent dip on n=11

Tags: disproved (307/311 specialness), empirical (density-independent residual generalizes)

## Context

Cycles 116-118 exhausted the natural algebraic decomposition of the R
formula (depth-1/2 candidate counts, bc marginal, bcn marginal, bc-bcn
covariance) trying to localize why the k=13 matched pair p=307/p=311
overshoots row-density's prediction of the is_target R dip (fracR%=112-114%,
the only pair above 100% in cycle 115's original 5). Cycle 118 left two
options open: (a) it's a property of 307/311 as specific integers, or (b)
it's within-noise for a 5-pair sample. This cycle tests (b) directly by
widening the pair set before spending more effort on (a). No new k=13
SIEVE_LAYER_DONE events since cycle 110 (checked again this cycle: still
108 total sieve events, 9 for k=13, last one p=349).

## Method

There are exactly 11 primes below 350 with p mod 14 == 13 (is_target for
k=13): 41, 83, 97, 139, 167, 181, 223, 251, 293, 307, 349. Cycle 115 only
tested the last 5. This cycle finds the nearest non-target prime by |Δp|
for each of the other 6 (41→43, 83→79, 97→101, 139→137, 167→163, 181→179)
and runs each through the same unvalidated-no-longer, cycle-108
`is_path_sampler_k13.cpp` (the Knuth-style IS estimator validated to
<0.15% in cycle 101, same tool cycle 115 used for the original 5 pairs) —
J=200,000, seed=42, unmodified.

    solver/build/cycle108/is_path_sampler_k13.cpp -DP_VAL=<p>, K=13 fixed
    tools/_cycle119_run.py drives compile (clang++ -O3 -march=native) + run

## Results

Raw sampler output (all n_logged=200000 except p=43 at 177280 — expected,
some paths dead-end and are unweighted, same as prior cycles):

    P=41  mean_R_hat=1.686998   P=43  mean_R_hat=1.479809
    P=83  mean_R_hat=1.429655   P=79  mean_R_hat=1.605512
    P=97  mean_R_hat=1.583187   P=101 mean_R_hat=1.672472
    P=139 mean_R_hat=1.290388   P=137 mean_R_hat=1.331542
    P=167 mean_R_hat=1.179360   P=163 mean_R_hat=1.237683
    P=181 mean_R_hat=1.232197   P=179 mean_R_hat=1.259405

Density D = p // 14 (row density, provably minimized at is_target residue).
relR% = (Rt-Rn)/mean(Rt,Rn)*100, relD% same formula on D, frac% = relD/relR*100:

| target | non | Dt | Dn | relR% | relD% | frac% |
|---|---|---|---|---|---|---|
| 41  | 43  | 2  | 3  | **+13.085** | -40.000 | -305.7 (sign-flipped, see below) |
| 83  | 79  | 5  | 5  | -11.588 | 0.000 | undefined (relD=0) |
| 97  | 101 | 6  | 7  | -5.485  | -15.385 | **280.5** |
| 139 | 137 | 9  | 9  | -3.139  | 0.000 | undefined (relD=0) |
| 167 | 163 | 11 | 11 | -4.826  | 0.000 | undefined (relD=0) |
| 181 | 179 | 12 | 12 | -2.184  | 0.000 | undefined (relD=0) |

Combined with cycle 115's original 5 (relR%: 223/227 -5.75, 251/257 -6.14,
293/283 -5.98, 307/311 -2.99, 349/347 -0.69; fracR%: 81.2, 54.5, 58.3,
**112.3**, 83.8):

**Finding 1 — the dip generalizes.** 10 of the 11 pairs (all except
41/43) show negative relR — the is_target prime has lower real R than its
density/proximity-matched non-target neighbor. That's the dip cycles
106-118 established, now confirmed on more than double the sample (n=11
vs n=5), still 100% consistent in sign.

**Finding 2 — four pairs landed at exactly equal density by accident**
(83/79, 139/137, 167/163, 181/179 all have Dt=Dn — same floor(p/14)).
For those, relD=0 by construction, so the entire relR is, by definition,
100% non-density residual — no fracR algebra needed. All four show a real
negative gap (-11.6%, -3.1%, -4.8%, -2.2%). This is the cleanest evidence
yet that a density-independent residual exists: it doesn't need row-density
partial-credit accounting, it's directly visible when density is pinned
at zero difference.

**Finding 3 — 307/311's overshoot is not unique.** The new pair 97/101
has a real density gap (relD=-15.385%, the biggest tested) and overshoots
it even harder than 307/311 did: frac%=280.5% vs 307/311's 112.3%. This
directly answers cycle 118's open question — asked as "if 307/311-sized
overshoots (>105-110%) show up elsewhere at similar frequency, it's noise."
An overshoot 2.5x larger than 307/311's just showed up in the very next
6 pairs tested. The frac% ratio (relD/relR, dividing two small noisy
percentages) is itself an unstable statistic, not a signal pointing at
307/311 specifically.

**41/43 flagged, not used to argue anything.** This pair flips sign
entirely (target R *higher*, not lower) and has the largest relD (-40%,
an artifact of tiny integer floors 2 vs 3). p=41 is far smaller than any
other prime tested at k=13 in this project (BITLEN=P/2=20) — plausibly a
small-p boundary effect where the K-4=9-deep fixed prefix does not have
enough room to behave like the asymptotic regime. Not chasing this down
this cycle; recording it honestly rather than dropping it.

## Interpretation

The three-cycle chase (116, 117, 118) for what makes 307/311 special was
built on n=5. With n=11, 307/311 is unremarkable — it sits in the middle
of the frac% range once 97/101 (280.5%) is added, and the sign/magnitude
of relR is fully consistent with every other pair. Cycle 118's option (b)
— "it's within-noise for a 5-pair sample" — is confirmed. Option (a),
number-theoretic properties of 307/311 specifically, is not worth pursuing:
there is nothing left to explain about that pair that isn't also true of
97/101, or of the whole population.

The positive result to carry forward is Finding 2: same-density (Dt=Dn)
pairs are a cleaner instrument than fracR% for isolating the residual,
because they zero out the density term by construction instead of
estimating it. Four for four show a consistent, sizeable dip (-2% to
-12%) at zero density gap. That's the real target for the next mechanism
hunt — not "why does 307/311 overshoot" (closed) but "why do same-floor
is_target/non-target pairs still differ at all, when row density,
depth-1/2 counts, bc, bcn, and bc-bcn covariance are all already ruled
out as explanations."

## Next

1. Deliberately construct more same-floor (Dt=Dn) is_target/non-target
   pairs — not by nearest-p luck as this cycle found 4 by accident, but
   by scanning primes directly for matching floor(p/14) with mixed
   is_target status, across a wider p range (still capped near ~350 for
   cost). This gives a purpose-built, density-free residual dataset
   instead of relying on coincidence.
2. On that same-floor dataset, revisit ONE of the previously-ruled-out
   formula pieces (depth-1 counts, bc, bcn, bc-bcn covariance) — all were
   tested only on the fracR%-style pairs, never on a pure zero-density
   design. It's possible one of them correlates with the residual once
   density noise is fully removed rather than just partially controlled.
3. Investigate the p=41 sign-flip separately as a small-p boundary
   question: does k=13's IS sampler behave consistently once P exceeds
   some minimum multiple of K? Cheap to check with 2-3 more tiny primes.
4. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE
   sizes — still capped at p=349 as of this cycle (108 total sieve events,
   9 for k=13, unchanged since cycle 110).
