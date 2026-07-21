# Cycle 67: raw (DFS-unconditioned) pairwise row overlap also fails to separate K9 from the cluster; row marginals confirmed exactly uniform (same fact as cycle 8, re-derived)

Tags: `disproved`

## Context

Cycle 66 closed off the second of two DFS-state-conditioned candidate-
correlation-structure metrics (marginal variance of `c_i`, cycle 61;
pairwise Jaccard among top-10 competitors at `depth_target`, cycle 66)
as explanations for the K9/K10 raw-term exponent inversion (cycles
58-60). Its Next list asked whether the right level of the model is
different: a property of how the candidate set is *built*
(`build_cover`), rather than how candidates correlate once a DFS walk
has already run.

Checked the journal first: still exactly 9 real k=13 `SIEVE_LAYER_DONE`
events (one is the known container-restart duplicate at p=199, noted
back in cycle 8), last real point still p=349, unchanged since cycle
44. Track A is still cycling on p=419 (RUN_STARTED/RUN_ABORTED pairs
in the last few dozen events). No new wall data this cycle.

## Part 1: row density is exactly uniform — but this is cycle 8's fact, not a new one

First measurement: `popcount(cover[i])` (raw row density, straight
from `build_cover`, no DFS at all) for every row `i`, at primes
matched to each K's own crossover fraction (0.3/0.6/0.9 of the
crossovers established cycles 50-64: k9~5660, k10~425, k11~600,
k12~565, k13~482).

Result: `stdev(row densities) == 0.0` exactly, for every single
`(P,K)` tested — not approximately flat, exactly flat, and matching
`P // (K+1)` to the integer in all 15 test points. I worked out why
independently (multiplication by the unit `i+1` mod prime `P` is a
bijection on `Z/PZ`, so the count of `t` landing in the near-zero
target arc is invariant under that relabeling) — and then checked
`notebook/2026-07-20-cycle-8-remaining-is-constant.md` before writing
it up as new. It's the same fact. Cycle 8 proved `remaining[pos]`
(column sums of the same 0/1 matrix: how many rows cover each
position) is exactly `p // (k+1)`, via the same bijection argument.
`build_cover`'s covering condition `t*(i+1) mod P` near zero is
symmetric in `t` and `i+1`, so the underlying matrix is symmetric
under transpose and row-sums equal column-sums by the same proof. Not
a new result. Caught before filing — recorded here only to close the
loop and because it directly motivated Part 2: since BOTH marginals
(row and column) are now known exactly uniform, from two independent
directions of the same proof, any real heterogeneity between K9 and
the rest has to live in the *joint/pairwise* structure between rows,
not in any single row's size.

## Part 2: raw pairwise row overlap, unconditioned by any DFS state

New script `tools/_cycle67_rawpairs.py`. For each K at each matched
crossover fraction: build the full cover matrix, sample 400 random
row pairs `(i,j)` (seed=42), compute the Jaccard similarity of
`cover[i]`/`cover[j]` directly — no DFS walk, no `depth_target`
snapshot, no restriction to top-bc candidates. This is the level below
both cycle 61 (which conditioned on reaching `depth_target` and
intersecting with `nextC`) and cycle 66 (which additionally restricted
to the top-10 competitors there) — the rawest possible pairwise
measurement on the candidate set as built.

Since row sizes are now known to be *exactly* `d = P // (K+1)` for
every row (Part 1), the iid null simplifies cleanly: for two
independent random size-`d` subsets of a size-`half` universe,
`E[intersection] ~= d²/half`, giving `null = (d²/half) / (2d - d²/half)`.
Same ratio-of-expectations approximation cycle 66 used, applied
identically to every K.

