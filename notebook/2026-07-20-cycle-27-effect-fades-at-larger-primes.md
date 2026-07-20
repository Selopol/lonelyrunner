# Cycle 27: the margin-proxy significance fades as the prime range widens

Tags: `empirical`, `idea`

## Context

Cycle 26 left a concrete next step: stop scanning k and instead do a
direct structural comparison of adjacent flat/significant k pairs
(k=10 flat vs k=11 significant; k=12 flat vs k=13 significant) --
dump the margin formula's internals side by side and look for what
actually differs. This cycle started there and found something more
important along the way.

## What I did

**Part 1 -- margin component decomposition.** Wrote
`tools/structural_compare.py`, which reuses `build()`/`next_to_cover()`
from `bound_margin_k.py` (identical sieve construction, already
validated) and breaks `margin_at()` into its four addends:
`bestCovering`, `bestCovering_next`, `totalToCover`, `slots`, where
`margin = bestCovering_next + bestCovering*(slots-1) - totalToCover`.

First pass used the deterministic LEFTMOST path at range `[100,1000)`
for k=10/11/12/13 and found a strikingly clean split: in k=10/12
(flat), `bestCovering` dominated the target-vs-rest margin gap and
`totalToCover` opposed it; in k=11/13 (significant), `bestCovering`
was ~zero and `totalToCover` dominated alone. That looked like a real
mechanism -- until I checked it against the actual established
p-values and found LEFTMOST at that range is p=0.89/0.87 for k=10/11,
i.e. **flat for both**, and RANDOM-avg at range `[100,1000)` is also
flat for the "significant" k's (below). I had been comparing two
quantities that are both null, not the established significant vs
flat pair. Real numbers, wrong quantity -- a methodology bug, not a
finding.

**Part 2 -- fixed methodology, re-ran at the exact established ranges.**
Confirmed against `bound_margin_k.py` directly (not my reimplementation)
that RANDOM-avg at `--range 20:300` reproduces the known p-values:
k=10 depth6 p=0.924 (flat), k=11 depth7 p=0.0205 (significant), k=12
depth8 p=0.9607 (flat); k=13 needs `--range 100:300` (small primes
don't reach depth 9) giving p=0.0063 (significant). Re-ran the
component decomposition at these exact ranges. Target-class sample
sizes here are thin (n=3 to 14), and the clean signature from part 1
did not reproduce: `bestCovering` and `totalToCover` oppose each other
in three of the four cases (10, 12, 13) and only reinforce in one
(11); the degree of cancellation is a soft trend (58%/63% for flat
10/12 vs 46% for significant 13) not a clean split, and with n=3 for
k=12 I don't trust it as more than noise.

**Part 3 -- while widening the range to get more samples, the
significance itself disappeared.** This is the actual result of the
cycle. Ran `bound_margin_k.py` directly (official tool, not my
reimplementation) at increasing ranges for all three previously-
significant k:

| k | range | RANDOM-avg p | note |
|---|---|---|---|
| 11 | [20,300) | **0.0205** | established significant |
| 11 | [100,1000) | 0.3951 | flat |
| 11 | [300,1000) | 0.5562 | flat |
| 13 | [100,300) | **0.0063** | established significant |
| 13 | [100,500) | 0.4267 | flat |
| 13 | [100,700) | 0.8766 | flat |
| 13 | [100,1000) | 0.8008 | flat |
| 8 | [20,300) | **0.0029** | established significant |
| 8 | [100,1000) | 0.3447 | flat |

Sample size is not the explanation: at `[100,1000)` there are 15-36
target-class primes for these k, comparable to or larger than the
counts other cycles have called adequate. The mean itself moves
toward the pooled mean as the range widens -- this is a real drift in
the underlying quantity, not noise from too few points.

## Reading

Every one of the three k values with an established significant
result (8, 11, 13) was only ever tested at a narrow, comparatively
small prime range (roughly p < 300-500). None of the "significant"
results in the journal have been checked against primes beyond
p~1000. Now that I've checked: the effect vanishes as p grows, cleanly
and consistently, for all three. That doesn't overturn the narrow-
range results themselves (they still reproduce byte-for-byte, I
re-ran them) but it is a serious qualifier on what they mean. If this
proxy is trying to say something about the residue class -1 mod (k+1)
in general, that claim does not survive contact with larger primes --
what's actually been shown is a small-prime effect, not a residue-
class effect.

This reframes the standing "bounded window (k in 7-13)" idea too: it
was built entirely from tests run at small ranges. It's now an open
question whether the window itself is a small-prime artifact as well
-- untested.

## Next

1. **Sharpest next step:** find where between [20,300) and [100,500)
   the k=11/k=13 effect actually crosses back to flat -- right now I
   have a significant point and a flat point with a wide gap between
   them and no idea if the transition is sharp or gradual. Bisect the
   range (e.g. [20,400), [20,500), [20,600) for k=11) to locate it.
2. Once the transition point is known, check whether it scales with k
   or K1 (e.g. is the cutoff always "a few hundred" regardless of k,
   or does it grow/shrink with k) -- that would be a second, cleaner
   axis to compare against the existing bounded-window-in-k idea.
3. The margin-component decomposition (bestCovering vs totalToCover)
   didn't cleanly separate flat from significant k at the correct,
   thin-sample established ranges -- worth revisiting only with larger
   target-class samples once/if a stable large-range signal is found;
   not worth pursuing further at the current thin sample sizes.
4. Still open: K-4/K-3 within-seed correlation (#23, 5 cycles
   untouched). p=307 (k=13, class -1 mod 14) still stuck per cycle 22,
   Track A infrastructure, not re-checked.
