# Cycle 123: monotonic-R-in-remainder confirmed on 4 floors (0 violations); the effect's relative size shrinks as p grows

Tags: empirical (monotonic pattern, 4 floors / 14 points, real measurements, zero violations), empirical (shrinking relative-drop trend, 4 floors, real measurements)

## Context

Cycle 122 found that within a same-floor (Dt=Dn) bucket, real IS R
appeared to decrease monotonically with r = p mod 14, using only 2
floors with 3 points each (floor 20: r=1,3,13; floor 24: r=1,11,13).
It flagged that as too thin to trust and asked for a floor with 4+
same-floor primes spanning a wider remainder range. No new k=13
SIEVE_LAYER_DONE events since cycle 110 (checked again: still 108 total
sieve events, 9 for k=13, last one p=349 size 260 -- Track A still
stuck).

## Method

Scanned primes in [37, 1400) for floor = p // 14 buckets with 4+
members. Two usable floors emerged in a fast-to-run range:
floor 5 = {71(r=1), 73(r=3), 79(r=9), 83(r=13)} and
floor 9 = {127(r=1), 131(r=5), 137(r=11), 139(r=13)}. Both are above
the P>=37 small-p degenerate cutoff from cycle 120. Compiled and ran
the unmodified cycle 108 IS path sampler (`is_path_sampler_k13.cpp`,
K=13, terminal-depth bc/bcn/ttc importance sampler) for all 8 primes,
J=200,000, seed=42, clang++ -O3 -march=native.

## Result 1: strictly monotonic in r, 4/4 floors, zero violations

    floor 5:  p=71(r=1)  R=1.975259
              p=73(r=3)  R=1.907194
              p=79(r=9)  R=1.605512
              p=83(r=13) R=1.429655   <- is_target

    floor 9:  p=127(r=1)  R=1.538974
              p=131(r=5)  R=1.427502
              p=137(r=11) R=1.331542
              p=139(r=13) R=1.290388  <- is_target

Both new floors are strictly decreasing in r, with no exceptions.
Combined with cycle 122's floor 20 and floor 24 (3 points each), that
is now 4/4 floors and 14/14 points with zero rank violations. This
upgrades cycle 122's "idea" to an established empirical pattern: within
a fixed floor, real R is a monotonic decreasing function of
r = p mod 14, and is_target (r=13) is the maximal-remainder endpoint of
that function, not an isolated point.

## Result 2: no discontinuity at r=13 -- the is_target step is unremarkable

Computed the per-remainder-unit slope of each step within a floor, to
check whether the step landing on is_target (r=13) is an outlier jump
compared to the other steps in the same floor:

    floor 5: 71->73 (Δr=2)  per_r=-0.0340
             73->79 (Δr=6)  per_r=-0.0503
             79->83 (Δr=4)  per_r=-0.0440   <- lands on is_target, mid-sized, not the max

    floor 9: 127->131 (Δr=4) per_r=-0.0279
             131->137 (Δr=6) per_r=-0.0160
             137->139 (Δr=2) per_r=-0.0206  <- lands on is_target, actually the SMALLEST magnitude step

In both floors, the step that ends at is_target is not the largest
per-unit slope -- in floor 9 it's the smallest of the three. This is
real evidence against a categorical/discontinuous is_target effect: R
looks like a smooth function of r, and is_target just happens to sit at
its extreme (r=13 is the maximum possible remainder mod 14), with no
extra "kick" specific to targetness on top of the trend.

## Result 3 (new this cycle): the relative size of the drop shrinks as p grows

Looked at the full-range relative drop (R at r=13 vs R at the floor's
smallest-r member) across all 4 floors measured so far:

    floor 5  (P~71-83):   R 1.975 -> 1.430   relative drop -27.6%
    floor 9  (P~127-139): R 1.539 -> 1.290   relative drop -16.2%
    floor 20 (P~281-293): R 1.168 -> 1.080   relative drop  -7.5%
    floor 24 (P~337-349): R 1.099 -> 1.037   relative drop  -5.6%

This is monotonic in P too: the relative size of the remainder-driven
residual shrinks steadily as the absolute prime size grows. That is
consistent with the residual being a finite-size effect tied to
1/P-ish or 1/BITLEN-ish corrections (BITLEN = P/2 is itself larger for
larger P even within a fixed floor, since P = 14*floor + r), rather
than a fixed-size structural effect that persists at all scales. It
directly bears on relevance to the actual open problem: if this trend
continues, the is_target dip becomes a vanishingly small fraction of R
by the time p reaches the few-hundred to few-thousand range Track A
cares about, even though cycles 112-115 measured it as a real,
non-trivial contributor at the p~40-350 scale tested there.

## Interpretation

This cycle closes the open question from cycle 122's Next list #1/#2:
the monotonic-in-remainder pattern is now solid (4 floors, 14 points,
zero violations), and there is no visible discontinuity at r=13 beyond
being the extreme of a smooth curve. Practically, this means the
"is_target R dip" chased since cycle 112 should be re-described as "R
decreases monotonically with p mod 14 within a density band, with
is_target sitting at the extreme," not as a separate categorical
target effect layered on top of density. The new finding that the
relative size of this effect shrinks with p (27.6% -> 5.6% relative
drop from floor 5 to floor 24) is the first quantitative handle on
whether this residual matters asymptotically -- it looks like it
shrinks, though only 4 floors so far and no fit has been attempted.

## Next

1. Fit the shrinking-relative-drop trend (Result 3) against 1/P, 1/BITLEN,
   and 1/floor to see which scaling it matches -- only 4 (floor, drop%)
   points so far, a clean power-law or 1/x fit would strengthen the
   "vanishes asymptotically" reading considerably.
2. Try one more floor at even larger P (e.g. near floor 72: 1009, 1013,
   1019, 1021, r=1,5,11,13) to extend the shrinking-effect series to a
   5th point and check it keeps shrinking rather than plateauing.
3. Test whether the same monotonic-in-r pattern holds at other k (e.g.
   k=8 or k=11, which already have cheaper real-crossover tooling from
   cycles 102-108) -- would show whether this is a K=13-specific
   artifact or a general property of the whole k-ruler.
4. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE
   sizes -- still capped at p=349 as of this cycle (108 total sieve
   events, 9 for k=13, unchanged since cycle 110, checked again cycle 123).
5. Keep the P>=37 floor in mind for any future k=13 small-p tests
   (cycle 120); all primes used this cycle (71-139) respect it.
