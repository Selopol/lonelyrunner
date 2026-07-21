# Cycle 122: ttc outgrows bc/bcn on the clean same-floor set -- localizes the residual, but a control test suggests it may not be target-specific

Tags: empirical (ttc/bc/bcn marginal localization, 11/11 pairs, real measurements), idea (monotonic-in-remainder reframing, only 2 floors tested so far)

## Context

Cycle 121 closed off depth-1/2 candidate counts as a source of the
density-independent residual, proving them bit-identical on all 11 clean
same-floor (Dt=Dn) is_target/non-target pairs from cycles 119/120. Its
Next list asked to redo cycle 117/118's bc/bcn marginal and covariance
probes -- previously tested only against 5 noisier fracR%-style pairs --
against this same clean 11-pair dataset. No new k=13 SIEVE_LAYER_DONE
events since cycle 110 (checked again: still 108 total sieve events, 9
for k=13, last one p=349 size 260).

## Method

Copied cycle 118's unmodified probe (`is_path_sampler_cov.cpp`, which
accumulates importance-weighted `mean_bc`, `mean_bcn`, `mean_ttc`,
`var_bc`, `var_bcn`, `cov_bc_bcn`, `corr` at the terminal depth-(K-4)
step) to `solver/build/cycle122/`. Ran it (`tools/_cycle122_cov_samefloor.py`
/ `tools/_cycle122_analysis.py`, clang++ -O3 -march=native, J=200,000,
seed=42) on all 20 unique primes spanning the 11 same-floor pairs from
cycle 119/120/121: (83,79), (97,89), (139,137), (167,163), (181,179),
(223,211), (251,239), (293,283), (293,281), (349,347), (349,337). Total
wall time ~77s per full run.

## Result 1: unlike depth-1/2, the terminal marginals are NOT flat

For every same-floor pair, target has higher mean_bc, mean_bcn, AND
mean_ttc than its non-target partner -- a real, non-zero, non-random
difference (unlike depth-1/2's exact identity). But relR% stays negative
(target's real R is lower) while relBC%/relBCN%/relTTC% are all
positive. The reconciliation: relTTC% exceeds both relBC% and relBCN%
in every single pair, by a factor of roughly 2-5x:

| pair | floor | relR% | relBC% | relBCN% | relTTC% |
|---|---|---|---|---|---|
| 83/79   | 5  | -11.588 | +9.359  | +7.271  | **+19.725** |
| 97/89   | 6  | -19.139 | +18.480 | +13.583 | **+34.751** |
| 139/137 | 9  | -3.139  | +0.927  | +1.166  | **+4.134**  |
| 167/163 | 11 | -4.826  | +2.666  | +2.238  | **+7.299**  |
| 181/179 | 12 | -2.184  | +1.516  | +1.241  | **+3.543**  |
| 223/211 | 15 | -9.389  | +7.249  | +6.227  | **+16.238** |
| 251/239 | 17 | -8.944  | +4.950  | +5.056  | **+13.808** |
| 293/283 | 20 | -5.981  | +3.983  | +3.851  | **+9.865**  |
| 293/281 | 20 | -7.811  | +4.416  | +4.288  | **+12.070** |
| 349/347 | 24 | -0.623  | +0.642  | +0.792  | **+1.281**  |
| 349/337 | 24 | -5.796  | +3.812  | +3.783  | **+9.547**  |

`relTTC% > relBC%` and `relTTC% > relBCN%` in all 11/11 pairs, zero
exceptions. Since `R = (bcn + 3*bc) / ttc`, a denominator (ttc, the
remaining-to-cover count) that grows faster than the numerator terms
(bc, bcn, the best single-choice coverage) as p increases explains the
net R decrease cleanly. This is a real localization that cycle 117/118's
noisier fracR%-style pairs could not deliver (cycle 117 found the
bc-vs-bcn split flipped sign between pairs; here, on the clean set,
ttc's dominance over both bc and bcn is completely consistent).

## Result 2: control test -- the pattern is not exclusive to is_target

Every same-floor pair compares is_target (always the *largest* p in its
floor bucket, since remainder 13 is the maximum possible mod 14) against
a smaller non-target p. To check whether "ttc outgrows bc/bcn" is a
property of targetness or just of being the larger prime in a floor
bucket, I ran the same comparison between two *non-target* primes that
happen to share a floor: 283 vs 281 (floor 20) and 347 vs 337 (floor 24).

| pair | remainders | relR% | relBC% | relBCN% | relTTC% |
|---|---|---|---|---|---|
| 283/281 | r=3 vs r=1 | -1.833 | +0.432 | +0.437 | **+2.212** |
| 347/337 | r=11 vs r=1 | -5.174 | +3.170 | +2.991 | **+8.269** |

Same sign, same qualitative pattern (ttc dominates, R decreases for the
larger prime), even with neither prime being is_target. This means the
ttc-outgrows-bc/bcn mechanism is not specific to `p ≡ -1 mod (k+1)` --
it looks like a general property of larger p within a fixed floor
bucket, and is_target primes are just the extreme case (always the
largest p possible in their bucket).

## Result 3 (preliminary): R may be monotonic in p mod 14 within a floor

Using the two floors where 3 same-floor primes at different remainders
were already measured this cycle and in cycle 120/121:

    floor 20: p=281 (r=1) R=1.168154 > p=283 (r=3) R=1.146941 > p=293 (r=13) R=1.080337
    floor 24: p=337 (r=1) R=1.098902 > p=347 (r=11) R=1.043483 > p=349 (r=13) R=1.036999

Both floors show R strictly decreasing as remainder (equivalently p)
increases. If this generalizes, the "is_target R dip" would be better
described as "R decreases monotonically with p mod (k+1) within a
density band, and is_target sits at the maximal-remainder extreme of
that curve" rather than a two-valued target/non-target effect. This is
only 2 floors with 3 points each -- real numbers, but too small a sample
to rule out coincidence, so it is filed as an **idea**, not established.

## Interpretation

This cycle both advances and complicates the mechanism search. It
successfully localizes the residual within the terminal bc/bcn/ttc step
to the denominator's growth rate (ttc outgrows bc/bcn, 11/11 clean
pairs) -- something cycle 117/118 could not do on noisier pairs. But the
control test suggests the whole "is_target vs non-target" framing may be
a special case of a more general "R decreases with remainder within a
floor" pattern, which would mean much of the density-independent
residual chase (cycles 112-121) has actually been comparing endpoints
of a smooth function rather than isolating a genuinely categorical
target effect. That reframing is not yet established -- it rests on 2
floors of 3 points -- but is a concrete, testable next step.

## Next

1. Test the monotonic-in-remainder hypothesis properly: find a floor
   with 4+ same-floor primes spanning a wider remainder range (need to
   scan primes < 500ish for floors with many hits), measure real R for
   all of them, and check for a clean monotonic trend or compute a rank
   correlation. 2 floors x 3 points is too thin to trust yet.
2. If monotonicity holds up, the right comparison for the "residual" is
   no longer target-vs-non-target at all -- it should be R as a function
   of r = p mod 14 at fixed floor, fit or plotted across many floors, to
   see whether is_target (r=13) is just the tail of a smooth curve or an
   actual discontinuity at r=13 specifically (which would still make it
   a real, separate effect worth the name "target dip").
3. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE
   sizes -- still capped at p=349 as of this cycle (108 total sieve
   events, 9 for k=13, unchanged since cycle 110).
4. Keep the P>=37 floor in mind for any future k=13 small-p tests
   (cycle 120).
