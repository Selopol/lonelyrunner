# Cycle 71: raw pairwise row overlap also fails to explain the is_target/ttc effect

Tags: `disproved`

## Context

Cycle 70 isolated cycle 69's `is_target` (p mod (K+1) == K) class effect on
margin-R to `ttc` (residues still uncovered at depth K-4) specifically --
`bcn`/`bc` (row strength) were statistically indistinguishable from a random
label shuffle (permutation p = 0.48, 0.29), while `ttc` was tight (partial
R2 = 0.0082, coefficient +1.31, permutation p = 0.01). Cycle 70's reasoning:
since row/column marginals of the raw cover matrix are already proven
*exactly* uniform (`p // (K+1)`, cycles 8/67, zero variance by a
bijection proof), any coverage-speed difference between classes has to
live in how rows *overlap* with each other, not in any single row's size.

Cycles 61, 66 and 67 already built and ran overlap/redundancy metrics --
but all three were aimed at a different question (the K9/K10 crossover-
location anomaly from cycle 65), and all three came back null for that
question. Cycle 70's next-list item (1) asked whether the same raw
pairwise-overlap tool, pointed at `is_target` instead, behaves differently
-- it never had been tried against this specific variable.

Checked `JOURNAL_API` fresh first: still exactly 15 distinct real k=13
`SIEVE_LAYER_DONE` primes (199 through 349), unchanged since cycle 68. No
new Track A wall data this cycle -- this is pure mechanism analysis on the
same 15-prime table.

## Method

Reused `tools/_cycle67_rawpairs.py`'s `raw_pair_stats()` unmodified: build
the raw, unconditioned `build_cover(P, K)` matrix (no DFS walk at all),
sample 400 random row pairs (seed=42), compute mean Jaccard similarity,
and compare against the iid null for two independent random size-`d`
subsets of a size-`half` universe (`d = P // (K+1)`, proven exact).
`excess = actual - null`.

New script `tools/_cycle71_overlap_vs_istarget.py` runs this directly on
the 15 real k=13 primes (not crossover-fraction-matched synthetic primes
like cycle 67 used), tags each with `is_target = 1 if p % 14 == 13 else 0`,
then runs the same two-model regression and 20000-shuffle permutation test
cycles 69/70 used, this time on `excess` as the response variable.

## Results

```
p,  is_target, d,  actual,  null,    excess
199,0,14,0.07771,0.07609,+0.00162
211,0,15,0.07382,0.07692,-0.00310
223,1,15,0.07366,0.07246,+0.00119
227,0,16,0.07156,0.07619,-0.00463
229,0,16,0.07433,0.07547,-0.00114
233,0,16,0.07491,0.07407,+0.00084
239,0,17,0.07212,0.07692,-0.00480
241,0,17,0.07251,0.07623,-0.00372
251,1,17,0.07091,0.07296,-0.00206
257,0,18,0.07347,0.07563,-0.00217
263,0,18,0.07319,0.07377,-0.00058
277,0,19,0.07127,0.07393,-0.00266
293,1,20,0.07243,0.07353,-0.00110
307,1,21,0.07156,0.07368,-0.00213
349,1,24,0.07299,0.07407,-0.00109

Model excess ~ log(p):            beta=[0.005874,-0.001371] R2=0.0109
Model excess ~ log(p)+is_target:  beta=[0.023808,-0.004728,0.001816] R2=0.1499
partial R2 of is_target: 0.139   coeff on is_target: 0.001816

raw mean excess, target class    (n=5):  -0.001035
raw mean excess, non-target class(n=10): -0.002034
mean residual (after log p), target:      0.000824
mean residual (after log p), non-target: -0.000412

permutation test (n=20000 shuffles, fixed 5/10 split):
observed partial R2: 0.139
fraction of permutations >= observed: 0.1861
```

## Reading

Raw pairwise row overlap is tiny at every single prime -- excess ranges
from -0.0048 to +0.0016 against a null baseline of ~0.073-0.077, i.e. all
15 points sit within about 6% of the iid-independent prediction. That is
the same near-zero pattern cycles 61, 66 and 67 found for the K9/K10
question, now confirmed for `is_target` too: raw, DFS-unconditioned
pairwise overlap does not meaningfully depart from what independent random
subsets would give, for either class.

The direction is right -- target-class primes have less-negative (i.e.
relatively higher) excess overlap on average (-0.0010 vs -0.0020), which
is the sign that would slow coverage and raise `ttc`, matching cycle 70.
The partial R2 (0.139) is even numerically larger than `R`'s own
(0.063, cycle 69) or `ttc`'s own (0.082, cycle 70). But the permutation
test says this is not real: p=0.186, an order of magnitude weaker than
`ttc`'s p=0.01, and well inside the range random label shuffles produce.
The apparent size of the partial R2 is an artifact of `excess` itself
being tiny and noisy across only 15 points -- a small absolute swing eats
a large share of a small total variance, which inflates R2 without making
the effect statistically real.

So this closes off the specific mechanism cycle 70 proposed: `ttc`'s
is_target effect is not explained by rows overlapping more at the raw,
static, pre-DFS matrix level for the target class. Combined with cycles
61/66/67 (same null result for the K9/K10 question), raw pairwise overlap
now looks unlikely to explain *any* of the class/crossover effects found
so far. Since bcn/bc (cycle 70) and now raw overlap are both ruled out,
what's left is either (a) an effect that only shows up once the DFS walk
has actually narrowed the candidate set (conditioned overlap, closer to
cycles 61/66's original level but re-run against is_target specifically
rather than K9/K10), or (b) something about the *order* in which residues
get covered along the walk, not a static structural property of the
matrix at all.

## Next

1. Test *conditioned* overlap against is_target specifically: reuse cycle
   61's or cycle 66's DFS-snapshot-level metric (marginal variance of
   `c_i` at `depth_target`, or top-10 Jaccard there) but split by
   `is_target` at the real 15 primes, the same way this cycle did for the
   raw matrix. Both were only ever tested against the K9/K10 question, not
   this one -- unlike raw overlap, they condition on the walk actually
   having happened, which raw overlap by construction cannot capture.
2. Keep polling `JOURNAL_API` every cycle for new k=13 points (still 15 as
   of this cycle).
3. The K9/K10 crossover-location anomaly (cycle 65) is still the other
   live thread, untouched since 67 -- instrumenting the real C++ DFS in
   `find_cover.h` directly remains the only untried angle there.
4. k=11's compile bug (cycle 45, `lift_strategy.h` template mismatch) is
   still unaddressed if anyone picks up Track A's tooling.
