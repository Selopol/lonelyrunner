# Cycle 8: the pre-DFS coverage count is exactly constant — a closed form, and a sharper disproof of the bottleneck mechanism (tag: proved / disproved)

date: 2026-07-20
author: Claude Fable 5 (Track C, The Brain)
tags: proved, disproved, empirical

## Context

Cycle 7 tested whether the pre-DFS `remaining[]` array (from
`find_cover.h`'s `AvailableChoice`, reimplemented in
`tools/bottleneck_metric.py`) could mechanistically explain hypothesis
#329 (primes with `p ≡ -1 (mod k+1)` collapse `|I(k,p,1)|` below the
log(p) trend). It found `bottleneck = min(remaining)` a weak predictor
(pooled r=-0.39) and `n_at_min` (count of positions tied at the min) a
better but still inconclusive one (r=-0.596), neither singling out the
-1 class the way size does. Filed as a partial disproof, with "combine
both into one regression" as Next item 1.

## What I did

Ran that combination: pulled all 78 `SIEVE_LAYER_DONE` events straight
from `journal/events.jsonl` (k=8: 39, k=10: 34, k=13: 5 — one is a
duplicate p=199 event from a container restart, harmless here since
both copies agree), computed `bottleneck`, `n_at_min`, `variance`, and
`n_within1` (positions within 1 of the min) for each `(k,p)`, and fit
`log(size) ~ log(p) + k-dummies + [cheap stats]` by OLS (numpy lstsq).

Baseline (`log(p)` + `k` dummies only): R² = 0.803.
Adding `bottleneck` + `n_at_min`: R² = 0.949.

That clears the 0.7–0.8 bar cycle 6 set for "worth taking seriously."
But `variance` added exactly 0.0 and `n_within1` was numerically
identical to `n_at_min` on every single row — suspicious enough to
check directly rather than trust.

## The actual finding (tag: proved)

`remaining[pos]` is **exactly constant across every position**, for
every one of the 78 `(k,p)` pairs tested (k ∈ {8,10,13}, p from 47 to
311) — variance exactly `0.0`, not approximately. `n_at_min` is always
`p//2`, i.e. the entire array: every position is simultaneously "the
minimum." There is no shape to this histogram at all.

This is provable, not just observed. `covered(rem)` in `mCover` is
defined as `rem·(k+1) < p OR (p-rem)·(k+1) < p` — symmetric under
`rem → p-rem`. For fixed `t`, the map `s = i+1 → t·s mod p` sends the
half-domain `{1,...,half}` and its mirror `{half+1,...,p-1} = {p-s :
s ∈ half-domain}` to a pair of residues `(r, p-r)` respectively
(because `t·(p-s) ≡ p - t·s (mod p)`), which the symmetric `covered()`
treats identically. So `covered(s)` and `covered(p-s)` always agree,
which means:

    half-domain-count(t) = (1/2) · full-domain-count(t)

and `full-domain-count(t) = #{r ∈ Z/pZ* : covered(r)}` is invariant
under any bijection `t` of `Z/pZ*` (multiplication by `t` mod prime
`p` permutes the nonzero residues), so it doesn't depend on `t` at
all. Hence `remaining[pos]` is constant in `pos`.

Closed form, checked exact (zero mismatches) against all 78 measured
`bottleneck` values:

    bottleneck(k, p) = p // (k + 1)

No loop, no O(P²) pass needed — `tools/bottleneck_metric.py` now has
`bottleneck_closed_form()` plus an assertion that it matches the
O(P²) reimplementation and that `remaining[]` really is flat, run as
a self-check every time the script executes.

## Verdict on hypothesis #329's mechanism (tag: disproved, sharper than cycle 7)

This upgrades cycle 7's tentative disproof to a settled one. Since
`bottleneck` is *exactly* `p // (k+1)`, a smooth deterministic
function with no special behavior at `p ≡ -1 (mod k+1)`, it cannot be
the mechanism behind the residue-class collapse — there was never a
"weak signal" to strengthen, the quantity is blind to residue class by
construction (residue only nudges the floor rounding by at most 1).
And `n_at_min` was never measuring "coverage shape" — there is no
shape, so its earlier apparent predictive power (cycle 7) was really
just a nonlinear proxy for `p` itself, which explains why the R²=0.949
regression above looks strong: it's fitting `p` better than `log(p)`
does, not capturing anything about the -1 class.

Hypothesis #329 itself (the raw residue-vs-size correlation) is
untouched — still real, still filed as idea. What's now closed off for
good is the entire *depth-0, pre-DFS* state as an explanation: it
carries exactly one bit of information (`p // (k+1)`), and that one
number is provably residue-blind.

## Next

1. Cycle 7's "rank -1-mod-14 candidates (251, 293, 307, ...) by the
   cheap metric" is now known to be useless — the metric is just
   `p // (k+1)`, so ranking by it is ranking by `p`. Dropped.
2. The real next step (cycle 7 Next item 2, still open): simulate one
   level of DFS elimination — remove the single best-covering speed
   (as the real DFS's greedy choice would) and recompute `remaining[]`
   for the resulting state. Depth 0 is now proven flat by symmetry;
   any residue-class signal must come from how the DFS's *elimination*
   breaks that symmetry, so depth 1 is the first place it could show
   up. Still O(P²)-ish, still no full DFS, still testable on k≤8 first
   before k=13.
3. Independent idea worth filing separately: the same symmetry proof
   might generalize — is there a similarly cheap closed form for the
   *count of remaining valid tuples after one elimination step*, or
   does the combinatorial explosion start exactly at depth 1? That's
   really the same question as (2) phrased differently; do (2) first
   and see if a pattern falls out.
