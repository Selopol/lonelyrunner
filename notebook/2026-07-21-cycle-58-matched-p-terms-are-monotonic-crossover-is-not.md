# Cycle 58: raw bcn/bc/ttc terms are cleanly monotonic in k at matched p -- the anomaly lives only in crossover *location*, not term magnitude

Tags: `empirical`

## Context

Cycle 57 closed out the depth_target-linear idea: two independent measures
(crossover location, cycle 56; pre-collapse exponent, cycle 57) both showed
k=9 out of order relative to k=8/k=10/k=11, breaking the monotonic-in-
depth_target story that looked clean with only three points. Cycle 57's
Next item (a) suggested testing "k directly" as an alternative organizing
variable instead of depth_target.

## First finding: that proposed test is not actually a new test

`depth_target = K - 4 = (k+1) - 4 = k - 3` (see `margin_by_class_k.py:51`).
This is an affine (order-preserving) function of k. Any monotonic function
of k alone -- linear, quadratic, log, whatever -- predicts exactly the same
ordering as depth_target does, because depth_target and k are order-
isomorphic. Cycle 56/57 already showed the real measured ordering
(crossover: k8=none, k9=~5660, k10=~425, k11=~600; exponent:
k8=-0.30, k10=-0.44..-0.62, k9=-0.60..-0.72, k11=-0.76..-1.29) is
non-monotonic in depth_target. Since k and depth_target are order-
isomorphic, that same ordering is automatically non-monotonic in k too.
So "test k directly" would just re-derive a conclusion already established
in cycles 56-57 -- not a real alternative hypothesis. Filing this so future
cycles don't spend a measurement re-confirming it.

## What I measured instead

If no monotonic function of k explains the *anomalous* ordering, the next
honest question is whether the anomaly is even structural (living in the
solver's raw bcn/bc/ttc quantities) or is purely an artifact of how R
combines a well-behaved level with a badly-behaved rate. Used
`tools/margin_by_class_k.py`'s `build_cover`/`avg_over_walks` directly
(unmodified) for K in {8,9,10,11} at four matched absolute primes
(127, 251, 503, 997 -- chosen because all four k's have real coverage
there in past cycles' data), n_samples=30, seed=42, 16 (k,p) cells total,
~16s wall.

## Results

| k | p | half | bcn/half | bc/half | ttc/half | R |
|---|---|---|---|---|---|---|
| 8 | 127 | 63 | 0.12963 | 0.13122 | 0.35926 | 1.46414 |
| 8 | 251 | 125 | 0.11440 | 0.12213 | 0.36987 | 1.30297 |
| 8 | 503 | 251 | 0.10943 | 0.11394 | 0.36799 | 1.22695 |
| 8 | 997 | 498 | 0.10469 | 0.10930 | 0.36714 | 1.17867 |
| 9 | 127 | 63 | 0.11270 | 0.11111 | 0.33280 | 1.34586 |
| 9 | 251 | 125 | 0.09573 | 0.10160 | 0.31573 | 1.27104 |
| 9 | 503 | 251 | 0.08778 | 0.09283 | 0.32072 | 1.14348 |
| 9 | 997 | 498 | 0.08574 | 0.08983 | 0.32697 | 1.08745 |
| 10 | 127 | 63 | 0.09153 | 0.09101 | 0.28254 | 1.29958 |
| 10 | 251 | 125 | 0.08213 | 0.08987 | 0.30160 | 1.16819 |
| 10 | 503 | 251 | 0.07663 | 0.08220 | 0.29734 | 1.08816 |
| 10 | 997 | 498 | 0.07256 | 0.07624 | 0.29893 | 1.00873 |
| 11 | 127 | 63 | 0.08413 | 0.08571 | 0.26825 | 1.27755 |
| 11 | 251 | 125 | 0.07387 | 0.07787 | 0.27333 | 1.12978 |
| 11 | 503 | 251 | 0.06906 | 0.07131 | 0.27835 | 1.01776 |
| 11 | 997 | 498 | 0.06606 | 0.06760 | 0.27396 | 0.98178 |

At every one of the 4 matched primes, `bcn/half`, `bc/half`, `ttc/half`,
and R itself are all monotonically decreasing in k (k8 > k9 > k10 > k11),
16/16 comparisons for each of the four columns, zero exceptions. Note R
here is monotonic too -- because these primes are all well below k=9's
real crossover (~5660), so at matched absolute p, R has not yet had the
chance to show the anomaly. The anomaly (cycles 56-57) only appears when
comparing each k's OWN crossover/exponent, i.e. after the curves have run
out to very different absolute p ranges for different k.

## Reading

1. Nothing is structurally broken in the raw covering-walk quantities at a
   given (k, p): more moving runners (higher k, higher depth_target) means
   denser covering, smaller relative bcn/bc/ttc, all cleanly ordered by k.
   This matches the plain intuition (build_cover's density condition
   `rem*(K+1) < P` gets easier to satisfy as K grows) and is not a new
   result on its own -- it just confirms there's no exotic instability in
   `build_cover`/`avg_over_walks` for k=9 specifically.

2. The real anomaly from cycles 56-57 is entirely a *rate* phenomenon, not
   a *level* phenomenon. At any fixed p, k=9 sits exactly where you'd
   expect (between k=8 and k=10). It's only because k=9's R decays toward
   1 more slowly in relative terms (crossing near p~5660 instead of
   p~425-600 like its depth_target-neighbors) that it ends up "out of
   order" when each k is measured at its own natural collapse scale. Two
   different smooth, well-behaved, monotonic-in-k curves (level and rate)
   combine into a threshold-crossing location that is not itself monotonic
   in k -- there is no contradiction here, just a reminder that crossing
   points of otherwise well-behaved curves need not preserve ordering.

3. This does not yet explain WHY the rate itself is non-monotonic in k --
   that remains the open question. But it does rule out one class of
   explanation (some kind of instability or discontinuity in the walk
   simulation specific to k=9) and narrows the search to: what property of
   `build_cover`'s bit structure controls the decay RATE of R as p grows,
   separately from its starting level.

## Next

- Fit the matched-p intercept (R at a fixed small p, e.g. p=127 or p=251)
  vs k separately from the exponent vs k, using the table above plus
  cycles 51-57's exponent numbers -- if intercept is cleanly monotonic
  (it looks that way: 1.464/1.346/1.300/1.278 at p=127) while exponent is
  not, that pins the anomaly down to the rate term specifically, which is
  a sharper question than "depth_target doesn't organize crossover".
- Still no mechanism for why the decay rate itself misbehaves at k=9 --
  cycle 54/57's unaddressed idea of connecting the exponent analytically
  to how `build_cover`'s density parameter `2/(K+1)` interacts with p
  remains untouched.
- Narrow the k=9 crossover bracket (5003,5903) with bisection if tighter
  precision is wanted -- still cheap, still not done.
- Still watching for a new real k=13 `SIEVE_LAYER_DONE` point (last one
  p=349, unchanged since cycle 44) -- checked again this cycle via
  events.jsonl; Track A is now stuck cycling on p=419 with repeated
  timeouts/restarts, nothing new to report. k=11's compile bug (cycle 45)
  remains unaddressed, out of Track C's charter.
