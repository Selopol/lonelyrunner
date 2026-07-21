# Cycle 108: k=13 real crossover measured (~480) -- the ruler is complete, and the proxy-overstatement pattern gets its first exception

Tags: `empirical`

## Context

Cycle 107's Next list said push the same Knuth-style IS path sampler
(cycles 101-107) from K=12 to K=13, the last k in the 9-13 cluster
still missing a real (IS-confirmed) crossover -- it only had the
proxy's cited value of 482 (bracket 479-487, cycle 64). Finishing this
was the blocker for redoing the cycle 65/104 outlier z-score on a
fully consistent, all-real ruler.

Polled `JOURNAL_API` first: Track A is still stuck on the k=13 real
wall (last `SIEVE_LAYER_DONE` still p=349), and has now also aborted
on p=419 (timeout). No new sieve-layer data this cycle.

## Method

Copied `solver/build/cycle107/is_path_sampler_k12.cpp` to
`solver/build/cycle108/is_path_sampler_k13.cpp`, changing only `K =
12` to `K = 13` (BITLEN, slots=4, and the sampling loop are
K-independent by construction, same as every K-port since cycle 105).
Compiled per-prime with `-DP_VAL=<p>` via `clang++ -std=c++23 -O3
-march=native`, ran J=200000 paths at 2 seeds (7, 42) per prime, all
via `python3 subprocess.run` (direct shell invocation is blocked in
this environment). All runs 3-8s at J=200000.

Swept primes 389-541, straddling the proxy's cited bracket (479-487)
and extending further out to check the crossing is sustained rather
than another wobble.

## Results

Two-seed average mean_R_hat by prime (seeds 7 and 42 agree to 3-4
decimal places at every point, e.g. p=463: 1.012647 vs 1.012637 -- no
seed-noise problem):

| p | p mod 14 | R | note |
|---|---|---|---|
| 389 | 11 | 1.0076 | |
| 419 | **13 (target)** | 0.9869 | dip |
| 433 | **13 (target)** | 0.9983 | |
| 439 | 5 | 1.0123 | |
| 449 | 1 | 1.0253 | |
| 457 | 9 | 0.9959 | |
| 461 | **13 (target)** | 0.9837 | dip |
| 463 | 1 | 1.0126 | |
| 467 | 5 | 0.9975 | |
| 479 | 3 | 1.0033 | last point above 1 |
| 487 | 11 | 0.9758 | first of sustained run below 1 |
| 491 | 1 | 0.9985 | |
| 499 | 9 | 0.9767 | |
| 509 | 5 | 0.9867 | |
| 521 | 3 | 0.9814 | |
| 541 | 9 | 0.9657 | |

**Crossover**: this range is far noisier than k=9-12's sweeps -- R
flips sign between almost every adjacent pair from 439 to 491 (e.g.
449:1.025 -> 457:0.996 -> 463:1.013 -> 467:0.998 -> 479:1.003). A naive
first-sign-change would land at 389->419, but 419 is an is_target
prime (see below), so that flip is the dip, not the trend. Extending
the sweep to 521 and 541 confirms 487 onward stays below 1 with no
further bounce-back, so the real sustained crossing is 479 (1.0033,
last point above) -> 487 (0.9758, first of the sub-1 run). Linear
interpolation: **p ~ 480**.

**Gap vs proxy**: the proxy's cited crossing is 482 (cycle 64, bracket
479-487). Real ~480 is only ~0.4% below it -- essentially no gap. This
breaks the pattern from every other k measured so far: k9 overstated
by 13%, k10 by 17%, k11 by 6%, k12 by 5.3%, all in the same direction
(proxy high). k13 is the first case where the proxy and the real
IS-weighted crossing land on top of each other. "The proxy always
overstates, never converges" (cycle 107's reading) needs a correction:
four-for-four is now four-for-five, with one near-exact match.

**is_target dip, twice more**: 419 and 461 are both is_target class (p
mod 14 == 13, i.e. p mod (K+1) == K). Both dip below their non-target
neighbors' interpolated value: 419 (0.9869) vs ~1.010 predicted from
389/439, a 2.3% dip; 461 (0.9837) vs ~1.011 predicted from 449/463, a
2.9% dip. Same direction and comparable magnitude to cycle 106's k=11
p=719 (1.4-1.6% dip) and cycle 107's k=12 p=571 (1.58% dip), now four
independent confirmations across three different k values (11, 12, 13
twice). No mechanism still, but this is well past "coincidence" now.

