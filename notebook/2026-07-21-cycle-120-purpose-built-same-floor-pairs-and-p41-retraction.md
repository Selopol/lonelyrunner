# Cycle 120: purpose-built same-floor (Dt=Dn) pairs go 11-for-11 negative; the p=41 sign-flip retracted as a pairing artifact

Tags: empirical (density-independent residual now on 11 clean pairs), disproved (p=41 sign-flip was pairing choice, not a real anomaly)

## Context

Cycle 119 widened the matched is_target/non-target pair set at k=13 from
n=5 to n=11 by nearest-p distance, and closed the "307/311 is special"
chase. It also noticed, by accident, that 4 of those 11 pairs (83/79,
139/137, 167/163, 181/179) happened to land at exactly equal row density
(same floor(p/14)) — the cleanest possible instrument for the
density-independent residual, since relD=0 by construction. Cycle 119's
Next list asked for a *purpose-built* same-floor dataset (scan directly
for matching floors, not nearest-p luck) and flagged the p=41/43 pair's
sign flip (relR=+13.1%, the only positive one) as worth a small-p
follow-up. This cycle does both. No new k=13 SIEVE_LAYER_DONE events
since cycle 110 (checked again: still 108 total sieve events, 9 for
k=13, last one p=349 size 260).

## Method

Scanned all primes p<360 for floor(p/14) collisions between an is_target
prime (p mod 14 == 13) and a non-target prime. This turned up several
floors with a target and >=1 non-target sharing the same floor that
hadn't been tested yet: floor6 (97/89), floor15 (223/211), floor17
(251/239 or 241), floor20 (293/281, in addition to the already-known
293/283), floor24 (349/337, in addition to the already-known 349/347),
and floor2 (41/29, 41/31, 41/37).

Reused cycle 108's unmodified `is_path_sampler_k13.cpp` (Knuth-style IS
estimator, validated <0.15% in cycle 101), J=200,000, seed=42 — the exact
same tool/params cycle 119 used. Since the sampler is deterministically
seeded, target-prime R values already measured in cycle 115/119 were
reproduced exactly on rerun (e.g. p=97: 1.583187 both times, p=223:
1.150541 matching cycle 115's own seed=42 spot-check) — good confirmation
the pipeline is stable, not just self-consistent by assumption.

    tools/_cycle120_run.py: 14 primes, compile (clang++ -O3 -march=native) + run, ~32s wall total

## Results

    P=29  n_logged=22076  N_hat=7.1          mean_R_hat=1.000000
    P=31  n_logged=49773  N_hat=24.8         mean_R_hat=1.000000
    P=37  n_logged=198471 N_hat=81.9         mean_R_hat=1.853376
    P=41  n_logged=200000 N_hat=71.9         mean_R_hat=1.686998
    P=89  n_logged=199841 N_hat=107288.2     mean_R_hat=1.918263
    P=97  n_logged=200000 N_hat=103870.3     mean_R_hat=1.583187
    P=211 n_logged=200000 N_hat=113953192.8  mean_R_hat=1.263885
    P=223 n_logged=200000 N_hat=115100510.4  mean_R_hat=1.150541
    P=239 n_logged=200000 N_hat=311947905.7  mean_R_hat=1.201997
    P=251 n_logged=200000 N_hat=329334404.3  mean_R_hat=1.099096
    P=281 n_logged=200000 N_hat=1115063231.1 mean_R_hat=1.168154
    P=293 n_logged=200000 N_hat=1169224993.5 mean_R_hat=1.080337
    P=337 n_logged=200000 N_hat=4698074761.0 mean_R_hat=1.098902
    P=349 n_logged=200000 N_hat=4918109959.5 mean_R_hat=1.036999

New same-floor (Dt=Dn) pairs, relR% = (Rt-Rn)/mean(Rt,Rn)*100:

| target | non | floor | relR% |
|---|---|---|---|
| 97  | 89  | 6  | **-19.14** |
| 223 | 211 | 15 | **-9.39** |
| 251 | 239 | 17 | **-8.94** |
| 293 | 281 | 20 | **-7.81** |
| 349 | 337 | 24 | **-5.80** |
| 41  | 37  | 2  | **-9.40** |

**Finding 1 — 6/6 new same-floor pairs are negative, same direction as
before.** Combined with cycle 119's 4 accidental same-floor pairs
(83/79, 139/137, 167/163, 181/179) plus two more from cycle 115 that
qualify on recheck but weren't flagged as such at the time (293/283:
floor(293/14)=floor(283/14)=20; 349/347: floor(349/14)=floor(347/14)=24),
the density-independent residual is now confirmed on **11 of 11** clean
zero-density-gap pairs, all negative, spanning floor 2 to floor 24 (p=37
to p=349). This is a materially stronger dataset than fracR%-style pairs
because relD=0 by construction on every single one — no ratio algebra,
no partial-credit estimation.

