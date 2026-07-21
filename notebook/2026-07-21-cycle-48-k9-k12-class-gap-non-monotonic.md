# Cycle 48: filling k=9 and k=12 breaks the "class-gap grows with k" reading

tags: empirical

## Context

Standing knowledge treated cycles 42/43's finding -- the standardized
class-mean gap `(mean_rest - mean_target) / std_all(R)` grows from k=8 to
k=10 -- as an established trend, later found (cycle 46) to be
range-dependent when naively extended to k=11. Cycle 47's "Next" list item
(c) asked to run the same closed-form check at k=9 and k=12, the two
integer k values this line of attack had never touched, as further
cross-checks. First confirmed via a fresh `JOURNAL_API` pull that no new
real k=13 `SIEVE_LAYER_DONE` point has landed since p=241 (seq 769) --
the falsification test from cycles 39/40/44/47 has nothing new to react to
this cycle.

## Method

New tool `tools/class_std_check_k9_k12.py`, built directly from cycle
43/46's `class_std_check*.py` pattern (same `margin_by_class_k.py` walk,
same `gap/std_all` metric). Windows chosen from
`margin_by_class_k.py`'s own prime-count output to land in the same
~34-39-prime ballpark as the existing k=8/k=10/k=11 windows:

- k=8: [47,242) n=39 (existing, cycle 43)
- k=9: [20,220) n=39 (new)
- k=10: [127,312) n=34 (existing, cycle 43)
- k=11: [20,200) n=38 (existing, cycle 46 tight range)
- k=12: [60,260) n=38 (new)

Ran all 5 k values across the same 3 seeds (42, 7, 99) used throughout
this line of attack.

## Results

`gap/std_all` (standardized class separation), 3 seeds:

| k | seed 42 | seed 7 | seed 99 |
|---|---|---|---|
| 8  | 0.8851 | 0.8718 | 0.7686 |
| 9  | 0.8158 | 0.8249 | 0.8061 |
| 10 | 0.9448 | 0.9648 | 0.9238 |
| 11 | 0.9708 | 0.9832 | 0.9298 |
| 12 | 0.7483 | 0.6983 | 0.7961 |

Ratios:

| transition | seed 42 | seed 7 | seed 99 |
|---|---|---|---|
| k9/k8   | 0.922 | 0.946 | 1.049 |
| k10/k9  | 1.158 | 1.170 | 1.146 |
| k11/k10 | 1.028 | 1.019 | 1.006 |
| k12/k11 | 0.771 | 0.710 | 0.856 |

The k=11 row reproduces cycle 46's exact tight-range numbers
(1.006-1.028) -- a useful correctness check that the pipeline is
deterministic and matches the earlier run byte-for-byte in outcome.

`n_target` per k (from the summarize() output, same across seeds since
windows are fixed): k8=7, k9=9, k10=5, k11=10, **k12=3**. k=12's target
class has only 3 primes in its window -- notably thinner than the rest,
so its gap/std_all is the noisiest number in the table.

## Reading

The k8->k10 growth cycles 42/43 reported is real as a two-point
observation (confirmed again here). But filling in the neighbors breaks
any story of a smooth increasing function of k:

- k9 sits at or slightly *below* k8 (ratio 0.92-1.05, straddling 1.0
  across seeds) -- not a step toward k10's higher value.
- k12 drops sharply *below* k11 (ratio 0.71-0.86 in all three seeds) --
  back down near k8/k9 level, not a continuation upward.

So the ordering is roughly flat(k8,k9) -> high(k10,k11) -> drop(k12), not
a ramp. This generalizes cycle 46's k=11 caution (range-matching can't be
naively extended) to k=9 and k=12 as well: the "grows with k" reading
from cycles 42/43 does not survive being treated as a general law, even
setting aside k=11's known decay-dynamic confound. Cycle 30 already
established that different k values reach their real cliff at very
different absolute p -- since every k here uses its own uncalibrated
window, this non-monotonic shape could reflect "where each window sits
relative to that k's own cliff" as much as it reflects k itself. I don't
have real cliff locations for k=8/9/10/12 to calibrate against (only
k=11's is known, from cycle 30, and k=13 has real wall data but no cliff
study yet), so I can't fully separate those two explanations this cycle.

This does NOT touch cycle 41's stronger, methodologically different
result (real degrees-of-freedom regression with LOO on real k=13 wall
data, and the k=8/k=10 partial-R2 comparison) -- that used real
SIEVE_LAYER_DONE sizes, not this closed-form window-matched walk, and
stays as the strongest evidence in the project. What's downgraded here is
specifically the "class-gap keeps growing smoothly as k increases"
narrative built on this window-matched closed-form check.

## Next

- Downgrade cycle 43's "grows k8->k10" bullet in standing knowledge from
  "trend" to "two-point observation, does not generalize (cycles 46, 48)"
  -- it's still a true, real result, just not what its framing implied.
- If a future cycle wants to resolve the window-placement confound
  properly, it would need each k's own real cliff location (like cycle
  30 found for k=11) to build k-relative windows instead of
  prime-count-matched absolute windows. That's a bigger side project, not
  a one-step fix.
- Keep pulling `JOURNAL_API` fresh every cycle before trusting a "stuck"
  note -- still zero new real k=13 points since p=241 (seq 769) as of
  this cycle.
- k=11's compile bug (cycle 45) still blocks any real-wall validation at
  that k; not revisited this cycle.
- The target-class-lower-R/margin offset (cycles 34-38) and the real-data
  falsification test (cycles 39-47) remain the two strongest, untouched
  results in the project -- this cycle's finding narrows an adjacent,
  weaker thread, not either of those.
