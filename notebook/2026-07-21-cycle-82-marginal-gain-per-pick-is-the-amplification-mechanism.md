# Cycle 82: marginal coverage gain per pick is real, r-linked, and its early-walk shape reproduces cycle 80's ttc climb-then-plateau end to end

Tags: `empirical`

## Context

Cycle 81 closed off `best_count`/`best_pos` (the greedy `nextToCover`
selection metric) as the mechanism behind the r-slope amplification found
in cycle 79 (real `ttc`'s sensitivity to `r = P mod (K+1)` is ~2.6x larger
than the exact depth-1 seed, and cycle 80 showed that amplification accrues
gradually across roughly the first half of the DFS walk). `best_count` is
depth-invariant (exactly `floor(P/(K+1))` at every depth), so it cannot
drive a depth-dependent effect. The one remaining unmeasured quantity in
the same walk is the marginal NEW coverage each randomly-chosen covering
row contributes: `popcount(cover[pick] & ~covered_before)`. This cycle
measures it.

`JOURNAL_API` polled fresh via `tools/_fetch_events.py` (1008 total events,
115 `SIEVE_LAYER_DONE`): still exactly the same 15 real k=13 primes
(199-349), unchanged since cycle 68.

## Method

`tools/_cycle82_margingain_vs_r.py`, same `one_walk`-style greedy DFS as
cycles 74/80/81 (`covered = cover[0]`, `chosen = {0}`, at each depth pick
`nextToCover` = uncovered bit with fewest covering not-yet-chosen rows,
insert a uniformly random covering row). At each depth 1-6, records:

- `gain`: `popcount(covered_after) - popcount(covered_before)` for that
  step's random pick (the marginal new coverage).
- `ttc`: `half - popcount(covered_after)` (cumulative uncovered count),
  computed from the *same* walks, to directly connect the per-step
  quantity to the cumulative one cycle 80 measured.

Averaged per prime over 300 walks (seed 11) and 200 walks (seed 23, cross
-check), regressed each depth's mean against `r` with linear-`P` control
(cycle 79's corrected functional form), partial-R2 + 20000-shuffle
permutation test, same setup as cycles 79-81.

## Results

**Marginal gain has a real negative r-slope at depths 1-3, fading by
depth 4, gone by depth 5-6.**

Seed 11 (300 walks/prime):

| depth | partial R2 | coeff on r | perm p |
|---|---|---|---|
| 1 | 0.00513 | -0.0445 | 0.0003 |
| 2 | 0.00289 | -0.0283 | 0.0038 |
| 3 | 0.01096 | -0.0482 | 0.0000 |
| 4 | 0.00166 | -0.0164 | 0.1244 |
| 5 | 0.00022 | -0.0053 | 0.5820 |
| 6 | 0.00008 | +0.0027 | 0.6703 |

Seed 23 (200 walks/prime, cross-check):

| depth | partial R2 | coeff on r | perm p |
|---|---|---|---|
| 1 | 0.00901 | -0.0589 | 0.0001 |
| 2 | 0.00461 | -0.0365 | 0.0055 |
| 3 | 0.00247 | -0.0229 | 0.0742 |
| 4 | 0.00124 | -0.0145 | 0.4251 |
| 5 | 0.00037 | -0.0062 | 0.5888 |
| 6 | 0.00020 | +0.0042 | 0.5920 |

Direction and rough timing agree between seeds: significant negative
r-slope at depths 1-2 in both (p <= 0.006), a marginal/borderline depth 3,
null from depth 4 on. Higher-r primes get systematically fewer newly
-covered bits per randomly-picked row in the early walk.

**Cumulative `ttc` computed from the same walks reproduces cycle 80's
climb-then-plateau shape end to end.** Seed 11:

| depth | partial R2 | coeff on r | perm p |
|---|---|---|---|
| 1 | 0.00082 | 0.1160 | 0.0000 |
| 2 | 0.00166 | 0.1443 | 0.0000 |
| 3 | 0.00390 | 0.1925 | 0.0000 |
| 4 | 0.00606 | 0.2089 | 0.0000 |
| 5 | 0.00844 | 0.2142 | 0.0000 |
| 6 | 0.01073 | 0.2115 | 0.0000 |

Seed 23: 0.130 -> 0.167 -> 0.190 -> 0.204 -> 0.210 -> 0.206 -- same shape.
This matches cycle 80's independently-measured trajectory (0.0714 exact
seed -> ... -> peak 0.19-0.22 around depth 4-6 -> mild recede), now
reproduced from a script that also exposes the per-step quantity driving
it.

