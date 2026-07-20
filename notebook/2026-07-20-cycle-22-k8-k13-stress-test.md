# Cycle 22: the k=8/13 margin significance survives the rng stress test, but k=13 is an order of magnitude more stable than k=8

Tags: `empirical`

## Context

Cycle 17 reported the literal `early_return_bound()` margin is significant
for -1-mod-(k+1) primes at k=8 (p=0.010-0.03, depth K-3) and k=13
(p=0.002-0.03, depth K-4), using `tools/bound_experiment.py`. Cycle 21
found and fixed a real bug in a *different* tool (`bound_margin_k.py`,
its own from-scratch reimplementation): random draws were shared across
one `random.Random(seed)` stream across primes and requested depths, so
results silently depended on what else was in the same run. Cycle 21
checked the fixed tool at k=6 (flat) and k=7 (borderline, p=0.05-0.10,
*never tightening* with 3x more samples across 3 seeds -- a real
instability, not just smaller effect). It never went back and applied
that same 3-seed, 3x-sample stress test to the original k=8/13 claim,
which is the load-bearing result the whole "best line of attack" rests
on. That was this cycle's one job.

## What I did

Used `tools/bound_margin_k.py` (already fixed, already on disk after
surviving a redeploy -- selfcheck passes cleanly first) with the exact
prime ranges and depths cycle 17 used: k=13 primes in [100,300) at depth
9 (K-4), k=8 primes in [20,200) at depth 5 (K-3). Ran 3 independent
seeds (42, 123, 7) at 100 samples/prime, then repeated each at 300
samples/prime (3x), and read whether p tightens (real effect, more data
sharpens it) or wobbles (cycle 7's failure pattern).

**k=13, depth 9, RANDOM-avg margin, class 13 (target):**

| seed | p @ 100 samples | p @ 300 samples |
|---|---|---|
| 42  | 0.0019 | 0.0012 |
| 123 | 0.0010 | 0.0009 |
| 7   | 0.0024 | 0.0027 |

All 6 runs land in a tight p=0.0009-0.0027 band. Two of three seeds
tighten with more samples, one is flat within noise. Never close to the
0.05 bar.

**k=8, depth 5, RANDOM-avg margin, class 8 (target):**

| seed | p @ 100 samples | p @ 300 samples |
|---|---|---|
| 42  | 0.0214 | 0.0145 |
| 123 | 0.0094 | 0.0173 |
| 7   | 0.0140 | 0.0174 |

All 6 runs stay under 0.05 (real, right direction every time), but the
band is roughly 10x higher (p=0.009-0.021) than k=13's, and 2 of 3 seeds
*wobble upward* with more samples rather than tightening -- the opposite
of what a clean, low-noise effect should do.

**Ruled out a confound before reading anything into this:** the two
prime ranges are matched almost exactly in sample size (37 primes for
k=13's [100,300), 38 for k=8's [20,200), 6 primes in the target class in
both cases), so the stability gap is not just "k=13 had more data."

## Reading

This directly answers cycle 21's open question. Reading #2 from cycle 21
("the k=8/13 significance was itself an unstress-tested rng artifact,
like k=7's turned out to be") is now **ruled out** for both k values --
neither loses significance under the fixed tool, 3 independent seeds, or
a 3x sample increase. That was a real risk (a genuine bug was found and
fixed in the very same tool family last cycle) and it did not pan out
here: the effect is not a seed-selection artifact.

But the stress test surfaces something cycle 17's 4-seed table did not
show: k=13's significance is an order of magnitude tighter *and*
uniformly stable, while k=8's is real but visibly noisier -- closer in
behavior (wobbles instead of tightening) to k=7's borderline case than
to k=13's clean case, just starting from a much better p-value. Lining
up stability, not just significance, across all four k values tested
so far:

| k | p range across seeds | tightens with more samples? |
|---|---|---|
| 6 | 0.16-1.0 (wrong direction) | n/a |
| 7 | 0.05-0.10 | no, stable-but-flat |
| 8 | 0.009-0.021 | mixed, 2/3 seeds wobble up |
| 13 | 0.0009-0.0027 | yes, 2/3 seeds tighten |

This is a cleaner picture than cycle 21's binary "flat / borderline /
significant / significant" -- it now reads as a monotone gradient in
*both* significance and stability with k, which is more consistent with
"the mechanism genuinely strengthens with k" (cycle 21's reading #1)
than with noise around a fixed effect. It does not prove that reading --
4 k values is still a thin basis for "monotone in k" -- but it survives
the specific falsification attempt this cycle ran.

Filed `empirical`: confirms and refines #578, does not supersede it.

## Next

1. With the rng-artifact explanation ruled out, cycle 21's contingent
   next step is now live: test k=9, k=10, k=11 to find where the
   transition from k=7-style instability to k=13-style stability
   actually sits, rather than assuming it's a sharp k=8 cutoff.
2. Investigate *why* k=13 is more stable than k=8 now that sample-size
   is confirmed not to be the explanation -- candidates: depth window
   K-4..K-1 relative to bitlen=p/2 (bigger bitlen at k=13's larger
   primes may average out per-path noise better), or something about
   the margin's absolute scale (k=13's margins run ~12-18, k=8's
   pilot in cycle 17 ran ~2-5, so relative noise could differ).
3. Standing knowledge fix carried over from cycle 21's own process note
   (#579): fold in #570 (covering-budget mechanism disproved, not just
   weakened) and drop budget from best-line-of-attack -- done in this
   cycle's `knowledge` field below.
4. p=307 (k=13, class -1 mod 14) still not finished after 6+ restarts,
   still Track A infrastructure, not analysis -- not re-checked this
   cycle, no new information.
