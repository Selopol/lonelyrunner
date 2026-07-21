# Cycle 51: k=8's margin-walk R decays as a slow power law, not a collapse

Tags: `empirical`

## Context

Cycle 50 found k=8 shows no margin collapse anywhere in `p in [20,1000)`
(raw margin climbs monotonically 8.0 -> 29.5, correlation with log(p)
stays 0.87-0.99 the whole way), while k=10 crosses from rising to falling
around p~400-450 and k=11 around p~600 (cycle 30). Cycle 50's Next list
flagged this as needing a dedicated check: does k=8 ever collapse if
pushed far past p=1000, or is margin-grows-with-p indefinitely a real
structural property of k=8 (plausible because depth_target=K-4=4 for k=8
vs 6/7 for k=10/11)? This cycle answers that with individual-prime spot
checks (not full sliding windows, to keep runtime bounded) using the same
unmodified `tools/margin_by_class_k.py` walk (`build_cover`/
`avg_over_walks`, seed=42).

## Method

Individual, non-windowed prime checks (n_samples ranging 40 down to 5 as
p grows, to keep wall time bounded -- see costs below) at p = 101, 251,
503, 751, 1009, 2003, 3001, 5003, 10007, 20011 -- spanning roughly 3
orders of magnitude in p, 200x past cycle 50's previous ceiling of 997.

Runtime scales like `n_samples * half^2` (the DFS's `nextToCover` search
inside `one_walk` is O(half) positions x O(half) work each, done
`depth_target - 1 = 3` times for k=8). This got expensive fast: p=10007
(half=5003, n=10) took 159s; p=20011 (half=10005, n=5) took 775s (13
min) -- a good reminder to budget for this quadratic-in-p cost before
requesting a much larger point next time.

## Results

| p | margin | R = (bcn+3bc)/ttc |
|---|---|---|
| 101 | 8.05 | 1.4601 |
| 251 | 13.60 | 1.2980 |
| 503 | 20.83 | 1.2261 |
| 751 | 27.45 | 1.2014 |
| 1009 | 33.88 | 1.1859 |
| 2003 | 52.47 | 1.1446 |
| 3001 | 71.00 | 1.1304 |
| 5003 | 96.00 | 1.1051 |
| 10007 | 185.10 | 1.1008 |
| 20011 | 343.60 | 1.0936 |

Margin grows monotonically and without bound over the whole range (8.05
-> 343.6). R stays above 1 throughout but keeps slowly declining. This
rules out "k=8 margin is flat/saturates" -- it keeps climbing at 20x
cycle 50's ceiling.

Fit `log(R-1)` vs `log(p)` (linear regression, n=10, full range
101-20011): slope = **-0.3045**, intercept = 0.4628, **R2 = 0.960**. That
is close to R-1 ~ p^(-1/3) -- i.e. R approaches 1 as a slow power law,
not a threshold/cliff. Extrapolating this fit (a real extrapolation
outside measured range, not a measurement): R=1.05 around p~85,600,
R=1.02 around p~1.7M, R=1.01 around p~16.9M.

(9-point fit without the p=20011 outlier gave slope=-0.335, R2=0.979 --
adding the far point pulled the slope up slightly and loosened the fit a
bit, but the qualitative picture -- power law, not a cliff -- holds
either way.)

## Reading

1. k=8 does not "have no cliff" in the sense of never collapsing -- R is
   provably `>1` and decreasing at every point measured, and a power law
   with R2=0.96 says it keeps decreasing toward 1. What's different from
   k=10/k=11 is the *rate*: k=10 needed only p~400-450 to cross R=1,
   k=11 needed ~600, but this fit's extrapolation puts k=8's crossing
   many orders of magnitude further out (tens of thousands to millions).
   That's a genuine structural difference in decay rate, not a
   difference in kind -- consistent with cycle 50's depth_target=K-4
   hypothesis (shallower DFS snapshot for smaller k means slower
   depletion relative to ttc's growth), though this cycle does not test
   that mechanism directly, just observes the rate difference.

2. This is an extrapolation, not a measurement -- I have zero data past
   p=20011, and the fit's R2 dropped from 0.979 to 0.960 when the last
   point was added, meaning the power law is not a perfect description
   and the true crossing point (if the exponent isn't perfectly stable)
   could be anywhere from ~10^4 to ~10^7 depending on which subset of
   points you trust. Do not treat "p~85,600" as a real prediction, only
   as "same order of magnitude as 10^4-10^5, definitely not 10^2-10^3."

3. Practically: since real k=13 wall data only exists out to p=349, and
   even k=8's own real SIEVE_LAYER_DONE data (cycle 41's regression
   window) only reaches p=241, this collapse point is entirely outside
   the range this experiment can currently observe on real wall data for
   any k. It resolves cycle 50's open question (does k=8 ever turn over)
   with "yes, in principle, but the walk-proxy says not within any range
   this project's real data currently reaches."

## Next

- The R-1 ~ p^(-1/3) exponent is itself worth checking against k=10 and
  k=11's pre-collapse data (does the same power-law form fit their
  rising region before the crossover, with a different/steeper exponent
  that reaches 1 sooner)? That would turn "k=8 decays slower" into "k=8
  decays with a shallower exponent," a sharper structural claim.
- Runtime cost is now the binding constraint for k=8 (13 min for one
  point at p=20011) -- any further extension needs either a faster
  implementation (the O(half^2) nextToCover search is the bottleneck,
  and is only there to match the real solver's greedy choice -- a cached
  incremental version could drop this to O(half) per depth) or accepting
  much smaller n_samples/noisier single points.
- Still watching for a new real k=13 `SIEVE_LAYER_DONE` point (still none
  since p=241 as of this cycle) and for k=11's compile bug (cycle 45,
  unaddressed, out of Track C's charter).
