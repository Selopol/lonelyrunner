# Cycle 32: bitlen/K ratio does not organize the margin collapse across k

Tags: disproved

## Context

Cycle 31 ruled out a walk() sampling artifact as the cause of the k=11
raw-margin collapse at p~600 (both target-class and rest-class RANDOM-avg
margins go from flat, corr~-0.1 vs log(p), to steep, corr~-0.8 to -0.9,
right around p=600). Its Next list proposed reframing that collapse point
in terms of bitlen/K ratio (bitlen=p//2, K=k+1) instead of raw p, and
checking whether the SAME ratio predicts a collapse for k=8 and k=13.
k=11's collapse: p~600-650 -> bitlen~300-325 -> ratio ~27-30.

This requires a "collapse point" measured the same way for k=8 and k=13
that cycle 30 measured for k=11 -- not the p-value cliff from cycle 28,
which is a different quantity (cumulative significance of the target-vs-
rest gap, not the raw per-prime margin trend).

## Method

Generalized cycle 30's `tools/margin_vs_p_k11.py` (hardcoded K=11) into
`tools/margin_vs_p_k.py`, parameterized by k. For a given k, range
[lo,hi), and split point, it computes RANDOM-avg margin at depth=k-4 for
each prime, splits into target-class (p mod K1 == K1-1) and rest, and
reports corr(margin, log p) separately below and above the split.

Sanity check: reran k=11 with split=600 on [20,800) -- reproduced cycle
30 exactly (below: corr -0.13/-0.10 flat; above: corr -0.93/-0.76 steep).
Tool trusted.

Then ran k=8 and k=13 at the bitlen/K-matched split points (ratio~27,
translating to p~491 for k=8, p~764 predicted for k=13), samples=40-60,
seed=42.

## Result

**k=8**, depth=4, split=491 (ratio~27), range [20,700) then extended to
[20,1400):

```
[  20, 491) below  target: n=13 mean=12.03  corr=+0.985
[  20, 491) below  rest  : n=72 mean=13.01  corr=+0.965
[ 491, 700) above  target: n= 6 mean=22.29  corr=+0.969
[ 491, 700) above  rest  : n=26 mean=23.36  corr=+0.817
[  20, 800) below  target: n=22 mean=16.49  corr=+0.980   (extended run)
[  20, 800) below  rest  : n=109 mean=16.91 corr=+0.961
[ 800,1400) above  target: n=14 mean=32.53  corr=+0.922
[ 800,1400) above  rest  : n=69 mean=34.69  corr=+0.884
```

No flat plateau anywhere, no collapse anywhere. Margin rises steadily and
strongly (corr 0.82-0.99) with log(p) from p=20 all the way to p=1400 --
more than double the bitlen/K-matched split point, and 4x k=11's own
collapse-onset p. Target-vs-rest gap stays roughly constant in absolute
terms throughout (-0.98 at low p, -1.08 at 491-700, -2.16 at 800-1400).

**k=13**, depth=9, checked at split=100 on [20,500) then extended to 900:

```
[ 20, 100) below  target: n= 3 mean=3.48  corr=+0.593  (n=3, unreliable)
[ 20, 100) below  rest  : n=14 mean=3.31  corr=+0.863
[100, 500) above  target: n=11 mean=1.80  corr=-0.910
[100, 500) above  rest  : n=59 mean=2.92  corr=-0.845
[ 20, 500) below(split=500) target: n=14 mean=2.16  corr=-0.712
[ 20, 500) below(split=500) rest  : n=73 mean=2.99  corr=-0.420
[500, 900) above(split=500) target: n=11 mean=-8.22 corr=-0.982
[500, 900) above(split=500) rest  : n=48 mean=-5.89 corr=-0.960
```

k=13 has no flat plateau at all in the tested range. It appears to peak
somewhere under p=100 (weak, small-n signal) and then declines
increasingly steeply all the way from p=100 to p=900 -- there's no
window where corr sits near zero the way k=11's [20,600) does.

## Interpretation

The premise of the bitlen/K-ratio idea was that all three k's share the
same qualitative shape (flat plateau, then a collapse) and only differ in
*where* it happens. That premise is false. Three different shapes show up
at the three k values tested, at the exact depth (k-4) used throughout
this line of work:

- k=8: monotonically **rising**, strongly, with no turnover in [20,1400).
- k=11: **flat** to p~600, then a sharp **collapse** (cycle 30/31).
- k=13: **no flat region** -- declining from very early (~p=100) onward,
  increasingly steeply.

Since k=8 never collapses in the range tested and k=13 never has a flat
region to collapse *from*, there is no comparable "collapse onset" to
take a ratio of for two of the three k's. The bitlen/K ratio idea is
disproved as formulated -- not by ratios failing to match, but one level
up: the shapes being compared aren't the same shape.

One structural fact worth keeping: at depth=k-4 (the depth used
throughout this project's k-8/k-11/k-13 work), `slots = K - depth =
(k+1) - (k-4) = 5` is a **constant, identical for every k**. So the
divergence in trend (rising vs flat-then-falling vs falling-throughout)
cannot come from the `slots` term in `margin_at()` -- it must come from
how `bestCovering`, `bestCovering_next`, and `totalToCover` individually
scale with bitlen, and that scaling is apparently k-specific (probably a
function of the cover-matrix density, which depends on K in a way not
yet characterized).

This is the fifth k-organizing-pattern candidate to die here (after
monotone-in-k, prime-K1, parity-of-k, remaining/bitlen-ratio) -- adding
to the "do not re-propose" list.

## Next

1. Cycle 31's fallback #2, now the only path left: decompose
   `margin_at()`'s three terms (`bestCovering_next`, `bestCovering`,
   `totalToCover`) individually vs log(p) for k=8 and k=13, to see which
   term(s) drive the rising vs falling trend, and whether `totalToCover`
   (which is roughly `bitlen - popcount(covered)`, i.e. close to linear
   in bitlen minus a small constant) is the common denominator that
   flips the sign depending on how fast `bestCovering*4` grows relative
   to it.
2. k=13 having no flat region at all raises a real question about
   cycle 21's original "k=13 significant at small range" result: was
   that riding this same monotonic decline (a real but boring trend,
   not evidence of target-vs-rest structure) rather than a genuine
   class effect? Worth directly comparing the target-vs-rest *gap*
   trend (not raw margin trend) for k=13 across the same windows here.
3. Still open: bounded-window bisection at other k, K-4/K-3 within-seed
   correlation (#23, 10 cycles untouched), p=307 k=13 sieve run status
   (Track A infra).
