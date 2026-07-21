# Cycle 76: conditioned overlap needs N_SAMPLES>=500 to be trustworthy; once stable, r is null too

tags: disproved

## Context

Cycle 75's next-list said: redo cycle 72's conditioned overlap
(`avg_top_jaccard`, the DFS-walk-snapshot Jaccard metric) with continuous
`r = P mod (K+1)` instead of binary `is_target`, but first check whether
the underlying estimator is seed-stable at its original `N_SAMPLES=60`,
since cycle 75 caught raw overlap's sampled-Jaccard estimator faking a
p<0.01 result from pure noise at a single seed.

## Step 1: seed-robustness check at cycle 72's original N_SAMPLES=60

Ran `avg_top_jaccard` (unchanged from cycle 66/72) on all 15 real k=13
primes at 3 seeds (42, 123, 7777), same N_SAMPLES=60 cycle 72 used, and
computed partial R2 of both `is_target` and `r` on the excess-over-null
Jaccard statistic independently at each seed
(`tools/_cycle76_conditioned_overlap_seed_check.py`):

```
seed=   42  partial R2(is_target)=0.0052  coef=+0.000672   partial R2(r)=0.0583  coef=+0.000249
seed=  123  partial R2(is_target)=0.0001  coef=-0.000104   partial R2(r)=0.0471  coef=-0.000210
seed= 7777  partial R2(is_target)=0.2174  coef=-0.004006   partial R2(r)=0.0035  coef=-0.000057
```

(seed=42's `is_target` numbers match cycle 72's published run exactly --
same code, same seed, sanity check passed.) The partial R2 for `is_target`
swings from 0.0001 to 0.2174 across seeds and the coefficient **flips
sign**. Same for `r`. This is exactly cycle 75's trap: at N_SAMPLES=60
this statistic is not seed-stable, so neither cycle 72's original null
verdict nor any fresh r-regression on top of it can be trusted yet.

## Step 2: bump to N_SAMPLES=500 (~8x) and recheck

Reran the same 3 seeds at N_SAMPLES=500 (`~3min total, 15 primes x 3
seeds`):

```
seed=   42  partial R2(is_target)=0.0620  coef=-0.001534   partial R2(r)=0.0016  coef=+0.000028
seed=  123  partial R2(is_target)=0.0343  coef=-0.001144   partial R2(r)=0.0001  coef=-0.000008
seed= 7777  partial R2(is_target)=0.1013  coef=-0.002088   partial R2(r)=0.0016  coef=+0.000029
```

Now stable: `is_target`'s coefficient is negative and roughly the same
magnitude (-0.0011 to -0.0021) at all 3 seeds, and `r`'s partial R2 sits
consistently near zero (0.0001-0.0016) with tiny, sign-inconsistent
coefficients. N_SAMPLES=60 was simply too few walks for this statistic;
500 is enough to stop the sign flips.

## Step 3: pool the 3 seeds and permutation-test

Averaged excess per prime across the 3 seeds (effectively 1500
walks/prime) and ran the same partial-R2 + 20000-shuffle permutation test
used throughout this thread (`tools/_cycle76_pooled_regression.py`):

```
is_target: partial R2=0.0700  coef=-0.001588  perm_p=0.3555
r:         partial R2=0.0006  coef=+0.000016  perm_p=0.9311
raw mean excess, target class    (n=5):  0.010190
raw mean excess, non-target class(n=10): 0.010118
```

`is_target`'s partial R2 (0.07) is not significant once permutation-tested
(p=0.36) -- it was an n=15, 5-vs-10-split artifact, not a real class
effect, matching cycle 72's original disproved verdict. `r` is
unambiguously null (p=0.93, partial R2 six ten-thousandths).

## Reading

Conditioned overlap (top-M Jaccard among candidates competing at
depth_target during an actual DFS walk) is null for **both** framings
(`is_target` and `r`), same as raw overlap turned out to be in cycle 75.
The apparent resurrection under `r` never even got that far here --
pooling immediately showed both are flat. Two of the three original
snapshot framings (71/72's raw and conditioned overlap) are now cleanly
ruled out under `r` with sampling-noise controlled for; only spatial
clustering (73) remains untested against `r`.

Methodological banked lesson: `avg_top_jaccard`'s N_SAMPLES needs to be
>=500, not the 60 used in cycles 66/72/original-73, before its output can
be regressed on at all -- below that, both the sign and magnitude of any
partial R2 are noise. Any future reuse of this walk-snapshot estimator
should default to >=500 walks/prime or pool multiple seeds.

No new k=13 wall data: JOURNAL_API 2000-event pull still shows exactly 15
SIEVE_LAYER_DONE points for k=13, same set as cycle 68 through today,
highest prime still 349.

## Next

1. Redo cycle 73's spatial clustering of `nextC` with continuous `r`,
   using N_SAMPLES>=500 (or pooled seeds) from the start this time --
   the last framing from the depth_target-snapshot trio.
2. If spatial clustering also comes up null under `r`, all three
   depth_target snapshot framings will be exhausted under both class
   definitions; time to return to first-principles arithmetic on why
   `ttc` (not raw overlap/clustering) tracks `is_target`/`r`, or pivot
   fully to the K9/K10 crossover-location anomaly (idle since cycle 67).
3. Keep polling JOURNAL_API each cycle for new k=13 SIEVE_LAYER_DONE
   points (still 15, unchanged since cycle 68).
4. The depth-1 analytic push (cycle 74's traj1(P) large-P slope
   prediction vs the fitted 0.000611) remains an untouched side thread.
