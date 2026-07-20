#!/usr/bin/env python3
"""Where does the residue effect live? Measure the covering hypergraph.

The record holders' first sieve layer is a covering problem: a residue a
covers a time t when min(at mod p, p - at mod p) < p/(k+1), and a tuple
survives when its coordinates together cover every t. The naive survivor
share ignores the residue class of p (measured), so the effect has to sit in
how the covering sets overlap.

This measures that overlap structure directly:

  degree      |cover(a)|                     for each a
  codegree 2  |cover(a) ∩ cover(b)|          over random pairs
  codegree 3  triple intersections
  union rate  how fast random tuples cover everything

If the class of p mod (k+1) shows up in the higher codegrees while the
degree stays flat, that is the mechanism, and it is arithmetic rather than
an artefact of anyone's code.

Usage: codegrees.py [k] [samples] [p ...]
"""
import sys
from itertools import combinations

import numpy as np


def cover_sets(p, k):
    """Boolean matrix C[a][t]: does residue a cover time t."""
    a = np.arange(p)[:, None]
    t = np.arange(p)[None, :]
    x = (a * t) % p
    return np.minimum(x, p - x) < p / (k + 1)


def measure(p, k, samples, rng):
    C = cover_sets(p, k)
    deg = C.sum(axis=1)
    nz = np.arange(1, p)                      # a = 0 covers nothing useful
    pairs = rng.choice(nz, size=(samples, 2))
    co2 = np.array([np.logical_and(C[i], C[j]).sum() for i, j in pairs])
    triples = rng.choice(nz, size=(samples, 3))
    co3 = np.array([np.logical_and(np.logical_and(C[i], C[j]), C[l]).sum()
                    for i, j, l in triples])
    # how much of the circle a random k-tuple leaves uncovered
    tup = rng.choice(nz, size=(samples, k))
    unc = np.array([p - np.logical_or.reduce(C[v]).sum() for v in tup])
    return {
        "deg_min": int(deg[1:].min()), "deg_max": int(deg[1:].max()),
        "deg_mean": float(deg[1:].mean()),
        "co2_mean": float(co2.mean()), "co2_var": float(co2.var()),
        "co3_mean": float(co3.mean()),
        "uncovered_mean": float(unc.mean()),
        "fully_covered_share": float((unc == 0).mean()),
    }


def main():
    k = int(sys.argv[1]) if len(sys.argv) > 1 else 13
    samples = int(sys.argv[2]) if len(sys.argv) > 2 else 3000
    primes = [int(x) for x in sys.argv[3:]] or [199, 211, 223, 227, 251, 293]
    rng = np.random.default_rng(20260720)
    K1 = k + 1
    print(f"k={k}, {samples} samples per prime")
    print(f"{'p':>5} {'mod':>4} {'deg':>7} {'co2':>9} {'co2/deg²·p':>11} "
          f"{'co3':>9} {'uncov':>8} {'covered':>9}")
    rows = []
    for p in primes:
        m = measure(p, k, samples, rng)
        # normalise pair overlap against what independence would give
        indep2 = m["deg_mean"] ** 2 / p
        rows.append((p % K1, p, m, m["co2_mean"] / indep2))
        print(f"{p:>5} {p % K1:>4} {m['deg_mean']:>7.1f} {m['co2_mean']:>9.2f} "
              f"{m['co2_mean']/indep2:>11.4f} {m['co3_mean']:>9.2f} "
              f"{m['uncovered_mean']:>8.2f} {m['fully_covered_share']:>9.4f}")
    print()
    by = {}
    for cls, p, m, ratio in rows:
        by.setdefault(cls, []).append(ratio)
    print("pair overlap relative to independence, by residue class:")
    for cls in sorted(by):
        v = by[cls]
        print(f"  p = {cls} mod {K1}: {sum(v)/len(v):.4f}  (n={len(v)})")


if __name__ == "__main__":
    main()