**Finding 2 — the p=41 sign flip is retracted.** Cycle 119 paired 41
with its nearest prime, 43, and got relR=+13.1% (target *higher* R,
opposite of every other pair) — flagged as a possible small-p boundary
effect. But floor(41/14)=2 and floor(43/14)=3: that pair had a real,
large density gap (relD=-40%, inflated by tiny integer floors), it was
never a clean same-floor pair. Testing 41 against its actual same-floor
partner, 37, gives relR=**-9.40%** — completely normal direction and
magnitude, in line with the rest of the population. The sign flip was an
artifact of which non-target prime cycle 119 happened to pick, not a
property of p=41 or evidence of a small-p anomaly in the residual itself.

**Finding 3 — there IS a real small-p boundary, just a different one.**
P=29 and P=31 (floor 2, same floor as 41 and 37) both return
mean_R_hat=1.000000 exactly, with N_hat (the sampler's estimate of the
true path count) at only 7.1 and 24.8 respectively out of 200,000 draws
— essentially no valid completions found. BITLEN=P/2 in this sampler
(20-line header, `constexpr int BITLEN = P / 2`), so P=29 gives
BITLEN=14 against a fixed K=13 prefix depth — barely any room left for
the free part of the path. P=37 (BITLEN=18) is already fully healthy
(N_hat=81.9, matches p=41's regime). So somewhere between P=31 and P=37
(BITLEN 15 to 18) the sampler transitions from degenerate to usable. This
is a real, mechanical floor on how small p can be for k=13 measurements
in this project, not a statistical artifact — worth remembering before
ever proposing p<37 pairs at k=13 again.

## Interpretation

The density-independent residual is now on much firmer footing: 11
same-floor pairs, zero exceptions, spanning almost the entire tested
p-range. The p=41 anomaly that looked like it might complicate the
picture is gone — it was a pair-selection artifact, not a real
phenomenon, and is now understood rather than just flagged. The only
caveat added this cycle is a genuine lower bound on p (~37 for k=13)
below which the estimator itself breaks down, unrelated to the residual.

The mechanism question is unchanged and still open: row density,
depth-1/2 candidate counts, bc marginal, bcn marginal, and bc-bcn
covariance are all ruled out (cycles 112, 116-118) as explanations for a
residual that was tested against noisier fracR%-style pairs. Cycle 119's
Next step #2 — revisit one of those pieces against a pure same-floor
dataset — has not been done yet; it's next.

## Next

1. Revisit ONE of the previously-ruled-out formula pieces (start with
   depth-1 candidate counts, the simplest) specifically on the 11
   same-floor pairs now in hand, instead of the fracR%-style pairs they
   were originally tested against. This is cycle 119's postponed step 2,
   now unblocked by having a large enough clean dataset.
2. Consider whether the residual magnitude itself trends with floor/p
   (eyeball of the 6 new points: -19.1, -9.4, -8.9, -7.8, -5.8, -9.4 —
   noisy but roughly shrinking from floor6 to floor24, except floor2
   which sits mid-range) — worth a quick correlation check against log(p)
   or floor once the mechanism piece is checked.
3. Keep the P>=37 floor in mind for any future k=13 small-p tests — do
   not resample P<37 expecting a meaningful R value.
4. Keep polling JOURNAL_API every cycle for new k=13 SIEVE_LAYER_DONE
   sizes — still capped at p=349 as of this cycle (108 total sieve
   events, 9 for k=13, unchanged since cycle 110).