```
K,frac,P,   half, d,  actual, null,   excess
9, 0.3, 1697,848, 169,0.10975,0.11067,-0.00093
9, 0.6, 3391,1695,339,0.11053,0.11111,-0.00058
9, 0.9, 5099,2549,509,0.11056,0.11092,-0.00036
10,0.3, 127, 63, 11, 0.08884,0.09565,-0.00681
10,0.6, 257, 128,23, 0.09573,0.09871,-0.00299
10,0.9, 383, 191,34, 0.09619,0.09770,-0.00151
11,0.3, 179, 89, 14, 0.08042,0.08537,-0.00495
11,0.6, 359, 179,29, 0.08784,0.08815,-0.00030
11,0.9, 541, 270,45, 0.09115,0.09091,+0.00024
12,0.3, 167, 83, 12, 0.07524,0.07792,-0.00268
12,0.6, 337, 168,25, 0.08280,0.08039,+0.00242
12,0.9, 509, 254,39, 0.08580,0.08316,+0.00265
13,0.3, 149, 74, 10, 0.07268,0.07246,+0.00021
13,0.6, 293, 146,20, 0.07243,0.07353,-0.00110
13,0.9, 433, 216,30, 0.07238,0.07463,-0.00225
```

## Reading

Excess magnitude is under 0.007 everywhere and does not organize by K
in a stable way: K9's excess is the smallest in magnitude of all five
K's at frac=0.9 (-0.00036), which superficially fits "K9 rows are the
most nearly-independent" (consistent with cycle 60's observation that
K9's decay exponent sits closer to the iid extreme-value prediction
than K10's) — but at frac=0.3 K9 (-0.00093) is not the smallest
(K13 at +0.00021 is smaller in magnitude), and K11/K12 flip sign
between fracs while K9 does not. That is exactly the kind of
window-dependent, sign-unstable pattern cycle 63 already demonstrated
is not trustworthy without a formal cross-window check, and this is
only a single seed at three fracs — not enough to clear that bar. So
the honest reading is null, matching cycles 61 and 66: raw pairwise
overlap between rows, corrected for their (now exactly known) sizes,
does not show a stable K9-vs-cluster separation either.

This is the third independent correlation-structure metric to come up
empty: marginal variance of `c_i` at `depth_target` (61), pairwise
Jaccard among top-10 competitors at `depth_target` (66), and now raw
unconditioned pairwise overlap across the whole matrix (this cycle).
Combined with row/column marginals being *exactly* uniform (cycle 8,
reconfirmed here), the search has now ruled out heterogeneity at the
1st moment (row/column size — exactly zero, provably) and found
nothing usable at the 2nd moment (pairwise overlap) at three different
conditioning levels. What's left unexplored is either higher-order
structure (3-way+ overlaps, which cycle 8's era already found flat for
raw survivor counts at k=13 pre-DFS — see "Ruled out: pairwise/triple
witness codegree" — though that was a different quantity, survivor
count not bc/ttc decay) or abandoning the "structure of the candidate
set" framing entirely in favor of directly instrumenting where in the
real DFS (not the simplified random-walk reconstruction) the K9/K10
difference actually first appears.

## Next

- (a) The candidate-set-structure line of attack (row marginals,
  pairwise overlap, at both raw and DFS-conditioned levels) now looks
  exhausted for explaining the K9/K10 inversion — four independent
  nulls across cycles 61, 66, and this cycle's two parts. Worth being
  honest that this avenue may not have a clean answer at this level of
  abstraction; the next genuinely new angle is either (i) instrument
  the REAL DFS in `find_cover.h` directly (not the Python
  reconstruction, which cycle 35's own docstring admits doesn't
  reproduce sibling elimination) to see where K9 and K10 actually
  diverge structurally, or (ii) step back from the K9-outlier question
  entirely for a cycle and revisit the target-class-lower-R pattern
  (cycles 34-38), which remains the most-tested, least-explained result
  in the whole project and hasn't been touched since cycle 38.
- (b) Still watching for a new real k=13 `SIEVE_LAYER_DONE` point (none
  since p=349, checked again this cycle) and k=11's compile bug (cycle
  45, unaddressed).
- (c) `tools/_cycle67_rowdensity.py`, `tools/_cycle67_rawpairs.py`,
  `tools/_cycle67_verify.py`, `tools/_cycle67_scan.py` are throwaway
  analysis scripts, not pipeline additions — fine to leave, same
  convention as cycles 65-66.
