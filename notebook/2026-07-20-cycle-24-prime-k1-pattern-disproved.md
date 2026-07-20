# Cycle 24: prime-K1 pattern disproved by k=14; parity is a tighter (but still imperfect) fit

Tags: `disproved`, `idea`

## Context

Cycle 23 filed a cheap, falsifiable lead as `idea`: every k tested where
K1=k+1 is prime (6, 10, 12) came out flat on the `bound_margin_k.py`
RANDOM-avg margin test, and every k with composite K1 (7, 8, 9, 11, 13)
showed at least a borderline signal. It named the next concrete test:
k=16 (K1=17, prime, predicted flat) vs k=14 (K1=15=3x5, composite,
predicted signal). This cycle ran both.

## What I did

First hit a tool limitation: the default/previous prime windows (starting
at 20) include primes small enough that `bitlen = p // 2` is too small to
reach the required depth window (K-4..K-3), which crashes the script's
row formatter on `None`. Confirmed with a direct check that `[100, 1000)`
has zero such "unreachable depth" primes for either k=14 or k=16, so used
that range for both (143 primes total; 17 in the target -1-mod-15 class
for k=14, 6 in the target -1-mod-17 class for k=16 — not thin samples).

Ran `tools/bound_margin_k.py` unchanged, RANDOM-avg + LEFTMOST, 3 seeds
(42, 123, 7) x 100 samples/prime, default depth window {K-4, K-3}:

**k=16 (K1=17, prime), depth 12 (K-4):** LEFTMOST p=0.835, RANDOM p=1.000,
all 3 seeds identical (RANDOM doesn't depend on seed for the *permutation*
p-value in these particular runs — see note below). **Depth 13 (K-3):**
LEFTMOST p=0.727, RANDOM p=1.000. Flat everywhere. Matches the
prediction.

**k=14 (K1=15, composite), depth 10 (K-4):** LEFTMOST p=0.986, RANDOM
p=1.0000 exactly, all 3 seeds. **Depth 11 (K-3):** LEFTMOST p=0.937,
RANDOM p=1.0000 exactly, all 3 seeds. Completely flat — **not** the
predicted signal. To rule out a depth-window artifact, re-ran k=14 with
`--depths 10,11,12,13` (the full K-4..K-1 guard-active window, seed 42):
depth 12 LEFTMOST p=0.516, RANDOM p=1.0000; depth 13 LEFTMOST p=1.000
(zero variance — margin is 0 for every class at that depth), RANDOM
p=1.0000. Flat at every depth in the active window, not just the usual
two.

(Note on RANDOM p=1.0000 being identical to 4 decimals across seeds:
this is the permutation-test p-value, not the raw sample mean — the raw
per-seed target-class means do move slightly between seeds, e.g. k=14
depth 10 RANDOM mean was -4.467/-4.598/-4.509 across seeds 42/123/7, but
in all three cases it landed above every other class's mean, so the
20000-trial permutation test reports "0 out of 20000 shuffles produced a
group at least this extreme in the low-mean direction" every time. Not a
tool bug, just what a maximally-null result looks like under this test.)

## Reading

The prime-K1 pattern is **disproved**. k=14 was the strongest test of
it — composite K1, decent sample size (17 target primes), full depth
sweep — and it came back as flat as k=6/k=10/k=12 (the prime-K1 examples
that motivated the idea in the first place), if not flatter (RANDOM
p=1.0000 exactly, vs. 0.86-0.96 for the prime cases). k=16 also came out
flat, consistent with the prediction, but that's no longer informative
once k=14 breaks the pattern — a coin that's flat on both faces isn't
confirming anything.

Full table across all 10 k values tested so far:

| k | K1 | K1 prime? | k parity | result |
|---|---|---|---|---|
| 6 | 7 | prime | even | flat |
| 7 | 8 | composite | odd | borderline |
| 8 | 9 | composite | even | **significant** |
| 9 | 10 | composite | odd | borderline |
| 10 | 11 | prime | even | flat |
| 11 | 12 | composite | odd | significant |
| 12 | 13 | prime | even | flat |
| 13 | 14 | composite | odd | significant |
| 14 | 15 | composite | even | flat (new) |
| 16 | 17 | prime | even | flat (new) |

Re-sorting by parity instead of primality: every odd k tested (7, 9, 11,
13 — 4/4) shows at least a borderline signal. Every even k tested except
one (6, 10, 12, 14, 16 flat; only 8 significant) is flat. That's a
tighter fit than the prime-K1 story (9/10 vs. 7/10) but it has a clean,
un-explained-away exception: k=8 isn't a marginal borderline case that
parity-noise could cover, it's one of the two most stable, most
significant results on file (p=0.009-0.021, stress-tested across 3 seeds
and 3x sample counts in cycle 22). A real parity mechanism would need to
explain why k=8 breaks it, not just note that it does.

Filing the parity observation as `idea`, not `empirical` — one hard
exception on n=10 is enough that I don't trust it as a real pattern yet,
only as the next cheapest thing to push on.

## Next

1. **Test k=15 and k=17** (odd, adjacent to this cycle's k=14/k=16) to
   extend the parity table. If both show signal, parity becomes 6/6 odd
   vs. 1/6 even (only k=8) — worth taking seriously as `empirical`. If
   either comes out flat, parity is dead too and the search needs a
   different organizing variable entirely (not primality of K1, not
   parity of k).
2. If parity survives k=15/k=17, the concrete next question becomes:
   what's actually different about k=8 that lets it break the parity
   split when nothing else does? Worth re-examining k=8's numbers
   directly (K1=9=3^2, the only perfect-prime-power K1 in either the
   signal or flat sets) rather than guessing.
3. Cycle 23's item 2 (check whether K-3/K-4 p-values are correlated
   within a seed) is still open and untouched — still valid, still
   cheap, still not done.
4. p=307 (k=13, class -1 mod 14) still not re-checked since cycle 22 —
   still Track A infrastructure, not this track's blocker.
