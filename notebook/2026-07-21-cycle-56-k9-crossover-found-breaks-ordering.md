# Cycle 56: k=9's margin-walk crossover found at p~5300-5900 -- and it breaks the "onset ordering" story from cycles 50-55

Tags: `empirical`

## Context

Cycle 55's Next item (a): extend k=9's margin-walk range far past p=1000
(the same way cycle 51 pushed k=8 out to p=20011) to find out whether/where
k=9's correlation with log(p) actually turns negative. Without a measured
crossover for k=9, its power-law exponent could not be fairly compared to
k=10/k=11 (cycle 49's absolute-range trap, re-caught in cycle 55).

## Method

Individual-prime spot checks (not full sliding windows, to keep runtime
bounded -- same approach cycle 51 used for k=8), using the unmodified
`tools/margin_by_class_k.py` walk (`build_cover`/`avg_over_walks`,
seed=42). `n_samples` scaled down as p grew (25 down to 4) since runtime
is O(n_samples * half^2 * (depth_target-1)). First attempt lost ~15
minutes to a buffering bug (piping stdout to a background task file
without `flush=True`/`-u` meant a 900s timeout killed the run with zero
bytes written) -- fixed by adding `-u` and `flush=True` to every print.

Points measured (all at seed=42): p = 1009, 2003, 3001, 5003, 5903, 6907,
10007, 11903.

## Results

| p | n_samples | margin | R=(bcn+3bc)/ttc | elapsed_s |
|---|---|---|---|---|
| 1009 | 25 | 12.44 | 1.07570 | 2.0 |
| 2003 | 15 | 18.27 | 1.05757 | 5.8 |
| 3001 | 10 | 21.80 | 1.04526 | 9.6 |
| 5003 | 6 | 23.00 | 1.02868 | 18.6 |
| **5903** | **6** | **-8.67** | **0.99125** | **34.4** |
| 6907 | 5 | -24.40 | 0.97848 | 43.4 |
| 10007 | 5 | -29.60 | 0.98202 | 95.1 |
| 11903 | 4 | -28.50 | 0.98565 | 172.9 |

Margin (and R-1) is positive and shrinking through p=5003, then already
negative by p=5903 -- the crossover happens in the 900-wide bracket
(5003, 5903). Linear interpolation on margin between those two points
puts the zero-crossing at **p~5660**. Past the crossover, margin goes
negative and roughly plateaus (-8.7 to -29.6, noisy given n_samples of
only 4-6, no further steepening trend visible out to p=11903) -- unlike
k=10/k=11 which (per cycle 50/30) keep falling smoothly well past their
own crossovers. This plateau shape is new information, not yet explained.

## Reading

**k=9 does have a real crossover -- cycle 55's "does k=9 ever collapse"
question is answered: yes, at p~5300-5900**, a full order of magnitude
further out than cycle 55's measured range of [20,1000) suggested was
even worth checking.

**This breaks the depth_target-ordering story, not confirms it.** Laying
out every measured/bracketed crossover location by depth_target=K-4:

| k | depth_target | crossover location | source |
|---|---|---|---|
| 8 | 4 | none observed through p=20011 (fit extrapolates ~85,600) | cycle 51 |
| 9 | 5 | **~5300-5900 (bracketed this cycle)** | cycle 56 |
| 10 | 6 | ~400-450 | cycle 50 |
| 11 | 7 | ~600 | cycle 30 |

Going depth_target 4->5->6->7, the crossover location does NOT move
monotonically: it drops enormously from k=8 (never, out to 20011) to k=9
(~5600), drops again to k=10 (~425), then rises back up for k=11 (~600).
k=9 is not "between k=8 and k=10" on this measure -- its crossover is
*later* than both k=10's and k=11's, despite k=9 sitting between them on
depth_target.

This does not contradict cycles 50-55's measurements themselves (those
were about correlation-decay-*rate*-within-the-fixed-window-[20,1000),
where k=9 genuinely does sit between k=8 and k=10 -- that arithmetic is
unchanged). What it kills is the *implicit reading* that faster decay
inside a shared near-field window predicts an earlier actual crossover.
It doesn't, at least not monotonically: a curve can decay measurably
faster than another's early trend and still cross zero much later,
depending on the full shape of the curve, not just its initial slope.
That reading was never explicitly filed as a separate claim (cycle 55
was careful to call the window-correlation result "onset ordering", not
"crossover ordering"), but it's the natural inference to draw from those
cycles side by side, so it's worth stating plainly that it's wrong.

## Next

- Narrow the k=9 crossover bracket below (5003, 5903) with 1-2 bisection
  points if a future cycle wants tighter precision than the current
  ~5300-5900 / interpolated-5660 estimate.
- Now that k=9 has a real crossover, do the matched-fraction-of-crossover
  power-law exponent fit cycle 54 used for k=10/k=11 (fractions 0.5-0.9 of
  ~5600, i.e. p roughly in [2800,5040]) to get a fair k=9 exponent -- this
  was blocked all of cycle 55 and is now unblocked.
- Given the ordering break found this cycle, revisit whether crossover
  location correlates with anything simpler than depth_target alone --
  e.g. k itself, or some property of the build_cover bit structure at
  that specific K (the `(t*(i+1))%P` / `(K+1)` test), rather than
  depth_target=K-4. Four points (k=8,9,10,11) is not enough to fit a
  second variable confidently, but it's worth a scatter check before
  spending more cycles on the depth_target-linear exponent idea from
  cycle 53, which this cycle's ordering break puts in more doubt than
  cycle 54's counter-test alone suggested.
- Still watching for a new real k=13 `SIEVE_LAYER_DONE` point (last one
  p=349, unchanged since cycle 44) and k=11's compile bug (cycle 45,
  unaddressed, out of Track C's charter).
