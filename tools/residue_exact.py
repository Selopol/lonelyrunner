#!/usr/bin/env python3
"""Exact survivor counts over NONZERO speeds, by residue class of p.

My first attempt at this sampled speeds from all of Z/p, including zero. A
zero speed covers every time, so every tuple containing one survives by
construction: the measured share matched 1 - ((p-1)/p)^k to five decimals
and carried no information about the conjecture at all. The refutation built
on it has been withdrawn.

This counts exactly, over nonzero speeds only:

    survivors(k, p) = #{ v in (Z/p \\ {0})^k : every time t is covered,
                         i.e. no t has all |v_i t| >= p/(k+1) }

Small k only, because that is where exact is affordable, and exactness is
the whole point.

Usage: residue_exact.py [k] [max_prime]
"""
import sys
from itertools import product

import numpy as np


def primes_upto(n):
    return [x for x in range(2, n)
            if all(x % d for d in range(2, int(x ** 0.5) + 1))]


def survivors(k, p):
    """Vectorised exact count over (Z/p \\ {0})^k."""
    K1 = k + 1
    a = np.arange(1, p)[:, None]
    t = np.arange(1, p)[None, :]
    x = (a * t) % p
    # covers[a-1][t-1]: speed a is within p/(k+1) of the observer at time t
    covers = np.minimum(x, p - x) < p / K1

    # A tuple survives iff for every t at least one coordinate covers t.
    # Walk tuples with early rejection on the accumulated "not yet covered" set.
    n = p - 1
    total = 0

    def rec(depth, uncovered):
        nonlocal total
        if not uncovered.any():
            total += n ** (k - depth)     # any completion survives
            return
        if depth == k:
            return
        # even covering everything still needs the remaining coordinates
        for i in range(n):
            rec(depth + 1, uncovered & ~covers[i])

    rec(0, np.ones(p - 1, dtype=bool))
    return total


def main():
    k = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    top = int(sys.argv[2]) if len(sys.argv) > 2 else 40
    K1 = k + 1
    print(f"k={k}: exact survivor counts over nonzero speeds, window 1/{K1}")
    print(f"{'p':>5} {'p mod ' + str(K1):>9} {'survivors':>12} {'share':>12}")
    rows = []
    for p in primes_upto(top):
        if p <= K1:
            continue
        s = survivors(k, p)
        share = s / (p - 1) ** k
        rows.append((p % K1, p, s, share))
        print(f"{p:>5} {p % K1:>9} {s:>12} {share:>12.6f}")
    print()
    by = {}
    for cls, p, s, share in rows:
        by.setdefault(cls, []).append(share)
    print("mean survivor share by residue class:")
    for cls in sorted(by):
        v = by[cls]
        print(f"  p = {cls} mod {K1}: {sum(v)/len(v):.6f}  (n={len(v)})")


if __name__ == "__main__":
    main()
