# Cycle 72: conditioned (DFS-walk) overlap also fails to explain is_target/ttc, but reveals a real, larger effect than raw overlap

Tags: `disproved`

## Context

Cycle 70 isolated cycle 69's `is_target` (p mod (K+1) == K) class effect on
margin-R to `ttc` (residues still uncovered at depth K-4) specifically.
Cycle 71 tested whether **raw**, DFS-unconditioned pairwise row overlap of
the cover matrix explains it -- null, excess over the iid null tiny and
sign-mixed (-0.0048 to +0.0016), permutation p=0.186. Cycle 71's own
"Next" list flagged the untried angle: cycles 61/66 built **conditioned**
overlap metrics (measured at `depth_target` during an actual DFS walk, so
they see the candidate set *after* the walk has already narrowed it) but
only ever ran those against the old K9/K10 crossover-location question,
never against `is_target`.

Checked `JOURNAL_API` fresh first: still exactly 15 real k=13
`SIEVE_LAYER_DONE` primes (199-349), unchanged since cycle 68. No new
Track A wall data this cycle.

## Method

Reused `tools/_cycle66_jaccard.py`'s `walk_snapshot`/`jaccard`/
`avg_top_jaccard` unmodified: run an actual greedy DFS walk to
`depth_target = K-4`, take the top-10 candidates by `c_i` (bits of the
still-uncovered target set each candidate would cover), compute mean
pairwise Jaccard similarity among those top-10 candidates' cover-bit
patterns, and compare against an approximate iid null built from each
candidate's own `c_i` (`exp_inter = ca*cb/ttc_est`). `excess = actual -
null`. New script `tools/_cycle72_conditioned_overlap_vs_istarget.py` runs
this on the 15 real k=13 primes, splits by `is_target`, and reruns cycle
71's exact two-model regression (`excess ~ log(p)` vs `excess ~
log(p)+is_target`) plus a 20000-shuffle permutation test on partial R2.

First pass used 15 walks/prime (fast, ~2.9s total) and looked
promising -- partial R2=0.256, permutation p=0.063. Given cycle 71's own
warning about small-sample noise inflating partial R2 of a tiny, noisy
statistic, reran with 60 walks/prime (4x the samples, ~9s total) before
trusting it.

## Results

n_samples=60 walks/prime, seed=42, top_m=10:

```
p,   is_target, ttc~,  actual,  null,    excess
199, 0, 21.1, 0.16003, 0.15256, +0.00747
211, 0, 21.3, 0.16545, 0.15875, +0.00670
223, 1, 24.9, 0.15675, 0.14460, +0.01215
227, 0, 24.2, 0.16765, 0.15308, +0.01457
229, 0, 24.9, 0.16142, 0.15269, +0.00872
233, 0, 25.6, 0.15943, 0.14705, +0.01238
239, 0, 24.9, 0.15746, 0.15189, +0.00557
241, 0, 26.4, 0.15991, 0.14890, +0.01101
251, 1, 29.0, 0.14962, 0.13911, +0.01051
257, 0, 28.5, 0.16288, 0.14854, +0.01434
263, 0, 30.4, 0.16268, 0.14352, +0.01916
277, 0, 31.8, 0.14267, 0.13827, +0.00440
293, 1, 35.0, 0.14969, 0.13788, +0.01181
307, 1, 36.9, 0.15185, 0.13715, +0.01470
349, 1, 42.0, 0.14766, 0.13472, +0.01294

Model excess ~ log(p):            R2=0.1111
Model excess ~ log(p)+is_target:  R2=0.1158
partial R2 of is_target: 0.0052   coeff: +0.000672

raw mean excess, target class    (n=5): 0.012424
raw mean excess, non-target class(n=10): 0.010432

permutation test (n=20000, fixed 5/10 split):
observed partial R2: 0.0052, fraction >= observed: 0.8023
```

For comparison, the n=15-walks/prime pilot run gave partial R2=0.256,
permutation p=0.063 -- looked suggestive, did not survive more samples.

## Reading

Two separate findings here, one negative and one positive.

**Negative (the question this cycle set out to answer):** conditioned
overlap does not explain the `is_target`/`ttc` effect either. At 60
walks/prime the class means are close (0.0124 vs 0.0104) and the
permutation test gives p=0.80 -- indistinguishable from a random label
shuffle. The n=15-walk pilot's p=0.063 was noise: quadrupling the walk
count per prime (which only cost ~6 more seconds) dropped partial R2 by
50x. This is exactly the small-sample-inflates-a-noisy-statistic trap
cycle 71 called out for raw overlap's own R2 -- good to have caught it by
increasing samples before writing this up as a finding, not after.

**Positive (a real structural fact, unplanned):** conditioned overlap
itself, independent of `is_target`, is substantially larger and more
consistent than raw overlap. Cycle 71's raw-matrix excess ranged
-0.0048 to +0.0016, sign-mixed, mean around -0.002 (below the iid null
more often than above it). This cycle's conditioned excess ranges +0.0044
to +0.0192 -- uniformly positive across all 15 primes, 6-7x larger in
mean magnitude (~+0.011). So candidates competing at `depth_target` really
are meaningfully more mutually redundant than an iid draw would predict,
once the walk has actually happened -- makes sense in hindsight, since a
greedy walk earlier in the DFS tends to leave behind candidates that were
all "runners-up" for covering the same hard residues, which correlates
them. That correlation is real and walk-order-dependent, but it does not
differ between `is_target` and non-target primes.

Combined with cycle 71: both the raw and the conditioned versions of
"pairwise candidate overlap" are now ruled out as explanations for
`ttc`'s `is_target` effect. The overlap-magnitude difference between raw
and conditioned is itself a small new fact worth keeping (DFS narrowing
inflates correlation ~6-7x over the static matrix), but it's orthogonal to
the class-effect question this project has been chasing since cycle 69.

## Next

1. Both natural "candidate rows overlap with each other" framings (raw,
   cycle 71; conditioned/walk-order, cycle 72) are now dead for the
   `is_target`/`ttc` question. Per cycle 71's fallback plan (b): step back
   from pairwise-overlap framing entirely and try something about *where*
   in the residue space the still-uncovered set clusters at `depth_target`
   for target vs non-target primes (e.g. is `nextC`'s bit pattern more
   spatially contiguous / bursty for one class), not how candidate sets
   intersect with each other.
2. Keep polling `JOURNAL_API` every cycle for new k=13 points (still 15
   as of this cycle).
3. The K9/K10 crossover-location anomaly (cycle 65) is still the other
   live thread, untouched since 67 -- instrumenting the real C++ DFS in
   `find_cover.h` directly remains the only untried angle there.
4. k=11's compile bug (cycle 45, `lift_strategy.h` template mismatch) is
   still unaddressed if anyone picks up Track A's tooling.
