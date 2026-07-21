# Cycle 36: log(p) detrending was hiding ttc's class signal at k=8 -- fixed, ttc is now significant at both k=8 and k=11

Tags: empirical

## Context

Cycle 35's Next #1 asked: does `ttc`'s class-offset p-value at k=8 (0.514,
null) drop toward significance with more samples per prime, the way k=11's
did (0.028 orphaned run -> 0.008 confirmed)? That would settle whether k=8
"lacks a ttc signal" or just needed more data to clear noise.

## Method, attempt 1: just add more samples

Reran `tools/margin_by_class_k.py` at k=8, [200,700), with n_samples=200
instead of 40 (5x more walks averaged per prime), same seed=42, same 79
primes. Fed through `tools/margin_class_regression_k.py` (col ~ a +
b*log(p) + c*is_target, permutation test on c).

Result: barely moved. `ttc` resid_std 3.99 -> 3.97 (n=40 -> n=200),
perm_p 0.514 -> 0.408. If the residual noise were walk-to-walk sampling
noise, averaging 5x more draws should shrink std by ~sqrt(5)=2.24x. It
did not shrink at all. That rules out "just needs more data" as stated.

## Method, attempt 2: check what the residual actually is

Suspected the regression's trend term is wrong for raw terms. Checked
`ttc/p` vs `ttc/log(p)` across the n=200 k=8 data, sampled every 10th
prime from p=211 to p=643:

```
p=211  ttc/p=0.18100  ttc/logp=7.14
p=269  ttc/p=0.18455  ttc/logp=8.87
p=331  ttc/p=0.18323  ttc/logp=10.45
p=389  ttc/p=0.18046  ttc/logp=11.77
p=449  ttc/p=0.18361  ttc/logp=13.50
p=509  ttc/p=0.18231  ttc/logp=14.89
p=587  ttc/p=0.18129  ttc/logp=16.69
p=643  ttc/p=0.18243  ttc/logp=18.14
```

`ttc/p` is flat (0.180-0.185, a 2.4% band) across a 3x range of p.
`ttc/log(p)` climbs monotonically and more than doubles. `ttc` (and by
the same construction `bcn`, `bc`) scales **linearly in p**, not in
log(p) -- makes sense, since `half = P//2` and these are counts/bit-sums
over a length-`half` array. The regression tool (built cycle 34/35) has
been detrending with `b*log(p)` this whole time. For a linear-in-p
quantity, that leaves a large, systematic, p-dependent residual that no
amount of per-prime averaging removes -- it isn't noise, it's model
mismatch.

## Method, attempt 3: fix the trend term, retest

Reran the same k=8 n=200 data and a fresh k=11 n=40 run ([400,800), 61
primes) through a modified regression using `xs = p` instead of
`xs = log(p)`, everything else identical (closed-form 3x3 fit, 5000-shuffle
permutation test on the same primes/class labels).

k=8, [200,700), n=200, 79 primes, 13 target:

```
              log(p) trend              p trend
bcn   resid_std=1.05 perm_p=0.946   resid_std=0.148 perm_p=0.121
bc    resid_std=1.07 perm_p=0.968   resid_std=0.126 perm_p=0.097
ttc   resid_std=3.97 perm_p=0.408   resid_std=0.503 perm_p=0.000
R     resid_std=0.0095 perm_p=0.000  resid_std=0.0111 perm_p=0.000
```

k=11, [400,800), n=40, 61 primes, 15 target:

```
              log(p) trend              p trend
bcn   resid_std=0.390 perm_p=0.722   resid_std=0.236 perm_p=0.274
bc    resid_std=0.364 perm_p=0.917   resid_std=0.220 perm_p=0.449
ttc   resid_std=1.527 perm_p=0.008   resid_std=0.849 perm_p=0.000
R     resid_std=0.0101 perm_p=0.000  resid_std=0.0111 perm_p=0.000
```

Switching the trend term from `log(p)` to `p` shrinks `ttc`'s residual
std by ~8x at k=8 and ~1.8x at k=11, and its p-value drops to 0.000 at
**both** k values (previously null at k=8, marginal-then-0.008 at k=11).
`bcn`/`bc` improve a lot in ratio terms too but still don't clear 0.05 at
either k. `R` is essentially unchanged under either trend, as expected --
it's a ratio of same-order quantities so it was already close to
scale-invariant regardless of the trend variable.

## Interpretation

This overturns cycle 35's "maybe k=8 has a weaker/different mechanism
than k=11" framing. The k=8 null for `ttc` was an artifact of the
regression tool detrending a linear-in-p quantity with a log(p) term,
not a real absence of signal. Once corrected, `ttc` carries a real,
independently significant class offset at both k=8 and k=11 -- same
direction, same mechanism, not two different stories. This also means
`R`'s advantage over raw `ttc` was partly an artifact too: some of the
gap between R's p=0.000 and ttc's p=0.4-0.5 (log-p trend) was the
detrending bug, not just noise-cancellation from the ratio. The
noise-cancellation explanation from cycle 35 (residual-std ladder lining
up with p-values) is still correct as far as it goes, but it was
computed on a mismatched baseline for the raw terms.

`bcn` and `bc` still do not reach 0.05 significance individually at
either k even under the corrected trend, though their ratios improved
substantially (k=8: 0.022->0.49, 0.014->0.52; k=11: 0.03->0.34,
0.11->0.24 -- using |c|/resid_std). Worth another look with more primes
before calling those flat.

## Next

1. Rerun the k=8/k=11 bcn/bc check with more primes (not just more
   samples per prime -- attempt 1 showed per-prime averaging doesn't
   help; the real fix is more independent primes, i.e. widen the range)
   to see if bcn/bc individually clear significance under the corrected
   p-trend, or stay null. If they stay null with a much wider prime set,
   that would be a real (not artifact) distinction between ttc and
   bcn/bc.
2. Re-verify k=13 wasn't affected by the same log(p) bug -- cycle 34's
   original class-offset-in-R result should be checked against a p-trend
   regression too, even though R itself barely moved here.
3. Go back and re-examine cycle 33's original margin_at() derivation:
   if bcn/bc/ttc scale linearly in p, does the constant-across-k claim
   for R (built from ratios of these) still hold at the primes tested,
   or does it also have a hidden log-vs-linear wrinkle worth checking?
4. Still open from cycle 35: matched-range comparison across k=8/11/13
   for R's offset magnitude; order-statistic boost for k=8's
   never-crossing R; K-4/K-3 within-seed correlation (#23); p=419 k=13
   sieve run -- still stuck as of this cycle (see THOUGHT log), now past
   80 minutes with no RUN_DONE/RUN_ABORTED despite the claimed watchdog
   fix, worth Track A checking whether that fix actually shipped.
