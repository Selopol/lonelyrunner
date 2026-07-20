#!/usr/bin/env python3
"""Is the residue effect a property of the problem or of one implementation?

The record holders' C++ sieve shows |I(k,p,1)| collapsing when p = -1 mod
(k+1). This recomputes the same quantity from the definition, independently,
in Python, for small k where brute force is honest:

    I(k,p,1) = { v in (Z/p)^k : no r in [1,p) puts every r*v_i inside the
                 loneliness window [p/(k+1), k*p/(k+1)] }

A tuple killed by some r is provably fine at this prime; the survivors are
what the expensive phases must chew on. If the residue class governs the
survivor count here too, in code that shares nothing with the C++, the effect
belongs to the problem.

Usage: residue_experiment.py [k] [max_prime]
"""
import sys


def primerange(a, b):
    for n in range(a, b):
        if n > 1 and all(n % d for d in range(2, int(n ** 0.5) + 1)):
            yield n


def survivors(k, p):
    """Count tuples with no witness r. Coordinate-wise: for each r, the set
    of allowed residues is fixed, so a tuple survives iff for every r at
    least one coordinate falls outside that r's allowed set."""
    K1 = k + 1
    lo, hi = p / K1, p * k / K1
    # allowed[r] as a bitmask over residues a: is r*a inside the window
    allowed = []
    for r in range(1, p):
        mask = 0
        for a in range(p):
            x = (r * a) % p
            if lo <= x <= hi:
                mask |= 1 << a
        allowed.append(mask)

    # Count tuples killed by at least one r via inclusion over r is hopeless;
    # instead walk tuples directly for small k.
    count = 0
    from itertools import product
    for v in product(range(p), repeat=k):
        for mask in allowed:
            if all((mask >> a) & 1 for a in v):
                break
        else:
            count += 1
    return count


def main():
    k = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    top = int(sys.argv[2]) if len(sys.argv) > 2 else 40
    K1 = k + 1
    print(f"k={k}, window [1/{K1}, {k}/{K1}], brute force over (Z/p)^{k}")
    print(f"{'p':>5} {'p mod ' + str(K1):>9} {'survivors':>12} {'share':>9}")
    rows = []
    for p in primerange(K1 + 2, top):
        s = survivors(k, p)
        rows.append((p % K1, p, s, s / p ** k))
        print(f"{p:>5} {p % K1:>9} {s:>12} {s / p**k:>9.5f}")
    print()
    by_class = {}
    for cls, p, s, share in rows:
        by_class.setdefault(cls, []).append(share)
    print("mean survivor share by residue class:")
    for cls in sorted(by_class):
        vals = by_class[cls]
        print(f"  p = {cls} mod {K1}: {sum(vals)/len(vals):.5f}  (n={len(vals)})")


if __name__ == "__main__":
    main()
