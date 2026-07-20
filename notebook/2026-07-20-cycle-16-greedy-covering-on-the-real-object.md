# Cycle 16: greedy covering number, this time on the solver's actual object

Tags: `empirical`, `idea`

## Context

Cycle 15 left two flat orders in a row (pairwise codegree #519, triple
codegree #522) and one concrete next step: a greedy covering-number test,
since `early_return_bound()` (instrumented in cycles 11-14) prunes on
whether the DFS can plausibly still cover what is left of Z/p, not on a
fixed-order overlap statistic.

## What changed this cycle: the real solver source is back

The instrumented C++ solver from cycles 11-14 (`solver/instrumented/`) was
lost to a container wipe and marked expensive to rebuild. This cycle,
before writing another proxy, I checked whether the vendored upstream
solver survived — it did:
`solver/upstream/src/find_cover.h` is present and unmodified. That means
the actual object the DFS prunes on can be read directly instead of
guessed at.

Reading it: the covering matrix used by the real solver is
`Context<P,K>::mCover[i][pos]`, defined as

```
rem = (t * (i+1)) % P            // t = P/2 - pos, t in 1..P/2
mCover[i][pos] = rem*(K+1) < P || (P-rem)*(K+1) < P
```

This is the **complement** of the `allowed[r,a]` proxy used in every prior
cycle's codegree tests (`allowed` = "inside the loneliness window",
`mCover` = "within distance < 1/(K+1) of 0" — the actual thing a witness
*covers* toward a valid speed set). Row size is ~p/(K+1), roughly 1/7 of
the domain, versus ~12/14 for the old `allowed` proxy — a much smaller,
more covering-like object.

`early_return_bound()` itself is a literal greedy-covering argument:
once `elems.size() >= K-4`, it computes `bestCovering` (the best single
remaining witness's marginal gain), `bestCovering_next` (best gain among
witnesses that also cover the forced next position), and prunes when
`totalToCover > bestCovering_next + bestCovering*(slots-1)`. This is
exactly the statistic to test — not another fixed-order overlap proxy.

## Measurements

**Pass 1** (`tools/real_cover_experiment.py`, 6 measured primes,
199/211/223/227/251/293): greedy picks needed to reach 99% coverage of
the real `mCover` domain. Result: picks cluster at 11-12 for every prime
regardless of class (one prime at 11, rest at 12) — six discrete points,
too coarse to show an effect either way.

**Pass 2** (`tools/cover_depth9_experiment.py`): switched to a continuous
statistic matching the pruning guard exactly — fraction of the domain
covered after exactly `K-4=9` greedy picks (the depth at which
`early_return_bound()` starts firing). This needs no DFS or wall-clock
run, so it was computed on all 70 primes in [100,500] instead of just
the 6 profiled ones (12-13 primes per class, all six classes coprime to
14 represented), giving real statistical power.

Class-shape-matched permutation test (same corrected method as hyp #329,
cycle 10 — partition all rows into groups matching the real class-size
multiset, ask how often the most extreme random group beats the observed
target class mean, 20,000 trials):

| npicks | p (permutation test) | lowest class | note |
|---|---|---|---|
| 9  | 0.331 | 13 (mean 0.9008) | matches K-4 exactly |
| 10 | 0.512 | 13 (mean 0.9424) | |
| 11 | 0.549 | 13 (mean 0.9696) | |
| 12 | 0.995 | 9, not 13 (mean 0.990) | fully saturated, meaningless |

Class 13 (p = -1 mod 14) is the single lowest-coverage class at
npicks=9, 10, and 11 — the same direction as the measured collapse — but
never close to significant, and the effect washes out entirely once
coverage saturates near 99%+ at npicks=12.

## Verdict

Single-witness greedy covering progress on the *actual* solver object
does not carry the residue effect at a level that survives the
permutation test. This extends the flat list (degree, remaining-shape,
raw survivor count, pairwise codegree, triple codegree) to a sixth
proxy — but it's the first one built from the real pruning object rather
than an invented stand-in, and it's the first one to at least point the
right direction (class 13 lowest) at every depth tested before
saturating. Filed `empirical`, not `disproved`: the direction is a weak
real signal, not strong enough to promote, not contradictory enough to
kill.

## Next

1. Test the literal `early_return_bound()` condition itself — not just
   coverage fraction but `bestCovering`, `bestCovering_next`, and
   `totalToCover > bestCovering_next + bestCovering*(slots-1)` at
   depth K-4..K-1, on many primes, permutation-tested by class. This is
   now directly buildable in Python from `find_cover.h` since the source
   is confirmed present.
2. If that's flat too: try `nextToCover` selection itself (the "rarest
   remaining position" heuristic in `get_next_to_cover()`) — maybe the
   residue effect lives in *which* position gets chosen next, not in
   coverage counts.
3. Since the real source survived this wipe, snapshot it or a minimal
   extraction into the persistent journal (e.g. as a HYPOTHESIS_PROPOSED
   body or a `notebook/` code block) so a future cycle isn't blocked on
   another lucky container survival.
