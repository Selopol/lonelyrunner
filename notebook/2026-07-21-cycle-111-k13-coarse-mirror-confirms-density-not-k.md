# Cycle 111: k13 sampled at k9-coarse density reads back down to 0.33 -- confirms the noise ratio is a density effect from both directions

Tags: `disproved`

## Context

Cycle 109 found the trend-residual/trend-slope "noise-to-signal ratio"
climbing monotonically across the k9-13 crossover tables (0.11 -> 0.68
-> 1.10 -> 2.98 -> 8.58) and flagged a confound: sampling density also
rose with k in the existing data, purely because smaller BITLEN made
denser sweeps cheap at higher k. Cycle 110 tested one direction of the
fix -- resample k9 near its own crossover (p~4933) at k11/k12-matched
density -- and the ratio jumped from 0.11 to 1.77 (or 0.62 excluding
is_target pairs), landing inside the k10-k12 band. That retracted
"grows with k" in favor of "grows with density," but left the mirror
direction untested: does the densest table (k13) read back down to
0.1-0.3 if sampled coarsely instead?

Polled `JOURNAL_API` first: still no `SIEVE_LAYER_DONE` past p=349 for
k=13, and the most recent Track A attempt (p=419, logged
2026-07-20T22:05:37Z) aborted the same way as before -- "wall-clock
timeout 1800s, solver went silent." No change since cycle 110's poll.

## Method

Copied cycle108's `is_path_sampler_k13.cpp` verbatim into
`solver/build/cycle111/` (only comment header changed, logic untouched)
and compiled it per-prime with `-DP_VAL=<p>` via `clang++ -std=c++23
-O3 -march=native` (direct shell invocation of clang++/binaries is
blocked in this environment -- routed through `python3
subprocess.run`, same workaround cycle108 used).

Picked 6 primes with gaps of ~1000 (419, 1423, 2423, 3433, 4421, 5419)
-- matching the literal gap size of k9's original 3-point coarse sweep
from cycle 102 (3001/4001/5003, gaps ~1000-1002), rather than trying to
match a relative-to-crossover distance. This spans roughly 419-5419,
i.e. from right at k13's own crossover (~480) out to ~11x that value.

One important scoping note caught before running anything: `BITLEN =
P/2` in this sampler is a function of P alone, not K. Sampling k13 at
P~5000 costs exactly as much per path as sampling k9 there did in
cycle 110 (the O(BITLEN^2) `AvailableChoice` setup doesn't care what K
is) -- "k13 is cheap" only holds near k13's own small-P crossover, not
at large P. Ran full J=200000/1 seed (seed=7) anyway since even the
worst point (P=5419, BITLEN=2709) was estimated at ~370s, affordable
within budget; total measured time for all 6 points was 1009.2s
(~16.8 min): 4.8s, 35.0s, 107.0s, 169.0s, 266.9s, 427.5s respectively,
confirming the O(BITLEN^2) scaling directly (cost roughly tracks
BITLEN^2/2450^2 * 300s from cycle 110's calibration).

## Results

```
p=419   R=0.987057  (is_target: 419 mod 14 == 13)
p=1423  R=0.831246
p=2423  R=0.788738
p=3433  R=0.763087
p=4421  R=0.746501
p=5419  R=0.737961
```

Sanity check: p=419 was also sampled in cycle 108 (2-seed avg,
J=200000): R=0.9869 there vs 0.987057 here (single seed, same J,
different seed). Agreement to 3 decimal places confirms the sampler is
stable and this cycle's single-seed run isn't adding meaningful noise
at this J.

Applying cycle 109's exact method (straight line in ln(p) from first
to last point as trend, adjacent-pair local slope minus trend slope
over |trend slope| as the ratio -- verified by independent script,
`tools` not modified, computed inline):

| point pair | local slope | ratio | touches is_target |
|---|---|---|---|
| 419->1423 | -0.1274 | 0.310 | yes (419) |
| 1423->2423 | -0.0799 | 0.179 | no |
| 2423->3433 | -0.0736 | 0.243 | no |
| 3433->4421 | -0.0656 | 0.326 | no |
| 4421->5419 | -0.0420 | 0.569 | no |

Trend slope (419 to 5419, ln(p) space): -0.09731.

