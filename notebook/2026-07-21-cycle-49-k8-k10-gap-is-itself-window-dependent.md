# Cycle 49: the k=8-vs-k=10 class-gap "growth" is itself window-dependent

tags: disproved

## Context

Cycles 42/43 built the "class separation in R grows k=8 -> k=10" claim on
two fixed windows: `[47,242)` for k=8 and `[127,312)` for k=10 -- chosen
because that's exactly where real `SIEVE_LAYER_DONE` wall data exists (39
and 34 primes respectively), so cycle 41's regression could use them.
Cycles 46/48 later found that the same `gap/std_all` metric, applied to
k=9/11/12 with *different, uncalibrated* windows, does not extend the
k8->k10 trend into a smooth "grows with k" law, and flagged a
window-placement confound: each k's window sits at an uncalibrated point in
that k's own margin-decay-toward-cliff curve (cycle 30 showed both classes'
margins collapse together as p grows, for k=11).

That confound was framed as a cross-k problem. This cycle checks whether it
is *also* a within-k problem for the original k=8/k=10 pair specifically --
i.e., does `gap/std_all` stay stable if you widen k=8's and k=10's own
windows, or does it move just as much as it did across different k in
cycles 46/48? First confirmed via `JOURNAL_API` (`?limit=1000`, 786 events)
that no new real k=13 point has landed since p=241, and that real
`SIEVE_LAYER_DONE` data still only exists at k=8 (39 pts), k=10 (34 pts),
and k=13 (12 pts) -- k=9/11/12 have zero real points, so cycle 41's
real-wall regression genuinely cannot be extended to a 3rd k this cycle.
That left cycle 43's own still-open Next item as the cleanest available
step: widen the k=8/k=10 ranges to see if the noisy target-class std (only
n_target=5-7 in the original windows) stabilizes with more points.

## Method

New tool `tools/class_std_check_wide.py`, built directly from cycle 43's
`class_std_check.py` (same `margin_by_class_k.py` walk, same
`gap/std_all` metric). For each k, ran the original cycle-43 window plus
one widened window with the same low bound: k=8 `[47,242)` vs `[47,450)`,
k=10 `[127,312)` vs `[127,450)`. `walk()` cost grows steeply with `hi`
(k=10 `[127,600)` alone took ~99s in a timing probe), so to stay inside
the 30-minute budget this cycle used 2 seeds (42, 7) and one widened
window per k, not the original 3-seed/3-range sweep.

## Results

| seed | k | range | n | n_target | std_target | std_rest | gap/std_all |
|---|---|---|---|---|---|---|---|
| 42 | 8  | [47,242)  | 39 | 7  | 0.0356 | 0.0850 | 0.8851 |
| 42 | 8  | [47,450)  | 73 | 12 | 0.0494 | 0.0926 | **0.4760** |
| 42 | 10 | [127,312) | 34 | 5  | 0.0294 | 0.0581 | 0.9448 |
| 42 | 10 | [127,450) | 57 | 7  | 0.0432 | 0.0694 | **0.4820** |
| 7  | 8  | [47,242)  | 39 | 7  | 0.0318 | 0.0852 | 0.8718 |
| 7  | 8  | [47,450)  | 73 | 12 | 0.0476 | 0.0932 | **0.4403** |
| 7  | 10 | [127,312) | 34 | 5  | 0.0371 | 0.0583 | 0.9648 |
| 7  | 10 | [127,450) | 57 | 7  | 0.0460 | 0.0698 | **0.4893** |

## Reading

1. **Widening the window nearly halves `gap/std_all` for both k=8 and
   k=10, in both seeds** (k=8: 0.87-0.89 -> 0.44-0.48; k=10: 0.94-0.96 ->
   0.48-0.49). This is not a small wobble -- it's the dominant effect in
   the table, bigger than the k8-vs-k10 difference that motivated cycles
   42/43 in the first place.

2. **Once widened, k=8 and k=10 land at essentially the same value**
   (0.44-0.48 vs 0.48-0.49, seed for seed). The "k10 > k8" separation that
   cycles 42/43 reported is a property of the *specific narrow windows*
   dictated by where real wall data happens to exist, not a property of k
   itself holding the window fixed. This directly confirms the mechanism
   cycles 46/48 could only hypothesize (window position relative to each
   k's own margin-decay curve, per cycle 30's finding that both classes'
   margins collapse together as p grows) -- and it now applies to the
   exact k pair the original growth claim was built on, not just to the
   k=9/11/12 extensions.

3. **std_target did not stabilize** -- cycle 43's original hope. It moved
   further as the window widened (k=8: 0.032-0.036 at n=7 -> 0.048-0.049 at
   n=12; k=10: 0.029-0.037 at n=5 -> 0.043-0.046 at n=7), consistent with
   real decay-curve movement rather than n=5-7 sampling noise settling
   down. More points didn't fix the noise; they revealed the range itself
   matters.

This narrows cycle 41's regression finding, but does not touch it: that
result used real degrees of freedom against real `SIEVE_LAYER_DONE` sizes
at the same fixed windows (because that's where the real data is), and
found R's partial R2 exceeds is_target's at both k=8 and k=10. This
cycle's finding is specifically about the closed-form `gap/std_all`
window-matching metric from cycles 42/43/46/48 -- it shows that metric is
not a fair k-vs-k comparison tool even for the original two k values,
because it was never actually holding "window" constant across the
comparison, only "matched to wherever real data exists."

## Next

- Downgrade cycle 42/43's "k8->k10 growth" from "two-point observation,
  narrow but real" (cycle 48's phrasing) to "an artifact of comparing two
  different, real-data-dictated windows at two different points along
  each k's own decay curve" -- this cycle shows the effect washes out when
  the windows are widened to be more comparable in absolute range, so it
  should not be cited as evidence of anything k-dependent going forward.
- This does NOT touch cycle 41's real-wall-data regression (partial R2,
  LOO coefficients) -- that stays the strongest evidence for R's
  independent signal and is unaffected by this finding.
- The window-placement confound (cycles 46/48) is now confirmed within a
  single k pair, not just across k values -- it is a property of the
  `margin_by_class_k.py`/walk methodology in general when comparing across
  arbitrary prime ranges, not specifically a k=9/11/12 issue. Any future
  use of `gap/std_all` for cross-range or cross-k comparison needs a
  principled way to match "position along the decay curve," not just
  prime count or real-data availability.
- Keep pulling `JOURNAL_API` fresh (`?limit=1000` to get full history, the
  default page is only the most recent 200 events) -- still zero new real
  k=13 points since p=241, and zero real k=9/11/12 points at all.
- k=11's compile bug (cycle 45) still unaddressed; still out of Track C's
  charter to patch solver semantics without a dedicated cycle for it.
