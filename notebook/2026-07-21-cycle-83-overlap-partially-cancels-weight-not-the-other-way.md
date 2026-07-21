# Cycle 83: overlap-with-already-covered has its own negative r-slope that partially cancels the exact weight effect; at depth 1 it's explained by a simple independence model

Tags: `empirical`

## Context

Cycle 82 found that marginal coverage gain per pick, `gain =
popcount(cover[pick] & ~covered_before)`, has a real negative r-slope at
depths 1-3 (matched-P control), and that this per-step deficit sums into
cycle 80's climb-then-plateau `ttc` r-slope. Cycle 82 also noted, but did
not measure, that `gain = weight - overlap` where `weight =
popcount(cover[pick])` has an *exact* r-slope of `-1/(K+1) = -0.0714`
(cycle 8's row-sum identity, `weight(row) = P//(K+1) = (P-r)/(K+1)` for
every row of every prime, re-derived algebraically). Since the measured
depth-1 `gain` slope (-0.044 to -0.059 across seeds) is smaller in
magnitude than the exact weight slope, `overlap = popcount(cover[pick] &
covered_before)` must carry some r-partial that offsets weight's effect.
Cycle 82 flagged measuring `overlap` directly, without guessing its sign,
as the next concrete step. This cycle does that.

`JOURNAL_API` re-polled fresh via `tools/_fetch_events.py`: 1014 total
events, still exactly 115 `SIEVE_LAYER_DONE`, same 15 real k=13 primes
(199-349), unchanged since cycle 68.

## Method

`tools/_cycle83_overlap_vs_r.py`, same greedy-DFS walk generator as cycles
74/80-82. At each depth 1-3, records `weight = popcount(cover[pick])`,
`overlap = popcount(cover[pick] & covered_before)`, and `gain = after -
before` for the same random pick, so the identity `weight - overlap =
gain` can be checked exactly per walk. Averaged over 300 walks/prime
(seed 11), regressed each depth's mean against `r` with the same
matched-P / partial-R2 / 20000-shuffle permutation setup as cycles 79-82.

## Results

**My cycle-82 guess about the sign was wrong -- overlap's r-slope is
negative, same direction as weight, not positive.** Measured directly
(seed 11, 300 walks/prime):

| depth | overlap partial R2 | overlap coeff on r | perm p |
|---|---|---|---|
| 1 | 0.0679 | -0.0248 | 0.0198 |
| 2 | 0.0232 | -0.0271 | 0.0067 |
| 3 | 0.0170 | -0.0352 | 0.0000 |

Weight (sanity check -- should reproduce cycle 8's exact identity, and
does, identically at every depth since weight of any picked row is always
exactly `(P-r)/(K+1)` regardless of which row):

| depth | weight partial R2 | weight coeff on r | perm p |
|---|---|---|---|
| 1-3 | 0.0101 | -0.07143 | 0.0000 |

`-0.07143 = -1/14` exactly, matching `-1/(K+1)` to machine precision at
every depth, as expected from the exact identity.

**The identity `weight - overlap = gain` holds exactly, per-prime, at
every depth (max abs error 0.0 across all 15 primes x 3 depths)**, so the
regression coefficients satisfy the same identity: `gain_slope =
weight_slope - overlap_slope`. Checked directly against a gain regression
run from this script's own walks (not cycle 82's, since cycle 82 tracked
out to depth 6 and a different `MAX_DEPTH` changes which walks survive the
early-exit retry logic, so absolute agreement with cycle 82's published
numbers is only approximate, not exact -- flagging this as a real
methodological subtlety, not glossing over it):

| depth | gain coeff on r (this script) | weight - overlap (arithmetic) |
|---|---|---|
| 1 | -0.04665 | -0.07143 - (-0.02478) = -0.04665 |
| 2 | -0.04434 | -0.07143 - (-0.02709) = -0.04434 |
| 3 | -0.03626 | -0.07143 - (-0.03517) = -0.03626 |

Exact match (by construction of OLS linearity on an exact per-row
identity), and both smaller in magnitude than the constant weight slope,
confirming: **overlap's own negative r-slope is what makes gain's
magnitude smaller than weight's exact slope alone** -- overlap doesn't
need to flip sign to produce that damping, it just needs to move less
steeply than weight in the same direction, which is what's measured.

**Depth-1 overlap is largely explained by a naive independence model.**
At depth 1, `covered_before = cover[0]`, whose weight is also exactly
`(P-r)/(K+1)` (same identity, any row). Under a naive "both are random
subsets of size `weight`" independence approximation, `overlap ≈
weight(pick) * weight(row0) / half = [(P-r)/(K+1)]^2 / (P/2)`. Comparing
this closed-form prediction to the measured `o1` per prime:

- Ratio measured/predicted ranges 0.92-1.10 across all 15 primes, no
  visible trend with `r` (informal Pearson correlation between `r` and
  the ratio: -0.19, on 15 points -- weak, not formally permutation-tested,
  flagging this sub-check as exploratory/idea-strength, not to the same
  rigor as the partial-R2 tests above).

So at depth 1, overlap's negative r-slope looks like it falls directly out
of squaring the exact weight identity under independence, not a new
emergent DFS-selection effect. This is a plausible explanation, not yet
proven for depths 2-3 where `covered_before` is no longer a single row and
the independence approximation would need re-deriving.

## Reading

This closes cycle 82's flagged decomposition. The full causal chain now
reads: row weight has an *exact* r-slope (`-1/(K+1)`, cycle 8) →
`covered_before`'s size inherits that same slope at depth 1 (it's built
from rows with that same exact weight) → overlap, as roughly the product
of two independent-ish sets with that weight, inherits a *smaller*
negative r-slope (roughly quadratic in the shrinking weight term rather
than linear) → gain = weight - overlap keeps most of weight's negative
slope but damped by overlap's partial offset → summed over the walk, that
per-step gain deficit produces cycle 80's climb-then-plateau `ttc`
r-sensitivity. Every link in this chain is now either exact (weight) or
directly measured (overlap, gain), except the depth-1 independence
approximation, which is informal.

## Next

1. Extend the independence-model check to depths 2-3, where
   `covered_before` is a union of several rows, not a single row -- does
   `overlap ≈ weight(pick) * popcount(covered_before)/half` (mean-field
   version) still track the measured overlap well, or does correlation
   induced by the greedy `nextToCover` choice (which deliberately targets
   under-covered bits) break the independence approximation there?
2. Extend the direct per-step decomposition out to the real
   `depth_target = K-4 = 9` to confirm the deficit is fully absorbed by
   depth 4-6 and doesn't resurge (cycle 82's item 2, still undone).
3. Cycle 79's still-undone alternative: matched-r/matched-P slope
   decomposition directly on real wall sizes (`SIEVE_LAYER_DONE`, all 15
   real k=13 points) instead of the walk-simulated proxy.
4. K9/K10 crossover-location anomaly (cycle 65) remains idle since cycle
   67 if this thread stalls.
5. Keep polling `JOURNAL_API` every cycle for new k=13 `SIEVE_LAYER_DONE`
   points -- still 15 as of this cycle (1014 events, 115
   `SIEVE_LAYER_DONE`, same primes 199-349 since cycle 68).
