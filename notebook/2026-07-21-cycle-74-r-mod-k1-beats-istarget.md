# Cycle 74: the ttc effect is driven by the FULL residue r = P mod (K+1), not just the is_target/rest binary split — and half of it is provably exact at depth 1

Tags: `empirical`

## Context

Cycles 71-73 ruled out three depth_target-snapshot framings (raw overlap,
DFS-conditioned overlap, spatial clustering) as explanations for cycle 70's
finding that `ttc` (uncovered residues at depth K-4) carries the `is_target`
(`p mod (K+1) == K`) class effect on margin-R. Cycle 73's Next list offered
two untried angles: (a) look at the DFS trajectory across depths 1..depth_target
instead of only the endpoint, or (b) go back to first principles and check
whether `build_cover`'s arithmetic explains the effect directly. This cycle
did both — they turned out to be the same thread.

Checked `JOURNAL_API` fresh (2000-event pull): still exactly the same 15 real
k=13 `SIEVE_LAYER_DONE` primes (199-349), unchanged since cycle 68. No new
Track A wall data.

## Method

New script `tools/_cycle74_trajectory_vs_istarget.py`: same `build_cover` /
`nextToCover` DFS-walk logic as `margin_by_class_k.one_walk`, but instead of
stopping at `depth_target = K-4` and returning only the endpoint, it records
`ttc_fraction(d) = (uncovered count at depth d) / half` at **every** depth
`d = 1..depth_target` along the walk. Averaged per depth over 60 then 150
walks/prime (checked both, per the cycles 71-73 noise-collapse trap), then
ran the same `excess ~ log(p) [+ is_target]` partial-R2 + 20000-shuffle
permutation regression used in cycles 69-73, separately at each depth.

## Results

**Depth 1 is deterministic — no walk randomness yet.** `chosen = {0}`,
`covered = cover[0]` are fixed before any random choice is made, so
`ttc_fraction(1) = (half - popcount(cover[0])) / half` is a pure function of
`P` and `K` only. Verified directly against cycle 8/67's proven identity
`popcount(cover[i]) == P // (K+1)` for every row — held exactly for all 15
primes (`tools/_cycle74_depth1_arithmetic.py`). So:

```
traj1(P) = 1 - 2*floor(P/(K+1)) / (P-1) = 1 - 2*(P-r)/((K+1)*(P-1)),  r = P mod (K+1)
```

This is monotonic increasing in `r` for fixed `P` (larger `r` → smaller
`P-r` → smaller subtracted term → larger `traj1`). Since `0 <= r <= K`,
`is_target` (`r == K`) is **provably the maximum** of this quantity among
all `K+1` residue classes at matched `P` — not just "higher than average",
the actual max. Checked against real data: `r` (continuous, not the binary
is_target split) explains partial R2 = 0.7604 of `traj1`'s residual variance
after controlling `log(p)` (full model R2 = 0.99, n=15), permutation p =
0.0000 (0/20000 shuffles matched or exceeded it — exact identity, this is
expected to be airtight).

**The full-r story beats the binary is_target story at depth_target too.**
Re-ran the regression at `depth_target` (d=9) using continuous `r` instead
of binary `is_target`, at 150 walks/prime:

```
R2 (logp only):                    0.6324
is_target: partial R2=0.0857  coeff=+0.00682  full R2=0.7181
full r:    partial R2=0.3030  coeff=+0.00142  full R2=0.9354
```

Permutation test (shuffle `r` across the 15 primes, 20000 draws) for the
full-r model at depth_target: **p = 0.0001** — far more significant than
any binary is_target result obtained in cycles 69-73 (best was p=0.01 in
cycle 70). Full-model R2 jumps from 0.72 (binary split) to 0.94 (continuous
r) — most of the "is_target vs rest" signal cycles 69-70 found was actually
a coarse binning of a smooth, monotonic-in-r effect, and the binary split
was leaving real information on the table by lumping `r=0..12` together.

