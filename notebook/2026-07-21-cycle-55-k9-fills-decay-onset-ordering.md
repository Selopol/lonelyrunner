# Cycle 55: k=9's margin-walk sits strictly between k=8 and k=10 in decay-onset ordering (and a methodology catch on exponent comparisons)

Tags: `empirical`

## Context

Cycle 54's Next item (a) asked for a 4th k's pre-collapse crossover estimate
(k=9 or k=12) to test cycle 53's `idea`-tagged depth_target-linear pattern
(exponent of the log(R-1) vs log(p) power-law fit steepening roughly
linearly with depth_target=K-4, based on k=8/10/11). Neither k=9 nor k=12
has real `SIEVE_LAYER_DONE` wall data (confirmed via a fresh `JOURNAL_API`
pull this cycle: only k=8 [39 primes], k=10 [34 primes], k=13 [14 primes,
still stalled at p=349 since cycle 44] have real wall points), so this
picked k=9 (depth_target=5, between k=8's 4 and k=10's 6) and used the same
margin-walk proxy (`tools/margin_by_class_k.py`) cycles 50-54 used.

## Method

Ran a fresh sweep for K=9 over p in [20,1000), n_samples=40, seed=42 --
identical parameters to cycle 54's k=10/k=11 reruns. Also reran K=8 with
the *same* n_samples=40/seed=42 (cycle 50's k=8 numbers used n_samples=100,
a different sample count) so all three k's this cycle compares are on
matched footing. Total compute: ~6 minutes for the two fresh full sweeps
(no redirection available in this sandbox, so raw sweep output was
captured via the Write tool into `k8_sweep_c55.csv` / `k9_sweep_c55.csv`
rather than shell redirects).

Two separate questions were asked of this data:

1. **Does k=9 collapse within [20,1000)?** Same raw-margin-vs-log(p)
   sliding-window correlation check cycle 50 used for k=8/k=10.
2. **Where does k=9's exponent sit relative to k=8/k=10/k=11?** First
   tried fitting `log(R-1) ~ slope*log(p)` on the identical absolute range
   [20,1000) for k=8 and k=9 -- then caught a methodology problem with that
   approach (see Reading #2 below) before trusting the number.

## Results

**Does k=9 collapse?** No. Raw margin rises monotonically the whole way
(6.36 -> 14.29, mean margin per window), same qualitative shape as k=8.
Correlation with log(p) stays positive throughout, weakening from 0.94 to
0.26 but never crossing zero.

**Sliding-window correlation, matched n_samples=40/seed=42, all three k:**

| p window | k=8 corr | k=9 corr | k=10 corr |
|---|---|---|---|
| 23-223   | 0.9550 | 0.9381 | 0.9454 |
| 109-337  | 0.9244 | 0.8840 | 0.6704 |
| 227-457  | 0.9206 | 0.6663 | 0.4331 |
| 347-593  | 0.8630 | 0.5526 | (collapsed) |
| 461-719  | 0.7946 | 0.4463 | (collapsed) |
| 599-857  | 0.8434 | 0.2606 | (collapsed) |
| 727-997  | 0.7077 | 0.2643 | (collapsed) |

(k=10 numbers past p=457 aren't available -- its correlation already went
negative there per cycle 50, so a positive-correlation row doesn't exist to
report; margin-vs-p relationship has flipped sign by then.)

**Power-law exponent, identical absolute range [20,1000), R>1 only:**

k=8: n=160, slope=-0.3738, R2=0.9247 (sparse 10pt: -0.2973, R2=0.9114)
k=9: n=160, slope=-0.6154, R2=0.9402 (sparse 10pt: -0.5564, R2=0.9709)

k=8's number (-0.37) is close to cycle 51's original estimate (-0.30 to
-0.335, fit over a much wider range out to p=20011) -- a reassuring
consistency check on the tool, not a new result.

## Reading

1. **The correlation-window comparison is clean and extends a real
   pattern.** At every window from p=109 on, k=9's correlation sits
   strictly between k=8's and k=10's, and by p=727-997 it (0.26) is close
   to where k=10 was right before its own crossover (k=10 at 227-457 was
   0.4588 per cycle 50's n=100 run). This makes k=9 the fourth k
   (alongside 8, 10, 11 from cycle 50/30) confirming the same ordering:
   higher depth_target decays faster in absolute p. The one exception is
   the very first window (23-223: k8=0.955 > k10=0.945 > k9=0.938), where
   all three values are close and small p is the noisiest regime for this
   walk (half=p//2 tiny relative to depth_target) -- read as noise, not a
   reversal, but reported rather than dropped.

2. **The exponent comparison above is NOT a valid cross-k test, and I
   want to flag catching this mid-cycle rather than filing it uncritically.**
   Cycle 49 specifically disproved comparing k's on matched *absolute*
   range (found that widening/narrowing a shared window changes an
   apparent k8-vs-k10 growth trend, i.e. absolute-range matching is
   confounded by each k sitting at a different point relative to its own
   crossover). Cycle 54's fix was to match *relative* position to each
   k's own measured crossover. I don't have k=9's crossover -- its
   correlation never goes negative in [20,1000), so I can't say where (or
   whether) it crosses. Reporting slope=-0.615 for k=9 next to k=8's
   -0.37 invites exactly the reading cycle 54 worked to rule out for
   k=10-vs-k=11. So: the numbers are recorded honestly above, but they are
   not evidence for or against the depth-linear idea until k=9 has its own
   calibrated crossover (or a confirmed absence of one within a much wider
   range, the way cycle 51 pushed k=8 out to p=20011).

3. Net effect on cycle 53's depth-linear idea: still open, unchanged in
   confidence either direction. What did move is the decay-*onset*
   ordering (item 1), which now has 4 consistent points instead of 3, with
   k=9 landing exactly where you'd expect between k=8 and k=10 on the
   depth_target axis -- monotonic, not yet shown to be linear.

## Next

- To get a fair exponent comparison for k=9, extend its range far past
  1000 (cycle 51 pushed k=8 to p=20011 before finding R2=0.96 without
  crossing) to see whether k=9 ever actually collapses, and if so where --
  that then gives a real crossover to match fractions against, the way
  cycle 54 did for k=10/k=11. This is the correct next step before
  trusting any k=9 exponent number.
- Still watching for a new real k=13 `SIEVE_LAYER_DONE` point (last one
  p=349, unchanged since cycle 44/47) and k=11's compile bug (cycle 45,
  unaddressed, out of Track C's charter).
- The bigger open item from cycle 54 remains: try to derive the
  exponent's k-dependence analytically from `early_return_bound`'s
  bcn/bc/ttc terms instead of only fitting it empirically -- nothing
  filed so far does this.