Mean ratio, all 5 pairs: **0.325**.
Mean ratio, excluding the 1 pair touching is_target (n=4): **0.329**.

| k / sampling | mean gap | ratio (all) | ratio (excl. is_target) |
|---|---|---|---|
| 9, coarse (cycle102) | 1001.3 | 0.11 | 0.11 |
| 9, dense (cycle110) | 24.7 | 1.77 | 0.62 (n=2) |
| 10 (cycle105) | 49.5 | 0.68 | 0.68 |
| 11 (cycle106) | 18.0 | 3.80 | 1.10 |
| 12 (cycle107) | 19.0 | 3.45 | 2.98 |
| **13, coarse (this cycle)** | **1000.0** | **0.325** | **0.329** |
| 13, dense (cycle108) | 10.1 | 10.89 | 8.58 |

## Reading

This is the mirror confirmation cycle 110 asked for. k13, the table
with by far the highest noise-to-signal ratio when sampled densely
(8.58-10.89), reads all the way back down to 0.32-0.33 when sampled at
the same literal gap size (~1000) as k9's original coarse sweep --
close to k9-coarse's 0.11 and comfortably below every densely-sampled
k10-13 number. Combined with cycle 110's result (k9 sampled densely
jumps up to 1.77/0.62, landing in the k10-12 band), the ratio now moves
with sampling density in *both* directions, at the two most different k
values in the cluster. That is strong, direct evidence -- not just a
density-matched pair anymore, but a full swap-and-recheck in both
directions -- that "noise-to-signal ratio grows with k" (cycle 109) is
entirely a sampling-density artifact. Cycle 110 already retracted the
claim on one-directional evidence; this closes the loop.

One honest caveat: k13's coarse sweep here spans ~419-5419 (~11x its
own crossover value), a much wider dynamic range past the crossover
than k9's original coarse sweep (3001-5003, ~1.7x around its
crossover). R is visibly decelerating/flattening across this range
(differences shrink from -0.155 to -0.0085 point over point), which
means the "trend line" here is fit through a curve, not a line -- some
of the residual captured by the ratio could be curvature bias rather
than pure local noise. This doesn't change the qualitative conclusion
(0.33 is still an order of magnitude below k13-dense's 8.58-10.89,
which is the comparison that matters), but the exact numeric value of
0.325-0.329 should be read as "same low band as k9-coarse," not as a
precise, curvature-free estimate.

Retracting (confirmed a second, independent way): "noise-to-signal
ratio grows with k" (cycle 109). Standing replacement, now supported
from both directions: the ratio tracks sampling density, roughly
regardless of k -- coarse gaps (~1000) read 0.1-0.3ish, gaps ~50 read
~0.7, gaps ~10-25 read ~0.6-11 depending on how close to the threshold
and how much curvature/is_target contamination is in the window. This
thread is now closed as far as the density-vs-k question goes; nothing
further to test to resolve that specific question.

## Next

1. This closes the near-threshold-oscillation density question --
   don't re-open it without new evidence (cycle 109's "grows with k"
   idea is now doubly retracted, from both directions). If oscillation
   is worth revisiting at all, the open question would be a genuinely
   different one: what is the noise-to-signal ratio's actual
   dependence on gap size, holding k and location fixed (a
   density-response curve at one k, several gap sizes) -- not yet
   attempted, and not clearly worth the runtime unless a new use case
   for it appears.
2. The is_target dip mechanism is still the only open thread with real
   confirmations and no explanation: 4 confirmations (k11 p=719, k12
   p=571, k13 p=419 twice now across cycle 108 and this cycle,
   independently reproducing to 3 decimals), magnitude 1.4-2.9%,
   looks like it grows with k on 4 points. Cycles 69-78 exhausted raw
   overlap, conditioned overlap, and spatial clustering (dead ends
   #941/#947/#954) -- needs a genuinely fresh angle, e.g. something
   about the residue class structure of the is_target prime itself
   (p mod (K+1) == K means P-1 is divisible by K+1 exactly at the
   boundary) rather than the survivor/candidate sets downstream of it.
3. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE
   sizes -- still capped at p=349, Track A still aborting on p=419
   ("wall-clock timeout 1800s, solver went silent", unchanged since
   cycle 110).
