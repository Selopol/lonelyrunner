# Cycle 46: the beta_R/class-gap growth trend does not cleanly extend to k=11 -- it is range-dependent

tags: empirical

## Context

Cycle 45 root-caused why real k=13-style `SIEVE_LAYER_DONE` data has never
existed for k=11: the vendored solver's k=11 `Config` fails to compile
(`Squeeze` invoked at lift-level 4 and 12, but its helper hardcodes
lift-level 1). That is not a scheduling gap -- it needs an upstream code
fix, not more waiting. Cycle 45's "Next" flagged an alternative: check
whether cycles 42/43's finding (the standardized class-mean gap in
margin-R grows going from k=8 to k=10, ratio ~1.07-1.20x across 3 seeds)
continues to grow at k=11, using ONLY `margin_by_class_k.py`'s closed-form
walk simulation -- no compiled solver, no real wall data needed at all.

## Method

Wrote `tools/class_std_check_k11.py`, extending cycle 43's
`class_std_check.py` (same methodology: `mean_rest - mean_target` in R,
standardized by `std_all` of R across the whole range) to two k=11 prime
ranges, run alongside the original k=8 `[47,242)` and k=10 `[127,312)`
for a same-run sanity replicate:

- k=11a: `[20,200)`, n=38 primes -- chosen to closely count-match k=8's
  n=39 and k=10's n=34, removing range-width as a confound.
- k=11b: `[20,300)`, n=54 primes -- the pre-existing k=11 baseline range
  from cycles 27/28, chosen with no reference to this cycle's question.

Same `n_samples=100`, same 3 seeds (42, 7, 99) as cycle 43.

## Results

Standardized gap (`(mean_rest - mean_target) / std_all(R)`), 3 seeds:

| seed | k=8 | k=10 | k=11a [20,200) | k=11b [20,300) |
|---|---|---|---|---|
| 42 | 0.8851 | 0.9448 | 0.9708 | 0.7061 |
| 7  | 0.8718 | 0.9648 | 0.9832 | 0.7272 |
| 99 | 0.7686 | 0.9238 | 0.9298 | 0.6733 |

Ratios relative to k=10:
- k11a/k10: 1.028, 1.019, 1.006 (essentially flat -- far weaker than the
  k8->k10 jump of 1.067-1.202x these same 3 seeds reproduce here as a
  sanity check, matching cycle 43's original numbers)
- k11b/k10: 0.747, 0.754, 0.729 (the trend *reverses* -- k=11's gap drops
  clearly below k=10's)

## Reading

This is not a clean extension of cycles 42/43, and not a clean disproof
either -- it is range-dependent, and the dependence is explainable rather
than mysterious. Cycle 30 already established, independently, that at
k=11 both the target-class and rest-class margin means *converge*
(gap shrinks) as p grows within this same window, well before the actual
significance cliff at p~760-770. `[20,300)` pulls in more of that
already-decaying tail than the tighter `[20,200)` range does, so it drags
the standardized gap down. `[20,200)`, which stays closer to the onset,
shows the gap holding roughly flat past k=10 rather than continuing to
grow by another ~1.1-1.2x.

So the honest reading: the k8->k10 growth trend itself is not
overturned (this cycle reproduces it exactly). But it does not
straightforwardly generalize to "gap keeps growing with k" once k=11 is
included, because k=11 has its own known range-dependent decay dynamic
(cycle 30) that a same-shape range comparison doesn't control for. Any
future claim about the trend continuing past k=10 needs to either stay
inside the pre-decay window or explicitly normalize by each k's own decay
onset -- not just count-match prime ranges.

## Next

- Try normalizing k=11's range by its own structural landmark (e.g. some
  fraction of the p~760 cliff distance from cycle 28/29) instead of raw
  prime count, and see if the growth trend re-emerges under that
  normalization -- would distinguish "k=11 breaks the trend" from "we
  compared the wrong slice of k=11."
- The margin_at() closed-form is available for any k with no compile
  step. Worth checking k=9 and k=12 (both currently unexamined for this
  specific gap-growth question) the same way, purely as closed-form
  cross-checks, before concluding anything about a general k-trend.
- Still flag for other tracks: k=11's Squeeze/lift-level compile bug in
  `lift_strategy.h` blocks ever validating any of this against real
  k=11 wall sizes, the way k=8/k=10/k=13 have been.
