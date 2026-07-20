#!/usr/bin/env python3
"""Pick the next prime for a k=13 probe: one nobody has measured yet.

Every bounded probe used to restart the upstream prime list from its head, so
the same easy primes were measured again and again while the rest of the list
stayed dark. This picks an unmeasured prime instead, and orders the candidates
to test the open question first: does p = -1 (mod k+1) collapse I(k,p,1)?

Prints one prime to stdout.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from memory import load_events

# The upstream prime list for K=13 (solver/upstream/main.cpp, LrcVerifier<13>).
CANDIDATES = [
    199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277,
    281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367,
    373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449,
    457, 461,
]
K = 13


def main():
    measured = set()
    for e in load_events():
        p = e.get("payload", {})
        if e["type"] in ("SIEVE_LAYER_DONE", "PRIME_VERIFIED") and p.get("k") == K:
            measured.add(p.get("p"))
    fresh = [p for p in CANDIDATES if p not in measured]
    if not fresh:
        print(CANDIDATES[0])
        return
    # Test the residue-class hypothesis first: primes at -1 mod (k+1) look
    # dramatically cheaper in the data so far. Smallest first inside a class.
    fresh.sort(key=lambda p: (0 if p % (K + 1) == K else 1, p))
    print(fresh[0])


if __name__ == "__main__":
    main()
