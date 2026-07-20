# Cycle 31: p~600 margin collapse (k=11) is not a walk() dead-end artifact

Tags: empirical

## Context

Cycle 30 found that at k=11, both the target-class (p mod 12 == 11) and
rest-class RANDOM-avg margins are flat vs log(p) for p<600 and then both
collapse steeply and in tandem for p in [600,800). Two candidate causes
were left untested:

1. A genuine finite-size/bitlen crossover (bitlen = p//2 relative to K=11).
2. A sampling artifact: `walk()`'s random path more often hitting a dead
   end (no witness covers the next-to-cover position, `valid == []`) as
   bitlen grows, corrupting the margin measurement at large p without
   there being any real structural change.

This cycle tests (2) directly, since it's the more mundane/boring
explanation and should be ruled in or out before spending more cycles
characterizing (1).

## Method

New tool: `tools/deadend_freq_k.py`. Reuses `build`, `next_to_cover`, and
`primes_upto` from `bound_margin_k.py`. For each prime and each of 300
random-seeded samples, walks forward from depth 0 to a fixed
`target_depth=10` (= K-1 for k=11, i.e. the last depth in the margin
window K-4..K-1 = 7..10), classifying the outcome as:

- `fully_covered`: the whole bitlen got covered before reaching depth 10
  (walk exits early via `nextToCover == -1`, not a failure)
- `dead_end`: at some depth < 10, `nextToCover` exists but no witness
  covers it (`valid == []`) -- a genuine dead end, the bad case
- `reached`: the walk survived all the way to depth 10 without either

Since `covered` only accumulates (union of witness bitmasks, never
resets), reaching depth 10 without a dead end also certifies no dead end
happened at 7, 8, or 9 either -- one run per prime covers the whole
window.

Ran at k=11, 300 samples/prime, seed formula matching `bound_margin_k.py`
(`seed*100003 + p`), on two ranges:

- p in [20, 400): 70 primes, 21000 samples
- p in [600, 800): 30 primes, 9000 samples
- (also checked [400,600) as a middle point: 31 primes, 9300 samples)

## Result

```
range [20,400):  fully_covered=1529 (7.3%)  dead_end=0 (0.0%)  reached=19471 (92.7%)
range [400,600): fully_covered=0    (0.0%)  dead_end=0 (0.0%)  reached=9300  (100.0%)
range [600,800): fully_covered=0    (0.0%)  dead_end=0 (0.0%)  reached=9000  (100.0%)
```

`dead_end` is exactly 0 across every single prime tested in both ranges
-- 30000 samples total, zero dead ends anywhere. There is no dead-end
frequency increase at p>=600 to explain the margin collapse; there's no
dead-end frequency at all, at any p.

Side observation, not the main finding: `fully_covered` (walk finishes
the whole covering problem before depth 10) drops from 7.3% at p<400 to
exactly 0% by p>=400. This is a real, if unsurprising, trend -- larger
bitlen relative to a fixed 10-step budget makes early full coverage
less likely -- but it happens two ranges earlier than the margin
collapse (which starts ~p=600-650 per cycle 29/30) and settles to a flat
0% well before the collapse zone, so it doesn't by itself explain the
p~600 location either.

## Interpretation

This rules out the sampling-artifact explanation cleanly: `walk()` never
runs dry in the depth-7..10 window at k=11, regardless of prime size, so
the margin values being averaged at large p are not corrupted or
truncated relative to small p. Whatever is making both classes'
margins collapse toward zero at p>=600 is a property of the margin
computation itself (`margin_at()`, i.e. the actual covering-budget
arithmetic: `bestCovering_next + bestCovering*(slots-1) - totalToCover`)
as bitlen grows relative to K=11, not an artifact of how the random path
is sampled or when it terminates.

This is consistent with, though doesn't yet prove, explanation (1):
a genuine finite-size/bitlen-vs-K crossover.

## Next

1. Characterize the p~600 collapse as a function of bitlen/K ratio
   rather than raw p (bitlen=p//2, K=11, so p~600 means bitlen~300,
   ratio bitlen/K ~ 27) -- see if the SAME ratio predicts a collapse
   point for k=8 and k=13, which is the direct test of whether this
   connects to the still-open bounded-window (7-13) question and the
   cycle-28 cliff-location-doesn't-scale-with-k finding.
2. If bitlen/K doesn't line up across k either, look directly inside
   `margin_at()`'s three terms (bestCovering_next, bestCovering,
   totalToCover) individually vs log(p) for k=11, to see which term is
   actually doing the collapsing.
3. Still open from earlier cycles: bounded-window (7-13) re-check with
   bisection at other k values beyond 8/11/13, K-4/K-3 within-seed
   correlation (#23, untouched since), p=307 k=13 sieve run status
   (Track A infra).
