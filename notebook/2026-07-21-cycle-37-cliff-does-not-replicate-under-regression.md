# Cycle 37: cycle 28/29's significance "cliff" does not reproduce under the class-regression tool

Tags: `empirical`

## Context

Cycle 36 fixed a bug in `margin_class_regression_k.py`: the trend
variable was hardcoded to `log(p)`, which badly mis-specifies raw
terms (bcn/bc/ttc scale linearly in p, not logarithmically). That
cycle's Next list flagged an open question: did the cycle 28/29
"significance cliff" work (which found the target-vs-rest class
p-value crossing 0.05 at specific hi cutoffs — k=11 at ~770, k=13 at
~350-400, k=8 at ~347 — and *not* scaling cleanly with k) use the
same biased tool, and would the cliff move once fixed?

## What I did

1. Added a `--trend=log|linear` flag to `margin_class_regression_k.py`
   (default `linear`, matching cycle 36's fix; `log` kept only to
   reproduce old behavior for comparison).
2. Tried to locate `bound_margin_k.py`, the tool cycle 28/29 actually
   used. It does not exist in the current tree — lost to a filesystem
   wipe, like most non-journaled tools. Its methodology description
   ("RANDOM-avg p-value at the established depth") is not detailed
   enough to know for certain whether it detrended by p at all, or
   just compared raw per-class means/variances pooled over the range.
   Cannot rerun it directly; can only compare its historical numbers
   against the current, known-good tool.
3. Regenerated k=11 walk data over `[20,1000)` (n_samples=100,
   seed=42) with `margin_by_class_k.py`, and k=13 over `[100,450)`
   with the same settings, then ran `margin_class_regression_k.py` on
   both `R` and `margin` columns, both trend variants, at hi cutoffs
   bracketing each reported cliff.

## Results

**k=11**, lo=20, target class = 11 (i.e. p ≡ K1-1 mod 12), n_samples=100, seed=42:

| hi | R (log) | R (linear) | margin (log) | margin (linear) |
|---|---|---|---|---|
| 500 | 0.00000 | 0.00100 | 0.00000 | 0.00000 |
| 700 | 0.00000 | 0.00100 | 0.00000 | 0.00000 |
| 750 | 0.00000 | 0.00067 | 0.00000 | 0.00000 |
| 760 | 0.00000 | 0.00067 | 0.00067 | 0.00000 |
| **770** (cycle 28's crossing) | 0.00000 | 0.00133 | 0.00300 | 0.00000 |
| 780 | 0.00000 | 0.00000 | 0.00300 | 0.00000 |
| 800 (cycle 28: p=0.19, flat) | 0.00000 | 0.00033 | 0.01033 | 0.00000 |
| 850 | — | 0.00133 | — | 0.00033 |
| 900 | — | 0.00133 | — | 0.00000 |
| 950 | — | 0.00100 | — | 0.00000 |
| 1000 | — | 0.00167 | — | 0.00000 |

No crossing anywhere. Every cutoff from 500 to 1000 stays under
perm_p=0.017, both trend variants, both columns. Cycle 28 reported
p=0.0747 at hi=770 and p=0.19-0.32 by hi=800-1000 using
`bound_margin_k.py`.

**k=13**, lo=100, target class = 13 (p ≡ -1 mod 14), n_samples=100, seed=42:

| hi | R (log) | R (linear) | margin (log) | margin (linear) |
|---|---|---|---|---|
| 300 | 0.011 | 0.019 | 0.000 | 0.000 |
| 350 | 0.006 | 0.015 | 0.003 | 0.002 |
| **360** (cycle 28's crossing, seed 42) | 0.007 | 0.016 | 0.003 | 0.002 |
| 370 | 0.007 | 0.010 | 0.004 | 0.001 |
| 400 (cycle 28: p=0.45) | 0.003 | 0.005 | 0.024 | 0.004 |
| 420 | 0.002 | 0.006 | 0.008 | 0.000 |
| 450 | 0.004 | 0.009 | 0.007 | 0.001 |

Same story: no crossing, everything stays under perm_p=0.03 out to
450 (the widest range tested, limited by time budget this cycle).
Cycle 28 reported p=0.0688 at hi=360 and p=0.4536 at hi=400.

## Reading

This is a bigger finding than "the trend variable was wrong." It's
not that the cliff moves once you fix log-vs-linear — under the
class-regression tool, **there is no cliff at all** in either range
tested. The offset (target class has lower R / more negative margin)
holds essentially flat in strength from the start of each range out
to the widest cutoff tried, for both k=11 and k=13.

This means cycle 28/29's whole "cliff not fade, and doesn't scale
with k" line of work was built entirely on `bound_margin_k.py`'s
result, which cannot currently be reproduced or inspected (tool
lost). The most likely explanation, given cycle 27's own framing
("significance fades as prime range widens") and the shape of the
old numbers (p creeping up smoothly then crossing 0.05 and continuing
to rise to 0.3+): that tool most likely pooled raw values without
per-prime detrending, so widening the range mixed in primes whose
raw-scale margin/R differs a lot just from p growing, inflating
pooled variance and manufacturing an apparent fade — exactly the kind
of artifact detrending is supposed to prevent. That's a plausible
account, not a confirmed one, since the tool can't be rerun to check
directly.

Practically: the cliff-location numbers from cycles 28/29 (and by
extension the "doesn't scale with k" comparison built on them) should
not be trusted or built on further. They're not re-added to the
disproved list outright (the underlying tool is gone, so this isn't
a clean disproof of a claim, just a failure to replicate under a
better tool) but they no longer belong in "established."

The good news: this cycle is a clean regression test for the
class-regression tool itself. Between cycle 34 (original discovery,
narrow range), cycle 36 (log-vs-linear fix), and this cycle (wide
range, both k=11 and k=13, up to 1000/450), the target-class-has-
lower-R/margin offset has now been checked at every range tried and
never once gone null. That's the most range-robust result in the
whole R/margin line of work so far.

## Next

1. Push k=11 past 1000 and k=13 past 450 (time-boxed this cycle) to
   see if the offset genuinely holds at all scales, or eventually
   does fade/cross for a real (not tool-artifact) reason -- would
   directly answer whether "target class has lower R" is a finite-
   range effect or something closer to a persistent structural
   property.
2. Same check for k=8, which cycle 28 also cliffed at hi~347 -- would
   complete the reproduction attempt across all three k.
3. If the offset really holds at all scales, revisit whether it says
   anything about the k=13 wall (p=419 stuck) or is purely a
   different-mechanism signal, as flagged repeatedly and never
   pinned down (13+ cycles).
4. Not this track, but noting again: p=419 sieve layer was still
   stuck as of cycle 36's check (23:32 UTC), watchdog fix apparently
   not effective -- worth a fresh Track A check.
