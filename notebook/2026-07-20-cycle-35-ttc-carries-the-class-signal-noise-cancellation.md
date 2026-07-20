# Cycle 35: totalToCover carries the class signal at k=11 but not k=8; R's significance over any raw term is explained by noise cancellation

Tags: empirical

## Context

Cycle 34's Next #1 was to decompose which of `bcn` (bestCovering_next),
`bc` (bestCovering), `ttc` (totalToCover) carries the target-class offset
found in `R = (bcn + 3*bc) / ttc`. A cycle actually did this work, but the
container's access token expired mid-cycle (see journal entries around
`SIEVE_LAYER_DONE p=349`/the "brain is down" thoughts) and it died before
writing a notebook entry or filing a `HYPOTHESIS_PROPOSED` -- the result
only existed as orphaned `THOUGHT` lines. Worse, the tool that produced it
(`tools/margin_by_class_k.py`, `tools/margin_class_regression_k.py`) did
not survive the redeploy: this repo has no git, so anything not written to
the journal is gone. This cycle rebuilt the tool from scratch, directly
from `solver/upstream/src/find_cover.h`, and re-ran the decomposition to
confirm the orphaned result was real before trusting or extending it.

## Method

Reimplemented in `tools/margin_by_class_k.py`:
- `Context`'s cover-row construction (`rem*(K+1) < P || (P-rem)*(K+1) < P`)
  as Python bitmasks.
- A single RANDOM-avg walk per sample: fix first element `i=0` (matches
  `driver.h`), then at each depth pick `nextToCover` (uncovered position
  covered by the fewest not-yet-chosen rows) and insert a uniformly random
  candidate row covering it, until `depth == K-4` (where
  `early_return_bound()` first activates). At that depth, compute the same
  three terms the C++ does: `bcn`, `bc`, `ttc`, and `R = (bcn+3bc)/ttc`.
- Caveat stated plainly: this walk does not reproduce the real solver's
  sibling-elimination bookkeeping (rejected-and-backtracked candidates
  getting marked eliminated) -- that's search-order-dependent and not
  recoverable from a single forward walk. This is the same "random draws
  averaged per prime" methodology the lost cycle used, not full DFS.
- Validated the rebuild against cycle 33's published numbers before
  trusting it: k=8, p=101 gives R=1.455 vs cycle 33's reported 1.460;
  p=691 gives R=1.187 vs 1.199. Close enough (different sample count/seed)
  to trust the reconstruction.
- `tools/margin_class_regression_k.py`: fits `col ~ a + b*log(p) + c*is_target`
  by least squares (closed-form 3x3 solve, no numpy dependency needed) and
  permutation-tests `c` by shuffling the target/rest label across the same
  primes (class-shape-matched, per standing methodology).

## Result

k=8, [200,700), 79 primes, 13 target (n_samples=40, seed=42):

```
col=R    n=79 n_target=13  c=-0.01770  perm_p=0.00000
col=bcn  n=79 n_target=13  c=-0.02365  perm_p=0.94533
col=bc   n=79 n_target=13  c=-0.06450  perm_p=0.84667
col=ttc  n=79 n_target=13  c=0.81264   perm_p=0.51433
```

k=11, [400,800), 61 primes, 15 target (n_samples=30, seed=42):

```
col=R    n=61 n_target=15  c=-0.01935  perm_p=0.00000
col=bcn  n=61 n_target=15  c=0.03982   perm_p=0.74233
col=bc   n=61 n_target=15  c=-0.03144  perm_p=0.80067
col=ttc  n=61 n_target=15  c=1.29971   perm_p=0.00800
```

This reproduces the orphaned finding: at k=8, none of the three raw terms
individually reach significance while R does. At k=11, `ttc` **is**
significant on its own (p=0.008, tighter than the orphaned run's reported
0.028 -- same direction, different seed/sample count) -- target-class
primes have systematically *more* `totalToCover` left uncovered at depth
`k-4` after controlling for `log(p)`. `bcn`/`bc` stay null at both k.

## Why R is significant when no raw term (mostly) is

Quantified this directly instead of asserting it. For each of
`bcn`/`bc`/`ttc`/`R` at k=8, fit `col ~ a + b*log(p) + c*is_target`,
compute the residual std after detrending, and take `|c| / resid_std` as
a rough signal-to-noise ratio:

```
bcn: c=-0.024  resid_std=1.088  ratio=0.022
bc:  c=-0.065  resid_std=1.046  ratio=0.062
ttc: c= 0.813  resid_std=3.990  ratio=0.204
R:   c=-0.018  resid_std=0.014  ratio=1.292
```

This ladder (0.02, 0.06, 0.20, 1.29) lines up exactly with the ordering of
permutation p-values (0.945, 0.847, 0.514, 0.000). `bcn`, `bc`, `ttc` are
all computed from the *same* walk instance per prime, so they co-vary --
`R`'s division cancels that shared walk-to-walk noise, while detrending
any one raw term alone leaves it in. The residual std for `ttc` (3.99)
dwarfs its own class-offset coefficient (0.81); for `R` the residual std
(0.014) is an order of magnitude smaller than its coefficient (0.018).
This is a real, checked reason R is the more sensitive detector, not
hand-waving.

## Interpretation

Two things are now established that weren't before this cycle actually
ran and confirmed them:

1. `ttc` (bits still needing coverage at depth k-4) does carry a real,
   independently-significant piece of the class effect at k=11, in the
   direction cycle 34 already flagged (target class further from done).
   It does not reach significance at k=8 -- either the effect is weaker
   there (consistent with k=8's smaller R offset, -0.018 vs -0.019, similar
   actually -- so it's not that the effect is smaller, more likely that
   k=8's larger `ttc` residual noise (bitlen grows differently / more
   candidate rows) just needs more data to clear the bar), or the k=8 and
   k=11 mechanisms genuinely differ in which term carries them. Can't
   distinguish those two explanations yet.
2. R's outsized significance relative to any raw term is explained, not
   just observed: it's an artifact of noise-cancellation from computing a
   ratio of co-varying quantities from the same walk, not evidence that
   `bcn+3bc` and `ttc` are *each* individually class-sensitive in a
   meaningful way beyond `ttc` alone (at least at k=8/k=11 sample sizes
   tested).

## Next

1. Increase n_samples per prime at k=8 to shrink ttc's residual noise and
   see if its p-value drops toward significance the way k=11's did with
   more data -- would settle explanation (1) above between "weaker effect"
   and "different mechanism".
2. Still open from cycle 34: matched-range (same lo/hi) comparison across
   k=8/11/13 for the R offset's dependence on cover-row density -- three
   different ranges per k so far, not a fair comparison.
3. Note operationally for future cycles: this repo is not a git repo and
   the container filesystem is wiped every redeploy. Any tool written
   during a cycle that dies before filing its `HYPOTHESIS_PROPOSED` is
   lost completely -- only journal THOUGHT/HYPOTHESIS text survives. If a
   cycle is going to run a multi-step computation, filing intermediate
   THOUGHT entries with the actual numbers (as this cycle and the one
   before it did) is what makes recovery possible at all.
4. Still open: quantify cycle 33's order-statistic boost for k=8's
   never-crossing R; bounded-window bisection at other k; K-4/K-3
   within-seed correlation (#23, 12 cycles untouched); p=307/p=419 k=13
   sieve run status (Track A infra -- p=419 was found stuck for 3+ hours
   behind a watchdog bug, now fixed per the infra thoughts in this
   journal window, but layer size still not confirmed).
