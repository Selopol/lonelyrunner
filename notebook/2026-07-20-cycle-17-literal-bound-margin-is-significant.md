# Cycle 17: the literal early_return_bound() margin carries a real, significant residue effect

Tags: `empirical`

## Context

Cycles 15-16 ruled out six proxies for the DFS pruning mechanism at real
k=13 (per-witness degree, remaining[]-shape, raw survivor count, pairwise
codegree, triple codegree, and single-witness greedy covering progress on
the real `mCover` object) -- all flat or non-significant under the
class-shape-matched permutation test (the corrected method from cycle 10).
Cycle 16's concrete next step: stop approximating and implement the
*literal* `early_return_bound()` expression from
`solver/upstream/src/find_cover.h` --

```
nextToCover = get_next_to_cover(covered)
if nextToCover != -1 and remaining[nextToCover] == 0: return True
if elems.size() < K-4 or nextToCover == -1: return False
totalToCover = bitlen - covered.count()
bestCovering       = max_i (nextC & cover(i)).count()          # nextC = ~covered, forced pos cleared
bestCovering_next  = 1 + max_{i: cover(i)[nextToCover]} (nextC & cover(i)).count()
slots = K - elems.size()
fires = totalToCover > bestCovering_next + bestCovering*(slots-1)
```

and test whether it fires more, or with a larger margin, for p = -1 mod
(k+1) than other classes -- at the actual depths (K-4..K-1) where the
guard is active, not a coverage-fraction stand-in for it.

## What I built

`tools/bound_experiment.py`: builds the real `mCover[i][pos]` matrix and
`remaining[]` vector exactly as the C++ does (verified against cycle 8's
closed form: `remaining[pos] = p//(k+1)` exactly, flat, e.g. 15 for
p=223, k=13), then samples random *valid* DFS descent paths (no
elimination happens on a pure first-descent, matching cycle 8's finding
that remaining[] stays constant pre-backtrack) using the actual
`get_next_to_cover()` heuristic at each step. At depths K-4..K-1 it
snapshots the state and evaluates the literal bound expression above,
recording both the boolean `fires` outcome and the continuous
`margin = bestCovering_next + bestCovering*(slots-1) - totalToCover`
(negative margin = bound fires = branch pruned).

## Measurements

**Pilot, the 6 primes with known wall-clock I(13,p,1) sizes** (199, 211,
223, 227, 251, 293 -- three of them, 223/251/293, are the -1 mod 14 class
where the collapse is measured), 100 samples/prime:

| p | class | fire-frac@9 | fire-frac@10 | margin@9 | margin@10 |
|---|---|---|---|---|---|
| 199 | 3  | 0.00 | 0.46 | 4.65 | -0.19 |
| 211 | 1  | 0.00 | 0.33 | 5.22 | 0.20 |
| 227 | 3  | 0.04 | 0.53 | 4.51 | -0.53 |
| **223** | **13** | **0.05** | **0.71** | **3.48** | **-1.76** |
| **251** | **13** | **0.06** | **0.87** | **2.46** | **-3.28** |
| **293** | **13** | **0.14** | **0.92** | **2.63** | **-3.71** |

At depth 10 (K-3) there is *complete separation*: min class-13 fire-frac
(0.71) exceeds max non-class-13 (0.53). Not driven by p-magnitude alone
either -- 227 > 223 in size but fires *less* (0.53 < 0.71).

**Broader sweep for significance.** A full [100,500) sweep saturates fast
(by depth 10 almost every prime above ~300 has fire-frac 1.0 regardless
of class, same saturation problem cycle 16 hit) and washes the effect
out. Restricting to [100,300) -- the actual regime the wall measurements
live in, ~30 primes coprime to 14 -- and running the class-shape-matched
corrected permutation test (cycle 10's method: partition all rows into
groups matching the real class-size multiset, ask how often the most
extreme random group beats the observed target, 20,000 trials) at depth
K-4=9, across 4 independent seeds and increasing sample counts:

| seed | samples/prime | fire-frac p (class 13 direction) | margin p (class 13 direction) |
|---|---|---|---|
| 42  | 30  | 0.041 (highest, correct) | 0.030 (lowest, correct) |
| 123 | 30  | 0.086 (highest, correct) | 0.0039 (lowest, correct) |
| 999 | 60  | 0.477 (class 11 highest, not 13) | 0.012 (lowest, correct) |
| 7   | 100 | 0.107 (highest, correct) | 0.0021 (lowest, correct) |

The boolean fire-frac statistic is noisy (only 1/4 seeds under 0.05) --
the base rate is only 5-8% at this depth with just 30 primes, so it's
starved of events. The **continuous margin statistic is significant in
all 4 seeds** (p = 0.030, 0.0039, 0.012, 0.0021), tightening as sample
count grows, and class 13 (p = -1 mod 14) is the single lowest-margin
(most prunable) class every single time.

**Counter-test at k=8** (required before trusting a k=13-only result),
primes [20,200), same margin statistic: depth K-4=4 is *not* significant
(p=0.962, class 7 is lowest, not class 8 -- wrong direction), but depth
K-3=5 *is* (p=0.010, class 8 correctly lowest). So the effect reproduces
at a second, independently-checkable k, but the depth at which it is
sharpest shifts by one step relative to K-4 (K-4 for k=13, K-3 for k=8)
-- not yet mechanistically pinned down why.

## Reading

This is the first proxy, in seven attempts across this notebook, to
cross the same significance bar (`p < 0.05`, corrected, class-shape
matched) that cycle 10 established for the real survivor-count collapse.
Unlike the six prior proxies, this one is not invented: it's the literal
arithmetic the real solver's pruning guard evaluates, translated from
`find_cover.h` line for line and checked against cycle 8's closed form
before trusting it. The effect is real but narrow: it needs the
continuous margin (the boolean fire/no-fire outcome is too coarse to be
reliable with only ~30 primes), it is only significant in the regime
where the guard hasn't already saturated to "always fires" (small-to-mid
p, matching where the wall-clock collapse itself is measured), and the
exact depth where it is sharpest is not identical between k=8 and k=13.

Filed `empirical`, not `proved` -- this is still a statistical result
over randomly sampled DFS paths (not the full tree, not a proof the real
solver actually visits more prunable states for this class), but it is
the strongest and most mechanistically-grounded signal this notebook has
produced since cycle 14's depth-localization finding.

## Next

1. Widen the k=13 prime sample within [100,300) (currently ~30 primes,
   4-13 per class) to shrink the permutation test's granularity and get
   a tighter p-value, and/or push samples/prime past 100 to shrink
   per-prime noise further -- margin p is already trending down with
   more samples (0.03 to 0.002), worth checking if it keeps tightening.
2. Investigate the depth-shift between k=8 (sharpest at K-3) and k=13
   (sharpest at K-4) directly -- is it a fixed offset, or does it scale
   with k? Test k=10 or k=11 to interpolate.
3. This measures *sampled* DFS paths, not the real algorithm's actual
   leftmost-first traversal order. A version that walks the true
   deterministic leftmost path (smallest valid i at each step, matching
   the real solver's actual first branch) instead of a random one would
   be a second, independent check with zero sampling noise.
4. If this keeps holding up, it is the first real lead toward *why*
   -1-mod-(k+1) primes prune harder: the margin is smaller specifically
   at the depth the guard turns on, meaning those classes have less
   surplus greedy-coverage capacity relative to what's left to cover --
   worth trying to derive a closed form for the margin analogous to
   cycle 8's `p//(k+1)` for `remaining[]`.
