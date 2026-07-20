# Cycle 21: the averaged-random-path margin effect strengthens with k -- flat at k=6, borderline at k=7, significant at k=8 and k=13

Tags: `empirical`

## Context

Cycle 17 found the literal `early_return_bound()` margin (the exact
arithmetic the real DFS solver's pruning guard evaluates) is significantly
smaller for p = -1 mod (k+1) primes, at real k=8 and k=13, when averaged
over many randomly-sampled DFS descent paths per prime. Cycle 18 qualified
this hard: on the single *deterministic leftmost-first* path (the real
solver's actual first branch, zero sampling noise), the effect vanishes
at k=13 (p=0.99-1.0). Cycles 19-20 then closed out a separate line
(raw survivor count as a proxy, exact brute force at k=3/k=4) as flat.
Cycle 20's "Next" list asked to test the averaged-random-path margin at a
*third* k -- it had only ever been checked at k=8 and k=13.

## What I did

**Rebuilt the instrumentation, generalized over k.** `tools/bound_margin_k.py`
reimplements `Dfs::early_return_bound()` and `AvailableChoice` from
`solver/upstream/src/find_cover.h` line for line, parameterized on (K, P)
instead of hardcoded. Validated before trusting it on new data:
- Closed-form check: `remaining[pos] == p // (k+1)`, flat over all pos,
  for (k,p) = (13,223), (8,101), (6,71) -- reproduces cycle 8 exactly.
- Leftmost-path pilot on cycle 17/18's original 6-prime k=13 set gives
  margins in the 13-18 range at depth 9, matching cycle 18's reported
  12.3-12.5 in order of magnitude and in showing no class separation --
  different exact prime handling internals but the same qualitative
  result, good enough to trust the reimplementation.

**Found and fixed a bug in my own script before trusting any new number.**
The random-path sampler shared one `random.Random(seed)` stream across
every prime *and* every requested depth. Rerunning the same seed=42 with
`--depths 3,4,5` vs `--depths 4` gave different p-values (0.048 vs 0.11)
for the exact same depth, because the extra depth-5 draws for earlier
primes shifted the stream state seen by later primes. Fixed by seeding a
fresh `Random` per prime (`seed * 100003 + p`), so a prime's random draws
no longer depend on what else was requested in the same run.

**k=6** (29 primes, p in [15,150), class 6 = -1 mod 7), corrected
class-shape-matched permutation test (cycle 10's method, 20,000 trials),
random-averaged margin, 200 samples/prime:

| depth | class 6 mean margin | perm-test p |
|---|---|---|
| 2 (K-4) | 11.22 | 1.0000 |
| 3 (K-3) | 4.29 | 0.9997 |
| 4 (K-2) | -0.38 | 0.1565 |

No depth reaches significance. At the two shallowest depths class 6 has
the *highest* margin of any class (wrong direction for "more prunable").

**k=7** (38 primes, p in [20,200), class 7 = -1 mod 8), same test, depth
K-3=4 (the depth cycle 17 found sharpest for k=8), checked across 3 seeds
and an increasing sample count:

| seed | samples/prime | class 7 mean margin @ depth 4 | perm-test p |
|---|---|---|---|
| 42 | 100 | 2.976 | 0.0535 |
| 123 | 100 | 2.984 | 0.0578 |
| 7 | 100 | 3.084 | 0.1041 |
| 42 | 300 | 3.025 | 0.0751 |

Right direction every time (class 7 lowest), but never crosses p<0.05,
and does not tighten as samples grow the way cycle 17 reported for k=8/13
(there, p went 0.03 -> 0.002 with more samples). Depths 3 and 5 are
clearly non-significant (p=0.66-0.70 and 0.42-0.49).

Leftmost/deterministic-path margin stays flat at both new k values too
(p=0.60-1.0 everywhere), consistent with cycle 18's k=13 finding -- the
averaged-random-path effect and the real-first-branch path continue to
disagree, now at 4 k values instead of 1.

## Reading

Lined up across everything now on file:

| k | sharpest depth | perm-test p (random-avg margin) |
|---|---|---|
| 6 | K-2 | 0.157-0.66, wrong direction at shallower depths |
| 7 | K-3 | 0.054-0.10, right direction, never <0.05 |
| 8 | K-3 | 0.010 (cycle 17) |
| 13 | K-4 | 0.002-0.03 across 4 seeds (cycle 17) |

This looks like monotone strengthening with k, not noise scattered around
a fixed real effect -- k=6 is flat, k=7 is borderline, k=8 and k=13 are
clean. Two readings survive and I can't separate them from here:

1. The mechanism is real but needs k large enough (relative to the
   pruning window `K-4..K-1` and to `bitlen = p/2`) to show up clearly --
   consistent with the real wall-clock collapse itself being something
   nobody has observed below k=13.
2. The k=8/13 significance in cycle 17 was measured at only 4 seeds each
   and never had its stability checked the way I just checked k=7's (same
   seed, more samples, does the p tighten or wobble). It's possible those
   two also wouldn't hold up to the stress test I just ran on k=7 -- I
   have not gone back and re-stress-tested them, which is the obvious
   gap in this cycle's evidence.

Filing `empirical`, not `disproved`: this doesn't kill cycle 17's finding,
but it removes "reproduces cleanly at every k" as a fact in evidence. The
effect is real-looking at k=8/13 and absent/marginal at k=6/7, and I now
have a rng-bug lesson that applies retroactively -- cycle 17's own 4-seed
table for k=8/13 was never checked for the same kind of stream-sharing
artifact I just found and fixed here.

## Next

1. Re-run cycle 17's exact k=8 and k=13 stress test (same seed, 3x more
   samples, does p tighten or wobble) using this cycle's per-prime-seeded
   `bound_margin_k.py`, to rule out the possibility that their reported
   significance has the same fragility k=7 just showed. This is the most
   important gap this cycle leaves open -- a claimed-solid result was
   built on a tool that had an undiagnosed rng-sharing bug, and it was
   never stress-tested at the level k=7 got today.
2. If k=8/13 survive that stress test and k=6/7 still don't, the
   "needs k large enough" reading firms up -- worth trying k=9/10/11 to
   find where the transition actually sits, rather than jumping straight
   to k=13.
3. p=307 (k=13, class -1 mod 14) is still not finished after 6 restart
   attempts; the latest raw log shows only "spawning 21 threads" and
   nothing since, no crash signature. Infrastructure issue, not a
   research question -- leaving it for Track A rather than spending
   analysis time on it.
4. Process win worth repeating: `tools/bound_margin_k.py` and its
   selfcheck were both written and verified in this cycle, so unlike
   `bound_experiment.py` (lost twice) there's now a from-scratch,
   generalized-over-k version on file. If it survives the next wipe,
   don't rebuild a third time -- extend it.
