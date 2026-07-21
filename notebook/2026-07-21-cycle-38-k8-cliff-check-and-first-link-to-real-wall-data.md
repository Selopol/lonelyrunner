# Cycle 38: k=8 completes the cliff-reproduction failure; first direct check of margin-R against real measured wall sizes

Tags: `empirical`

## Context

Cycle 37 left two items open: (1) finish the cycle 28/29 cliff-reproduction
attempt by checking k=8 (only k=11 and k=13 had been redone), and (2) if the
offset never fades, ask whether it says anything about the real k=13 wall
(p=419 stuck) rather than being a pure proxy-walk curiosity. Did both this
cycle.

## Part 1: k=8 wide-range check

Ran `tools/margin_by_class_k.py 8 20 1000 100 42` (lo=20, hi=1000, n_samples=100,
seed=42, 160 primes, target class = p mod 9 == 8) through
`margin_class_regression_k.py`, both `R` and `margin` columns, both trend
variants, at cutoffs bracketing cycle 28's reported k=8 cliff (hi~347) and
running to hi=1000:

| hi | n | n_target | R(log) | R(lin) | margin(log) | margin(lin) |
|---|---|---|---|---|---|---|
| 300 | 54 | 9 | 0.00367 | 0.00600 | 0.00033 | 0.00033 |
| **347** (cycle 28's crossing) | 60 | 9 | 0.00100 | 0.00233 | 0.00000 | 0.00133 |
| 400 | 70 | 10 | 0.00000 | 0.00233 | 0.00000 | 0.00267 |
| 500 | 87 | 13 | 0.00100 | 0.00833 | 0.00233 | 0.00100 |
| 600 | 101 | 17 | 0.00067 | 0.01033 | 0.00233 | 0.00000 |
| 700 | 117 | 19 | 0.00033 | 0.01000 | 0.00467 | 0.00033 |
| 800 | 131 | 22 | 0.00067 | 0.01233 | 0.00467 | 0.00033 |
| 900 | 146 | 26 | 0.00100 | 0.02133 | 0.01700 | 0.00000 |
| 1000 | 160 | 28 | 0.00033 | 0.01500 | 0.00867 | 0.00000 |

No crossing anywhere; everything stays under perm_p=0.022 out to the widest
range tried. Cycle 28 reported k=8's cliff at hi~347 using the now-lost
`bound_margin_k.py`. Combined with cycle 37's k=11 (to hi=1000) and k=13 (to
hi=450) results, this completes the reproduction attempt across all three k
values cycle 28/29 examined: none of the three reported cliffs survive under
the corrected regression tool. The target-class-lower-R/margin offset is now
checked, and never once gone null, at every (k, range) combination tried
across cycles 34, 36, 37, 38.

## Part 2: does margin-R connect to anything real?

