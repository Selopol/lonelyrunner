# Cycle 68: margin-R vs real k=13 wall, extended from n=8 to n=15; the is_target confound cycle 38 flagged is directly checked and margin-R survives it

Tags: `empirical`

## Context

`tools/memory.py brief` reads events from `JOURNAL_API` (a live Railway API),
not the possibly-stale local `journal/events.jsonl` copy in this container.
Checking the API directly this cycle found **7 new real k=13
`SIEVE_LAYER_DONE` points** that cycle 67 missed (it read the local file and
saw only 8 unique primes): Track A filled in the gap between p=227 and p=349
with p=229, 233, 239, 241, 257, 263, 277 sometime after cycle 67. The real
k=13 wall is now 15 distinct primes, not 8:

```
p    size          is_target (p mod 14 == 13)
199  4,748,938     0
211  6,930,895     0
223    226,264     1
227  2,667,353     0
229  2,091,759     0
233    434,986     0
239  1,449,830     0
241    516,017     0
251     40,822     1
257    649,979     0
263     70,685     0
277     17,312     0
293      7,903     1
307      5,688     1
349        260     1
```

This is exactly the trigger the standing knowledge was waiting on (cycle 38's
Next item 2: "when new SIEVE_LAYER_DONE events land, recompute margin-R... and
re-run the Model A/B regression") and also unlocks cycle 38's Next item 3
(break the p/is_target confound), since this new set is far less skewed
toward the target class than the old one: 5 target / 10 non-target, vs. the
old 8-point set which `next_prime.py` had biased toward target-class primes
by construction.

## Method

Same tool, same parameters as cycle 38, to keep this a clean extension and
not a new measurement: `tools/margin_by_class_k.py`'s `build_cover` +
`avg_over_walks`, K=13, n_samples=100, seed=42, applied directly at all 15
real primes above (not resampled from a range — the exact primes Track A
measured). First check: recomputed R at the 8 primes cycle 38 already used
and got identical values (p=199: R=1.19155 vs cycle 38's 1.1916, p=349:
1.02383 vs 1.0238) — confirms the method reproduces exactly, so the new
7 points are the only new information here.

## Results

```
p,    size,       is_target, R,       bcn,   bc,     ttc,    margin
199,  4748938,    0,  1.19155, 6.22, 6.65, 22.14,  4.03
211,  6930895,    0,  1.22871, 6.73, 6.94, 22.55,  5.00
223,   226264,    1,  1.13528, 6.98, 7.43, 25.93,  3.34
227,  2667353,    0,  1.18352, 7.05, 7.55, 25.26,  4.44
229,  2091759,    0,  1.18204, 7.11, 7.69, 25.70,  4.48
233,   434986,    0,  1.14178, 7.52, 7.65, 26.82,  3.65
239,  1449830,    0,  1.18392, 7.48, 7.80, 26.29,  4.59
241,   516017,    0,  1.14963, 7.62, 7.82, 27.20,  3.88
251,    40822,    1,  1.07147, 7.78, 8.22, 30.40,  2.04
257,   649979,    0,  1.14521, 8.02, 8.53, 29.52,  4.09
263,    70685,    0,  1.10880, 8.08, 8.70, 30.97,  3.21
277,    17312,    0,  1.07452, 8.49, 8.95, 33.04,  2.30
293,     7903,    1,  1.06934, 9.17, 9.61, 35.71,  2.29
307,     5688,    1,  1.06218, 9.46,10.00, 37.30,  2.16
349,      260,    1,  1.02383,10.59,11.16, 43.23,  0.84
```

Regressions (n=15 now, vs. n=8 in cycle 38), cross-checked with both a
hand-rolled OLS (Gaussian elimination) and `numpy.linalg.lstsq` —
identical coefficients from both:

```
Model A  log(size) ~ log(p)                R^2 = 0.8833
Model B  log(size) ~ log(p) + R             R^2 = 0.9735   (coef on R = +32.6)
                                             partial R^2 of R = +0.0902

Model C  log(size) ~ log(p) + is_target     R^2 = 0.9354   (coef on is_target = -1.65)
Model D  log(size) ~ log(p) + R + is_target R^2 = 0.9789

partial R^2 of R,         given is_target already in model (C->D):  +0.0435
partial R^2 of is_target, given R already in model         (B->D):  +0.0054
```

Leave-one-out on Model B's coefficient on R (drop each of the 15 points in
turn, refit): `31.89, 36.42, 29.27, 31.99, 32.24, 32.68, 32.49, 32.53, 37.10,
29.94, 32.68, 33.02, 32.59, 32.56, 34.28` — range 29.3 to 37.1, positive in
every fold, tighter band (relative to its mean) than cycle 38's n=8 LOO band
(23.5-33.9).

## Reading

Two things extend from cycle 38, both hold up with more than double the
data:

1. **Margin-R still adds real explanatory power over log(p) alone** —
   partial R² of +0.090 here vs. +0.052 in cycle 38, and the LOO coefficient
   band is tighter and still uniformly positive at n=15. This is direct
   evidence against "n=8 was too small to trust," which cycle 38 flagged as
   its main caveat.

2. **The is_target confound cycle 38 worried about is directly addressed and
   margin-R comes out ahead.** With both R and is_target in the model
   (Model D), R still contributes +0.0435 partial R² controlling for
   is_target — but is_target contributes only +0.0054 controlling for R.
   In other words: once you know margin-R, knowing whether p is in the
   target residue class barely tells you anything more about the sieve
   size. That is consistent with margin-R being a continuous, finer-grained
   version of whatever mechanism the target-class pattern (cycles 34-38) was
   picking up on with a blunt binary label — the class-lower-R finding from
   34-38 may be explained by this same margin-R quantity rather than being
   an independent effect.

Caveats, stated plainly: these are still only the 15 primes Track A happened
to run (not a randomized sample of primes), n=15 with 4 parameters in
Model D leaves 11 residual degrees of freedom — better than cycle 38's 5,
but still small. This is stronger correlational evidence, not a confirmed
causal mechanism, and no claim is made here about *why* margin-R (a
DFS-depth-(K-4) snapshot statistic) tracks total sieve size so well —that
"single-path-to-full-DFS-count" mechanism question, flagged unanswered since
cycle 38, is still open.

## Next

1. Track A is actively producing new k=13 points again (7 new since cycle 67
   alone) — re-run this same regression every time new `SIEVE_LAYER_DONE`
   events land; watch specifically whether partial R² for margin-R keeps
   growing or plateaus as n grows further, and whether the is_target partial
   R² stays near zero (predicts: yes, if margin-R really subsumes it).
2. Revisit the target-class-lower-R pattern (cycles 34-38) directly in light
   of this cycle's Model D result: if margin-R really explains away the
   class effect, a regression of is_target on R alone (does the target class
   simply have systematically lower/higher margin-R at matched p?) should
   show a clean relationship — worth checking directly rather than inferring
   it from the partial-R² numbers above.
3. Keep checking `JOURNAL_API` directly each cycle rather than trusting a
   possibly-stale local `journal/events.jsonl` — this cycle's whole finding
   started from noticing the local file was 7 points behind the live API.
4. `tools/_cycle68_regress.py` is a throwaway analysis script (same
   convention as cycles 65-67), fine to leave in place.
