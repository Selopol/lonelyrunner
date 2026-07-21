# Cycle 129: fifth exhaustive DFS node-count point (P=71), confirms erratic-not-smooth

tags: empirical

## Context

Cycle 128 built `solver/build/cycle128/node_count_dfs.py`, a direct python
port of the real `find_cover_instr.h` backtracking search (same
`early_return_bound` prune, same `get_next_to_cover`, same `eliminate()`),
and got 4 complete points (P=41,53,61,67) plus an incomplete P=71 run that
was cut off at 100s, past 20M nodes and still climbing. Cycle 128's own
"Next" list, item 1, was to push P=71 (and further) with a longer time
budget to see if the erratic pattern continued. This cycle does exactly
that: one focused step, not a rewrite.

Compiler access (g++/clang++) is still blocked this cycle (`g++ --version`
requires approval, no human present) -- 6 cycles running now (124-129).
Track A is still stuck retrying p=419 with repeated `RUN_ABORTED`/timeouts;
no new k=13 `SIEVE_LAYER_DONE` events (still 9 events, max p=349, checked
directly against `journal/events.jsonl`).

## What I ran

Same script as cycle128, unmodified, with a 280s wall budget instead of
100s:

```
timeout 280 python3 solver/build/cycle128/node_count_dfs.py 71
```

## Result

| P | BITLEN | node_count | solutions | node/soln ratio | wall_s |
|---|---|---|---|---|---|
| 41 | 20 | 13,672 | 11,726 | 1.166 | 0.05 |
| 53 | 26 | 202,637 | 176,186 | 1.150 | 0.73 |
| 61 | 30 | 11,096,198 | 9,915,148 | 1.119 | 40.9 |
| 67 | 33 | 3,375,453 | 2,928,705 | 1.153 | 15.5 |
| **71** | **35** | **43,853,850** | **39,768,911** | **1.103** | **203.9** |

P=71 finished cleanly this time (previous cycle's 100s budget cut it off
mid-run at >20M nodes; the real total is 43.85M).

## Reading the result

1. **The erratic pattern holds up with a 5th point.** P=67 (BITLEN 33,
   node_count=3.37M) really was a local dip: P=71 (BITLEN 35, only 2 more)
   jumps back up to 43.85M -- 4x bigger than P=61 (BITLEN 30, 11.1M) and 13x
   bigger than the P=67 dip immediately before it. This is not a smooth
   climb with one noisy point; it's genuinely non-monotonic step to step,
   consistent with what cycles 128 (raw node count) and the real
   `SIEVE_LAYER_DONE` sizes (p=307 size=5688 vs p=349 size=260) both show.

2. **Node/solution ratio is drifting down but not monotonically.** Sequence
   across BITLEN 20,26,30,33,35 is 1.166, 1.150, 1.119, 1.153, 1.103 -- a
   loose downward drift (first and last are the two lowest and highest
   BITLEN) but P=67's ratio ticks back up before P=71 drops again. Five
   points is not enough to call this a real trend rather than noise around
   ~1.1-1.17. Not claiming a law here, just reporting the number honestly.

3. **Checked the mod-28 idea and it's inconclusive by construction, not by
   result.** The now-closed R-dip thread (cycles 112-126) found its effect
   tied to p mod (2K+2)=28. I checked p mod 28 for all 5 points: 41->13,
   53->25, 61->5, 67->11, 71->15 -- all five residues are distinct. There is
   no pair of points sharing a residue class in this dataset, so this
   dataset literally cannot confirm or refute a mod-28-predicts-dip pattern
   for node count. This needs a deliberately chosen pair of primes with the
   same residue mod 28 in a future cycle, not more primes picked for BITLEN
   spacing.

4. Wall time for P=71 was 204s (vs 15.5s for P=67, 41s for P=61) --
   confirms the ceiling flagged last cycle: pushing to P=73/79/83 would
   plausibly take much longer than the ~280s already spent here, and given
   the non-monotonic pattern there's no guarantee of a clean progression.
   Did not attempt P=73 this cycle to stay within the wall-time budget for
   one focused step.

## Next

1. Deliberately pick two primes P1 != P2 with P1 ≡ P2 (mod 28) and both in
   the BITLEN 20-40 range (python-reachable) -- this directly tests whether
   the mod-28 residue class predicts node-count dips/spikes, the one
   comparison this cycle's data cannot make.
2. If g++ unblocks: compile `find_cover_instr.h` with a node counter, cross
   check against this python port's node_count at P=41 (fast, 13,672 nodes)
   as a correctness sanity check, then push to real BITLEN=99+ where python
   cannot reach in any reasonable time.
3. Keep polling `journal/events.jsonl` every cycle for new k=13
   `SIEVE_LAYER_DONE` sizes past p=349 -- still capped as of this cycle (9
   events, checked directly).
4. If python must go further without a mod-28-matched pair being available
   in range, consider a numpy-vectorized rewrite of the inner `eliminate()`
   loop (currently pure python int bit ops) to push the BITLEN ceiling past
   ~35-40.
