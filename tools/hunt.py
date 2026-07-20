#!/usr/bin/env python3
"""Track B: extremal configuration hunt for k=13 (14 runners).

Adversarial search around known tight configurations: mutations, swaps and
arithmetic families of integer speed tuples. Pipeline (nothing is claimed
from sampling alone):

  candidate (numeric prefilter) -> exactly certified (delta_verifier) ->
  novelty check (vs known tight list)

A certified delta < 1/14 would disprove the conjecture (lottery ticket).
Certified delta == 1/14 with new structure = new tight instance (real find).

Usage: hunt.py [--max-speed 40] [--pass-name mutations-v1]
"""
import itertools
import json
import os
import sys
from fractions import Fraction
from math import gcd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from delta_verifier import delta, classify
from journal import append

K = 13
BOUND = Fraction(1, K + 1)
PREFILTER_MARGIN = 0.004

# Known tight instances for k=13 we consider non-novel.
KNOWN_TIGHT = {tuple(range(1, 14))}


def norm(t):
    t = sorted(set(t))
    if len(t) != K or any(x <= 0 for x in t):
        return None
    g = 0
    for x in t:
        g = gcd(g, x)
    return tuple(x // g for x in t)


def sampled_delta(speeds, n=20000):
    try:
        import numpy as np
    except ImportError:
        return None
    t = np.arange(1, n) / n
    x = np.outer(list(speeds), t) % 1.0
    return float(np.minimum(x, 1 - x).min(axis=0).max())


def candidates(max_speed):
    base = tuple(range(1, 14))
    seen = set()

    def emit(t):
        t = norm(t)
        if t and t not in seen and max(t) <= max_speed:
            seen.add(t)
            yield t

    # Single-component mutations of the canonical tight tuple.
    for i in range(K):
        for new in range(1, max_speed + 1):
            mut = list(base)
            mut[i] = new
            yield from emit(mut)
    # Double mutations of the two fastest components.
    for a in range(1, max_speed + 1):
        for b in range(a + 1, max_speed + 1):
            mut = list(base[:11]) + [a, b]
            yield from emit(mut)
    # Arithmetic families a, a+d, ..., a+12d.
    for a in range(1, 6):
        for d in range(1, 4):
            yield from emit(tuple(a + d * i for i in range(K)))
    # Codex-suggested tuple (unverified claim -> certify it here).
    yield from emit((1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 24))


def main():
    max_speed = 40
    pass_name = "mutations-v1"
    if "--max-speed" in sys.argv:
        max_speed = int(sys.argv[sys.argv.index("--max-speed") + 1])
    if "--pass-name" in sys.argv:
        pass_name = sys.argv[sys.argv.index("--pass-name") + 1]

    screened = kept = 0
    results = []
    for t in candidates(max_speed):
        screened += 1
        s = sampled_delta(t)
        if s is not None and s > float(BOUND) + PREFILTER_MARGIN:
            continue  # comfortably lonely, not extremal — skip exact cert
        kept += 1
        info = classify(t)
        novel = tuple(info["speeds"]) not in KNOWN_TIGHT
        info["novel_vs_known_list"] = novel
        results.append(info)
        if info["status"] in ("TIGHT", "COUNTEREXAMPLE"):
            append("CANDIDATE_FOUND", {
                "track": "B", "pass": pass_name, "speeds": info["speeds"],
                "sampled_delta": s})
            append("EXACTLY_CERTIFIED", {
                "track": "B", "pass": pass_name, **info})
            print(f"[{info['status']}] {info['speeds']} delta={info['delta']}"
                  f" novel={novel}")

    summary = {
        "track": "B", "pass": pass_name, "screened": screened,
        "exact_certified": kept,
        "tight_found": sum(1 for r in results if r["status"] == "TIGHT"),
        "tight_novel": sum(1 for r in results
                           if r["status"] == "TIGHT" and r["novel_vs_known_list"]),
        "counterexamples": sum(1 for r in results if r["status"] == "COUNTEREXAMPLE"),
        "max_speed": max_speed,
    }
    append("RUN_DONE", {"run_id": f"hunt-{pass_name}", **summary})
    print(json.dumps(summary, indent=2))
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..",
                       "journal", "raw", f"hunt-{pass_name}.json")
    with open(out, "w") as f:
        json.dump(results, f, indent=2)


if __name__ == "__main__":
    main()
