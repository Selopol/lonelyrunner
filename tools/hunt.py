#!/usr/bin/env python3
"""Track B: extremal configuration hunt for k=13 (14 runners).

Adversarial search around known tight configurations: mutations, swaps and
arithmetic families of integer speed tuples. Pipeline (nothing is claimed
from sampling alone):

  candidate (numeric prefilter) -> exactly certified (delta_verifier) ->
  matched against the known tight instances in the literature

A certified delta < 1/14 would disprove the conjecture (lottery ticket).
Certified delta == 1/14 that no known family explains would be a find;
our list of known families is the bar, and it is not the literature itself.

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
from memory import load_events, load_facts

K = 13
BOUND = Fraction(1, K + 1)
PREFILTER_MARGIN = 0.004

# Tight instances already in the literature. Absence from this list is not
# evidence of novelty, only that our list did not match; say so that way.
#
# Goddyn and Wong, "Tight instances of the lonely runner": accelerating one
# runner of the canonical instance can stay tight. Their infinite family is
# V = {1, ..., n-2, n, 2(n-1)} for n = 6t+1, which at n=13 is exactly
# {1,...,11, 13, 24}. They also list {1,4,5,6,7,11,13} and
# {1,...,17, 19, 36}.
def _goddyn_wong(n):
    return tuple(sorted(set(range(1, n - 1)) | {n, 2 * (n - 1)}))


KNOWN_TIGHT = {
    tuple(range(1, 14)),                    # the canonical instance
    _goddyn_wong(13),                       # (1..11, 13, 24)
    (1, 4, 5, 6, 7, 11, 13),
    (1, 3, 4, 7), (1, 3, 4, 5, 9),
    (1, 2, 3, 4, 5, 7, 12),
    tuple(sorted(set(range(1, 18)) | {19, 36})),
} | {_goddyn_wong(6 * t + 1) for t in range(1, 8)}


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

    # A configuration certified in an earlier pass is not a new find. Keep
    # verifying it, but do not announce it again.
    already = set()
    facts = load_facts()
    if facts is not None:
        already = {tuple(v) for v in facts.get("certified_speeds", [])}
    else:
        try:
            for e in load_events():
                if e["type"] == "EXACTLY_CERTIFIED":
                    already.add(tuple(e["payload"].get("speeds", [])))
        except Exception:
            pass

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
        info["unmatched_by_known_list"] = novel  # not a novelty claim
        results.append(info)
        if info["status"] in ("TIGHT", "COUNTEREXAMPLE"):
            seen_before = tuple(info["speeds"]) in already
            if seen_before:
                print(f"[{info['status']}] {info['speeds']} (already certified)")
            else:
                already.add(tuple(info["speeds"]))
                append("CANDIDATE_FOUND", {
                    "track": "B", "pass": pass_name, "speeds": info["speeds"],
                    "sampled_delta": s})
                append("EXACTLY_CERTIFIED", {
                    "track": "B", "pass": pass_name, **info})
                print(f"[{info['status']}] {info['speeds']} delta={info['delta']}"
                      f" unmatched_by_known_list={novel}")

    summary = {
        "track": "B", "pass": pass_name, "screened": screened,
        "exact_certified": kept,
        "tight_found": sum(1 for r in results if r["status"] == "TIGHT"),
        "tight_unmatched_by_known_list": sum(
            1 for r in results
            if r["status"] == "TIGHT" and r["unmatched_by_known_list"]),
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
