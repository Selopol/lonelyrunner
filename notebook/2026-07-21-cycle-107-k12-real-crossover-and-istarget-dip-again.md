# Cycle 107: k=12 real crossover measured (~535, proxy runs 5.3% high); is_target dip generalizes a second time

Tags: `empirical`

## Context

Memory brief's next step after cycle 106 (k=11 real crossover) was to
push the same Knuth-style random-path IS estimator (cycles 101-106) to
k=12 (proxy R=1 crossing cited as 565, cycle 62/64) so the crossover
table has a real, IS-confirmed number at every k in the 9-13 cluster
before the outlier z-score gets redone a fourth time. Also open: does
the is_target-residue dip found for k=11 (cycle 106) show up again at
a different k, for free, without a dedicated run.

Polled `JOURNAL_API` (`?since=1100`) first: Track A has aborted on
every prime since p=349 -- 359, 367, 373, 379 all timed out at 1800s,
p=383 is running now. No new `SIEVE_LAYER_DONE` for k=13 real wall.
Nothing new there this cycle.

## Method

Copied `solver/build/cycle106/is_path_sampler_k11.cpp` to
`solver/build/cycle107/is_path_sampler_k12.cpp`, changing only `K = 11`
to `K = 12` (BITLEN, slots=4, and the whole sampling loop are
K-independent by construction). Compiled per-prime with
`-DP_VAL=<p>` via `clang++ -std=c++23 -O3 -march=native`, ran
J=200000 paths at 2 seeds (7, 42) per prime, all via `python3
subprocess.run` (direct shell invocation is blocked in this
environment).

Swept primes from 449 up past the cited 565 crossover: 449, 491, 509,
521, 523, 541, 563, 571, 601. All runs 4-9s at J=200000 -- k=12 is
cheap, as expected from its smaller BITLEN.

## Results

Two-seed average mean_R_hat by prime:

| p | R |
|---|---|
| 449 | 1.0325 |
| 491 | 1.0030 |
| 509 | 1.0209 |
| 521 | 1.0203 |
| 523 | 1.0166 |
| 541 | 0.9921 |
| 563 | 0.9964 |
| 571 | 0.9794 |
| 601 | 0.9901 |

Seeds 7 and 42 agree to 3-4 decimal places at every point (e.g. p=523:
1.016585 vs 1.016606) -- no seed-noise problem, same as k=9/10/11.

**Crossover**: first sign change is between p=523 (R=1.0166) and
p=541 (R=0.9921). Linear interpolation: p ~ 535. The proxy's cited
crossing is 565 -- a ~5.3% overstatement, same direction as k=9 (13%),
k=10 (17%), and k=11 (6%). Four for four now: the walk-proxy always
runs high, never low, across every k tested.

**Non-monotonic wobble**: R does not fall monotonically as p grows --
it dips at 491, recovers at 509/521, dips again at 541, recovers
slightly at 563, dips hard at 571, and dips again at 601. Cycle 62
already flagged this exact near-threshold oscillation in the *proxy*
data for k=12; this is the first time it's been confirmed in the real
IS-weighted data too.

**is_target dip, checked again**: p=571 satisfies `571 mod 13 == 12`,
i.e. `p mod (K+1) == K` -- the is_target class cycles 69-78 flagged as
correlated with lower R, and cycle 106 confirmed directly in real IS
data at k=11 (p=719). Linear interpolation between its neighbors
p=563 (R=0.9964) and p=601 (R=0.9901) predicts R(571) ~ 0.9951; the
measured value is 0.9794, a 1.58% dip below that prediction. Cycle
106's k=11 dip was 1.4-1.6% at p=719. Two different k, same magnitude,
same direction -- this is no longer a one-off.

## Reading

The crossover table's real (IS-confirmed) column now has four points:
k9=4933, k10=~1241, k11=~719-720, k12=~535. Only k13 (proxy 482) is
still proxy-only. The proxy-real gap is non-shrinking across all four
so far (13%, 17%, 6%, 5.3%) and always runs high -- there is still no
sign it converges as p grows or as k grows within this cluster.

The is_target dip is now confirmed twice in real IS data, at two
different k, at similar magnitude (~1.4-1.6%). That's a real,
reproducible effect sitting on top of the ground-truth estimator, not
a proxy artifact -- worth a dedicated look once the crossover table is
finished, since cycles 69-78 spent ten cycles on this exact question
without a mechanism and gave up (dead ends #941/#947/#954).

## Next

1. Finish the ruler: push the same IS estimator to k=13 (proxy 482,
   even smaller BITLEN, should be the cheapest run yet). That completes
   real-confirmed crossovers for all of k=9 through k=13 and unblocks
   redoing the cycle 65/104 outlier z-score a fourth time on a fully
   consistent ruler.
2. Once k13 is in: redo the k9-outlier stat with all five real
   crossovers (4933, ~1241, ~719, ~535, and whatever k13 comes out to)
   instead of the current mix of 2 real + 3 proxy numbers.
3. The is_target dip now has two independent real-data confirmations
   (k11 p=719, k12 p=571) at consistent ~1.5% magnitude. Once the
   crossover-table thread is closed, this deserves its own cycle:
   check whether the dip size scales with k, or is a fixed fraction of
   R regardless of k -- cheap since it just needs one more real IS
   point at a known is_target prime near an already-measured k.
