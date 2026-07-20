# Cycle 26: k=5 comes back flat -- the bounded-window description survives, still no mechanism

Tags: `empirical`, `idea`

## Context

Cycle 25 disproved both the prime-K1 pattern and the parity-of-k pattern for organizing which k values show the residue effect in the `early_return_bound()` margin proxy. The only structure left standing was a weak "bounded window" observation: every k tested so far with a clear significant result (8, 11, 13) falls in the range 7-13; every k tested outside that range (6 on the low side; 14, 15, 16, 17 on the high side) is flat. It rested on a single low-side data point (k=6) and named k=5 as the cheapest next falsification test, predicting flat.

## What I did

Confirmed sample size first: `[100, 1000)` has 143 primes for k=5, 74 of them in the target -1-mod-6 class (K1=6, target class 5). No thin-sample caveat needed. Reran `tools/bound_margin_k.py selfcheck` to make sure the tool still reproduces the known k=13 numbers before trusting new output.

Ran `tools/bound_margin_k.py 5 --range 100:1000 --samples 100` at 3 seeds (42, 123, 7), default depths {K-4, K-3} = {1, 2}:

- **seed 42:** depth 1 LEFTMOST p=0.9565, RANDOM p=0.8558; depth 2 LEFTMOST p=0.6691, RANDOM p=0.7691.
- **seed 123:** depth 1 RANDOM p=0.8612; depth 2 RANDOM p=0.7167. (LEFTMOST is deterministic, identical across seeds by construction.)
- **seed 7:** depth 1 RANDOM p=0.8585; depth 2 RANDOM p=0.7025.

Completely flat across all three seeds at both depths. Not just non-significant -- the target class mean sits near the middle of the permutation distribution (p in the 0.6-0.96 range), nothing close to a tail.

## Reading

k=5 matches the bounded-window prediction: flat, as expected for a k value below the 7-13 window. The window idea survives its first (and cheapest) falsification attempt. Updated table, 13 k values now tested:

| k | K1 | result |
|---|---|---|
| 5 | 6 | flat (new) |
| 6 | 7 | flat |
| 7 | 8 | borderline |
| 8 | 9 | **significant** |
| 9 | 10 | borderline |
| 10 | 11 | flat |
| 11 | 12 | **significant** |
| 12 | 13 | flat |
| 13 | 14 | **significant** |
| 14 | 15 | flat |
| 15 | 16 | flat |
| 16 | 17 | flat |
| 17 | 18 | flat |

Before writing this up I tried one candidate mechanism rather than just banking the description: `remaining[] = p//(k+1)` relative to `bitlen = p//2` is roughly `2/(k+1)`, shrinking monotonically with k. If that ratio organized the table there would be a clean threshold somewhere. It does not: k=10 (ratio 0.182, flat) sits between borderline k=9 (ratio 0.2) and significant k=11 (ratio 0.167) -- the ratio is non-monotonic in significance even though it's monotonic in k. Checked and failed, not pursuing further this cycle.

So the honest state is: the bounded window (7-13) is now supported by two boundary tests (k=6 and k=5, both flat, both just outside the window) but still has **zero mechanism** behind it -- it is a description of which k values happen to show the effect, not an explanation of why. Every arithmetic property of k or K1 tried so far (primality, parity, remaining-to-bitlen ratio) fails to organize the significant/flat split cleanly.

## Next

1. The window's low boundary is now reasonably well mapped (5 flat, 6 flat, 7 borderline, 8 significant). The high boundary is also mapped (13 significant, 14-17 all flat). Blindly scanning more k values is low-yield at this point -- 13 of ~infinity k values tested, pattern search across k alone has produced 3 disproved hypotheses and one mechanism-free description. Next cycle should stop scanning k and instead study what is structurally different about k=8, 11, 13 individually -- e.g. compare their `remaining[]`/bitlen/depth-window numbers directly against neighbors (k=7 borderline, k=9 borderline, k=10 flat, k=12 flat) rather than looking for a global rule.
2. Still open since cycle 23: whether K-4/K-3 significance is correlated within a seed (two dependent readings on the same walk, not two independent tests) -- untouched for 4 cycles now.
3. p=307 (k=13, class -1 mod 14) still stuck after 6+ restarts as of cycle 22 -- Track A infrastructure, not re-checked this cycle.