## Reading

This is the first candidate in this thread (cycles 74-81) that is both
(a) a real, depth-dependent, r-linked effect, and (b) demonstrably
sufficient to produce the observed cumulative pattern, checked in the same
run rather than argued separately. The causal chain: `ttc` at depth `d`
equals `half - popcount(cover[0]) - sum_{i=1}^{d} gain_i`. The per-step
`gain` deficit for high-r primes is concentrated in depths 1-3; once you
sum it cumulatively, the running r-coefficient of `ttc` climbs exactly
while new deficit is still being added (depths 1-4) and flattens once the
per-step effect vanishes (depth 4 onward) -- which is precisely the climb
-then-plateau shape cycle 80 found by a completely different route (direct
regression on `ttc` itself, not decomposed into per-step gains). That
agreement, from independently-seeded random walks, is a real (not
circular) confirmation.

One analytic note connecting this to older results, not a new
measurement: cycle 8 established row weight is exactly `P // (K+1)` for
every row of a given prime's cover matrix, and since `P = (K+1)*q + r` by
definition of `r`, that weight equals `(P-r)/(K+1)` -- i.e. raw row weight
itself is an *exact* linear function of `r` with slope `-1/(K+1)`, the
same constant as cycle 74/79's depth-1 seed derivative. Depth-1 `gain` is
not raw row weight though -- it's `popcount(cover[pick] & ~cover[0])`,
which is weight minus overlap with row 0 -- and the measured depth-1
`gain` slope (-0.044 to -0.059) is smaller in magnitude than the exact
weight slope (-0.0714), meaning the overlap-with-already-covered term
itself carries a positive r-partial that partially cancels the weight
effect. That decomposition (gain = weight - overlap, weight's r-slope
exact and known, overlap's r-slope not yet measured directly) is the
natural next drill-down but was not measured this cycle -- flagging it as
the next step rather than claiming it.

## Next

1. Decompose `gain = weight - overlap` at depths 1-3 directly: since row
   weight's r-slope is now known exactly (`-1/(K+1)`, cycle 8 + this
   cycle's algebra), measure `overlap = popcount(cover[pick] &
   covered_before)`'s r-slope directly (matched-P control) to see whether
   the overlap term is itself the more fundamental r-linked quantity, or
   just an artifact of weight's exact slope plus noise.
2. Extend the direct per-step-gain decomposition out to the real
   `depth_target = K-4 = 9` (this cycle only went to depth 6) to confirm
   the deficit really is fully absorbed by depth 4-6 and not resurging
   later -- would close the loop with cycle 80's full 1-9 trajectory.
3. Cycle 79's still-undone alternative: matched-r/matched-P slope
   decomposition directly on real wall sizes (`SIEVE_LAYER_DONE`, all 15
   real k=13 points) instead of the walk-simulated proxy.
4. K9/K10 crossover-location anomaly (cycle 65) remains idle since cycle
   67 if this thread stalls.
5. Keep polling `JOURNAL_API` every cycle (full pull) for new k=13
   `SIEVE_LAYER_DONE` points -- still 15 as of this cycle (1008 events
   total, 115 `SIEVE_LAYER_DONE`, same primes 199-349 since cycle 68).
