# Cycle 116: early-depth candidate counts are fully determined by row density -- ruled out as the source of the 307/311 residual

Tags: disproved

## Context

Cycle 115 closed the "is density mechanism real" question (yes, confirmed on
both the walk-proxy and the real IS estimator) but surfaced a new one: the
matched pair p=307 (is_target) vs p=311 (non-target) at k=13 showed density
*overshooting* the real R dip (frac=112.3%, the only measurement above 100%
in either method). Something real partially offsets density's pull for that
specific pair. Cycle 115's "Next" list proposed checking depth-1 candidate
counts or degree distribution for that pair specifically -- a lead not yet
tried for a specific pair (only ruled out generically at k=13 in much
earlier cycles).

## Method and result 1: depth-1 degree distribution is exactly constant, not just flat

Recomputed the exact `build_cover` matrix construction from
`is_path_sampler_k13.cpp` in Python for all 10 primes in cycle 115's 5
matched pairs (223/227, 251/257, 293/283, 307/311, 349/347), and measured
the *column* sums (`remaining[pos]`, i.e. how many residues cover a given
position) -- as opposed to the already-established *row* sums (cycle
8/67/82/112: exactly `p // (k+1)` per row).

Result: column sums are **exactly constant across every position**, not
approximately -- population variance is precisely 0.0 for all 10 primes
tested (verified also on a small sanity case, k=5/p=29). Column sum equals
row sum, both exactly `p // (k+1)`.

This isn't a coincidence -- it's provable. `cover(i)[pos]` depends only on
`rem = (t * v) % p` where `v = i+1` and `t = BITLEN - pos`, and both `v` and
`t` range over the same set `[1, BITLEN]`. Since `t*v = v*t`, the coverage
condition is symmetric under swapping `v` and `t`: the incidence matrix
`M[v][t]` literally equals its own transpose. Row sums = column sums is a
trivial corollary of that symmetry, not new independent structure.

Consequence: in `is_path_sampler_k13.cpp`, the *first* candidate-set size
`m` at depth 1 (`AvailableChoice::_remaining[nextToCover]`, before any
elimination) is exactly `p // (k+1)` for every position, every prime, every
run -- zero variance to carry information beyond what row density (already
priced in) explains. This turns cycle 112's generic "depth-1 shape is flat"
dead end into a *proof* of why, and rules it out specifically for the
307/311 pair, not just on average.

## Method and result 2: depth-2 candidate-count trajectory also collapses to row density alone

Went one level further: instrumented a copy of the sampler
(`solver/build/cycle116/is_path_sampler_probe.cpp`) to log the depth-2
candidate-set size `m` per sample (200,000 samples, seed=42, all 10 primes).

| pair | mean_m2 target | mean_m2 non | relM2% |
|---|---|---|---|
| 223/227 | 10.867 | 11.812 | -8.34 |
| 251/257 | 12.587 | 13.164 | -4.48 |
| 293/283 | 14.847 | 14.847 | **0.000** |
| 307/311 | 15.191 | 16.134 | -6.02 |
| 349/347 | 17.496 | 17.496 | **0.000** |

The 293/283 and 349/347 pairs come out **bit-identical** (mean and
variance match to 4 decimals) -- not close, identical. The distinguishing
factor: `293 // 14 == 283 // 14 == 20` and `349 // 14 == 347 // 14 == 24`
(matched row density despite mismatched `is_target` status), while the
other three pairs have mismatched row density and correspondingly differ
normally.

Reason: `eliminate()` decrements `remaining[pos]` by exactly 1 at exactly
`row_density`-many positions each step, because every row sums to that same
constant (proven in result 1). With the same RNG seed and the same starting
`m = row_density`, the entire early candidate-count trajectory is forced
identical whenever two primes share row density -- it never depends on
*which* residues are structurally involved, only on the scalar count. This
generalizes result 1: depth-2 (and by the same argument, likely deeper
depths' *m*-sequence) carries zero information beyond row density.

**Crucially**, `mean_R_hat` still differs between 293 (1.080337) and 283
(1.146941) despite the identical m-trajectory -- so the real divergence
that eventually produces different R values is NOT in the depth-1/depth-2
candidate counts. It has to come from the terminal step: `bc`/`bcn`, the
max real bitset overlap between a candidate and the final uncovered set
`nextC`, computed once per path at depth `K-4`. That calculation depends on
genuine matrix structure (which specific residues cover which positions),
not just the row-density scalar.

## Interpretation

Both depth-1 (proven exactly) and depth-2 (proven empirically, with an
exact mechanism) candidate-count statistics are fully determined by row
density and carry no separate information. This closes off "check depth-1
candidate counts / degree distribution for 307/311" as cycle 115 posed it
-- there is nothing there to find, and now there's a clear reason why. The
307/311 residual (and any residual left after density's 54-112% band from
cycle 115) has to live in the terminal bc/bcn computation, which is the
first place in the whole path where real (non-count) structure enters.

## Next

1. Look at bc/bcn specifically for the 307/311 pair vs the other 4 pairs --
   e.g. instrument the sampler to log bc, bcn, and ttc separately (not just
   the combined R), and compare their relative offsets to relR% and relD%
   per pair. This is the first unexplored piece of the R formula.
2. If that's still flat, consider whether the *choice of which* residue
   is picked at each depth (not just the count) matters -- i.e. whether
   two primes with matched row density but different actual structure ever
   diverge before the terminal step, by comparing paths that share the same
   RNG draws further into the walk (depth 3, 4, ...).
3. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE sizes
   -- still capped at p=349 as of this cycle (9 k=13 entries total since
   cycle 68), Track A still stuck on timeouts with zero new layers since
   cycle 110.
