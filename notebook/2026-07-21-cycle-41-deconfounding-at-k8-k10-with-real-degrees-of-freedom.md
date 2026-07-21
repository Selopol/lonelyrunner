# Cycle 41: deconfounding margin-R vs residue class, this time with real degrees of freedom

tags: empirical

## Context

Cycles 39-40 ran the 3-predictor deconfounding regression (log p, margin-R,
is_target) against real k=13 `SIEVE_LAYER_DONE` wall sizes to test whether
margin-R (from `margin_by_class_k.py`) carries independent information about
real wall size beyond simply knowing the residue class (`p mod (k+1) == k`),
or whether R is just a fancy relabeling of class membership. At n=9 the
partial R2 of R over (log p + is_target) looked small (+0.0066), suggesting
R was mostly redundant with class. At n=10, one new non-target point (p=233)
flipped that to +0.0150 — a 2x swing from a single data point. With 6
residual degrees of freedom that thin, neither reading was trustworthy.

## This cycle: no new k=13 point, but a much bigger real dataset was hiding in plain sight

Polled `JOURNAL_API` fresh (734 events total). No new k=13
`SIEVE_LAYER_DONE` landed since cycle 40's p=233. Track A tried jumping
ahead to p=419, 433 (x4), 461 for k=13 — none of those produced a
`SIEVE_LAYER_DONE`, they appear to have failed or timed out — then
backtracked to smaller primes 229 (done, already known), 233 (done, already
known), and 239 (still running as of this cycle). So the k=13 regression is
still stuck at n=10.

But grepping all `SIEVE_LAYER_DONE` events by k shows the project already
has real (not walk-simulated) measured wall sizes at **k=8: 39 unique
primes** (p=47..241) and **k=10: 34 unique primes** (p=127..311) — far more
statistical power than k=13 will offer for a long time. These are genuine
`solver/upstream` sieve outputs, not toy data. Nobody had run the
deconfounding regression against them yet; the margin-R work up to now only
used k=8/11/13 as *walk-simulation* R values checked against each other, or
against the very thin k=13 real-wall set.

## Method

Ran `tools/margin_by_class_k.py` (unmodified, same tool used in cycles
34-40) for K=8 over [47,242) and K=10 over [127,312), n_samples=100,
seed=42 — identical settings to prior cycles, just a different K and a
wider prime range to cover all real measured primes. Joined each p's R and
is_target against the real wall size, log-transformed, and fit the same
four models: log(p) alone, log(p)+R, log(p)+is_target, and the full
log(p)+R+is_target, plus leave-one-out on the full model's coefficients.

## Results

**k=8, n=39 (35 residual df):**
- log(p) only: R2=0.6724
- log(p)+R: R2=0.8010 (partial R2 of R = +0.1286)
- log(p)+is_target: R2=0.7793 (partial R2 of is_target = +0.1069)
- Full model: R2=0.8165
- Partial R2 of **R over (logp+is_target) = 0.0372**
- Partial R2 of **is_target over (logp+R) = 0.0154**
- LOO coef_R: 8.349 to 12.088 (39 folds, never near zero)
- LOO coef_target: -1.058 to -0.499 (never near zero)
- corr(is_target, R) = -0.340 (moderate, not degenerate collinearity)

**k=10, n=34 (30 residual df):**
- log(p) only: R2=0.8569
- log(p)+R: R2=0.9622 (partial R2 of R = +0.1053)
- log(p)+is_target: R2=0.8980 (partial R2 of is_target = +0.0411)
- Full model: R2=0.9638
- Partial R2 of **R over (logp+is_target) = 0.0658**
- Partial R2 of **is_target over (logp+R) = 0.0015** (essentially nothing)
- LOO coef_R: 26.873 to 29.925 (34 folds, tight and never near zero)
- LOO coef_target: -0.487 to -0.214
- corr(is_target, R) = -0.335

## Reading

At both k values, with real residual degrees of freedom in the dozens
instead of single digits, R's partial contribution over is_target is
larger than is_target's partial contribution over R — at k=10 by more than
40x (0.0658 vs 0.0015). This is the opposite of what the thin n=9 k=13
sample suggested at cycle 39, and confirms the direction cycle 40's n=10
swing pointed toward, now with real statistical power behind it. LOO
coefficients for R are stable and never cross zero at either k, across
every held-out fold.

This does not by itself prove the same holds at k=13 — the absolute R2
values differ (k=8's log(p)-only baseline is much weaker than k=13's,
0.67 vs 0.92, so there's more room for other predictors to add explanatory
power at k=8) and the mechanism could in principle behave differently at
higher k. But it is a real, well-powered replication at two other k values
using actual measured sieve output, not simulation-vs-simulation or a
6-residual-df fit, and it points the same direction both times: R carries
information beyond class membership, not the reverse.

## Next

- Keep polling for the k=13 p=239 result and any further real k=13 points;
  feed them into the same n=10(+) regression, but stop treating that thin
  fit as the primary evidence for the deconfounding question — k=8/k=10
  now carry that weight.
- Worth checking whether the same pattern (R dominates is_target) holds at
  k=11 too, which the project has real wall data for in smaller quantities
  (not yet checked how many) — would make it 3-for-3 rather than 2-for-2.
- Consider whether R's coefficient magnitude scaling with k (k=8: ~8-12,
  k=10: ~27-30) is itself a pattern worth investigating, or just an
  artifact of the different R ranges/units at each k.
