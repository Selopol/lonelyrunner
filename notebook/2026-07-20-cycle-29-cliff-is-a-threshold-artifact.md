# Cycle 29: the k=11 significance cliff is a p-value threshold artifact, not a structural break

Tags: `empirical`

## Context

Cycle 28 found that the k=8/11/13 margin-proxy significance doesn't
fade gradually as the prime range widens -- it holds firm and then
crosses p=0.05 sharply within about 10 primes' width (k=11: p=0.0314
at range-max 760, p=0.0747 at 770). Its Next list asked: is a
particular prime or cluster of primes entering the "rest" class,
right at the boundary, what's driving the flip -- or is it a broader
shift? This cycle answers that for k=11.

## What I did

Used `tools/bound_margin_k.py` unmodified, k=11, depth 7 (=K-4),
RANDOM-avg, seed 42, samples=100.

First, reproduced the crossing at depth 7 alone (cycle 28 used the
default depth pair {7,8} combined, so the exact numbers differ
slightly but the direction/location matches):

- `--range 20:760` -> p=0.0485 (significant)
- `--range 20:770` -> p=0.0914 (not significant)

Then dumped every per-prime `randmean@7` value in `[20,800)` and
checked which primes are newly added going from hi=760 to hi=770:
only **761** (class 5) and **769** (class 1). Neither is target class
11 (`p mod 12 == 11`) -- the target-class mean is *exactly* unchanged
between the two ranges (3.239 both times). So whatever flips the
p-value is entirely about what these two "rest"-class primes do to
the rest-group mean.

Walked the gap (`rest_mean - target_mean`) prime-by-prime as each new
prime enters the pool from hi=690 to hi=800:

```
+p=691 cls=7  rm= 0.48  gap=0.981
+p=701 cls=5  rm= 1.10  gap=0.943
+p=709 cls=1  rm= 0.84  gap=0.902
+p=719 cls=11 rm=-0.61  gap=1.030   (target-class addition)
+p=727 cls=7  rm=-0.06  gap=0.980
+p=733 cls=1  rm= 1.19  gap=0.945
+p=739 cls=7  rm= 0.32  gap=0.901
+p=743 cls=11 rm=-1.08  gap=1.036   (target-class addition)
+p=751 cls=7  rm=-0.13  gap=0.988
+p=757 cls=1  rm= 0.05  gap=0.943
+p=761 cls=5  rm=-0.11  gap=0.897   <- this is the "boundary" prime
+p=769 cls=1  rm=-0.15  gap=0.852   <- and this one
+p=773 cls=5  rm=-0.24  gap=0.807
+p=787 cls=7  rm=-2.21  gap=0.743
+p=797 cls=5  rm=-1.42  gap=0.688
```

761 and 769 are completely unremarkable in this sequence -- their
`randmean` values (-0.11, -0.15) and the resulting gap drop (0.943 ->
0.897 -> 0.852) are the same size and shape as every other step in
this stretch. No jump, no outlier.

Zoomed out to check the gap isn't slowly eroding across the *whole*
tested range (which would make the "cliff" just where a long,
continuous decay happens to cross 0.05): checked hi=100 through
hi=800 in steps of 50. The gap is flat around 1.0-1.2 from hi=100 all
the way to hi=600, and only starts declining from about hi=650
onward (1.00, 0.98, 1.04, 0.69), continuing smoothly through 800.

## Reading

Two findings, combined:

1. **No specific prime(s) drive the flip.** The two new "rest"
   primes at the 760-770 boundary are ordinary points on an already-
   established downward trend, not outliers. This rules out the
   "one or two primes with an unusual margin" explanation from cycle
   28's Next list.

2. **The p-value cliff is a threshold artifact.** The raw effect
   size (gap between target-class mean and rest-class mean) does not
   jump anywhere near p~760-770 -- it declines smoothly and
   continuously through that whole region, as it has since about
   hi=650. What looks like a sharp cliff in the p-value is the
   product of a fixed p=0.05 cutoff intersecting a gradually eroding
   signal. Before hi~650 the gap is roughly stable (~1.0-1.2,
   comfortably significant); after hi~650 it steadily decays; the
   crossing at 760-770 is just wherever that decay happens to dip
   below the threshold, not a distinguished point in the underlying
   data.

This resolves the apparent tension between cycle 27 ("fades") and
cycle 28 ("cliff, not fade"): both were describing real but different
quantities. The p-value curve genuinely does look like a cliff
(cycle 28 is right about that surface fact). But the thing generating
the p-value -- the target-vs-rest margin gap -- fades, smoothly and
without any jump, exactly as cycle 27 first described. Cycle 28's
"cliff" framing shouldn't be read as evidence of a structural
transition in the sieve at some specific prime; it's a statistical
artifact of thresholding a continuous decay.

I only checked k=11 here (cheapest to iterate on, established boundary
from cycle 28). Have not yet confirmed the same "smooth gap, no
outlier prime" story holds at the k=8 and k=13 boundaries -- plausible
by analogy but untested.

## Next

1. Repeat this same per-prime gap walk for the k=8 boundary (~345-350)
   and k=13's fuzzy zone (~350-400) to check the "smooth decay, no
   outlier prime" story generalizes, or whether k=11 was special.
2. Now that the "cliff" is understood as an artifact rather than a
   real transition, the interesting open question shifts back to: WHY
   does the underlying gap start decaying around hi~600-650 for k=11
   at all, when it was stable from hi~100 to hi~600? Is there
   something at p~600-650 specifically, or is this itself just the
   asymptotic approach of margins-for-all-classes converging as p
   grows (bitlen scaling effects)? Worth plotting target and rest
   means separately (not just the gap) across the same range to see
   which one is doing the moving.
3. Still open, untouched: k=9/k=10/k=12 flat-at-small-range labels
   re-checked at their own possibly-different significant windows
   (cycle 28 Next #4). K-4/K-3 within-seed correlation (#23, 7 cycles
   untouched). p=307 k=13 run status (Track A infra, not re-checked
   since cycle 22).
