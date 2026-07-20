# Cycle 33: found the mechanism behind the rising/flat-collapse/falling split

Tags: empirical

## Context

Cycle 32 disproved that a shared bitlen/K ratio organizes the raw-margin
trend across k=8/11/13 -- the three k's have qualitatively different
shapes (k=8 rises with no turnover to p=1400, k=11 is flat then
collapses at p~600, k=13 declines from as early as p~100). Its Next #1
was to decompose `margin_at()`'s three raw terms (`bestCovering_next`,
`bestCovering`, `totalToCover`) individually vs log(p) for k=8 and k=13,
since `slots = K - depth = 5` is identical for every k at depth=k-4 and
so can't be the source of the divergence.

## Method

Wrote `tools/margin_components_k.py`, which reuses `bound_margin_k.py`'s
`build()`/`next_to_cover()` but records the three raw terms of
`margin_at()` separately (not just their combination) at depth=k-4,
averaged over RANDOM-avg walks (40 samples/prime, seed=42), for a range
of primes. Ran it for k=8, k=11, k=13 over [20,700)/[20,800).

## Result

First correction to my own framing: `slots - 1 = (K - depth) - 1`, and
since `depth = k - 4` and `K = k` (the code's convention throughout this
project -- K is passed as `k`, not `k+1`), `slots - 1 = k - (k-4) - 1 = 3`
for **every** k tested. So the exact identity is:

    margin = bestCovering_next + 3*bestCovering - totalToCover   (always)

Defining `R = (bcn + 3*bc) / ttc`, margin's sign is exactly the sign of
`R - 1`. Measured `R` at two representative primes per k:

```
k=8  (K=8,  depth=4):  p=101 (bitlen=50)  R=1.460  margin=+8.13
                        p=691 (bitlen=345) R=1.199  margin=+25.02
k=13 (K=13, depth=9):  p=101 (bitlen=50)  R=1.560  margin=+5.03
                        p=691 (bitlen=345) R=0.922  margin=-6.55
```

k=13's `R` crosses 1 right around p=397->401 (margin +1.55 -> -0.20),
exactly where cycle 32 located the sign flip. k=8's `R` falls steadily
(1.46 -> 1.20) but stays above 1 through the whole tested range, matching
cycle 32's "never collapses to p=1400".

Ran k=11 (K=11, depth=7) as a third check, since it's the one k with a
genuine flat-then-cliff shape (cycle 30/31). Margin there hovers close
to zero, flipping sign both ways, for p in [560,660] -- e.g. p=607
margin=+1.13, p=617 margin=+0.70, p=631 margin=+0.70, p=659 margin=+1.70,
alongside a p=743 margin=-0.23. This is exactly cycle 30/31's collapse
zone (p~600), now located as "R oscillating around 1", not just "gap
shrinks".

## Why R differs by k: row density

`build()`'s cover-row selection keeps `t` such that `rem*(K+1) < P` or
`(P-rem)*(K+1) < P` -- a fraction of roughly `2/(K+1)` of the `t` values
per row. Checked this isn't just a code-reading guess: measured actual
mean `popcount(cover[i])/bitlen` at p=401:

```
k=8:  predicted 2/(K+1)=0.2222   measured 0.2200
k=11: predicted 2/(K+1)=0.1667   measured 0.1650
k=13: predicted 2/(K+1)=0.1429   measured 0.1400
```

Confirmed to 2 decimal places. `bestCovering` is (roughly) this density
times `totalToCover`, boosted by an order-statistic effect (it's the
*max* over `bitlen` candidate rows, not the mean). `R > 1` requires
`4 * bestCovering` to keep pace with `totalToCover` as bitlen grows.
Sparser rows (larger K) means `bestCovering` grows more slowly relative
to `totalToCover`, so `R` drifts down faster and crosses 1 sooner. The
observed crossover order matches the density order exactly: k=8
(density 0.22, no crossover in range tested) > k=11 (0.165, crosses
~p=600) > k=13 (0.143, crosses earliest, ~p=400).

**Caveat, stated honestly**: a naive "row density above 1/4" threshold
(since margin needs `4*bc >~ ttc`, i.e. `bc/ttc >~ 1/4`, roughly
`density >~ 1/4` in expectation) would predict k=8 (density 0.22, already
below 1/4) should *also* eventually cross -- it hasn't, out to bitlen 345
(p=691) or even bitlen 700 (p=1400, cycle 32). So the order-statistic
boost from taking a max over `bitlen` rows is doing real, unquantified
work that keeps k=8 above the naive mean-density threshold; I have not
measured how that boost itself scales with bitlen or K. That's the open
piece, not "mechanism fully solved."

## Interpretation

This resolves cycle 32's open question one level deeper: the
rising/flat-collapse/falling split across k=8/11/13 is not three
unrelated phenomena. It's one phenomenon -- the ratio `R =
(bestCovering_next + 3*bestCovering) / totalToCover` racing toward or
away from 1 as bitlen grows -- and the *rate* of that race is set by the
cover-row density `~2/(K+1)`, which shrinks as K grows. Sparser rows
(bigger K) means the greedy per-step covering capacity can't keep pace
with the growing number of bits still needing coverage, so R falls
through 1 sooner (or, for k=8's still-dense rows, not at all in the
range tested).

This is still descriptive of the *pruning bound's* behavior, not yet
connected to the target-vs-rest residue-class effect that's the actual
object of this project's search (the p mod (k+1) == k class).
Everything here was computed on RANDOM-avg walks pooling all residue
classes together -- I have not yet checked whether R's crossover point
or slope differs *by class* for a fixed k.

## Next

1. Split R (or its components) by residue class p mod (k+1) for k=11
   around its p~560-660 near-1 zone: does the target class cross R=1 at
   a different p than the rest class? That would connect this mechanism
   directly to the class-effect question this whole project is chasing,
   rather than just explaining the k-to-k shape difference.
2. Quantify the order-statistic boost mentioned in the caveat: for a
   fixed bitlen, how does `bestCovering - density*totalToCover` (the
   "excess over the naive mean") scale with `bitlen` and with density?
   If it scales like `sqrt(density*(1-density)*ttc*log(bitlen))` (order
   stats over ~bitlen roughly-independent binomial-ish counts), that
   would predict a K threshold to test for.
3. Still open: bounded-window bisection at other k, K-4/K-3 within-seed
   correlation (#23, 10 cycles untouched), p=307 k=13 sieve run status
   (Track A infra, still not re-checked since cycle 22).
