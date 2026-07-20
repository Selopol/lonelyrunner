#!/usr/bin/env python3
"""Track B, second generation: search families, not neighbours.

The mutation hunt walks integer tuples one coordinate at a time, which is
the big space the Jacobian construction deliberately avoided. This searches
parametric families instead, and certifies every hit exactly.

Families implemented:

  goddyn_wong(n, r, m)   accelerate one runner of {1..n} by a factor: replace
                         r with m*r. Goddyn and Wong prove tightness holds
                         exactly when r shares a factor with every element of
                         [(n+1)-r, m(n+1-r)-1]; we test their criterion
                         against our exact delta and report disagreements.
  double_accel(n, ...)   accelerate two runners at once: outside their
                         theorem, so anything tight here is worth a look.
  scaled_ap(a, d, drop)  arithmetic progressions with one term replaced.
  geometric_tail(n, g)   {1..n-j} with a geometric tail, the structured end
                         of the spectrum where correlations survive.

Every certified instance is matched against the known families before it is
called anything. Usage: families.py [--max-speed 200] [--pass-name fam-1]
"""
import json
import os
import sys
from fractions import Fraction
from math import gcd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np

from delta_verifier import classify
from journal import append
from memory import load_facts

K = 13
BOUND = Fraction(1, K + 1)
PREFILTER_MARGIN = 0.004


def sampled_delta(speeds, n=20000):
    """A sampled max can only undershoot the true delta, so a tuple that
    already looks comfortably lonely cannot be tight and needs no exact pass."""
    t = np.arange(1, n) / n
    x = np.outer(list(speeds), t) % 1.0
    return float(np.minimum(x, 1 - x).min(axis=0).max())


def norm(t):
    t = sorted(set(int(x) for x in t))
    if len(t) != K or any(x <= 0 for x in t):
        return None
    g = 0
    for x in t:
        g = gcd(g, x)
    return tuple(x // g for x in t)


# ---------- the families ----------

def goddyn_wong_criterion(n, r, m):
    """Their stated condition: r shares a factor with every element of
    [(n+1)-r, m(n+1-r)-1]."""
    lo, hi = (n + 1) - r, m * (n + 1 - r) - 1
    if lo > hi:
        return True
    return all(gcd(r, x) > 1 for x in range(lo, hi + 1))


def accelerated(n, r, m):
    """{1..n} with r replaced by m*r, as a k=13 tuple when it has 13 members."""
    s = set(range(1, n + 1))
    if r not in s:
        return None
    s.discard(r)
    s.add(m * r)
    return norm(s) if len(s) == K else None


def family_instances(max_speed):
    """Yield (tuple, label, predicted_tight_or_None)."""
    n = K + 1  # {1..14} has 14 members; dropping to 13 happens by accelerating
    for base_n in (K, K + 1):
        for r in range(1, base_n + 1):
            for m in range(2, 24):
                t = accelerated(base_n, r, m)
                if t and max(t) <= max_speed:
                    pred = (goddyn_wong_criterion(base_n, r, m)
                            if base_n == K else None)
                    yield t, f"accelerate n={base_n} r={r} m={m}", pred

    # two runners accelerated at once: outside the theorem
    for r1 in range(1, K + 1):
        for r2 in range(r1 + 1, K + 1):
            for m1 in range(2, 8):
                for m2 in range(2, 8):
                    s = set(range(1, K + 1))
                    s -= {r1, r2}
                    s |= {m1 * r1, m2 * r2}
                    t = norm(s)
                    if t and max(t) <= max_speed:
                        yield t, f"double r={r1},{r2} m={m1},{m2}", None

    # arithmetic progressions with one term replaced
    for a in range(1, 4):
        for d in range(1, 5):
            base = [a + d * i for i in range(K)]
            for i in range(K):
                for new in range(1, max_speed + 1):
                    cand = list(base)
                    cand[i] = new
                    t = norm(cand)
                    if t and max(t) <= max_speed:
                        yield t, f"ap a={a} d={d} slot={i}->{new}", None

    # geometric tails on a canonical head
    for cut in range(8, K):
        for g in (2, 3):
            head = list(range(1, cut + 1))
            tail, v = [], head[-1]
            while len(head) + len(tail) < K:
                v *= g
                tail.append(v)
            t = norm(head + tail)
            if t and max(t) <= max_speed:
                yield t, f"geometric head={cut} ratio={g}", None


def main():
    max_speed = 200
    pass_name = "families-1"
    if "--max-speed" in sys.argv:
        max_speed = int(sys.argv[sys.argv.index("--max-speed") + 1])
    if "--pass-name" in sys.argv:
        pass_name = sys.argv[sys.argv.index("--pass-name") + 1]

    facts = load_facts() or {}
    already = {tuple(v) for v in facts.get("certified_speeds", [])}

    seen, tested, tight, disagreements = set(), 0, [], []
    screened_out = 0
    for t, label, predicted in family_instances(max_speed):
        if t in seen:
            continue
        seen.add(t)
        tested += 1
        if sampled_delta(t) > float(BOUND) + PREFILTER_MARGIN:
            screened_out += 1
            continue
        info = classify(t)
        is_tight = info["status"] in ("TIGHT", "COUNTEREXAMPLE")
        if predicted is not None and predicted != is_tight:
            disagreements.append({"speeds": info["speeds"], "family": label,
                                  "criterion_says": predicted,
                                  "exact_says": info["status"]})
        if is_tight:
            tight.append({**info, "family": label})
            if t not in already:
                already.add(t)
                append("EXACTLY_CERTIFIED", {
                    "track": "B", "pass": pass_name, "family": label, **info})
                print(f"[{info['status']}] {info['speeds']}  {label}")

    summary = {
        "run_id": f"families-{pass_name}", "track": "B", "pass": pass_name,
        "families_tested": tested, "screened_out_numerically": screened_out,
        "exactly_certified": tested - screened_out, "tight_found": len(tight),
        "criterion_disagreements": len(disagreements),
        "max_speed": max_speed,
    }
    if disagreements:
        summary["disagreement_sample"] = disagreements[:5]
    append("RUN_DONE", summary)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
