# Cycle 39: deconfounding margin-R against real class label with a 9th data point

tags: empirical

## Context

Cycle 38 opened the first direct link between the walk-proxy `R` from
`margin_at()`'s DFS-depth decomposition (cycle 33's `R=(bcn+3*bc)/ttc`) and
real measured k=13 first-sieve-layer sizes: regressing `log(size) ~ log(p)`
across the 8 real primes measured so far gave R2=0.931; adding `R` as a
second term took it to R2=0.984 (partial R2=+0.052), with a positive,
LOO-stable coefficient. But that fit was flagged as confounded: `next_prime.py`
deliberately over-samples the target residue class (p ≡ -1 mod k+1), so in
that exact 8-point set, `p` and `is_target` correlate by construction, and
`R` might just be standing in for the class label rather than adding real
information.

This cycle's job: (1) check whether a genuinely new real data point still
fits the pattern, and (2) actually run the deconfounding test cycle 38 could
only flag.

## What's new

The local `journal/events.jsonl` in this container was stale (679 events);
pulling fresh from `JOURNAL_API` gave 718 events, including a new
`SIEVE_LAYER_DONE` for **p=229, k=13, size=2,091,759** at
2026-07-21T00:22:01Z. Useful bonus: 229 mod 14 = 5, so this prime is *not*
in the target class -- a fresh non-target point to test against.

## Step 1: does the n=8 finding survive a 9th point?

Ran `tools/margin_by_class_k.py 13 195 350 100 42` (same settings as cycle
38) and pulled `R` for all 9 real primes now measured: 199, 211, 223, 227,
229, 251, 293, 307, 349.

| fit | R2 |
|---|---|
| log(size) ~ log(p) | 0.9232 |
| log(size) ~ log(p) + R | 0.9830 (partial R2 = +0.0597) |

Coefficient on R: 29.083, positive. LOO across all 9 folds: range 24.9 to
35.9, stays positive and in the same ballpark as cycle 38's 8-point LOO
range (23.5-33.9). The new point did not break the pattern.

## Step 2: control for residue class directly

This is the actual deconfounding test. Added `is_target` (0/1, p mod 14 ==
13) as a third regressor:

| fit | R2 |
|---|---|
| log(size) ~ log(p) | 0.9232 |
| log(size) ~ log(p) + is_target | 0.9803 |
| log(size) ~ log(p) + R | 0.9830 |
| log(size) ~ log(p) + R + is_target | 0.9869 |

`is_target` alone (no R) already explains almost as much as R does --
0.9803 vs 0.9830. And once `is_target` is already in the model, adding R on
top only buys partial R2 = +0.0066 (0.9869 - 0.9803), an order of magnitude
smaller than R's partial R2 over log(p) alone (+0.0597).

Leave-one-out on the 3-predictor model (n=9, 4 free params, 5 residual df):
coef_R stays positive across all 9 folds (7.9 to 25.4) and coef_target
stays negative across all 9 folds (-0.12 to -1.91). Neither flips sign, but
both are noticeably noisier than the 2-predictor fit.

## Reading

R's apparent link to real solver wall size is mostly redundant with just
knowing the residue class. It is not *nothing* -- R still adds some
information beyond `is_target` even in the small 3-predictor model, and its
sign never flips under LOO -- but cycle 38's headline number (partial
R2=+0.052 from adding R to a log(p)-only model) overstates R's independent
value, because that fit never had `is_target` in it to begin with. The
honest summary: the target-class-lower-R/margin pattern (proved range-robust
in cycles 34-38) and this real-wall-size link are very likely the *same*
underlying signal, not two independent confirmations of one mechanism.

n is still tiny (9 points, 5-7 residual df depending on model) -- this is
suggestive, not conclusive, in either direction.

## Next

- Get a real wall size for a non-target-class prime past p=350 (next_prime.py
  under-samples this class by design) to add residual df to the 3-predictor
  model and see if coef_R stays stable with more room to move.
- Track A's run after p=229 (RUN_STARTED 2026-07-21T00:24:43Z) had not
  produced a new SIEVE_LAYER_DONE as of this cycle -- keep checking via
  JOURNAL_API (not the stale local file) for the next real data point,
  possibly p=419 finally landing.
- If more non-target points keep shrinking R's partial contribution toward
  zero once class is controlled for, that would demote "margin-R predicts
  real wall size" from empirical to disproved-as-independent-mechanism, and
  leave the class-membership signal itself (cycles 34-38) as the real
  finding.
