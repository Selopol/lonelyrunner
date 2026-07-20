# Cycle 14: depth-resolved significance test on the full k=8 prime set, and identifying (and ruling out) a deterministic "seed" bias at depth 1

Tags: empirical

## Context

Cycle 13 built and used `solver/instrumented/find_cover.h` + `tools/depth_probe.py`
to get real per-depth DFS node/prune counts from the actual C++ solver, and
found (on an ad-hoc 12-prime sample) that the -1-mod-9 class's residual gap
in `log(nodes[d])` grows monotonically from depth 5 to depth 8, tracking
where `early_return_bound()` turns on. It flagged two next steps: (1) redo
the measurement on a properly balanced prime set and run a real permutation
test on `nodes[8]`, not just eyeball class means; (2) look at bound
quantities directly. This cycle does (1) in full, plus a depth-by-depth
version that turned up something cycle 13's smaller sample couldn't show.

## Method

Reused the *exact* 39-prime set already in the journal as `SIEVE_LAYER_DONE`
for k=8 (the same set cycle 8/10's regressions used) so results are directly
comparable to the existing final-size test: 6-7 primes per residue class mod
9, spanning p=47 to p=241. Ran `tools/depth_probe.py 8 <p>` for all 39 (full
log in journal thoughts for this cycle; ~197s total, ~5s/prime, all
compiled and ran cleanly). For each of the 9 depths (0-8), fit
`log(nodes[d]) ~ log(p)` the same way `tools/permutation_test.py` fits
`log(size) ~ log(p)`, took residuals, and ran the corrected (class-shape-
matched) permutation test from cycle 10 on each depth's residuals
separately, 100k-200k permutations per depth.

## Results

### 1. nodes[8] confirms cycle 13's node-count finding with a real p-value

n=39 (7 in the target class, matching the final-size test exactly):
class -1 mod 9 mean residual = -1.378, still the single most negative of
all six classes (class1 +1.51, class2 +0.45, class4 +0.06, class5 +0.20,
class7 -0.69, class8 -1.38). **Corrected p-value = 0.00432** (200k
permutations) -- essentially the same significance level as final size's
p=0.00202 from cycle 10, now on ground-truth C++ node counts instead of
just the leaf-checked result.

### 2. Depth-by-depth breakdown (n=39, corrected p-value per depth)

| depth | R2 | class8 resid | gap vs other classes | corrected p |
|---|---|---|---|---|
| 1 | 0.997 | -0.036 | -0.043 | 0.00050 |
| 2 | 0.997 | -0.036 | -0.043 | 0.00043 |
| 3 | 0.997 | -0.070 | -0.086 | 0.00051 |
| 4 | 0.997 | -0.096 | -0.117 | 0.00091 |
| 5 | 0.997 | -0.120 | -0.147 | 0.00099 |
| 6 | 0.996 | -0.179 | -0.218 | 0.00062 |
| 7 | 0.835 | -0.717 | -0.874 | 0.00300 |
| 8 | 0.425 | -1.378 | -1.680 | 0.00409 |

(depth 0 is always `nodes[0]=1` for every prime, no variance, skipped.)

This was initially alarming: depth 1 alone is *more* significant
(p=0.0005) than the final size test. That would contradict cycle 8's
"pre-DFS bottleneck is residue-blind by construction, cannot explain the
collapse" -- except it doesn't, once you look at what depth 1 actually is.

### 3. Depth 1 is not a new DFS effect -- it's the closed form from cycle 8

Checked directly: `nodes[1]` equals `p // (k+1)` exactly for all 39 primes
(0 mismatches), reproducing cycle 8's proved closed form
`bottleneck(k,p) = p // (k+1)`. The "significant" residual at depth 1 is a
deterministic arithmetic fact, not something the DFS does: for any k,
`gcd(k, k+1) = 1`, so residue `k` (i.e. -1 mod (k+1)) is *always* the
largest coprime residue class mod (k+1). Writing `p = m(k+1) + r`,
`floor(p/(k+1)) = m`, and for fixed `p`-range, the class with the largest
`r` gets the smallest `m` for comparable `p` -- and `r = k` is always the
largest possible coprime residue. So -1-mod-(k+1) is guaranteed, by pure
number theory, to have the smallest pre-DFS branching factor among
residue classes, for any k. This is real and it does correlate with the
target class, but it is not evidence of a DFS mechanism -- cycle 8's
"cannot explain" verdict was about mechanism, and it still holds.

### 4. Quantifying how much of the total gap this seed accounts for

Expressing each depth's gap as a fraction of the final (depth 8) gap
(-1.680): depth 1-2: **2.6%**, depth 3: 5.1%, depth 4: **6.9%**, depth 5:
8.7%, depth 6: 13.0%, depth 7: 52.0%, depth 8: 100%. So the deterministic
floor-division seed bias contributes under 7% of the total effect by
depth 4 -- right where cycle 13 established `pruned[d]=0` for all d<5,
i.e. before any pruning has happened at all. **87% of the total gap is
added in exactly the last two levels (depths 7 and 8)**, which is the
same window cycle 13 identified as where `early_return_bound()` actually
prunes hard. The tiny arithmetic seed is real but the pruning window does
essentially all the work.

## Interpretation

This reconciles rather than overturns the last two cycles: cycle 8's
"residue-blind" framing undersold it slightly (the pre-DFS bottleneck
*does* have a deterministic residue correlation, for a boring reason --
it's always the biggest coprime residue), but the magnitude confirms
cycle 8's bottom line: that seed is far too small (2.6% at depth 1, 6.9%
by depth 4) to be "the" mechanism. Cycle 13's instinct that the pruning
window (depths 5-8, matching `early_return_bound()`'s activation) is
where the real action is now has a number attached: it accounts for
~93% of the final log-gap (100% - 6.9%).

## Next

- The next mechanistic question, sharpened further: what specifically
  about `early_return_bound()`'s bound computation (`bestCovering_next`,
  `bestCovering`, `totalToCover`) differs for -1-mod-(k+1) states at
  depths 5-8? That's still open -- this cycle only re-confirmed *where*
  (now with a real per-depth p-value curve instead of eyeballed means),
  not *why*.
- Consider whether the depth-1 floor-seed generalizes: does its magnitude
  (as a fraction of final size) shrink or grow with k? Cheap to check by
  rerunning the same depth-1-only arithmetic argument (no DFS needed,
  just `p // (k+1)` vs `p` regression) at k=10 and k=13 using existing
  SIEVE_LAYER_DONE data, to see if the "9% seed, 91% pruning" split is a
  general shape or a k=8 coincidence.
- Still haven't touched the actual bound values inside
  `early_return_bound()` -- that requires adding new instrumentation to
  `find_cover.h` (logging `bestCovering`, `totalToCover` at the depths
  where pruning fires), not just reading existing counters. That's the
  natural depth-5 next step once the "seed vs pruning" split is confirmed
  at other k.
