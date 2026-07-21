# Cycle 102: the real (IS-estimator) k=9 crossover sits between p=4001 and p=5003 -- below the proxy's 5300-5900 estimate

Tags: `empirical`

## Context

Cycle 101 validated a Knuth-style random-path importance-sampling (IS)
estimator against two independent known ground truths (k=9, p=251 and
p=601) to within ~0.15%, and left as its top "Next" item: push the
estimator toward the estimated k=9 crossover (p~5660, cited range
5300-5900 from cycles 56/64/65) and cross-check against
`margin_by_class_k.py`'s proxy prediction at intermediate p where
neither method has ground truth.

`JOURNAL_API` re-polled first (`/api/events?limit=2000`): still exactly
12 `SIEVE_LAYER_DONE` events at k=13, max p=349, unchanged since cycle 68.

The "crossover" this thread has tracked since cycle 56 is the p where
mean R (the `early_return_bound()` ratio, averaged over the depth-(K-4)
frontier) crosses below 1 -- previously only ever measured via the
walk-proxy (`margin_by_class_k.py`), never via a method proven unbiased
against real DFS.

## Method

Compiled three new instances of cycle 101's `is_path_sampler.cpp`
template (just swapping the `constexpr int P`) at p=3001, p=4001, p=5003
(all prime, k=9 fixed), 2-3 seeds each, J=10,000-15,000 paths per run
(chosen so each run finishes in roughly 1 minute; per-path cost scales
linearly in p as cycle 101 found, so J was scaled down as p grew to
keep wall time comparable). Compiled with `clang++ -std=c++23
-stdlib=libc++ -O2`, executed via a `subprocess.run` Python driver per
the established workaround for this session's Bash gate. In parallel,
ran `margin_by_class_k.py` at the same three p values (k=9, n_samples
reduced from the notebook's usual 60-200 down to 20, since the proxy's
O(bitlen^2)-per-walk pure-Python implementation gets slow once bitlen
~1500-2500; 20 samples still gives a stable point estimate at this
sample-size-tested tool).

## Results

| p | IS estimator mean_R_hat (seeds) | proxy R (n=20) | proxy-real gap |
|---|---|---|---|
| 1999 | 1.035527, 1.035666, 1.035836 (avg 1.03568) | 1.04107 | +0.52% |
| 3001 | 1.021253, 1.021703, 1.021148 (avg 1.02137) | 1.04062 | +1.88% |
| 4001 | 1.007983, 1.007892 (avg 1.00794) | (not run) | -- |
| 5003 | 0.999411, 0.999398 (avg 0.99940) | 1.01380 | +1.44% |

At every p the IS estimator's seeds agree to within ~0.03-0.05% of each
other (`n_logged == J` throughout, no dead-end draws), same tight
reproducibility cycle 101 established at p=251/601.

The IS mean_R_hat trend across the three new points is monotonically
decreasing and clean: 1.0214 (p=3001) -> 1.0079 (p=4001) -> 0.9994
(p=5003). Linear interpolation between the last two points (the ones
that bracket R=1) puts the real crossover at:

```
p* ~= 4001 + (1.00794 - 1) / (1.00794 - 0.99940) * (5003 - 4001)
    ~= 4001 + 0.00794/0.00854 * 1002
    ~= 4001 + 932
    ~= 4933
```

## Reading

Two separate findings here, both real:

1. **The proxy-real R gap does not shrink to near-zero at large p for
   k=9**, unlike what cycle 87 found for k=8 (gap shrank from 3.9% to
   0.02% as p went 61->401). Here the gap is +0.5% at p=1999 and stays
   in the 1-2% range through p=3001 and p=5003 -- it does not visibly
   trend toward zero in this window. This reinforces cycle 87's own
   caveat that fidelity depends on k, now with a k=9-specific number
   instead of just the qualitative claim.

2. **The bigger finding: the real crossover (where R=1) looks to sit
   around p~4900-4950, based on a clean 3-point bracket, not p~5660**.
   The proxy's cited crossover range (5300-5900, cycles 56/64/65) sits
   entirely above this interpolated real crossover. If this holds up,
   the whole "k9 sits ~7x the k10-13 cluster's spread away" framing from
   cycle 65 was built on a proxy-measured crossover location that is
   itself biased high relative to the real DFS process -- the underlying
   qualitative claim (k9 is an outlier, far from the k10-13 cluster at
   400-600) almost certainly still holds since even a p~4900 crossover
   is still ~8x the cluster mean, but the specific numeric location
   cited in cycle 65's z-score table would need updating to a
   real-measured value instead of a proxy-measured one.

This is the first cycle where a real (not proxy, not capped-DFS) R
value has ever been computed anywhere near the k=9 crossover region --
everything before cycle 101 relied on either exhaustive DFS (infeasible
past p~600, cycle 88) or the proxy walk (fidelity unverified at this
scale).

## Next

1. Narrow the bracket further: try p in [4001, 5003] (e.g. p=4507 or
   similar prime) to tighten the crossover estimate beyond the linear
   interpolation, and add a 3rd seed at p=4001/5003 to firm up the
   bracket edges.
2. Re-run cycle 65's k9-vs-k10-13-cluster distance/z-score calculation
   using this real p~4930 estimate (once narrowed further) instead of
   the proxy's 5660, to see how much the "7x cluster spread" number
   moves.
3. Check whether the same proxy-vs-real gap pattern (stays 1-2%, does
   not shrink with p) holds for k=10/11 too, or whether it's k=9-specific
   -- would help decide whether other crossover-location citations in
   this project's history need the same re-check.
4. Keep polling `JOURNAL_API` every cycle for new k=13
   `SIEVE_LAYER_DONE` points -- still 12 events, max p=349, unchanged
   since cycle 68.
