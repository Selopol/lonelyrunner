# Cycle 23: filling in k=9, k=10, k=11 kills the "monotone in k" reading

Tags: `disproved`, `empirical`

## Context

Cycle 21 read the four k values tested so far (6, 7, 8, 13) as a monotone
gradient: 6 flat/wrong-direction, 7 borderline, 8 significant-but-noisy,
13 significant-and-stable. Cycle 22 stress-tested 8 and 13 and confirmed
neither was an rng artifact, and flagged the concrete next step: fill in
k=9, k=10, k=11 to see whether the transition from "unstable" to "stable"
is a smooth ramp or a sharp jump somewhere in that range. That is what
this cycle did.

## What I did

Used `tools/bound_margin_k.py` unchanged. Chose primes in `[20,300)` (54
primes total) for all three k values so the target-class sample size is
comparable to the earlier windows (12, 6, and 14 primes in the -1-mod-
(k+1) class for k=9, 10, 11 respectively — smaller than ideal for k=10
but that is what the range gives). Ran each k at 3 independent seeds (42,
123, 7) x 100 samples/prime, RANDOM-avg margin, at both depths in the
default window {K-4, K-3}. For the depth that looked most interesting in
each case, added a 300-sample (3x) run on 2 seeds to check tightening vs
wobbling, same falsification method cycle 22 used.

**k=9 (K1=10, target class 9), depth K-4=5:**
p = 0.284, 0.192, 0.196 (seeds 42/123/7) — flat and stable, no signal.

**k=9, depth K-3=6:**
p = 0.126, 0.037, 0.029 @ 100 samples — 2/3 seeds cross 0.05, one doesn't.
At 300 samples, seed 123: 0.037 -> 0.047 (wobbled up slightly, stayed
under the bar by luck). Borderline and noisy, same character as k=7.

**k=10 (K1=11, target class 10), depth K-4=6:**
p = 0.924, 0.862, 0.863 — flat, wrong-direction-ish (near 1.0), the
*most* null result of any k tested so far, more null than k=6 or k=7.

**k=10, depth K-3=7:**
p = 0.600, 0.656, 0.486 — flat and stable, no signal either.

**k=11 (K1=12, target class 11), depth K-4=7:**
p = 0.0205, 0.0249, 0.0295 @ 100 samples (seeds 42/123/7). At 300
samples: seed 42 0.0205 -> 0.0320, seed 123 0.0249 -> 0.0229. Five runs,
all in a tight p = 0.02-0.032 band, consistently significant, mild
wobble but never close to losing significance and never far from where
it started.

**k=11, depth K-3=8:**
p = 0.347, 0.395, 0.373 — flat, stable, no signal.

While writing this up I noticed k=6 and k=10 are exactly the two k
values tested where K1=k+1 is prime (7 and 11), and both are the two
flattest results on file. That's cheap to check further, so before
filing I also ran **k=12 (K1=13, prime)**, seed 42, depth window
{K-4,K-3}={8,9}, RANDOM-avg:
- `[20,300)`, 3 primes in target class: p=0.9607 (depth 8), 0.9059 (depth 9)
- `[20,500)`, 7 primes in target class: p=0.3127 (depth 8), 0.7756 (depth 9)

Both windows flat, no signal — a third confirming case.

## Reading

Lined up with the earlier four k values:

| k | depth with signal | p range | character |
|---|---|---|---|
| 6 | — | 0.16-1.0 | flat / wrong direction |
| 7 | K-3 | 0.05-0.10 | borderline, stable-but-flat |
| 8 | K-3 | 0.009-0.021 | significant, noisy (wobbles up) |
| 9 | K-3 | 0.029-0.126 | borderline, noisy (crosses 0.05 sometimes) |
| 10 | none | 0.49-0.92 | flat, most null result tested |
| 11 | K-4 | 0.020-0.032 | significant, fairly stable |
| 12 | none | 0.31-0.96 | flat (n=3-7 target primes, thin) |
| 13 | K-4 | 0.0009-0.0027 | significant, tightens |

Cycle 21's "monotone strengthening with k" reading is **dead**. k=10 is
flatter than k=6 and k=7. k=9 is noisier and weaker than k=8. If the
mechanism strictly needed "k large enough," k=10 sitting between two
significant neighbors (9 borderline-ish, 11 clearly significant) would
not happen. Whatever is going on is not a smooth function of k alone.

A second thing this cycle turned up: the depth that shows the effect
is not the same depth across k. k=8 and (weakly) k=9 show it at K-3;
k=11 and k=13 show it at K-4; k=10 shows it at neither. That is not a
parity split (9 and 11 are both odd, but one lights up at K-3 and the
other at K-4) and I don't have an explanation for it. It could be real
structure, or it could be that K-3 and K-4 are correlated tests on the
same underlying data and only one of the two happens to clear 0.05 for
a given k by chance — I have not checked how correlated the two depths'
p-values are within a single seed, which would be the next thing to
rule out before reading anything more into the K-3-vs-K-4 split.

This does not kill the underlying "margin proxy shows a real residue
effect at some k" finding — k=8, 11, and 13 are all independently
significant and none of them look like rng artifacts (k=8/13 stress-
tested in cycle 22, k=11 already run at 3 seeds x 2 sample sizes here
with a tight band). What's dead is the specific *shape* of "strengthens
monotonically with k" as the explanation for why.

**New candidate pattern (tag `idea`, not yet strong evidence):** every k
tested where K1=k+1 is prime (k=6 -> K1=7, k=10 -> K1=11, k=12 -> K1=13)
comes out flat/null, and every k tested where K1 is composite (7, 8, 9,
11, 13 -> K1 = 8, 9, 10, 12, 14) shows at least a borderline signal.
Three-for-three on the prime side is a small n and k=12's target class
only had 3-7 primes (thin), so this is a lead, not a result. But it's a
clean mechanical hypothesis — K1 composite means the mod-K1 residue
classes used in `build()`'s covering condition interact with K1's
factor structure, which a prime K1 wouldn't have — and it's cheap to
push on directly.

Filed `disproved` for the monotone-in-k reading specifically, `empirical`
for the new k=9/10/11/12 numbers, `idea` for the prime-K1 pattern.

## Next

1. **Prime-K1 pattern is the strongest lead from this cycle.** Test k=16
   (K1=17, prime) and k=14 (K1=15=3x5, composite) at matched sample size
   to add a 4th prime-K1 point and a same-cost composite comparison
   further out from the already-tested range. If k=16 also comes out
   flat, this stops being 3 lucky coincidences.
2. Check whether K-3 and K-4 p-values are correlated within a seed (same
   underlying walk, two depths) — if they move together, the "different
   depth lights up for different k" observation may just be which of two
   non-independent coin flips landed under 0.05, not real structure.
3. p=307 (k=13, class -1 mod 14) still stuck after 6+ restarts per cycle
   22 -- not re-checked this cycle, still Track A infrastructure.
