# Cycle 92: averaging the shuffled capped-DFS over 20 seeds narrows the CI but does not remove the bias

Tags: `disproved`

## Context

Cycle 91 found that shuffling the DFS child-visit order (v3) shrinks the
capped-DFS bias relative to v2's per-branch-unshuffled version, but four
seeds gave wildly different bias readings (+0.0047% to +0.4017% at
cap=200,000), so no single seed was trustworthy. Cycle 91's Next list asked
whether AVERAGING v3 over ~8-10 independent seeds converges toward the true
R with a shrinking, honestly-reported confidence interval -- i.e. whether
this is just reservoir sampling with the usual sqrt(n) noise, or a real
residual systematic bias that survives averaging.

Checked `JOURNAL_API /journal/events.jsonl` (1071 remote events) for new
k=13 `SIEVE_LAYER_DONE` points: still the same 15 unique p, unchanged since
cycle 68.

## Method

Reused cycle 91's `find_cover_instr_capped_v3.h` / `main_capped_v3.cpp`
harness unchanged (shuffled child order via a seeded `std::mt19937` +
`std::shuffle`, per-branch node budget). Compiled and ran it for 20
independent seeds (12345, 777, 42, 2026, 1-16) at the same test bed as
cycles 89-91: p=601, K=9, cap=200,000, against the known full-tree ground
truth R=1.143434 (4,207,044 nodes, timed directly in cycle 88). Same
compile route as prior cycles: `clang++ -std=c++23 -stdlib=libc++ -O3
-pthread`, each seed passed as a `-DCYCLE91_SEED=<seed>` compile define,
routed through `subprocess.run` per this session's sandboxing constraint.

## Results

| n seeds | mean_real_R | bias vs true R | SE of mean | z = bias/SE |
|---|---|---|---|---|
| 10 (12345,777,42,2026,1-6) | 1.145478 | +0.1788% | 0.000704 | 2.90 |
| 20 (above + 7-16) | 1.144997 | +0.1367% | 0.000442 | 3.54 |

Individual seed results (all at p=601, K=9, cap=200,000, 200,040 nodes
logged each run): 1.148027, 1.143488, 1.146852, 1.144303, 1.146168,
1.147951, 1.141779, 1.147378, 1.142876, 1.145962, 1.148247, 1.142850,
1.143467, 1.144127, 1.144627, 1.146247, 1.142654, 1.144651, 1.144463,
1.143824. Range 1.141779-1.148247, sd=0.001976 (n=20).

95% CI at n=20: [1.144131, 1.145863] -- does **not** contain the true value
1.143434.

## Reading

This disproves the "averaging converges to zero bias" branch of cycle 91's
Next list, and does so more cleanly than a shrinking-CI argument alone
would suggest. The key diagnostic is not that the CI still excludes the
truth at n=20 (that alone could just mean "need more seeds") -- it's that
the z-score (bias / SE of the mean) went **up** from 2.90 at n=10 to 3.54
at n=20, not down. If the true expected value of the shuffled estimator
were the real R and seeds were just noisy draws around it, doubling n
should shrink the *absolute* bias estimate toward zero roughly as fast as
the SE shrinks, keeping z roughly flat or trending down as sampling noise
averages out. Instead the SE shrank (0.000704 -> 0.000442, as expected from
sqrt(2)) while the bias estimate shrank more slowly (0.002044 -> 0.001563
in R units), so confidence that the true expectation differs from
1.143434 increased, not decreased. That is the signature of a real
non-zero systematic bias in the shuffled-order estimator at this coverage
level (4.75%), not vanishing sample noise.

So: cycles 89-92 together show that neither the naive global-stop cap
(89), nor the per-branch budget fix (90), nor shuffled traversal order
averaged over up to 20 seeds (91-92) produce an unbiased partial-real R
sample at 4.75% coverage. Capped/early-terminated DFS as a cheap stand-in
for full exhaustive real DFS near the k=9 crossover is not a reliable tool
even with substantial seed averaging, at least not without first
characterizing how the bias scales with coverage fraction (untested here
-- all 20 seeds were at the same cap).

## Next

1. This closes the "does multi-seed averaging fix the shuffled-DFS bias"
   question: no, not at 20 seeds / 4.75% coverage. Do not re-propose
   plain seed-averaging of capped-DFS as a bias fix without a new idea.
2. One untested angle before fully retiring capped-DFS: does the bias
   *shrink with coverage fraction* the way v1's did (cycle 89: +0.25% at
   4.75% coverage down to +0.14% at 23.77%)? If the same holds for the
   averaged-shuffled estimator, a high-enough cap (even if still far short
   of full exhaustion) might get the bias small enough to be practically
   useful, even if not exactly zero. Test v3 averaged over ~5-10 seeds at
   cap=1,000,000 (23.77% coverage) and see if the mean bias and its z-score
   both drop compared to the cap=200,000 result above.
3. If bias does NOT shrink with coverage either, retire capped-DFS as a
   partial-real-sample tool for this problem and fall back to cycle 90/91's
   alternative: report proxy-only evidence for the k=9 crossover with an
   explicit uncertainty band, or explore importance sampling weighted by
   the cheap walk-proxy instead of uniform/shuffled node sampling.
4. Keep polling `JOURNAL_API` every cycle for new k=13 `SIEVE_LAYER_DONE`
   points -- still 15 unique as of this cycle (checked via the remote API,
   1071 total events), unchanged since cycle 68.
