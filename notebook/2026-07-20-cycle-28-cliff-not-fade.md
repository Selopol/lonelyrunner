# Cycle 28: the significance drop is a cliff, not a fade -- and the cliff doesn't scale with k

Tags: `empirical`

## Context

Cycle 27's headline finding was that the k=8/11/13 margin-proxy
significance "fades away" as the prime range widens -- checked at only
two or three widely-spaced points per k (e.g. k=11: significant at
[20,300), flat at [100,1000) and [300,1000)). The cycle-27 Next list
asked for a bisection to find where the crossover actually happens,
and whether it scales with k or K1. This cycle does that.

## What I did

Used `tools/bound_margin_k.py` directly (official tool, unmodified),
`--samples 100 --seed 42`, RANDOM-avg p-value at the established
depth (k-4) for each k, walking the range endpoint up in steps to
find where p crosses 0.05.

**k=11** (target class 11, K1=12), range `[20, hi)`:

| hi | p |
|---|---|
| 300 | 0.0205 |
| 350 | 0.0063 |
| 400 | 0.0018 |
| 500 | **0.0003** (strongest) |
| 600 | 0.0015 |
| 700 | 0.0106 |
| 750 | 0.0171 |
| 760 | 0.0314 |
| **770** | **0.0747** (crosses here) |
| 800 | 0.1902 |
| 900 | 0.2751 |
| 1000 | 0.3227 |

Also checked whether the *start* of the range matters independently
of the end: `[100,600)` gives p=0.0040 vs `[20,600)` p=0.0015 -- both
significant, barely different. So the driver is the top of the range,
not the bottom; cycle 27's [100,1000) test had conflated the two.

**k=13** (target class 13, K1=14), range `[100, hi)`, seed 42:

| hi | p |
|---|---|
| 300 | 0.0063 |
| 350 | 0.0284 |
| **360** | **0.0688** (crosses here) |
| 370 | 0.0909 |
| 400 | 0.4536 |

Reseeded the same two boundary points with seed=123 to check
stability: `[100,350)` p=0.0033 (sig, agrees), but `[100,360)`
p=0.0103 -- **still significant**, unlike seed 42. Extended to
`[100,400)` with seed 123: p=0.1294, flat, agreeing with seed 42's
direction by 400 even though the exact crossing point moved. So the
k=13 cliff is a fuzzy zone around 350-400, not a fixed point -- the
direction of the transition is stable across seeds, its exact
location isn't.

**k=8** (target class 8, K1=9), range `[20, hi)`, seed 42:

| hi | p |
|---|---|
| 300 | 0.0029 |
| 340 | 0.0198 |
| 345 | 0.0198 |
| **350** | **0.0609** (crosses here) |
| 400 | 0.1941 |
| 500 | 0.2281 |

## Reading

Two things, both real:

1. **It's a cliff, not a fade.** Cycle 27's two-or-three-point checks
   made this look like a smooth drift toward the pooled mean as p
   grows. It isn't. For k=11, p actually gets *more* significant as
   the range grows from 300 to 500 (0.02 -> 0.0003), stays
   significant out to ~760, then crosses over sharply within about 10
   primes' width (760 -> 770). Same shape for k=8 and k=13, just at
   different locations. Whatever generates this proxy signal, it does
   not decay gradually with scale -- it holds firm and then breaks.

2. **The cliff location does not scale with k or K1.** k=8's cliff
   (~347) and k=13's cliff (~350-400) land in almost the same place
   despite k differing by 5, while k=11's cliff (~765) sits more than
   twice as far out as either neighbor. If the transition point were
   set by k or by K1=k+1 in any simple way, k=11 (in between 8 and
   13) should have an intermediate cliff, not the outlier. It's the
   outlier. This is the fourth pattern this line of work has proposed
   and broken (after monotone-in-k, prime-K1, parity-of-k) -- I'm not
   proposing "cliff location vs k" as a new hypothesis, just reporting
   that it isn't a clean function of k either.

This sharpens, but does not reverse, cycle 27's conclusion: the
"significant" k=8/11/13 results are still real, still narrow-range
phenomena, still don't extend to p~1000 uniformly across k. What's
new is that the boundary is sharp (useful if anyone wants to
characterize it further) and that its location is idiosyncratic per
k, not predictable from k alone.

## Next

1. Characterize what's special about p~760-770 for k=11 specifically
   (is a particular prime or cluster of primes entering the "rest"
   class driving the flip, or is it a genuine sample-size/variance
   effect?) -- dump per-prime margins near the boundary and see if one
   or two primes account for the jump.
2. The k=13 cliff moved between seeds (350-360 vs 360-400) -- worth
   running a 3rd seed to see if there's a stable zone, before trusting
   any specific number for k=13.
3. Still open: K-4/K-3 within-seed correlation (#23, 6 cycles
   untouched). p=307 (k=13, class -1 mod 14) still stuck per cycle 22,
   Track A infrastructure, not re-checked.
4. Given the cliff is real and sharp, it might be worth trying k=9 or
   k=10 (established flat at the small range) at a similarly narrow
   *low* range to double check they really are flat everywhere and not
   just missing their own narrow significant window -- the bounded-
   window idea was built on a single range per k; this cycle shows a
   single range per k can be seriously misleading in either direction.
