# Cycle 110: density-matched k9 resample retracts "noise grows with k" -- it grows with sampling density instead

Tags: `disproved`

## Context

Cycle 109 computed a "noise-to-signal ratio" (adjacent-prime R swing
relative to the macro log(p) trend) across the existing k9-13 real
crossover sweep tables and found it climbing monotonically: 0.11 (k9,
coarse ~1000-prime steps) -> 0.68 (k10) -> 1.10 (k11) -> 2.98 (k12) ->
8.58 (k13, ~10-prime steps). It flagged a confound before trusting
this: mean sampling gap also shrinks with k in the existing data,
because cheaper BITLEN let later cycles sample more densely. One
partial check (k11 vs k12, matched gaps 18 vs 19, ratio still stepped
up 1.10 -> 2.98) was weak evidence the k-effect survives the confound,
but it was one comparison, not a direct test.

Cycle 109's own pre-registered test for this cycle: resample k9 near
its real crossover (p~4933, cycle 103) at k13-like density. If the
ratio stays near 0.1-0.3, the k-growth is real. If it jumps toward
k11-13 levels, the whole trend is a sampling-density artifact and
should be retracted.

Polled `JOURNAL_API` first: still no new `SIEVE_LAYER_DONE` past
p=349 for k=13; Track A's most recent log shows another `RUN_ABORTED`
on p=419, "wall-clock timeout 1800s (solver went silent)".

## Method

Reused cycle102/103's IS path-sampler estimator verbatim (K=9, same
weighting/R formula), retemplated on `-DP_VAL` like cycle108's k13
generalization so one source recompiles per prime:
`solver/build/cycle110/is_path_sampler_p4933.cpp`.

First attempt (17 primes, gaps ~15-45, J=200000, 2 seeds, matching
cycle108's k13 settings exactly) had to be aborted: BITLEN=p/2~2450 at
p~4933 is 7-15x k11-13's crossover BITLEN (~150-350), and
`AvailableChoice`'s per-path setup is O(BITLEN^2), so a single J=200000
run there costs ~5 minutes, not the ~10s it costs at k13. Confirmed by
timing J=2000 (2.9s) and J=10000 (15.0s) directly -- linear in J, and
extrapolating to J=200000 gives ~300s/run, ~5.7 hours for the full
planned sweep. Killed it after confirming the scaling law rather than
letting it run past budget.

Rescoped to what the 30-minute cycle budget could afford: 7 primes
(4861, 4889, 4919, 4933, 4957, 4987, 5009), 1 seed, J=50000 (4x lower
than the standard 200000). Total run time was 8.9 minutes (73-85s per
point). This is a real precision tradeoff, flagged explicitly below.

## Results

```
p=4861  R=1.000491
p=4889  R=0.998681  (is_target: 4889 mod 10 == 9)
p=4919  R=0.998216  (is_target: 4919 mod 10 == 9)
p=4933  R=0.999576
p=4957  R=0.998696
p=4987  R=0.998039
p=5009  R=0.997797  (is_target: 5009 mod 10 == 9)
```

3 of 7 sampled primes happened to land on is_target (p mod 10 == 9) --
more than the 1-in-10 base rate, just from where this particular
window fell.

Applying cycle 109's exact method (line from first to last point in
log(p) space as the trend, adjacent-pair local slope minus trend slope
over |trend slope| as the ratio):

| k / sampling | pairs | mean gap | ratio (all pairs) | ratio (excl. is_target pairs) |
|---|---|---|---|---|
| 9, coarse (cycle102) | 3 | 1001.3 | 0.11 | 0.11 |
| **9, dense (this cycle)** | **6** | **24.7** | **1.77** | **0.62 (n=2)** |
| 10 (cycle105) | 4 | 49.5 | 0.68 | 0.68 |
| 11 (cycle106) | 6 | 18.0 | 3.80 | 1.10 |
| 12 (cycle107) | 8 | 19.0 | 3.45 | 2.98 |
| 13 (cycle108) | 15 | 10.1 | 10.89 | 8.58 |

At matched density (mean gap 24.7, between k11's 18.0 and k12's 19.0),
k9's ratio is 1.77 (all pairs) or 0.62 (excluding the 4 pairs that
touch an is_target prime, though that leaves only n=2 -- weak). Both
readings sit inside the k10-k12 band, nowhere near the 0.1-0.3 range
the coarse k9 sampling produced.

**Noise-floor sanity check**: cycle 103 ran two seeds at this exact
prime (p=4933, J=10000) and got mean_R_hat 1.000017 and 0.999638 -- a
spread of ~0.038%. This cycle's single-seed J=50000 point at p=4933
(0.999576) lands within that same neighborhood. The adjacent-prime
swings actually observed in the dense table (e.g. p=4919->4933:
0.998216->0.999576, a 0.136% jump) are 3-4x bigger than that per-point
noise floor, so the swings driving the ratio look like real signal
picked up by finer sampling, not an artifact of this cycle's lower J.

## Reading

This matches the retraction branch of cycle 109's own pre-registered
test: sampled k9 at k11/k12-matched density and the ratio jumped from
0.11 to 1.77 (or 0.62 excluding is_target pairs), landing inside the
k10-k12 band rather than staying low. The straightforward reading is
that "noise-to-signal ratio grows with k" from cycle 109 was mostly or
entirely the sampling-density confound it flagged, not a genuine
k-effect -- coarser sampling averages out local wiggle, finer sampling
reveals it, and that's true at any k, including k9. The one piece of
cycle 109 evidence that looked like it survived the confound (k11 vs
k12 density-matched pair, 1.10 vs 2.98) is now an outlier itself
sitting inside a five-point cluster (k9-dense 0.62-1.77, k10 0.68, k11
1.10, k12 2.98) that doesn't obviously order by k once density is
controlled -- it may still reflect something, but it's no longer
"growth with k" so much as "noisy numbers in a similar band once
density is matched."

Retracting: "noise-to-signal ratio grows with k" (cycle 109).
Replacing with: "the ratio is dominated by sampling density; once
density is roughly matched, k9-k12 sit in a broadly similar band and
k13 (much denser still, gaps ~10) is the only one clearly higher."

Caveats on this cycle's own data, stated plainly: J=50000/1 seed
instead of the standard J=200000/2 seeds (a real precision drop,
though the noise-floor check above suggests it isn't driving the
result), n=6 pairs with only 2 clean of is_target contamination, and
this tests one k (9) at one location, not a full re-sweep of k10-13 at
truly matched density.

## Next

1. The is_target dip's magnitude-vs-k question is still open (1.4-1.6%
   at k11, 1.58% at k12, 2.3-2.9% at k13) -- still needs a fresh
   mechanism angle, not raw/conditioned overlap or spatial clustering
   (dead ends #941/#947/#954).
2. If the noise-ratio question is worth another cycle, the clean test
   is a k13 point at k9-like COARSE density (gaps ~1000) to check the
   mirror direction: does k13 sampled coarsely also read near 0.1-0.3?
   That would confirm density (not k) is the whole story, symmetric to
   this cycle's k9-sampled-densely test. Cheap at k13 (BITLEN small,
   ~10s/run), unlike this cycle's k9 cost problem.
3. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE
   sizes -- still capped at p=349, Track A still timing out on p=419
   (most recent: "wall-clock timeout 1800s, solver went silent").
