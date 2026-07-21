# Cycle 77: spatial clustering of nextC finally shows a real (if modest) r effect

Tags: `empirical`

## Context

Cycle 76 left one framing untested: cycle 73's spatial-clustering-of-`nextC`
statistic, redone against continuous `r = p mod (K+1)` (cycle 74) instead of
binary `is_target`. Cycle 76 also established the key methodological
constraint for reusing it: at `N_SAMPLES=60` (what cycles 66/72/73 all used),
`avg_top_jaccard`-style DFS-walk statistics are not seed-stable -- partial R2
swings 0.0001-0.22 and even flips sign across seeds. Any reuse needs
`N_SAMPLES>=500`, pooled across multiple seeds, before trusting a regression.

Checked `JOURNAL_API` fresh with the full pull first: still exactly the same
15 real k=13 `SIEVE_LAYER_DONE` primes (199-349), unchanged since cycle 68.
No new Track A wall data this cycle.

## Method

Reused `per_prime()` from `tools/_cycle73_spatial_clustering.py` completely
unchanged (same DFS walk, same CV-of-gaps clustering statistic, same
matched-size discrete-uniform null). New driver
`tools/_cycle77_spatial_clustering_vs_r.py` runs it at `N_SAMPLES=500`
straight away (not 60), across 4 independent seeds (42, 123, 7777, 99999),
pooled by averaging `excess` per prime (2000 effective walks/prime).
Regression and permutation-test machinery copied from cycle 76's
`_cycle76_pooled_regression.py`: `excess ~ log(p)` vs `excess ~ log(p) + X`
for `X in {is_target, r}`, partial R2, 20000-shuffle permutation test.

Ran the first 3 seeds together (71.5s + 68.3s + 70.8s = 3.5 min), checked the
partial R2 for `r` per individual seed before pooling (0.0636, 0.1768,
0.1482 -- consistent sign and rough magnitude, no flip), then pooled: partial
R2=0.2885, perm p=0.0468. Borderline, so ran a 4th seed (66.1s) as a
robustness check rather than stopping at a result sitting right at the 0.05
line.

## Results

Individual seeds, `r` partial R2 (coefficient always negative):

```
seed=42:    partial R2=0.0636  coef=-0.000399  perm p=0.386
seed=123:   partial R2=0.1768  coef=-0.000527  perm p=0.133
seed=7777:  partial R2=0.1482  coef=-0.000428  perm p=0.177
seed=99999: partial R2=0.1628  coef=-0.000673  perm p=0.154
```

Pooled across all 4 seeds (2000 walks/prime effective):

```
r:         partial R2=0.3805  coef=-0.000507  perm p=0.0220   R2(logp)=0.9044  R2(logp+r)=0.9408
is_target: partial R2=0.1447  coef=-0.002823  perm p=0.1701   R2(logp)=0.9044  R2(logp+is_target)=0.9182
```

(3-seed pool for comparison: partial R2=0.2885, perm p=0.0468 -- adding the
4th seed strengthened the result rather than washing it out.)

## Reading

This is the first snapshot-shape statistic in the whole depth_target-snapshot
search (raw overlap 71/75, conditioned overlap 72/76, now spatial clustering
73/77) to show a partial R2 that survives permutation testing against either
framing. It is specifically an `r` effect, not an `is_target` effect --
`is_target` stays non-significant (p=0.17) on the exact same pooled data
where `r` clears p=0.022. That matches cycle 74's general finding that `r`
outperforms the binary split.

All 4 individual seeds agree in sign (coefficient always negative) and land
in a consistent 0.06-0.18 partial-R2 range even before pooling -- this is
not the sign-flipping pattern cycle 76 used to catch the noise trap in
conditioned overlap at `N_SAMPLES=60`. It looks like a real, modest effect
that a single seed at 500 samples is *underpowered* to detect cleanly (each
individual seed just misses p<0.05), but that pooling correctly recovers,
which is exactly what pooling is for when the underlying signal is real
but small.

**Important caveat**: this statistic measures the *shape* of `nextC` (how
evenly-spaced its bits are, `excess CV` relative to an iid-uniform null),
not its *size* (`ttc`, the count of uncovered residues, which is what
cycles 69-70 showed carries the `is_target`/margin-R effect). The
coefficient is negative: higher `r` makes `nextC` *more* evenly spread
(less bursty), not more clustered. That's a genuine new structural fact
tied to `r`, but it is orthogonal to -- not yet an explanation of -- the
uncovered-set *size* effect. Do not conflate "found a real r-effect on
shape" with "found the ttc-size mechanism." They may or may not be linked;
that link is untested.

## Next

1. Test whether this shape effect (evenness of `nextC`) is causally/
   mechanically connected to the size effect (`ttc` count) at all, or is a
   fully independent consequence of `r` acting on the DFS walk. One cheap
   check: does `excess` (this cycle's spacing statistic) itself correlate
   with `ttc` (cycle 70's count statistic) across the 15 real primes, after
   controlling for log(p)? If yes, they might share a common cause; if no,
   they're two separate `r`-driven facts and this thread still hasn't found
   the size mechanism.
2. If (1) comes up null, this cycle's result stands as an interesting but
   separate structural fact, and the search for the `ttc`-size mechanism
   should pivot to first-principles arithmetic (cycle 74's unfinished
   depth-1 large-P slope check: predicted slope 2/((K+1)P) vs the fitted
   0.000611) or fully switch to the K9/K10 crossover-location anomaly,
   idle since cycle 67.
3. Keep polling `JOURNAL_API` every cycle for new k=13 points (still 15 as
   of this cycle, use the full 2000-event pull not the default 500-event
   page).
4. The K9/K10 crossover-location anomaly (cycle 65) remains the other live
   thread, untouched since 67.
