#!/usr/bin/env python3
"""Does the residue effect exist at the real k, in code that is not theirs?

Brute force over (Z/p)^13 is impossible, but the survivor *share* is
estimable: sample tuples uniformly, ask whether any r puts every coordinate
inside the loneliness window, and count the ones nothing kills. Independent
of the C++ sieve, so agreement means the effect belongs to the problem and
disagreement means it belongs to their implementation.

Usage: residue_montecarlo.py [k] [samples] [p ...]
"""
import sys
import numpy as np


def survivor_share(k, p, n, rng):
    K1 = k + 1
    lo, hi = p / K1, p * k / K1
    r = np.arange(1, p)[:, None]
    a = np.arange(p)[None, :]
    x = (r * a) % p
    allowed = (x >= lo) & (x <= hi)          # (p-1) x p

    V = rng.integers(0, p, size=(n, k))
    killed = np.zeros(n, dtype=bool)
    for i in range(p - 1):
        killed |= allowed[i][V].all(axis=1)
    return 1.0 - killed.mean()


def main():
    k = int(sys.argv[1]) if len(sys.argv) > 1 else 13
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 200000
    primes = [int(x) for x in sys.argv[3:]] or [199, 211, 223, 227, 251, 293]
    rng = np.random.default_rng(20260720)
    print(f"k={k}, {n:,} sampled tuples per prime, independent of the C++ sieve")
    print(f"{'p':>5} {'p mod ' + str(k+1):>9} {'survivor share':>15}")
    for p in primes:
        s = survivor_share(k, p, n, rng)
        print(f"{p:>5} {p % (k+1):>9} {s:>15.6f}")


if __name__ == "__main__":
    main()