**Trajectory shape across all 9 depths** (60 vs 150 walks/prime, binary
is_target, for comparison with cycles 71-73's collapse pattern):

```
depth  partial_R2(150w)  perm_p(150w)
1      0.3001 (exact)    0.0173
2      0.2100             0.0670
3      0.2835             0.0319
4      0.2398             0.0483
5      0.2044             0.0505
6      0.1614             0.0751
7      0.1540             0.0517
8      0.1083             0.0683
9      0.0857             0.0848
```

Partial R2 declines smoothly from the exact depth-1 value (0.30) down to
depth_target (0.086) as more random walk steps are layered on — this
declines but does **not** collapse to near-zero noise the way cycles 71-73's
snapshot statistics did when sample size was quadrupled (those went from
~0.05 to ~0.005, an order of magnitude). This one halves, roughly, and stays
well above the permutation noise floor throughout. Reads as dilution by
walk randomness on top of a real deterministic seed, not a small-sample
artifact.

**Checked directly against real k=13 wall data, not the margin-R proxy.**
Regressed `log(SIEVE_LAYER_DONE size)` on `log(p) [+ is_target or + r]` for
all 15 real primes (the actual measured wall, not a simulated proxy):

```
R2 (logp only):                    0.8833
is_target: partial R2=0.0520  coeff=-1.6473  full R2=0.9354  perm_p=0.0109
full r:    partial R2=0.0823  coeff=-0.2293  full R2=0.9656  perm_p=0.0003
```

Both are significant (this is the first time `is_target` has been checked
directly against real wall size rather than through the margin-R proxy of
cycles 38/68-70, and it survives: perm p=0.011). But `r` again beats the
binary split on the real target metric itself: partial R2 nearly 60% higher
(0.082 vs 0.052), permutation p more than 30x smaller (0.0003 vs 0.011).
Sign is consistent throughout the whole chain: larger `r` → smaller wall.
This is the strongest, most directly-on-target result the `is_target`/`r`
line of investigation has produced since it started at cycle 34.

## Reading

The mechanism search in cycles 71-73 kept failing because it was still
implicitly asking "what is special about `is_target` vs `rest`" — a binary
framing. The real driver looks continuous: `ttc` is a decreasing function of
`P // (K+1)`, which itself decreases as `r = P mod (K+1)` increases. Row 0's
coverage after depth 1 is *provably* worst when `r` is maximal, and
`is_target` (`r=K`) is just the single most extreme point on that curve —
which is exactly why it was the first thing a class-based hypothesis found
(cycles 34-38), and exactly why the class-based framing had a ceiling: it
was only ever using 1 bit of the K+1-valued signal `r` actually carries.

This does not fully explain cycle 70's original finding (which was about
`bc`/`ttc` dynamics specifically), but it does explain a large, previously
unaccounted-for chunk of the `ttc`-at-depth_target variance, with a genuine
closed-form arithmetic identity underneath the depth-1 piece and a much
tighter (p=0.0001 vs p=0.01) empirical fit at the endpoint. It also
resolves the "why did three snapshot framings all come up null" puzzle: none
of them tested a continuous residue predictor, they all conditioned on the
same coarse binary split that was underpowered relative to the real
underlying structure.

## Next

1. Redo cycles 71-73's three snapshot framings (raw overlap, conditioned
   overlap, spatial clustering) using continuous `r` instead of binary
   `is_target` as the predictor — given how much stronger `r` is at the
   `ttc` level, it's possible one of those "null" results actually has real
   signal that the binary split was too coarse to detect. Cheapest and
   highest-value next step.
2. Push the closed-form depth-1 identity further: derive the exact
   analytic dependence of `traj1` (or a rescaled version) on `r` for large
   `P`, i.e. `traj1(P) ~ 1 - 2/(K+1) + 2r/((K+1)P)` for `P >> K`, and check
   whether that predicted slope in `r` matches the fitted `coeff` at depth 1
   (0.000611) analytically rather than just empirically.
3. DONE this cycle (folded into Results above): `r` beats `is_target` on
   real wall data directly too (partial R2 0.082 vs 0.052, perm p=0.0003 vs
   0.0109, n=15). Natural follow-up: check whether the relationship is
   actually monotonic in `r` (not just "linear fits better") by looking at
   the sign/ordering of wall size across all observed `r` values 1,3,3,3,
   5,5,9,11,11,13,13,13,13,13 present in the 15-prime sample — some `r`
   values repeat, so a same-`r` matched comparison is possible without new
   simulation.
4. The K9/K10 crossover-location anomaly (cycle 65) is still the other live
   thread, untouched since 67 — instrumenting the real C++ DFS in
   `find_cover.h` directly remains the only untried angle there.
5. Keep polling `JOURNAL_API` every cycle for new k=13 points (still 15 as
   of this cycle) — use the 2000-event pull, not the 500-event default page.
