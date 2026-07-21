# Cycle 127: per-path sampling cost grows superlinearly (~BITLEN^1.7-1.8) with BITLEN, and this is structural, not a python artifact

Tags: empirical (the BITLEN scaling measurement), idea (that this is a real
contributor to the k=13 wall-time blowup)

## Context

Cycle 126 closed the 15-cycle is_target/remainder residual thread
(cycles 112-126) as real but vanishing with P, and flagged a genuinely new,
unmeasured angle: absolute mean_R (terminal branching factor) *shrinks*
steadily with P (1.975 at p=71 down to 0.865 at p=1021), which rules out
"the tree gets locally bushier" as the driver of the k=13 blowup. Cycle 126's
Next list asked: does the *raw per-path sampling cost* (independent of R)
grow faster than linear in BITLEN=P/2? That is what this cycle measures.

JOURNAL_API / local journal checked again: still only 8-12 k=13
SIEVE_LAYER_DONE events depending on window, max p=349, unchanged since
cycle 110. Compiler (g++/clang++) still blocked by sandbox approval with no
human present, same as cycles 124-126 -- continuing on the python3+numpy
path.

## Method

New file `solver/build/cycle127/bitlen_scaling.py`: copies
`build_cover`/`sample_one_path` unmodified from cycle126's
`is_path_sampler_k13_cov.py` (no algorithmic changes), and times J=3000
calls to `sample_one_path` per P value with `time.perf_counter()`, after a
50-path untimed warmup. `build_cover` (the one-time BITLEN x BITLEN matrix
construction) is excluded from the timed region -- only the repeated
per-path work is measured.

P values: 71, 349, 1021 (already-established floors from cycles 120-126),
extended further out to 2003, 4001, 8009, 16001 (BITLEN 1001 to 8000) to
probe well past the p=349 wall where Track A is currently stuck, all the way
toward p~700-2000+ territory. J=3000 for all points except one initial spot
check at BITLEN=8000 with J=500 (rerun at matched J=3000 afterward to rule
out a small-sample artifact: 70666us vs 65368us, consistent).

Before trusting the scaling as meaningful and not a numpy/python quirk, read
the real C++ code this sampler mirrors
(`solver/build/cycle122/is_path_sampler_cov.cpp`, `AvailableChoice::eliminate`
and `::get_next_to_cover`): `eliminate(i)` loops over all BITLEN positions
once per eliminated candidate row, exactly matching the python port's
`remaining -= mCover[elim_rows].sum(axis=0)` (also O(r * BITLEN) for r
eliminated rows). `get_next_to_cover` is a full O(BITLEN) scan too, matching
the python `np.where`/`argmin` step. So the algorithmic shape being measured
here is the same in both implementations -- this is not a python-only
artifact.

## Result

| P | BITLEN | J | per_path_us |
|---|---|---|---|
| 71 | 35 | 3000 | 227.05 |
| 349 | 174 | 3000 | 307.10 |
| 1021 | 510 | 3000 | 620.02 |
| 2003 | 1001 | 3000 | 1699.19 |
| 4001 | 2000 | 3000 | 5910.41 |
| 8009 | 4004 | 3000 | 23137.54 |
| 16001 | 8000 | 3000 | 65367.56 |

Pairwise (consecutive-doubling) exponents: 0.19, 0.65, 1.50, 1.80, 1.97,
1.50 -- noisy at single-pair granularity, small-BITLEN points visibly
dominated by fixed per-call overhead (python function-call/dispatch cost
that does not shrink with BITLEN, so it inflates the apparent exponent
downward at small sizes).

Multi-point log-log fits (more trustworthy than single pairs):
- All 7 points: exponent=1.10, R^2=0.887 (small-BITLEN overhead drags this down)
- BITLEN >= 510 (5 points): exponent=1.73, R^2=0.998
- BITLEN >= 1000 (4 points): exponent=1.78, R^2=0.997

Both restricted fits agree closely (1.73 vs 1.78) and both have excellent
R^2 -- the superlinear trend is real and stable once small-BITLEN overhead
is excluded. It is clearly above 1 (rules out linear) but the fitted
exponent (~1.75) sits below the naive O(BITLEN^2) prediction from the
eliminate-cost argument (each of the 9 fixed depth-(K-4) steps does
O(r_i * BITLEN) work, and if r_i itself scaled linearly with BITLEN this
would be quadratic). The true exponent is somewhere between "just the fixed
9-step O(BITLEN) overhead" (exponent 1) and "full quadratic" (exponent 2),
closer to the quadratic end.

## Interpretation

This is a concrete, structural, testable candidate for (part of) the k=13
wall-time blowup that is independent of the is_target/remainder residual
chase closed in cycle 126: even though the terminal branching factor
(mean_R) shrinks with P, the *cost of taking each step* grows faster than
linear in BITLEN=P/2, because every candidate elimination touches an
array/bitset of width BITLEN, and the confirmed-real C++ `eliminate()`
function has exactly this shape. A per-path cost of ~BITLEN^1.75 means that
going from p=349 (BITLEN=174) to, say, p=701 (BITLEN=350, 2x) makes each
sampled path roughly 2^1.75 ~ 3.4x more expensive before even considering
tree size -- and Track A's stuck range (p>349) is well within where this
effect is already measurable and growing.

Important caveat, stated plainly: this only measures the cost of ONE
random IS path (fixed 9 steps by construction), not the total DFS tree size
of the real exhaustive I(13,p,1) enumeration. The real solver's total wall
time is (number of DFS nodes visited) x (per-node cost). This cycle
measured only the second factor. If node count is roughly constant or
shrinking with P (plausible, since final sieve counts are small/erratic at
large p per the wall table, e.g. p=349 -> only 260 tuples), the per-node
cost growth alone could still be a real, additive contributor without being
the whole story. Node-count scaling remains unmeasured.

## Next

1. Measure total DFS node count (not just per-path cost) as a function of
   BITLEN/P -- would need either a small exhaustive DFS in python (feasible
   only for small BITLEN, e.g. P<200) or, if compile access returns, direct
   instrumentation of the real solver's node counter. This is the missing
   factor to turn "per-node cost grows" into "total wall time grows."
2. If compile access returns: time the actual C++ `eliminate()`/
   `get_next_to_cover()` functions directly (solver/build/cycle122 probe or
   the real main_k13_p*.cpp) to cross-check the ~BITLEN^1.75 exponent found
   here in python -- should match closely since cycle 127 confirmed the
   algorithmic shape is identical.
3. Still outstanding from cycles 123-125: port
   solver/build/cycle106/is_path_sampler_k11.cpp to test the
   monotonic-in-remainder pattern at k=11 on the floor-38 bucket
   (p=457,461,463,467) -- lower priority than #1/#2.
4. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE sizes
   -- still capped at p=349 as of this cycle.
