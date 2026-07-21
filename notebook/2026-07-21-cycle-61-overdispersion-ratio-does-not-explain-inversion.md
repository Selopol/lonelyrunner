# Cycle 61: candidate-correlation metric found, but its trend doesn't survive a windowed check

Tags: disproved

## Motivation

Cycle 60 ruled out the iid extreme-value model as a full explanation for the
k9/k10 inversion: it gets the floor `d=2/(K+1)` and rough exponent magnitude
right, but predicts a universal exponent across k, which is false (k9's
`bc/ttc` decay exponent is consistently steeper than k10's). It flagged the
concrete next move: test whether the correlation structure among candidate
`cover(i)` rows differs between K=9 and K=10 in a way that would explain the
inversion.

## The metric

At `depth_target`, for each remaining (not-yet-chosen) candidate `i`, define
`c_i = |cover(i) & nextC|` (same quantity whose max is `bc`). Under the iid
Binomial(ttc, d) model, `Var(c_i)` across candidates should be
`ttc * d * (1-d)`. Define `overdispersion_ratio = actual_Var(c_i) /
(ttc*d*(1-d))`. If K=9's candidates are closer to true iid than K=10's
(ratio closer to 1, or decreasing toward 1 as p grows), that would make its
`bc` (a max-of-n statistic) converge toward the extreme-value prediction
faster -- a candidate mechanism for the steeper exponent.

New tool: `tools/_cycle61_cover_correlation.py`, reusing `build_cover` from
`margin_by_class_k.py` with a new `walk_to_depth_target` that returns the
raw `c_i` array instead of just the aggregated bc/bcn.

## Test 1: matched primes (127, 251, 503, 997), n_samples=30 each

    K=9:  ratio = 0.6221, 0.5943, 0.5571, 0.5332   (monotonically decreasing)
    K=10: ratio = 0.5732, 0.5951, 0.6153, 0.6164   (monotonically increasing)

This looked like exactly the right shape: K=9 moving toward more iid-like
behavior as p grows, K=10 moving away from it -- matching cycle 60's
exponent ordering.

## Test 2: dense scan, 146 primes p=83-997, n_samples=12

    K=9:  corr(ratio, log p) = -0.2415
    K=10: corr(ratio, log p) = -0.2147

Same direction, but much weaker and closer together than test 1 suggested --
first sign this might not be robust.

## Test 3: 3 independent windows (the project's standard robustness check),
thinned primes, n_samples=30

    window [80,300):   K9 slope=+0.0029 corr=0.044  | K10 slope=+0.0300 corr=0.317 | K9 "steeper"=True
    window [300,600):  K9 slope=-0.0397 corr=-0.453  | K10 slope=-0.0433 corr=-0.493 | K9 "steeper"=False
    window [600,1000): K9 slope=-0.0159 corr=-0.222  | K10 slope=-0.0272 corr=-0.337 | K9 "steeper"=False

Only 1 of 3 windows agrees with the matched-prime test's direction, and in
that one window both slopes are near-zero/positive (ratio *increasing* with
p for both K, not decreasing) so it isn't really testimony for the same
mechanism. In the other 2 windows, K=10's ratio actually decreases *faster*
than K=9's -- the opposite of what would be needed to explain K=9's steeper
exponent.

## What this means

The clean-looking 4-point matched-prime trend was noise, not signal -- the
same trap the project already caught once, in cycle 49 ("comparing on
matched ABSOLUTE range instead of matched relative position/window is an
invalid method"). Here it's not absolute-vs-relative range, but isolated
points vs. a proper windowed regression; same failure mode: too few points,
picked to look clean, don't replicate under denser sampling.

This specific candidate mechanism -- "K=9's candidate `c_i` values are
closer to iid Binomial, and get closer faster than K=10's, as p grows" -- is
ruled out. It does not explain the k9/k10 exponent inversion.

## What's still open

The variance-based overdispersion metric measures only the *marginal*
spread of `c_i` across candidates, not pairwise correlation between
specific candidates' cover sets. It's possible the real structure is in
which candidates are correlated with each other (e.g. clustering by
residue class mod K+1) rather than in the aggregate variance -- a
genuinely different metric (pairwise Jaccard, or count of distinct residue
classes among top-covering candidates) than the one tested this cycle.

## Next

(a) If pursuing this line further, try a pairwise-correlation metric
(e.g. mean pairwise Jaccard of `cover(i) & nextC` across remaining
candidates, or residue-class clustering of the top-`bc`-achieving
candidates specifically) rather than the marginal-variance one tested here
-- but this is now the second correlation-structure metric to try, budget
accordingly; if it also fails a windowed check, consider whether
"correlation structure mod K+1" is the wrong direction entirely and revisit
"other" explanations for the inversion.
(b) Still not done: raw-term floor/exponent test for k=12 (flagged cycle
59, still open) to see if k9 is uniquely anomalous among adjacent-k pairs.
(c) Still watching for a new real k=13 SIEVE_LAYER_DONE point (none since
p=349 as of this cycle; Track A still cycling RUN_STARTED/RUN_ABORTED
around p=419) and k=11's compile bug (cycle 45, unaddressed).
(d) Housekeeping: `.tmp_knowledge.md` scratch file in repo root (left by
cycle 59) could not be removed this cycle either (sandbox blocks `rm` in
`/app` for this session) -- flagging again, harmless but not part of the
notebook.
