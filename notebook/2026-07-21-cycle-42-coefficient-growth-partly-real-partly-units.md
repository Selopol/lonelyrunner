# Cycle 42: is R's growing coefficient a real k-effect or just narrower units?

tags: empirical

## Context

Cycle 41's regression (log p, margin-R, is_target against real k=8 n=39 and
k=10 n=34 `SIEVE_LAYER_DONE` wall sizes) found R's LOO coefficient jumps from
8.3-12.1 at k=8 to 26.9-29.9 at k=10 — roughly 3x — and left as an open
question whether that's a real strengthening of the R-to-wall-size link with
k, or just an artifact of R occupying a different numeric range at each k.
Cycle 41's other suggested next step (checking the same regression at k=11)
was checked first and is blocked: a fresh pull of `JOURNAL_API` (739 events)
shows **zero** real k=11 `SIEVE_LAYER_DONE` points exist yet, and no new
k=13 point landed since cycle 41's p=233. So this cycle answers the
coefficient-scaling question instead, using data already on hand.

## Method

Regenerated `margin_by_class_k.py`'s R column for K=8 over [47,242) and K=10
over [127,312), n_samples=100, joined against the real wall sizes pulled
fresh from `JOURNAL_API` (k=8: 39 points p=47..241; k=10: 34 points
p=127..311 — same sets cycle 41 used). Refit the 3-predictor model
`log(size) = a + b1*log(p) + b2*R + b3*is_target` directly by least squares
(not LOO this time, full-sample fit as a sanity check against cycle 41's LOO
ranges) to get exact `coef_R` and `std(R)` per k. Then computed the
standardized effect size `beta_R = coef_R * std(R) / std(log(size))`, which
answers "how many standard deviations does log(wall size) move per standard
deviation of R" — this is scale-free, so if the raw coefficient growth were
purely from R's units shrinking, beta_R should stay roughly flat across k.
Reran with two more seeds (7, 99) to check the result isn't a walk-sampling
fluke.

## Results

Full-sample fit sanity check (seed 42): coef_R=9.95 at k=8, 28.85 at k=10 —
matches cycle 41's LOO ranges closely, confirms the reconstruction is
consistent with last cycle's numbers.

| seed | k | n | coef_R | std(R) | std(log size) | beta_R |
|---|---|---|---|---|---|---|
| 42 | 8 | 39 | 9.95 | 0.0845 | 2.143 | 0.392 |
| 42 | 10 | 34 | 28.85 | 0.0591 | 2.869 | 0.594 |
| 7 | 8 | 39 | 8.58 | 0.0843 | — | 0.337 |
| 7 | 10 | 34 | 29.53 | 0.0602 | — | 0.619 |
| 99 | 8 | 39 | 11.49 | 0.0892 | — | 0.478 |
| 99 | 10 | 34 | 32.09 | 0.0601 | — | 0.672 |

`std(R)` itself drops by ~1.4x from k=8 to k=10 in every seed (R is trending
toward 1, consistent with cycle 33/34's margin-racing-to-1 story) — that
narrowing predicts part of the raw coefficient growth mechanically. But
`beta_R` (the scale-free version) is still consistently ~1.4-1.8x larger at
k=10 than at k=8 across all three seeds (0.392→0.594, 0.337→0.619,
0.478→0.672).

## Reading

The ~3x raw coefficient growth from k=8 to k=10 decomposes into roughly two
multiplicative pieces: about 1.4x is a genuine units effect (R's own range
narrows with k, so it takes a bigger coefficient to explain the same
variance), and a further ~1.4-1.8x is a real strengthening of the
standardized relationship between R and wall size — not explained away by
units. This is a second, independent line of evidence (on top of cycle 41's
partial-R2 growing from 0.037 at k=8 to 0.066 at k=10, also roughly a 1.8x
increase) pointing the same direction: R's explanatory power over wall size
relative to its own scale genuinely increases with k, at least across the
two k values with enough real data to check. This is weak-to-moderate
evidence, not proof — two adjacent k values, walk-simulated R (not the
solver's real DFS), and no k=11/13 confirmation yet.

## Next

- The natural test is still k=11, but the real data doesn't exist in the
  journal yet — if Track A ever runs a batch of small-p k=11 sieve layers,
  redo this exact standardized-beta check there; a monotone 8→10→11 rise in
  beta_R would make this a much stronger claim than 2 points allow.
- Consider whether the standard deviation of the class-conditional means
  behaves the same way (target vs rest, separately) as a complementary check
  on this decomposition.
- Keep polling for new real k=13 points (still stuck at n=10 since p=233).
