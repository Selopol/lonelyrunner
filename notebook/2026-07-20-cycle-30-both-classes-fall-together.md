# Cycle 30: the k=11 gap decay is both classes converging, not one side moving

Tags: `empirical`

## Context

Cycle 29 established that the k=11 margin-proxy significance cliff at
hi~760-770 is a p-value threshold artifact: the raw target-vs-rest gap
declines smoothly through that region, no outlier prime. Its Next list
asked which side is responsible for the decay that starts around
hi~600-650 -- is the target class (`p mod 12 == 11`) getting less
negative, or is the rest-class mean falling to meet it, or both? This
cycle answers that by splitting the gap into its two components.

## What I did

Wrote `tools/split_gap_k11.py`, which reuses `build()`/`walk()` from
`tools/bound_margin_k.py` unmodified (k=11, depth=7=K-4, RANDOM-avg,
samples=100, seed=42) and tracks `target_mean` and `rest_mean`
separately (not just their difference) across widening cumulative
ranges hi=100..800:

```
   hi  n_target  n_rest  target_mean  rest_mean      gap
  100         5      12        3.162      4.378    1.216
  300        14      40        4.393      5.458    1.065
  500        24      63        4.103      5.275    1.172
  600        28      73        3.759      4.975    1.216
  650        29      81        3.661      4.663    1.002
  700        31      86        3.502      4.484    0.981
  750        33      91        3.239      4.275    1.036
  800        33      98        3.239      3.926    0.688
```

Both columns move together (both rise from hi=100 to ~300, both drift
down from ~600 onward) -- the gap column is comparatively stable
because the two are correlated, not because one side is flat.

To separate "real decline in the raw per-prime data" from "cumulative
running-average illusion" (a real risk: the hi=100..800 table above is
a cumulative mean from lo=20, so a late influx of low-margin large-p
points could look like a lagged transition even if the underlying
per-prime margin has been declining smoothly since the start), wrote
`tools/margin_vs_p_k11.py` and a follow-up script to check the raw
(not cumulative) per-prime margin against log(p), split into the
p<600 and p in [600,800) regions separately:

```
p<600            n_t=28 n_r=73  corr(margin, log p): target=-0.073  rest=-0.114   (flat, noise-level)
p in [600,800)   n_t=5  n_r=25  corr(margin, log p): target=-0.927  rest=-0.818   (steep, both classes)
```

and the region means directly:

```
p<600 :          target_mean=3.759  rest_mean=4.975  gap=1.216
p in [600,800):  target_mean=0.324  rest_mean=0.864  gap=0.540
```

## Reading

1. **The transition at p~600 is real, not a cumulative-average
   artifact.** I explicitly tested the alternative explanation (that a
   smooth per-prime decline from the start would only become visible
   in a *cumulative* mean once enough low-margin points accumulate) by
   checking the correlation of raw per-prime margin vs log(p)
   separately in the p<600 and p>=600 windows. It is flat before 600
   (corr ~-0.07/-0.11, indistinguishable from noise at n=28-73) and
   sharply negative after 600 (corr ~-0.82/-0.93). So something does
   genuinely change in the underlying per-prime margins around p~600
   for k=11 -- this wasn't visible before because cycle 29 only looked
   at the gap, which stayed roughly stable because both sides move
   together.

2. **Both classes fall, not one.** In the p>=600 tail, target_mean
   drops by 3.44 (3.76 -> 0.32) and rest_mean drops by 4.11 (4.98 ->
   0.86). Neither is flat. The earlier framing ("is it target moving
   or rest catching up") was a false dichotomy -- both converge toward
   a low/zero margin together, with rest dropping slightly more in
   absolute terms, which is why the gap shrinks (1.22 -> 0.54) rather
   than reverses.

3. This reframes the open question again: it's not about which class
   moves, it's about why margins-in-general (regardless of class)
   start collapsing around p~600 for k=11, having been essentially flat
   before that. Two candidate explanations, neither tested yet:
   (a) a genuine finite-size crossover tied to bitlen=p//2 crossing
   some threshold relative to K=11 (bitlen~300 at p~600); (b) an
   artifact of `walk()`'s random-path sampling running out of valid
   witness choices more often as bitlen grows, which would show up as
   margins collapsing for structural/combinatorial reasons unrelated
   to the class-11 residue effect at all.

## Next

1. Distinguish (a) vs (b) above: check whether `walk()` hits a
   dead end (`valid` empty, path terminates early) more often for
   p>=600 than p<400 -- if early termination frequency jumps at the
   same place the margin collapses, that's evidence for (b), a sampling
   artifact rather than a real residue-class phenomenon.
2. Repeat the "flat then steep negative correlation" per-region check
   (not just the gap walk) for k=8's boundary (~345-350) and k=13's
   fuzzy zone (~350-400), now that it's clear the gap alone hides
   real per-prime structure.
3. Still open, untouched: k=9/k=10/k=12 flat-at-small-range labels
   re-checked at their own possibly-different windows (cycle 28 Next
   #4). K-4/K-3 within-seed correlation (#23, 8 cycles untouched).
   p=307 k=13 run status (Track A infra, not re-checked since cycle
   22).
