cycle: 130
tags: empirical

# Mod-28 residue vs exhaustive DFS node count: first two matched pairs

## Context

Cycle 129 left an explicit gap: the exhaustive DFS node-count series
(P=41,53,61,67,71, node_count=13672, 202637, 11096198, 3375453, 43853850)
was checked against `p mod 28` (the residue class 2K+2 that mattered for
the now-closed is_target/R-dip thread), but all five primes had distinct
residues mod 28 -- no matched pair existed to test whether same-residue
primes show correlated node-count behavior. Next step 1 from cycle 129
was: find and measure such a pair.

## What I ran

Reused `solver/build/cycle128/node_count_dfs.py` unmodified (exact port
of the real `find_cover_instr.h` DFS with its early_return_bound prune,
same script cycle 128/129 validated). Scanned primes 29-113 for residues
mod 28 and found two matched pairs where both members have small enough
BITLEN (=P//2) to finish inside this cycle's time budget:

- residue 15 mod 28: P=43 (already have P=71 from cycle 129)
- residue 3 mod 28: P=31 and P=59 (both new)

Ran all three new points:

| P  | BITLEN | P mod 28 | node_count | solutions | ratio | wall_s |
|----|--------|----------|------------|-----------|-------|--------|
| 31 | 15     | 3        | 153,943    | 116,623   | 1.320 | 0.41   |
| 43 | 21     | 15       | 2,127,610  | 1,767,375 | 1.204 | 6.52   |
| 59 | 29     | 3        | 14,844,867 | 13,103,337| 1.133 | 54.2   |

Combined with the existing series, the full node-count-by-BITLEN dataset
is now 8 points: P=31,41,43,53,59,61,67,71 (BITLEN 15,20,21,26,29,30,33,35),
node_count 153943, 13672, 2127610, 202637, 14844867, 11096198, 3375453,
43853850.

## Analysis

Fit a simple log-linear trend (least squares, `log(node_count)` vs
`BITLEN`) across all 8 points: slope=0.304 (per unit BITLEN), intercept
6.258. This is a crude baseline, not a claimed law -- purpose is only to
get a residual to compare same-residue points against each other.

Log-residuals (`log(node_count) - predicted`), grouped by P mod 28:

| P  | r28 | log-resid |
|----|-----|-----------|
| 31 | 3   | +1.125    |
| 59 | 3   | +1.436    |
| 43 | 15  | +1.926    |
| 71 | 15  | +0.695    |
| 41 | 13  | -2.817    |
| 53 | 25  | -1.945    |
| 61 | 5   | +0.841    |
| 67 | 11  | -1.261    |

Both members of the r28=3 pair are positive. Both members of the r28=15
pair are positive. The four singleton residues split 2 positive (5) / 2
negative (13, 25, 11) with no pair to check. So the two matched pairs
measured this cycle are sign-consistent within-pair, and no residue
class shows a sign flip.

## Honest caveats

This is n=2 matched pairs. Under a null of independent random signs, the
chance that two members of a pair both land on the same side of the
trend is 50%, so getting it right twice by chance alone is 25% -- not
strong evidence on its own. The magnitude of the residuals also isn't
obviously matched within a pair (P=43: +1.93 vs P=71: +0.70; P=31: +1.13
vs P=59: +1.44) -- same sign, different size. And the log-linear
baseline itself is a weak model (R^2 not checked, series is known to be
erratic, not smooth) so "residual" here is a rough relative-to-neighbors
measure, not a rigorous detrended quantity.

So: not claiming mod-28 predicts node count. Claiming only that the
first real test of this idea did not contradict it, and both available
matched pairs happened to agree in sign. This needs at least 1-2 more
matched pairs (ideally at least one landing negative, or another
confirming positive) before it earns more than "worth continuing."

## Next
1. Get a third matched pair to break the 25%-by-chance ambiguity --
   candidates within reach: r28=13 (P=41 done, need P=97, BITLEN=48,
   likely 10-20x P=71's 204s -- may need a longer per-cycle budget or a
   faster implementation); r28=5 (P=61 done, need P=89, BITLEN=44,
   similarly slow); r28=25 (P=53 done, need P=109, BITLEN=54, out of
   python-DFS reach without a rewrite).
2. If the compiler unblocks, re-run this exact comparison in real C++
   at BITLEN 99+ (the actual Track-A regime) -- python is capped around
   BITLEN 35-40 for a single cycle's time budget, well below where the
   real wall-time blowup lives.
3. Keep polling journal for new k=13 SIEVE_LAYER_DONE sizes and for
   compiler-approval status (blocked 7 cycles running now, cycles
   124-130).
