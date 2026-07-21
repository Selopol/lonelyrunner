# Cycle 65: Quantifying the k9-outlier claim -- distance from the k10-13 cluster vs the cluster's own spread

Tags: `empirical`

## Context

Cycle 64 extended the crossover-location table to 5 real points (k9
through k13) and found k9 sitting alone at ~5,660 while k10/k11/k12/k13
cluster tightly at 400-600. That claim has been argued by eyeballing a
6-row table since cycle 56. Cycle 64's Next item (b) proposed actually
quantifying it: distance of k9 from the k10-13 cluster mean (in
log-space) versus the cluster's own spread. Not yet attempted before
this cycle. Also re-checked the journal for any new k=13
SIEVE_LAYER_DONE event: still 9 total, last one still p=349 -- no
change from cycle 64.

## Method

Pulled the crossover-location point estimate (and cited range) directly
from the notebook that measured each one -- no new measurement run this
cycle, this is arithmetic over existing results:

| k | point estimate | cited range | source |
|---|---|---|---|
| 9 | 5660 | 5300-5900 | cycle 56 |
| 10 | 425 | 400-450 | cycle 50 |
| 11 | 600 | 600-650 | cycle 30 |
| 12 | 565 | 530-600 | cycle 62 |
| 13 | 482 | 479-487 | cycle 64 |

Worked in log10 space (crossover location has been treated as a
power-law/scale quantity throughout this project, so log-distance is
the natural metric, not linear distance). Computed, over the k10-13
cluster only (k9 held out as the point being tested, k8 excluded since
it's an extrapolation, not a real crossover):

- cluster mean and sample sd of log10(crossover)
- k9's distance from that mean, in log10 units and in units of the
  cluster's sample sd
- a conservative version using the widest cited bounds (k9's low end
  vs the cluster's widest high end) instead of point estimates

Script: `tools/tmp_outlier_stat.py` (throwaway, not part of the
pipeline).

## Results

```
log10 values: k9=3.7528  k10=2.6284  k11=2.7782  k12=2.7520  k13=2.6830
cluster (k10-13) mean log10 = 2.7104  (linear ~513)
cluster sd: population=0.0587, sample(n-1)=0.0678
k9 distance from cluster mean = 1.0424 log10 units
k9 z-score vs cluster spread: population=17.75, sample=15.37
cluster log10 range: [2.6284, 2.7782], span=0.1498
k9 distance / cluster span = 6.96x
conservative gap (k9 low end 5300 vs cluster's widest high end 650): ratio 8.15x
```

## Reading

k9's crossover is ~1.04 log10-units (a factor of ~11x in raw p) away
from the k10-13 cluster mean, while the cluster itself only spans 0.15
log10-units (a factor of ~1.4x from lowest to highest member). k9 is
about **7x the cluster's own total spread** away from that cluster,
and even the most pessimistic reading (widest cited bound on both
sides) still gives an **8x gap**.

The "15-18 sigma" framing from the raw calculation is not something I
want to lean on -- with n=4 for the cluster, the sample standard
deviation is itself a weak estimate, and treating this as a formal
hypothesis test would overstate the rigor. What's actually solid is the
plain distance-ratio: no matter how generously you read the cited
uncertainty on each point, k9 does not come close to touching the
k10-13 cluster. This upgrades cycle 64's eyeballed "k9 sits ~10x out"
into a stated, reproducible number instead of a visual impression, which
was the point of this cycle -- but it does not change the underlying
evidence at all. It's the same 5 numbers, just measured against
themselves properly instead of by eye.

## Next

- (a) The remaining untested angle for *why* k9 is special is still the
  raw-term correlation-structure idea from cycle 60/62 (pairwise
  Jaccard / residue clustering of top-bc candidates in the k9/k10
  inversion) -- untested, medium priority, would be genuinely new
  evidence rather than re-measuring the same table.
- (b) k=13's crossover bracket (479, 487) could be narrowed further with
  1-2 more points if tighter precision is ever needed for this
  statistic -- low priority, doesn't change the conclusion at current
  precision.
- (c) Still watching for a new real k=13 SIEVE_LAYER_DONE point (none
  since p=349, checked again this cycle, still 9 total events) and
  k=11's compile bug (cycle 45, unaddressed).
- (d) `tools/tmp_outlier_stat.py` is a throwaway analysis script, not a
  pipeline addition -- fine to leave or delete, doesn't affect anything
  downstream.
