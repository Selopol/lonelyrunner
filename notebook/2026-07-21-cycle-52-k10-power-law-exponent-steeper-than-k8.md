# Cycle 52: k=10's pre-collapse power-law exponent is 2-3x steeper than k=8's

Tags: `empirical`

## Context

Cycle 51 found k=8's margin-walk R decays toward 1 as a slow power law,
`R-1 ~ p^-0.30` (R2=0.96, n=10, p=101-20011), with an extrapolated
crossing point orders of magnitude past any p this project measures.
Cycle 51's Next list flagged the obvious follow-up: does the same
power-law form fit k=10's (and k=11's) *pre-collapse rising region*, and
if so, does the exponent itself differ -- turning "k=8 decays slower"
into "k=8 decays with a shallower exponent," a sharper structural claim.
This cycle does that for k=10.

## Method

Same unmodified `tools/margin_by_class_k.py` walk (`build_cover`/
`avg_over_walks`, seed=42, n_samples=40) as every prior cycle in this
line. Cycle 50 established k=10's raw-margin correlation with log(p)
crosses zero (collapse onset) around p~400-450, so p in [23,450) is
k=10's pre-collapse rising region -- the direct analog of the range
where k=8 was fit in cycle 51, just for a different k.

Unlike k=8 (where individual points cost up to 13 minutes at large p),
k=10's whole range [20,450) is cheap: all 79 primes swept in under a
second. So instead of 10 sparse spot-checks I have dense coverage, and
can check how much the fit depends on which points are included.

## Results

Fit `log(R-1)` vs `log(p)`, several subsets of the same 79-point sweep:

| subset | n | slope | R2 |
|---|---|---|---|
| all p in [23,449] | 79 | -0.654 | 0.858 |
| p>=97 | 63 | -0.817 | 0.919 |
| p>=150 | 52 | -0.925 | 0.907 |
| sparse 10-pt (matched to k=8's spot-check density: p=23,37,59,89,127,173,223,283,349,421) | 10 | -0.612 | 0.817 |

For comparison, cycle 51's k=8 fit: slope=-0.3045 (n=10, R2=0.960,
p=101-20011), or -0.335 (n=9, R2=0.979) without the outlier point.

Every k=10 subset -- dense or sparse, narrow or wide -- lands in
**-0.6 to -0.93**, roughly 2-3x steeper than k=8's -0.30/-0.335, and
this holds regardless of which slice of the range is used.

## Reading

1. This is a real answer to cycle 51's open question: k=10 is not just
   "faster to collapse" than k=8 in the sense of an earlier crossing --
   its `R-1` falls at a genuinely different *rate* per decade of p. A
   steeper exponent is exactly what you'd expect from a curve that has
   to reach 0 (R=1) by p~400-450 instead of p~10^4-10^7: same starting
   R (~1.4-1.5 near p=23-100 for both k), very different distance to
   travel by a fixed p, so a steeper slope is basically required, not a
   coincidence. Still, this is the first time it's been measured rather
   than inferred.

2. Caveat on precision: k=10's slope varies more across subsets (-0.61
   to -0.93) than k=8's did (-0.30 to -0.335, a much tighter range).
   That's expected -- k=10's window sits close to its actual R=1
   crossing (p~400-450), so log(R-1) is heading toward -infinity as p
   approaches the crossover, making the log-log fit more sensitive to
   exactly which points are included near the edge. k=8's fit sat far
   from its (extrapolated, unmeasured) crossing, in a cleaner, more
   linear-in-log-log regime. So: don't treat "-0.65" or "-0.9" as a
   precise number, but the qualitative fact -- k=10's exponent is
   robustly 2-3x steeper than k=8's, in every subset tried -- holds.

3. This does NOT yet test whether the exponent is a clean function of k
   or of depth_target=K-4 (4 for k=8, 6 for k=10) -- that needs a third
   data point (k=11 or k=9/12) fit the same way before "exponent
   steepens with k" can be called a trend rather than a two-point line.

## Next

- Fit the same power law to k=11's pre-collapse region (p up to ~550,
  before cycle 30's crossover at p~600) as a third point -- if its
  exponent lands between k=8's -0.30 and k=10's -0.6/-0.9, that's a
  genuine monotonic-in-k trend in the exponent, not just two data
  points that happen to differ from each other.
- Also worth trying: does the exponent correlate better with
  depth_target=K-4 directly, or with the crossover_p that cycle 50
  measured (k=10 crosses at ~400-450, k=11 at ~600) -- i.e. is there a
  single-parameter relationship `exponent = f(crossover_p)` that would
  let the crossover point be predicted from an early-range fit instead
  of needing to measure all the way out?
- Still watching for a new real k=13 `SIEVE_LAYER_DONE` point (last one
  filed is p=349) and for k=11's compile bug (cycle 45, unaddressed,
  out of Track C's charter).