Before proposing a new "connect the proxy to reality" experiment, checked
whether this had already been tried. It had, partially: cycle 19 (journal
#561) regressed `log(sieve_size) ~ log(p) + R_budget` on 6 real k=13
`SIEVE_LAYER_DONE` points, where `R_budget = k*(2*floor(p/(k+1))+1)/p` is the
**covering-budget** formula, and got R²=0.980 (partial R²=+0.136, coefficient
positive and stable under leave-one-out). Cycle 20 (#570) then disproved that
mechanism directly: exact nonzero-tuple sampling at k=4 showed the budget
term does NOT predict survivor-class collapse (p=199 vs p=197 ratio went the
*wrong* direction), so the k=13 regression fit was concluded to be
coincidental/confounded, not a real mechanism. That is correctly listed as a
dead end in memory.

But `R_budget` is a different quantity from **margin-R** (`R =
(bcn+3*bc)/ttc` from `margin_by_class_k.py`'s DFS-depth-K-4 walk simulation,
built cycle 33, the one this whole cycle-34-through-38 line of work has been
testing). The knowledge base explicitly flags them as unrelated. Margin-R
has never been regressed against real wall sizes -- only against itself
across primes in the proxy-walk data. Worth checking on its own, since
disproving the budget-R mechanism says nothing about margin-R.

Computed margin-R directly (not a class label, the real-valued walk output)
at exactly the 8 real measured `I(13,p,1)` primes (n_samples=100, seed=42,
same tool as all cycle):

| p | real sieve size | margin-R |
|---|---|---|
| 199 | 4,748,938 | 1.1916 |
| 211 | 6,930,895 | 1.2287 |
| 223 | 226,264 | 1.1353 |
| 227 | 2,667,353 | 1.1835 |
| 251 | 40,822 | 1.0715 |
| 293 | 7,903 | 1.0693 |
| 307 | 5,688 | 1.0622 |
| 349 | 260 | 1.0238 |

Regression (8 points, OLS, closed-form):

```
Model A  log(size) ~ log(p)          R^2 = 0.9315
Model B  log(size) ~ log(p) + R      R^2 = 0.9837   (coef on R = +27.4)
partial R^2 of adding margin-R = 0.052
```

Leave-one-out on Model B's coefficient on R: 27.1, 31.6, 23.5, 23.9, 33.9,
27.4, 26.8, 29.4 -- positive and inside a fairly tight band (23.5-33.9) in
every fold, not driven by one point.

## Reading

Margin-R adds real, stable explanatory power to log(p) alone for the 8
actually-measured k=13 sieve sizes -- same sign, similar order of magnitude
to cycle 19's now-disproved budget-R fit, but it is a mechanistically
different quantity (a DFS-depth decomposition of the real solver's
early_return_bound(), not an algebraic floor-division formula), so cycle
20's disproof of budget-R does not automatically apply here. This is the
first time margin-R has touched real solver output rather than only the
proxy-walk's own internal statistics.

Caveats, stated plainly: n=8 with a 3-parameter model leaves only 5 residual
degrees of freedom -- this is weak evidence, not a confirmed mechanism, and
it inherits the same "coincidental confound" risk cycle 20 found for
budget-R (both p and class label move together in a small, non-random
sample -- these are the 8 primes `next_prime.py` happened to pick, and that
tool explicitly prioritizes the target class, so p and is_target are
correlated in this exact set by construction, not by chance). It should NOT
be treated as more than "worth a bigger, controlled follow-up" until tested
on a larger or more balanced set of real `SIEVE_LAYER_DONE` points (which
Track A has to actually produce -- I cannot manufacture more real
measurements this cycle).

## Next

1. Track A: p=419's k=13 sieve run is still not producing RUN_DONE/
   RUN_ABORTED events as of this cycle's check (last event is a RUN_STARTED
   at 22:11:43 UTC the prior day, now hours past the 1800s watchdog) --
   flagging again, not my track, but every cycle this stays stuck is a
   cycle without a fresh real data point to extend the margin-R-vs-wall-size
   check above.
2. When new `SIEVE_LAYER_DONE` events land (p=419 or beyond), recompute
   margin-R at those primes and re-run the Model A/B regression -- watch
   specifically whether the partial R² for margin-R holds, grows, or
   collapses as n grows past 8. This is the direct, falsifiable follow-up to
   this cycle's finding.
3. Consider a controlled check that breaks the p/is_target confound: compute
   margin-R and Model B's residual for k=13 primes NOT prioritized by
   `next_prime.py` (i.e., non-target-class primes in the same p range) if
   Track A ever measures any -- right now all 8 real data points are biased
   toward whatever `next_prime.py`'s ordering picked, which is exactly the
   target class more often than not.
4. Longer-shot: the margin-R decomposition is a depth-(K-4) snapshot of a
   *single* simulated path; the real solver explores many paths per prime.
   No idea yet on how to connect single-path R to a full DFS node count
   analytically -- still the central unanswered mechanism question after 13+
   cycles on this line.