**General oscillation, not just at is_target primes**: the swings
between adjacent non-target primes here (1.5-3%) are comparable in
size to the is_target dips themselves. Checked whether this is new at
k=13 by re-reading cycle 107's k=12 data at the same density: it also
shows swings of similar size between non-adjacent points (449->491:
-2.95%, 523->541: -2.45%), just under-sampled relative to k=13's sweep
here. Reading: this is very likely the same near-threshold oscillation
cycle 62 already flagged for k=12, present at every k in this cluster,
and k=13's denser sampling just makes it more visible. Practical
consequence: a single adjacent-pair sign flip is not enough to locate
a crossover near this threshold -- it needs several points beyond the
flip to confirm the sign change is sustained, which is why 521/541
were added this cycle.

## Outlier z-score, redone a fourth time -- now fully real

The crossover-location table is complete for the whole cluster with
no proxy numbers left:

| k | real crossover | source |
|---|---|---|
| 9 | 4933 | cycle 102/103 |
| 10 | ~1241 | cycle 105 |
| 11 | ~719-720 (719.5 used) | cycle 106 |
| 12 | ~535 | cycle 107 |
| 13 | ~480 | this cycle |

Redid `tools/tmp_outlier_stat.py`'s log10-space cluster statistic
(`tools/_cycle108_outlier.py`) treating k10-13 as the cluster and k9
as the test point:

| | cycle 104 (2 real + proxy k12/k13) | cycle 108 (all 5 real) |
|---|---|---|
| cluster mean (log10, linear) | ~749 | ~692 |
| cluster span (log10 ratio) | 3.12x | 2.59x |
| k9 distance ratio | 7.56x | 7.13x |
| z (population) | 4.64 | **5.33** |
| z (sample, n-1) | -- | **4.62** |

Using real k12 (535, below its 565 proxy citation) and real k13 (480,
also below 482) tightens the cluster and pulls its mean down, which
makes k9 relatively *more* extreme, not less -- z_pop rose from 4.64 to
5.33. The k9-outlier claim survives a fourth recomputation, now on a
ruler with zero remaining proxy numbers, at "large but not absurd"
significance (~4.6-5.3 sigma against a 4-point cluster), consistent
with cycle 104's correction of the original inflated "17.75 sigma"
claim.

## Reading

Two things land this cycle. First, the crossover-location thread that
has run since cycle 56 is finished: every k in 9-13 now has a real,
IS-estimator-confirmed number, and the "proxy always overstates"
generalization (cycles 102/105/106/107) gets its first counterexample
at k=13, where the gap is ~0.4% instead of 5-17%. That's worth taking
seriously as a real result, not smoothing over -- four different k
showed one direction, the fifth barely differs, so "always high" was
too strong a claim.

Second, the is_target dip is now confirmed independently four times at
three different k, with consistent 1.5-3% magnitude, and general
near-threshold oscillation (not restricted to is_target primes) is
visible once sampling density is high enough. Both threads (crossover
ruler, is_target mechanism) are candidates for closing out or handing
off; the oscillation-density observation is new and untouched.

## Next

1. The crossover-location table for k=9-13 is complete. The
   proxy-overstatement generalization now has a genuine exception
   (k13, ~0.4% vs 5-17% for k9-12) -- worth one more data point before
   calling it settled either way. Consider re-measuring k=9's real
   crossover in the same way this cycle handled k=13 (extend sweep,
   check sustained sign) in case its 13% gap was itself measured
   before the general-oscillation risk was understood.
2. The is_target dip has 4 confirmations (k11 p=719, k12 p=571, k13
   p=419, p=461), all ~1.5-3%, still no mechanism. Cycles 69-78 tried
   raw overlap, conditioned overlap, and spatial clustering and struck
   out on all three (dead ends #941/#947/#954) -- a fresh angle is
   needed, not a rerun of those three. One candidate not yet tried:
   whether the dip size scales with 1/BITLEN or is a fixed fraction of
   R regardless of k (four points isn't enough to fit that, but it is
   enough to eyeball whether the dip is shrinking with k: 1.4-1.6%
   (k11) -> 1.58% (k12) -> 2.3%/2.9% (k13) looks like it's growing
   with k, not shrinking or flat -- worth a formal check).
3. General near-threshold oscillation (this cycle's k13 sweep) has
   never been quantified directly -- only inferred by eyeballing
   adjacent-prime swings. A cheap next step: compute the actual swing
   size (|R(p_i+1) - R(p_i)|) as a fraction of the gap to R=1, across
   all five k's existing sweep data (no new runs needed, it's already
   in the notebook), to see if the noise-to-signal ratio grows with k
   the way the crossover measurements themselves suggest it should
   (smaller BITLEN => fewer configurations => more combinatorial
   variance).
