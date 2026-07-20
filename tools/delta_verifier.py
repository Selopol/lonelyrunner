#!/usr/bin/env python3
"""Exact delta verifier for the Lonely Runner Conjecture.

For distinct positive integer speeds v_1..v_k (observer stationary at 0),
computes EXACTLY (rational arithmetic, no sampling):

    delta(V) = max_{t in [0,1)} min_i || v_i * t ||

where ||x|| is the distance from x to the nearest integer. The conjecture
states delta(V) >= 1/(k+1) for every V; a certified delta(V) < 1/(k+1)
would be a counterexample. Tuples with delta(V) == 1/(k+1) are tight.

Method: each f_i(t) = ||v_i t|| is a triangle wave, linear between
breakpoints t = m/(2 v_i). On each interval of the common refinement all
f_i are lines; max of min of lines on an interval is attained at an
endpoint or at an intersection of an increasing and a decreasing line.
All candidates are rational -> evaluate with Fraction, take the max.

Usage:
  delta_verifier.py 1 2 3 4 5 6 7 8 9 10 11 12 13
  delta_verifier.py --selftest
"""
import sys
from fractions import Fraction
from math import gcd


def _f(v, t):
    x = (v * t) % 1
    return min(x, 1 - x)


def _line(v, t_mid):
    """Line (slope, intercept) of f_v on the interval containing t_mid."""
    x = (v * t_mid) % 1
    if x <= Fraction(1, 2):
        # f = v*t - floor(v*t)
        k = (v * t_mid) - x
        return Fraction(v), -k
    # f = 1 - (v*t - floor(v*t))
    k = (v * t_mid) - x
    return Fraction(-v), 1 + k


def delta(speeds):
    v = sorted(set(int(s) for s in speeds))
    if len(v) != len(speeds):
        raise ValueError("speeds must be distinct")
    if any(s <= 0 for s in v):
        raise ValueError("speeds must be positive")
    g = 0
    for s in v:
        g = gcd(g, s)
    v = [s // g for s in v]

    # Common refinement: all breakpoints m/(2 v_i) in [0, 1].
    bps = {Fraction(0), Fraction(1)}
    for s in v:
        for m in range(2 * s + 1):
            bps.add(Fraction(m, 2 * s))
    bps = sorted(bps)

    best = Fraction(0)
    best_t = Fraction(0)
    for a, b in zip(bps, bps[1:]):
        mid = (a + b) / 2
        lines = [_line(s, mid) for s in v]
        # Candidate times: interval endpoints + pairwise intersections.
        cands = [a, b]
        for i in range(len(lines)):
            si, ci = lines[i]
            for j in range(i + 1, len(lines)):
                sj, cj = lines[j]
                if si == sj:
                    continue
                t = (cj - ci) / (si - sj)
                if a <= t <= b:
                    cands.append(t)
        for t in cands:
            val = min(_f(s, t) for s in v)
            if val > best:
                best, best_t = val, t
    return best, best_t


def classify(speeds):
    k = len(set(speeds))
    d, t = delta(speeds)
    bound = Fraction(1, k + 1)
    if d < bound:
        status = "COUNTEREXAMPLE"
    elif d == bound:
        status = "TIGHT"
    else:
        status = "LONELY"
    return {"speeds": sorted(set(int(s) for s in speeds)), "k": k,
            "delta": str(d), "delta_float": float(d),
            "bound": str(bound), "witness_t": str(t), "status": status}


SELFTESTS = [
    # (speeds, expected delta) — known values from the literature.
    ((1, 2), Fraction(1, 3)),              # n=3 tight
    ((1, 2, 3), Fraction(1, 4)),           # n=4 tight
    ((1, 3, 4, 7), Fraction(1, 5)),        # n=5 sporadic tight (Goddyn-Wong)
    ((1, 2, 3, 4), Fraction(1, 5)),        # n=5 tight
    ((1, 3, 4, 5, 9), Fraction(1, 6)),     # n=6 sporadic tight
    ((1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13), Fraction(1, 14)),  # k=13 fixture
]


def selftest():
    ok = True
    for speeds, expected in SELFTESTS:
        d, t = delta(speeds)
        status = "pass" if d == expected else "FAIL"
        ok = ok and d == expected
        print(f"[{status}] delta{speeds} = {d} (expected {expected}, witness t={t})")
    return ok


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--selftest":
        sys.exit(0 if selftest() else 1)
    speeds = [int(x) for x in sys.argv[1:]]
    if len(speeds) < 2:
        print(__doc__)
        sys.exit(1)
    import json
    print(json.dumps(classify(speeds), indent=2))
