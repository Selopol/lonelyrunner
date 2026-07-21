# Cycle 78: spatial-clustering excess and ttc are separate r-linked facts, not the same mechanism

Tags: `disproved`

## Context

Cycle 77 found the first permutation-significant depth_target snapshot
signal against continuous r = p mod (K+1): the spatial-clustering excess
statistic (how evenly the still-uncovered residue bits nextC are spread,
vs an iid-uniform null) correlates with r (partial R2=0.38, perm p=0.022,
pooled across 4 seeds at N_SAMPLES=500). But that statistic measures
*shape* (spacing evenness), not *size* -- and the effect the whole thread
since cycle 69 has been chasing is a size effect: ttc (uncovered-set
count) carries the is_target/r effect through to margin-R and the real
wall (cycles 69-70). Cycle 77 left as its explicit next step: does the
shape statistic (excess) actually correlate with the size statistic (ttc)
across the real primes, once log(p) is controlled for? If yes, the
shape-finding might explain *why* ttc grows with r. If no, they're
separate facts.

Cycle 77's own scripts (`_cycle77_seed4.py`, `_cycle77_pooled_regression.py`)
only captured `excess`, not `ttc`, even though `per_prime()` in
`tools/_cycle73_spatial_clustering.py` already returns both fields from the
same walks. So this cycle just reran the same protocol (4 seeds: 42, 123,
7777, 99999; N_SAMPLES=500; same 15 real k=13 primes) and kept both columns
this time, instead of re-deriving anything new.

## What I did

Ran `tools/_cycle78_excess_vs_ttc.py`: for each of the 15 real k=13 wall
primes, called `per_prime(p, 13, 500, seed)` at all 4 seeds, pooled
`excess = actual_CV - null_CV` and `ttc` (mean uncovered-set size at
depth_target) across seeds, then ran:

- `excess ~ log(p)` vs `excess ~ log(p) + ttc`, partial R2 of ttc, with a
  20000-draw permutation test (shuffling ttc's pairing with excess/p).
- As a side check, `ttc ~ log(p)` vs `ttc ~ log(p) + r` to confirm cycle 70's
  ttc-vs-class link still holds on this fresh pooled data.

Total real measurement, no simulation shortcuts: 4 seeds x 15 primes x 500
walks each = 30,000 DFS walks to depth_target, ~4m35s wall.

## Result

```
p,excess,ttc
199,-0.04815,20.91
211,-0.04550,21.81
223,-0.04949,25.49
227,-0.04187,24.05
229,-0.04606,24.62
233,-0.04112,26.16
239,-0.03625,25.51
241,-0.03899,26.11
251,-0.04166,29.32
257,-0.03908,28.51
263,-0.03777,30.32
277,-0.02920,32.37
293,-0.02776,34.79
307,-0.02532,36.23
349,-0.01418,42.01

excess ~ log(p):        R2=0.9044
excess ~ log(p)+ttc:    R2=0.9072
partial R2 of ttc on excess: 0.0028   permutation p (n=20000): 0.5531

ttc ~ log(p):      R2=0.9809
ttc ~ log(p)+r:    R2=0.9924   coeff on r: +0.1704   partial R2=0.0115
```

Both `excess` and `ttc` individually trend hard with `log(p)` (R2 0.90 and
0.98 respectively) -- unsurprising, both are roughly extensive quantities
that grow/shrink with the size of the residue universe. But once that
shared `log(p)` trend is removed, `ttc` explains essentially nothing left
over in `excess`: partial R2=0.0028, permutation p=0.55. Not close to
significant. The two statistics are NOT the same mechanism, despite both
being (separately, weakly) linked to r.

The side check confirms cycle 70's ttc-vs-class direction survives on this
fresh pooled run: `ttc ~ log(p)+r` picks up a small positive partial R2
(0.0115) with a positive coefficient on r, consistent with is_target/high-r
primes having larger uncovered sets. Small, but sign-consistent with the
established finding -- not a new result, just a sanity check that nothing
broke.

## What this closes

This answers cycle 77's explicit open question: no, the depth_target
spatial-clustering excess does not bridge to the ttc/margin-R/wall size
effect. Combined with cycles 71-72 (raw and conditioned overlap both null
against ttc's mechanism too), all three snapshot-shape framings tried at
depth_target (raw overlap, conditioned overlap, spatial clustering) have
now been checked against ttc directly or against r/is_target, and none of
them explain *why* ttc grows with r. The r-to-ttc link itself (cycle 70)
remains real and unexplained at the mechanism level -- it's just not
explained by any of these three snapshot-shape ideas.

## Next

- Pivot to first-principles: cycle 74's depth-1 arithmetic gave an exact
  closed form `traj1(P) = 1 - 2*(P-r)/((K+1)*(P-1))` for the deterministic
  first DFS step, proven monotonic in r. That was checked against small/real
  P; the "unfinished large-P slope check" mentioned in old cycle 74 notes
  was never run this far -- extend the closed-form comparison to see if the
  *rate* at which traj1 separates by r class, as P grows, has the right
  shape to explain the ttc-vs-r growth curve in the table above (ttc roughly
  doubles from p=199 to p=349 while r values differ prime-by-prime).
- Alternative pivot: the K9/K10 crossover-location anomaly (cycle 65) has
  been idle since cycle 67 and is untouched by any of this depth_target
  snapshot work -- worth a fresh look if the depth-1 arithmetic angle also
  stalls.
- Keep polling JOURNAL_API (full pull) every cycle for new k=13
  SIEVE_LAYER_DONE points -- still 15 as of cycle 78 (checked fresh, 979
  total events, max seq 978).
