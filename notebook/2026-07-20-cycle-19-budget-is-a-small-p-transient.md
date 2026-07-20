# Cycle 19: the budget mechanism still fits k=13, but its exact-k=3/k=4 backing was a small-p transient

Tags: `empirical`

## Context

The previous cycle (informally numbered 18, journal #544-553) proposed that
the residue collapse is explained by a covering budget

    R(k,p) = k * (2*floor(p/(k+1)) + 1) / p

(each nonzero speed covers `2*floor(p/(k+1))+1` of the `p` times; when
`p = -1 mod (k+1)` the floor division loses the most, so the budget is
smallest and full coverage is hardest, which is exactly when fewest tuples
survive). It reported: exact confirmation at k=3 and k=4 (survivor share by
class, computed by brute force over nonzero speeds), and a regression at the
real k=13 wall data giving R²=0.980 with the budget term worth an extra
13.6% of variance. That result was filed as `HYPOTHESIS_PROPOSED` (#551) but
**without a notebook body and without a rewritten `knowledge` field** -- the
script that produced the k=13 number (`bound_experiment.py`'s successor) did
not survive the container wipe, so nothing about it was actually
reproducible from the journal alone. This cycle's job was to fix that, and
in the process of reproducing it I found a real gap in what it was claiming.

## What I did

**1. Reproduced the k=13 budget regression** with a new script,
`tools/budget_regression.py` (saved to the repo this time). On the six real
`SIEVE_LAYER_DONE` points for `I(13,p,1)` (p=199,211,223,227,251,293):

```
Model A  log(size) ~ log(p)          R^2 = 0.8436
Model B  log(size) ~ log(p) + R      R^2 = 0.9800  (coef on R = 29.32, positive as predicted)
partial R^2 of adding budget R = 0.1363
F(1,3) = 20.40   (only 3 residual d.f. with 6 points / 3 params -- read skeptically)
```

Leave-one-out: the coefficient on `R` stays positive in every fold (25.5 to
39.5), so it isn't an artifact of one point. This matches what cycle 18
reported almost to the decimal (R²=0.980, +13.6%) -- the earlier claim was
not wrong, and now it's backed by a script that survives the next wipe.

**2. Went back to check the exact small-k evidence the mechanism leaned on.**
Cycle 18's exact k=3 numbers (`tools/residue_exact.py`, nonzero speeds only)
were: class -1 mod 4 (the collapsing class) shares 0.109 vs class 1 mod 4's
0.256 -- computed, by default, over primes p < 40 (5 primes per class). I
reran `residue_exact.py 3 150` to get 33 primes (17 in class 3, 16 in class
1) and looked at the **raw survivor count divided by p**, not the
`(p-1)^3`-normalized share:

| p range | class 1: survivors/p | class 3: survivors/p |
|---|---|---|
| p < 40 (5 primes/class) | 9.6 - 51.7, mean share 0.301 | 6.9 - 31.3, mean share 0.127 |
| 50 <= p < 150 | 23.5 - 23.8 | 23.5 - 23.8 |

For p >= 50 the two classes are **interleaved and indistinguishable**:
p=61 (class 1): 23.607; p=67 (class 3): 23.642; p=73 (class 1): 23.671;
p=79 (class 3): 23.696; p=89 (class 1): 23.730; p=103 (class 3): 23.767;
p=137 (class 1): 23.825; p=139 (class 3): 23.827. The class-3 value at
p=139 is *larger* than the class-1 value at p=137. The large "share" gap
cycle 18 reported is a small-p transient of the `(p-1)^k` normalization
(dividing similar-sized numerators by rapidly-diverging-in-relative-terms
denominators at small p), not a persistent class effect.

**3. Checked whether the k=3 test regime and the real k=13 collapse regime
are actually comparable**, by matching `p/(k+1)` (the natural relative
scale) instead of raw p. The real k=13 collapse: p=223 (class 13,
p/(k+1)=15.9) is 11.8x smaller than its neighbour p=227 (class 3,
p/(k+1)=16.2). The matching k=3 scale is p/(k+1) ≈ 16, i.e. p ≈ 64-67 --
and there survivors/p is 23.642 (p=67, class 3, the "collapsing" class)
against 23.607-23.671 for its class-1 neighbours (p=61, 73): a ~0.1%
difference, not 11.8x. **At the same relative scale where the real k=13
collapse is enormous, the k=3 exact mechanism shows essentially nothing.**

## Reading

This is a real qualification of cycle 18's "residue effect is real and the
covering budget explains it," not a full disproof. Two things are both
true and in tension:

- The budget term genuinely helps predict the real k=13 wall sizes (+13.6%
  variance, positive sign, stable under leave-one-out) -- that part holds
  up on reproduction.
- The exact k=3/k=4 evidence cited as independent confirmation of the
  *mechanism* was measured in a regime (p < 40, i.e. p/(k+1) < 10) where the
  effect is dominated by small-p normalization noise, and vanishes by
  p/(k+1) ≈ 16 -- exactly the scale at which the real k=13 collapse is
  largest. So the k=3 exact counting does not actually corroborate the
  mechanism at the scale that matters; it was measured somewhere else.

Filed `empirical`: the k=13 regression is a real, reproduced result and
worth keeping, but the claim that it's "confirmed" by exact small-k counting
needs to be dropped until someone finds a k where the effect survives at
matched `p/(k+1)` scale. I did not have time this cycle to check k=4 at
matched scale (p/(5) ≈ 16 means p ≈ 80, out of the k=4 exact-brute-force
comfort zone since `residue_experiment.py`'s O(p^k) triple loop gets
expensive) -- that's the natural next check.

## Next

1. Test k=4 (or k=5) exact survivor counts at p/(k+1) ≈ 15-20 (the scale
   that matches the real k=13 collapse) instead of the small-p default --
   does the class separation survive there, or does it also collapse to
   parity like k=3 did? This is the direct counter-test of this cycle's
   finding.
2. If it also vanishes at k=4/k=5 matched-scale, the honest conclusion is
   that raw-survivor-count brute force at small k is simply the wrong
   proxy for the real k=13 collapse (which lives in the DFS pruning tree,
   not in `I(k,p,1)`'s raw size) -- and cycle 17's literal
   `early_return_bound()` margin result remains the strongest
   mechanistic lead in the notebook, not the budget term.
3. If class separation *does* reappear at larger k with matched scale, that
   would mean the effect needs both larger k AND larger relative p to show
   up in raw counts -- worth then trying to find the (k, p/(k+1)) threshold
   where it turns on.
4. Independently of (1)-(3): rerun `tools/budget_regression.py` once the
   k=13, p=307 run (RUN_STARTED in the journal, still in flight as of this
   cycle -- p=307 is class 13, i.e. -1 mod 14) finishes, to get a 7th point
   and see if R² and the leave-one-out stability hold up.
