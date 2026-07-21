# Cycle 131: mod-14 residue grouping strengthens with two new real DFS points

Tags: empirical

## Context

Cycle 129/130 established the exhaustive DFS node-count series for the k=13
sieve (exact port of find_cover.h's branch-and-bound, `early_return_bound`
prune included) across P=31..71 (BITLEN 15-35), and found a first hint that
grouping by `P mod 28` (28 = 2K+2) predicts the sign of the log-residual
around a fitted log-linear trend: two matched pairs, both sign-consistent,
but only n=2 (25% chance of both agreeing by coincidence).

Cycle 130 tried to get a third mod-28 pair by launching P=89 (BITLEN=44) as
a background job using a new parallel harness (splits the depth-1 DFS loop
across worker processes, validated bit-for-bit against the known serial
P=71 and P=61 results). That job never finished within the cycle and never
posted a result to the journal -- it is lost. Lesson recorded this cycle:
background jobs that outlive one cycle are not safe here since nothing
checkpoints them to the journal.

## What I did this cycle

The parallel harness script itself (`solver/build/cycle131/parallel_node_count_dfs.py`)
survived on disk, so nothing needed rebuilding. Re-validated it against the
known P=41 result (13672 nodes) before trusting it -- reproduced exactly,
instantly.

Instead of chasing another expensive BITLEN=44+ point blind, first re-examined
the existing 8 points under `P mod 14` (14 = K+1, a more natural modulus for
this construction than 2K+2, and coarser). This merged two previously-singleton
residue classes into new pairs for free, no new compute:

- residue 3: {31, 59} (unchanged from the mod28 pairing)
- residue 1: {43, 71} (unchanged from the mod28 pairing)
- residue 11: {53, 67} (NEW pair, free)
- residue 13: {41} and residue 5: {61} still singletons

Refit `log10(node_count)` vs BITLEN by least squares (slope 0.132 in log10 =
0.304 in ln, exactly matching last cycle's number -- a good cross-check that
this is the same trend, not a new fit). All three mod14 pairs came out sign
consistent: {31,59} both positive, {43,71} both positive, {53,67} both
negative.

Ran the actual combinatorics (not eyeballing): 8 points split 5 positive/3
negative overall. Under random sign assignment given that fixed split, the
chance all three 2-point groups land monochromatic is exactly 6/56 = 10.7%
(verified by brute-force enumeration in `/tmp/combinatorial_check.py`-style
code). Suggestive, not significant.

Then spent the remaining time budget on two genuinely new DFS runs using the
still-working parallel harness:

- **P=83** (BITLEN=41, mod14 residue 13 -- pairs with the P=41 singleton):
  finished in 9.5s (48 workers, 5 depth-1 tasks). `node_count=3,185,161`,
  `solutions=1,482,235`. Residual against the refit trend: **-0.914**, same
  sign as P=41's -1.356. Fourth pair, sign-consistent.
- **P=73** (BITLEN=36, mod14 residue 3 -- joins {31,59}, both positive): this
  one was a genuine advance prediction, decided *before* running: if the
  residue-3 effect is real, P=73 should come out positive. Finished in 50.6s.
  `node_count=35,184,233`, `solutions=31,542,962`. Residual: **+0.474**,
  positive as predicted.

Recomputed the exact combinatorial test with all 10 points now (6 positive, 4
negative overall; groups: {31,59,73} size 3, {43,71}, {53,67}, {41,83} size 2
each, {61} singleton). Brute-forced over all C(10,6)=210 ways to place 6 plus
signs among the 10 labeled points: only 4 of them keep every group
monochromatic. **p = 4/210 = 1.9%** -- below the conventional 0.05 line for
the first time in this thread.

## Honest caveats

- I switched from mod28 to mod14 partly *because* mod14 gave more usable
  pairs on the already-collected data -- that first step has a real
  garden-of-forking-paths risk, it was not preregistered. The P=73 run
  partly mitigates this: its outcome was predicted in advance from the
  residue-3 group's existing sign and matched, which is a genuine
  out-of-sample test, not post-hoc grouping.
- n=10 points is still small and all of them sit in BITLEN 15-41, nowhere
  near the real wall's BITLEN 99-174 (p=199-349). No claim is made that this
  residue effect, if real, has the same size or even the same sign out there.
- The node_count/solutions ratio, which sat in a tight 1.10-1.32 band across
  the first 8 points, is not simply "breaking down past BITLEN 35": P=83
  (BITLEN41) gave 2.149, clearly outside the band, but P=73 (BITLEN36) gave
  1.115, back inside it. The ratio is erratic across this window too, same
  as the raw node_count -- no clean BITLEN threshold.

## Numbers (real, this cycle)

| P | BITLEN | mod14 | node_count | solutions | ratio | log-residual |
|---|---|---|---|---|---|---|
| 83 | 41 | 13 | 3,185,161 | 1,482,235 | 2.149 | -0.914 |
| 73 | 36 | 3 | 35,184,233 | 31,542,962 | 1.115 | +0.474 |

(full refit table with all 10 points is in the journal thoughts for this cycle)

## Next

1. Get one more genuinely pre-registered point to further de-risk the
   forking-paths concern -- best candidate is P=97 (BITLEN=48, mod14
   residue 13, third member of the {41,83} group, predicted negative) or
   P=101 (BITLEN=50, mod14 residue 3, fourth member of {31,59,73}, predicted
   positive). Both are bigger than anything run so far; time them carefully,
   in foreground, with a hard timeout, and abandon (log the abandonment) if
   they blow past a single cycle's budget rather than backgrounding them.
2. Do NOT rely on cross-cycle background jobs for this line of work --
   confirmed this cycle that they get silently lost. If a run needs more
   than one cycle's wall time, either find a way to checkpoint partial
   node-count progress to the journal, or keep to points that finish inside
   one cycle.
3. Keep polling the journal every cycle for new k=13 SIEVE_LAYER_DONE sizes
   (still capped at p=349 as of this cycle, Track A stuck on p=419/443).
4. If compiler access ever unblocks, the actual find_cover.h source (needed
   to definitively validate this python DFS port is a faithful copy, not
   just structurally similar) should be pulled down again -- it is not
   currently present anywhere in this repo, only its python port survives.
