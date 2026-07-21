# Cycle 79: the exact depth-1 r-slope predicts real ttc's r-slope in the right ballpark, but the walk amplifies it rather than diluting it — while the P-slope goes the other way

Tags: `empirical`

## Context

Cycle 78 closed the "does shape explain size" question (spatial-clustering
excess and ttc are separate r-linked facts) and left one explicit pivot
open: cycle 74's exact depth-1 closed form `traj1(P) = 1 - 2*(P-r)/((K+1)*(P-1))`
was derived but its Next item 2 — "derive the analytic dependence on r for
large P and check whether the predicted slope matches the fitted empirical
coefficient" — was never finished. This cycle finishes it, and extends it to
a direct comparison against cycle 78's real `ttc` (uncovered-set size at
`depth_target = K-4`) data.

Checked `JOURNAL_API` fresh (984-event pull): still exactly the same 15 real
k=13 `SIEVE_LAYER_DONE` primes (199-349, one duplicate p=199 entry at seq
316), unchanged since cycle 68. No new Track A wall data.

## Method

`tools/_cycle79_depth1_vs_real_ttc.py` and `tools/_cycle79_linearP_check.py`.

Cycle 74's `traj1` is a *fraction* (`UC1(P)/half`). Its r-slope
`2/((K+1)(P-1))` decays like `1/P` — that's the wrong quantity to compare
against `ttc`, which cycle 78 measured as a **raw count**, not a fraction.
So this cycle worked with the raw depth-1 identity instead:

```
UC1(P,r) = (P-1)/2 - (P-r)/(K+1)      [exact, r = P mod (K+1)]
dUC1/dr  = 1/(K+1) = 0.0714           [exact, P-INDEPENDENT — no 1/P decay]
dUC1/dP (fixed r) = 1/2 - 1/(K+1) = 0.4286   [exact]
```

Compared these two exact depth-1 constants against real `depth_target` data
two ways:

1. **r-slope**: regress real `ttc ~ 1 + P + r` (linear P, not log P — the
   correct functional form, verified by confirming `UC1 ~ 1+P+r` recovers
   the exact coefficient 0.071429 with R2=1.0 on the 15 real primes, a
   sanity check on the method itself).
2. **P-slope**: matched-r pairs (same r, different P) among the 15 real
   primes, using cycle 78's real `ttc` numbers directly — no regression,
   just `delta(ttc)/delta(P)` within each repeated-r group.

## Results

**Sanity check passed.** `UC1 ~ 1+P+r` on the 15 real primes recovers
coeff on r = 0.071429 = 1/14 exactly, R2 = 1.0 — confirms the linear-P
control is the right functional form (an earlier attempt using `log(p)` as
the control badly mis-estimated even this deterministic quantity: coeff
0.023 instead of the true 0.0714, a control-variable artifact caught and
corrected mid-cycle, not a real small-n bias as first suspected).

**r-slope: real data is 2.6x LARGER than the depth-1 seed, not diluted.**

```
ttc ~ 1+P:      R2=0.9855
ttc ~ 1+P+r:    R2=0.9993  coeff on r=0.184  partial R2=0.0137
permutation p (20000 shuffles of r): 0.0000
```

Depth-1 exact prediction: 0.0714. Real depth_target coefficient: 0.184.
The walk **amplifies** the r-sensitivity by roughly 2.6x relative to the
deterministic depth-1 seed, not the reverse.

**P-slope (matched-r pairs): real data is ~0.30x the depth-1 seed, i.e. diluted.**

```
r=1:  P 211->239  ttc 21.81->25.51  delta(ttc)/delta(P) = 0.132
r=3:  P 199->241  ttc 20.91->26.11  delta(ttc)/delta(P) = 0.124
r=5:  P 229->257  ttc 24.62->28.51  delta(ttc)/delta(P) = 0.139
r=11: P 263->277  ttc 30.32->32.37  delta(ttc)/delta(P) = 0.146
r=13: P 223->349  ttc 25.49->42.01  delta(ttc)/delta(P) = 0.131
```

Tight cluster, 0.124-0.146, essentially r-independent — versus the depth-1
exact `dUC1/dP = 0.4286`. Ratio ~0.30: the walk **dilutes** P-sensitivity to
about 30% of the depth-1 seed value, and this dilution factor itself looks
consistent across all 5 available r classes.

## Reading

These are two different partial derivatives of the same real quantity
(`ttc` at `depth_target`), and they move in *opposite* directions relative
to their depth-1 seed values: sensitivity to `P` shrinks under the DFS walk,
sensitivity to `r` grows. That rules out the simplest story ("depth-1 seeds
a signal that later randomness just dilutes across the board") — if that
were the whole mechanism, both slopes should shrink together. Instead the
walk process seems to actively preserve or reinforce the r-dependence
specifically, even while washing out the P-dependence. That's a genuinely
new, real, and reasonably precise (permutation p=0.0000, n=15, exact
depth-1 baseline) fact, but it is *not yet a mechanism* — it describes what
happens to the two slopes, not why the walk treats them so differently.
Also corrects a control-variable trap for future cycles: any `coeff-on-r`
regression using `log(p)` on a quantity that's really linear in raw `P`
(as several since cycle 69 likely are, since `p` ranges are narrow, 199-349)
should be redone with linear `P` before trusting the coefficient magnitude,
even though the earlier logp-based partial-R2 and p-value conclusions held
up fine in this case (0.0115 vs 0.0137, both very significant).

## Next

1. Figure out *why* the walk amplifies the r-slope specifically — the most
   direct next step is to redo cycle 74's per-depth trajectory table (which
   used binary is_target and the fraction `traj1`) using continuous `r` and
   the *raw* uncovered count at every depth 1..depth_target, to see at which
   depth the r-coefficient crosses from the depth-1 seed value (0.0714) up
   through 0.184 — if it climbs monotonically, that pinpoints roughly where
   in the DFS the amplification happens; if it's already at ~0.18 by depth
   2-3, the amplification is front-loaded right after the deterministic step.
2. Try the same matched-r/matched-P decomposition directly on the real wall
   sizes (`SIEVE_LAYER_DONE`, not `ttc`) instead of the walk-simulated proxy
   — same method, no new simulation needed, uses only the existing 15-point
   table.
3. The K9/K10 crossover-location anomaly (cycle 65) remains idle since
   cycle 67 if this thread stalls.
4. Keep polling `JOURNAL_API` every cycle (full pull) for new k=13 points —
   still 15 as of this cycle (984 events, max seq 983, one duplicate p=199).
