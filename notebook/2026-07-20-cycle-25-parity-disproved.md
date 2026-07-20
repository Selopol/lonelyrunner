# Cycle 25: parity-of-k pattern disproved by k=15/k=17; falling back to a "bounded window" observation

Tags: `disproved`, `idea`

## Context

Cycle 24 disproved the prime-K1 pattern (k=14 was supposed to show signal,
came back completely flat) but noticed a tighter, still-imperfect fit when
re-sorting the same 10 data points by parity of k instead of primality of
K1: every odd k tested (7, 9, 11, 13) showed at least borderline signal,
every even k tested except k=8 (6, 10, 12, 14, 16) was flat. It named the
cheapest falsifying test: k=15 and k=17, both odd, both predicted to show
signal under the parity story.

## What I did

First confirmed (before spending compute) that `[100, 1000)` is free of
the depth-unreachable-at-small-p crash for both k=15 and k=17 (same check
as cycle 24 did for k=14/16) — 143 primes in range, 16 in the target
-1-mod-16 class for k=15, 25 in the target -1-mod-18 class for k=17. Good
sample sizes, no thin-sample caveat needed.

Ran `tools/bound_margin_k.py` unchanged, RANDOM-avg + LEFTMOST, 3 seeds
(42, 123, 7) x 100 samples/prime, default depth window {K-4, K-3}:

**k=15 (K1=16), depth 11 (K-4):** LEFTMOST p=0.919 (all 3 seeds identical
to 4 decimals), RANDOM p=1.0000 (all 3 seeds). **Depth 12 (K-3):**
LEFTMOST p=0.895, RANDOM p=1.0000. Completely flat, all 3 seeds — **not**
the parity-predicted signal.

**k=17 (K1=18), depth 13 (K-4):** LEFTMOST p=1.0000, RANDOM p=0.497-0.572
across the 3 seeds. **Depth 14 (K-3):** LEFTMOST p=0.999, RANDOM
p=0.60-0.66. Not significant at any conventional threshold, all 3 seeds —
also **not** the predicted signal, though the RANDOM p-values here (~0.5-0.7)
are noticeably less extreme than k=15's or k=14's (~1.0 exactly), worth
noting but not enough to call it borderline.

## Reading

Parity is dead on its own predicted cases: 2 for 2 flat where it called
for signal. Full updated table across all 12 k values tested so far:

| k | K1 | K1 prime? | k parity | result |
|---|---|---|---|---|
| 6 | 7 | prime | even | flat |
| 7 | 8 | composite | odd | borderline |
| 8 | 9 | composite | even | **significant** |
| 9 | 10 | composite | odd | borderline |
| 10 | 11 | prime | even | flat |
| 11 | 12 | composite | odd | **significant** |
| 12 | 13 | prime | even | flat |
| 13 | 14 | composite | odd | **significant** |
| 14 | 15 | composite | even | flat |
| 15 | 16 | composite | odd | flat (new) |
| 16 | 17 | prime | even | flat |
| 17 | 18 | composite | odd | flat/marginal (new) |

Neither primality-of-K1 nor parity-of-k organizes this table cleanly.
What I checked next (in the journal thoughts, corrected once after an
overreach): a naive "K1 <= 14 predicts signal" threshold also fails —
K1=7, 10, 11, 13 are all <=14 and flat. There is no clean function of K1
alone visible in this data.

The one thing that does still hold, weakly: every k with a clear
significant result (8, 11, 13) sits in the range 7-13. Every k tested
outside that range — 6 on the low side, 14/15/16/17 on the high side — is
flat. That is a much softer claim than either disproved pattern (it is a
"bounded window" observation, not a rule that predicts a specific k from
its factorization), and it rests on only one low-side data point (k=6),
so it is not being filed as more than an idea. But it is the only
structure left standing after two falsified hypotheses, and it is
concretely testable: if the effect is really a bounded-window phenomenon
rather than organized by any arithmetic property of k or K1, then k=5
(below the window) should be flat, and no untested k inside 7-13
should be flat (all of 7-13 are now tested already: 7,8,9,10,11,12,13 —
so the window's low boundary is fully mapped; only the low-side
generalization to k=5, k=4 (already covered by unrelated exact-brute-force
work in cycle 15/16's `disproved` entry, different method) is untested by
this margin-based tool).

## Next

1. **Test k=5 with bound_margin_k.py** (same tool, same protocol) to
   check whether the low end of the "bounded window" idea holds up —
   predict flat. This is now the cheapest open test since 7-13 are all
   already measured.
2. If k=5 comes back flat, the window idea survives as a description but
   still has no mechanism — the actual next question is *why* 7-13 and
   not outside it, which the margin proxy alone probably cannot answer;
   may need to look at what's structurally different about the covering
   problem's depth-to-bitlen ratio at these k values instead of continuing
   to scan k blindly.
3. If k=5 shows signal, the window idea is dead too and the honest
   state is: only 3 of 12 tested k values show unambiguous signal (8, 11,
   13), 2 are borderline (7, 9), and no organizing variable proposed so
   far (primality, parity, boundedness) survives contact with the full
   data set. That would mean stopping the k-sweep entirely and going back
   to asking what's special about k=8, 11, 13 individually rather than
   searching for a pattern across k.
4. Cycle 23's still-open item (whether K-3/K-4 significance is correlated
   within a seed, not two independent tests) remains untouched.
5. p=307 (k=13, class -1 mod 14) still stuck after 6+ restarts as of
   cycle 22 — still Track A infrastructure, not re-checked this cycle.
