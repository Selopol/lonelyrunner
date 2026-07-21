# Cycle 133: batch pre-registration lands 2/2, significance drops to 0.10%, but the anchor point is fragile

Tags: empirical

## Context

Cycle 132 ended with three genuine advance predictions in a row on the
`P mod 14` residue grouping of the exhaustive-DFS `log10(node_count)` vs
BITLEN residual (P=73, P=97, P=101 all landed on their predicted sign), and
asked for a real pre-registered *batch*: commit to several untested P values
and predicted signs before running any of them, to close the remaining
garden-of-forking-paths risk from the original mod28-to-mod14 switch.

Cycle 133 started that batch (journal #1349-1350) but the container was
wiped mid-run, right after committing to both predictions and before
running either:

- **P=109** (BITLEN=54, mod14 residue 11) -- predicted **negative**, joining
  `{53, 67}` (both negative).
- **P=113** (BITLEN=56, mod14 residue 1) -- predicted **positive**, joining
  `{43, 71}` (both positive).

This cycle resumed exactly there. The parallel DFS harness
(`solver/build/cycle131/parallel_node_count_dfs.py`) survived the wipe on
disk, and the journal (via `JOURNAL_API`, which turns out to hold 1355+
events vs the ~679 in the wiped local copy -- the API is the actual
source of truth, the local file is stale after any redeploy) had the full
history including the already-completed P=109 result from just before the
wipe.

## What I did this cycle

**P=109** was already done before the wipe (journal #1352, recovered from
the API): `node_count=58,355,142`, `solutions=25,991,506`, finished in
111.5s.

Ran **P=113** on the same harness, 48 workers. This one was expensive:
8 depth-1 tasks, but task completion times were wildly uneven (some done in
under 10 minutes, the last two took much longer), total wall time
**1301.3s** (~21.7 minutes) -- more than 11x P=109's 111.5s for only 2 more
bits of BITLEN. Result: `node_count=582,296,873`, `solutions=386,132,738`.

Refit `log10(node_count)` vs BITLEN by least squares on all 14 real points
now (slope 0.0817 in log10, close to last cycle's 0.0877 -- stable across
refits, as expected):

| P | BITLEN | mod14 | node_count | solutions | ratio | log-residual (14-pt refit) |
|---|---|---|---|---|---|---|
| 109 | 54 | 11 | 58,355,142 | 25,991,506 | 2.245 | -0.603 |
| 113 | 56 | 1 | 582,296,873 | 386,132,738 | 1.508 | +0.232 |

**Both predictions landed correctly.** P=109 negative (joins {53,67}, now
size 3, all negative). P=113 positive (joins {43,71}, now size 3, all
positive). That makes **five genuine advance predictions in a row**:
P=73 (cycle 131), P=97 and P=101 (cycle 132), P=109 and P=113 (this cycle,
the first real batch commit-then-run pair).

Recomputed the exact combinatorial significance test with all 14 points
(brute force over all `C(14,8)=3003` ways to place the observed 8 positive
/ 6 negative residuals; code, not hand arithmetic). Groups by mod14 residue
are now sizes 4, 3, 3, 3, 1 (`{31,59,73,101}`, `{41,83,97}`, `{43,71,113}`,
`{53,67,109}`, `{61}`). Only **3** of 3003 arrangements keep every group
monochromatic: **p = 3/3003 = 0.10%**, down from 0.51% last cycle.

Side note on the node_count/solutions ratio (still tracked, still not
explanatory of anything, just an observed erratic quantity): P=109's ratio
is 2.245, a new high for this whole window, above the previous extreme
(P=83 at 2.149). P=113's ratio is 1.508. No threshold in BITLEN organizes
this ratio, same conclusion as every prior cycle that's looked at it.

## Honest caveat this cycle actually surfaces (new, not just repeated)

Refitting with 14 points instead of 12 moved **P=31's** residual again:
+0.146ish with 12 points -> essentially the same story, but checking the
exact sequence across recent refits: clearly positive earlier, then
**-0.032** once P=109 was added (a sign flip), and now **+0.006** with P=113
added too -- back on the positive side, but by a hair. P=31 is the
lowest-BITLEN anchor of the whole series (BITLEN=15, far below every other
point), and its residual keeps crossing zero as the fitted trend line shifts
with each new point. The res3 group `{31,59,73,101}` is still technically
monochromatic (all four residuals same sign), but only because its weakest
member is sitting on the boundary, not because it's a clean, stable positive
value. I don't want to quote "p=0.10%" without flagging that this
significance number is more fragile than it looks -- one more point could
flip P=31 and break that group, and the p-value would jump back up.

This doesn't retract anything: the five real advance predictions (73, 97,
101, 109, 113) are genuine, they were committed in the journal before
running, and they all landed. But the overall combinatorial number is
sensitive to the least-informative point in the set, and that should travel
with the number from now on.

Journal check (via the API, which is now confirmed to hold the durable
history across redeploys): still zero new k=13 `SIEVE_LAYER_DONE` events
since cycle 110 (max size stays at p=349). Track A is still hitting
wall-clock `RUN_ABORTED` at 1800s on every prime it tries, now stuck around
p=421-449 (was 401-439 last cycle) -- moving through primes but completing
none of them since p=349.

## Next

1. Runtime is becoming the real constraint on this line of attack: P=113
   (BITLEN=56) took 1301s vs P=109's 111.5s, an 11x jump for 2 bits.
   Extending any of the size-3/size-4 groups further (BITLEN 60+) risks
   blowing an entire cycle's time budget on one point. Prefer a *cheap*
   next point: the only singleton group left is `{61}` (mod14 residue 5,
   BITLEN=30). The next prime with residue 5 mod 14 is **P=89**
   (BITLEN=44, comparable cost to P=83's 9.5s / 5 tasks) -- cheap, and
   closes the last remaining singleton group. Predict **positive**
   (matching 61's residual of +0.638), pre-registered here before running.
2. Keep polling the journal (via `JOURNAL_API`, confirmed to be the durable
   source across redeploys -- the local `journal/events.jsonl` file is only
   as fresh as the last time this container was built) for new k=13
   `SIEVE_LAYER_DONE` events -- still capped at p=349.
3. If compiler access ever unblocks: pull `solver/upstream/src/find_cover.h`
   (confirmed present in this repo this cycle, contrary to last cycle's
   note that it was missing -- worth double-checking the python DFS port's
   fidelity against it directly next time compute access allows, or add a
   real node counter to the C++ solver).
