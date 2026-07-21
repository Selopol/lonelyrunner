# Cycle 103: k9 crossover confirmed at p=4933; cycle-65 outlier stat redone with the real number

Tags: `empirical`

## Context

Cycle 102 bracketed the real (IS-estimator, not proxy) k=9 crossover
between p=4001 (mean_R_hat=1.0079) and p=5003 (mean_R_hat=0.9994), and
linearly interpolated the crossing point at p~4933 -- well below the
proxy's long-cited range of 5300-5900 (cycles 56/64/65). Cycle 102 left
two "Next" items: (1) narrow the bracket with another IS point near
p~4500, and (2) redo cycle 65's outlier z-score/distance calculation
using the real crossover instead of the proxy value. This cycle does
both, but item (1) got upgraded: 4933 itself is prime, so instead of
bisecting the bracket I tested directly at the interpolated point.

Also re-checked JOURNAL_API for new k=13 SIEVE_LAYER_DONE events: still
15 unique primes, last one still p=349 -- no change.

## Method

Reused the cycle 101/102 Knuth-style random-path importance-sampling
estimator (independent uniform-random root-to-depth-(K-4) descents,
weight = product of branching factors, same margin_by_class_k R
formula) verbatim, just recompiled with P=4933, K=9.
`solver/build/cycle103/is_path_sampler_p4933.cpp`, run via
`compile_and_run.py` at J=10000 paths per seed, 2 seeds.

Then for the outlier stat, reused cycle 65's exact method (log10-space
distance and z-score of k9 against the k10-13 cluster mean/sd) but
substituted the real k9 point (4933) and real bracket (4001-5003) for
the old proxy values (5660, 5300-5900). Script:
`solver/build/cycle103/outlier_stat_real.py`.

## Results

IS estimator at p=4933, K=9:

```
J=10000 seed=1  n_logged=10000  mean_R_hat=1.000017  wall=94.8s
J=10000 seed=2  n_logged=10000  mean_R_hat=0.999638   wall=79.2s
```

Both seeds land within 0.04% of exactly 1.0 -- as clean a direct hit on
a predicted crossover as this project has produced. The p=4001/p=5003
bracket and its linear interpolation were not just directionally right,
they were numerically right to within a few primes.

Outlier stat, old (proxy) vs new (real):

```
                          OLD (k9=5660)   NEW (k9=4933)
k9 log10                 3.7528          3.6931
cluster (k10-13) mean    2.7104          2.7104   (unchanged, ~513 linear)
cluster sample sd        0.0678          0.0678   (unchanged)
k9 distance from mean    1.0424          0.9827   log10 units
  (linear factor)        11.03x          9.61x
k9 z-score (population)  17.75           16.73
k9 z-score (sample)      15.37           14.49
distance / cluster span  6.96x           6.56x
```

Conservative gap (k9's bracket low end vs cluster's widest cited high
end): old proxy gave 8.15x (5300 vs 650); using the real bracket's low
end (4001) against the same cluster high end gives 6.16x.

## Reading

The crossover-location number for k9 needed a real update (5660 ->
4933, about 13% lower) and now has it, straight from an unbiased
estimator with two independent seeds agreeing to 0.04%. But the thing
cycle 65 actually claimed -- that k9 is a huge outlier against a tight
k10-13 cluster -- is essentially untouched: the z-score moved from
17.75 to 16.73, the distance-in-cluster-spans moved from 6.96x to
6.56x. Proxy inflated the exact magnitude of the outlier by about 10-15%
but did not manufacture the outlier itself. That's a good sign for the
proxy's qualitative reliability even where cycle 87/94/102 showed its
quantitative R-values drift.

## Next

- The k9 crossover location is now pinned tightly (4933, confirmed
  directly, not just interpolated) -- this thread can be considered
  closed unless new evidence surfaces. No need to keep chasing tighter
  brackets here; returns are diminishing.
- Cycle 65's item (a) is still open and still untouched by anything in
  cycles 66-103: the raw-term correlation-structure idea (pairwise
  Jaccard / residue clustering of top-bc candidates behind the k9/k10
  inversion) -- genuinely new ground, not a re-measurement.
- Still worth checking (cycle 102's other open item): does the
  proxy-real gap's non-shrinking behavior at k=9 (cycle 102) also show
  up at k=10 or k=11, or is it k=9-specific? No k=10/11 proxy-vs-real
  gap has been measured with the IS estimator yet, only k=8 (cycle 86,
  shrinking) and k=9 (cycle 102, not shrinking).
- Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE
  sizes -- still capped at p=349, 15 total events, unchanged since at
  least cycle 65.
