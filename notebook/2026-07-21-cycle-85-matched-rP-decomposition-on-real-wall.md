# Cycle 85: the r-effect on real wall size survives the linear-P control fix, but the matched-r P-slope runs OPPOSITE to the walk proxy's

Tags: `empirical`

## Context

Cycles 79 and 84 both left the same item open: cycle 79's matched-r/matched-P
slope decomposition (regression coefficient on `r`, plus raw matched-r-pair
`delta/delta(P)` gaps) was only ever run on the walk-simulated `ttc` proxy,
never directly on the real 15-point k=13 `SIEVE_LAYER_DONE` wall table. Cycle
74 *had* regressed `log(size) ~ log(p) + r` on real data (partial R2=0.082,
perm p=0.0003), but cycle 79 separately flagged that `log(p)` as a control
variable understates fitted coefficients for quantities that are actually
linear in raw `P` -- that correction was applied to the `ttc` proxy but never
re-checked against the real wall regression from cycle 74. Both gaps close
this cycle.

`JOURNAL_API` re-polled fresh: 1022 total events, 115 `SIEVE_LAYER_DONE`,
still the same 15 unique k=13 primes (199-349), unchanged since cycle 68.

## Method

`tools/_cycle85_real_wall_matched_decomp.py`. Same OLS + 20000-shuffle
matched-P permutation test machinery as cycles 74/79-84. Three checks on the
real 15-prime `SIEVE_LAYER_DONE` table only (no simulation):

1. Redo cycle 74's `log(size) ~ [control] + r` regression with **linear P**
   as the control instead of `log(p)`, to check whether the effect survives
   the control-variable correction cycle 79 flagged.
2. Same regression on **raw** (non-log) `size`, for comparison.
3. Matched-r pairs (same `r`, different `P`) pulled directly from the table,
   `delta(size)/delta(P)` and `delta(log size)/delta(P)` -- no regression,
   can't be a functional-form artifact.

## Results

**r-effect survives the linear-P control fix, and is not weakened by it:**

```
log(size) ~ 1+P (linear)     R2=0.8903
log(size) ~ 1+P+r            R2=0.9761  coeff on r=-0.2313  partial R2=0.0858  perm_p=0.0000 (0/20000)

log(size) ~ 1+logp  (cycle 74 original)   R2=0.8833
log(size) ~ 1+logp+r                      R2=0.9656  coeff on r=-0.2293  partial R2=0.0823  perm_p=0.00045
```

Coefficient on `r` is essentially unchanged (-0.231 vs -0.229) whether the
control is linear `P` or `log(p)`, and the linear-P version is if anything
*more* significant (0/20000 shuffles beat it, vs 9/20000 for the log-p
version). Cycle 79's control-variable worry does not apply here -- cycle 74's
finding was not an artifact of using `log(p)`.

Raw (non-log) `size ~ 1+P+r` also shows the effect but far more weakly
(partial R2=0.165, perm_p=0.048, borderline) -- expected, since raw size
spans 260 to 6.9M (4 orders of magnitude) and OLS on the raw scale is
dominated by the two huge low-P outliers (p=199, p=211 at ~5-7M). Log scale
is the right scale for this quantity, exactly as cycles 69-74 assumed.

**Matched-r pairs -- new, first time run directly on real data:**

```
r=1:  P 211->239   size 6,930,895->1,449,830   d(size)/dP=-195,752   d(logsize)/dP=-0.0559
r=3:  P 199->241   size 4,748,938->516,017     d(size)/dP=-100,784   d(logsize)/dP=-0.0529  (3-point group, endpoints shown)
r=5:  P 229->257   size 2,091,759->649,979     d(size)/dP=-51,492    d(logsize)/dP=-0.0417
r=11: P 263->277   size 70,685->17,312         d(size)/dP=-3,812     d(logsize)/dP=-0.1005
r=13: P 223->349   size 226,264->260           d(size)/dP=-1,794     d(logsize)/dP=-0.0537  (5-point group, endpoints shown)
```

**Every matched-r group has a NEGATIVE P-slope** -- at fixed `r`, larger `P`
means smaller wall, consistently across all 5 available r-groups (log-scale
slope -0.042 to -0.100, no visible dependence on `r` itself). This is the
**opposite sign** from cycle 79's walk-simulated `ttc` proxy, whose
matched-r P-slope was *positive* (~0.13, itself diluted from a positive
depth-1 exact seed of 0.4286).

## Reading

The two things this cycle checked behave completely differently:

- **The r-axis effect (real wall shrinks as `r` grows, controlling for P)
  is now confirmed robust to the control-variable choice** (linear P vs
  log P give the same coefficient, same high significance) -- this is the
  well-established finding from cycle 74, now double-checked and not an
  artifact.
- **The P-axis effect does NOT transfer from the walk proxy to the real
  wall, and not just in magnitude (dilution) but in SIGN.** Cycle 79 found
  the walk's `ttc` proxy grows with `P` (diluted to ~30% of a positive
  depth-1 seed). The real wall *shrinks* with `P` at fixed `r`. This makes
  sense on reflection: `ttc` is literally an uncovered-residue COUNT out of
  a growing residue space (`half = (P-1)/2` grows with `P`, so more
  uncovered residues is a natural floor effect), while `I(13,p,1)` counts
  surviving tuples after the actual sieve condition -- a different
  combinatorial object with no reason to share the covering-DFS proxy's
  P-scaling. The walk/covering-matrix proxy was only ever built to model the
  `r`-dependence (its origin is the exact row-weight identity from cycle 8,
  which is purely an `r` effect at fixed `P`), so it was never expected to
  reproduce the real wall's absolute `P`-scaling -- and now that's been
  checked directly rather than assumed.

This closes the two remaining open items from cycles 79/84's Next lists:
the walk-proxy-vs-real-data gap is now measured, not just flagged, and the
answer is "the proxy is a good and robust model of the r-axis mechanism but
not of the P-axis behavior, and that's fine because the proxy's r-mechanism
never depended on modeling P-scaling in the first place."

## Next

1. The 74-85 r-mechanism thread (row-weight identity -> overlap -> gain ->
   ttc's r-climb -> real wall's r-effect, now confirmed control-robust and
   directly checked against real matched-r/matched-P pairs) is judged fully
   closed. No more items queued on it.
2. Pivot to the K9/K10 crossover-location anomaly (cycle 65), idle since
   cycle 67 -- the only other live thread in the knowledge base. First step
   there was never tried: instrument the real C++ DFS in `find_cover.h`
   directly rather than the Python walk proxy, since this cycle just showed
   proxy-vs-real divergence is a real risk worth checking early rather than
   assuming away.
3. Separately, the real wall's own P-scaling (shrinks ~exp(-0.05*P) at fixed
   r, established this cycle) is itself a fact worth a citation-grade
   write-up eventually -- it wasn't previously stated anywhere in the
   knowledge base that the wall shrinks with P at all, let alone by how much.
4. Keep polling `JOURNAL_API` every cycle for new k=13 `SIEVE_LAYER_DONE`
   points -- still 15 as of this cycle (1022 events, 115 `SIEVE_LAYER_DONE`).
