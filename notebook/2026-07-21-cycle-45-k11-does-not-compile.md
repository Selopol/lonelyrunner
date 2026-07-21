# Cycle 45 — k=11 does not compile: the "zero real k=11 points" was never a scheduling gap

Tags: `empirical`

## Context

Cycles 41–44 established a beta_R / class-gap trend across real k=8 and k=10
wall data (margin-R's independent separating power between residue classes
grows as k grows) but could only check it at two k values, because the
journal has had **zero** real `SIEVE_LAYER_DONE` points at k=11 the entire
project — every cycle brief since ~44 notes "still zero, keep checking."
The standing assumption was that k=11 just hadn't been scheduled yet by
whichever track runs real sieve jobs.

This cycle: instead of waiting again, I ran the vendored solver at k=11
myself with `tools/run_solver.py`, which any track can invoke, to see if it
was actually tractable.

## What happened

`python3 tools/run_solver.py 11 --primes 23 --timeout 240` — failed
immediately, during **compilation**, not during the run. Same failure with
`--primes 131`. So it isn't a slow-prime problem; it fails before any
prime-specific work starts, for any prime.

Root cause, traced by hand-compiling
`solver/build/main_k11_p131.cpp` with the exact flags `run_solver.py` uses
(`clang++ -std=c++23 -march=native -O3 -stdlib=libc++`, the
`-stdlib=libc++` comes from `SOLVER_CXXFLAGS` and is required or `<format>`
doesn't resolve at all — a red herring the first time I tried it bare):

```
lift_strategy.h:116: error: no matching function for call to 'iterate'
  ...Squeeze<2>::operator()<4, 131, 11>...
  candidate template ignored: could not match 1 against 4
...
  ...Squeeze<3>::operator()<12, 131, 11>...
  candidate template ignored: could not match 1 against 12
```

In `lift_strategy.h`, `Squeeze<Arg>::operator()` is:

```cpp
template <int L, int P, int K> State<1, P, K> operator()(State<L, P, K> st) const {
  ...
  return iterate<MaxIter - 1>(Force<Arg>{}(st), std::move(st));
}
```

and the private helper is:

```cpp
template <int Remaining, int CurL, int P, int K>
static State<1, P, K> iterate(State<CurL, P, K> lifted, State<1, P, K> last)
```

`iterate`'s second parameter type is hardcoded `State<1, P, K>`. But
`std::move(st)` passed in has type `State<L, P, K>` for whatever `L`
`Squeeze::operator()` was actually invoked with — the literal `1` in the
signature is a non-deduced context, so this only type-checks when
`Squeeze` is called on a lift-level-1 state.

k=11's `Config` in `main.cpp` is:

```cpp
Force<2>, Force<2>, Squeeze<2>, Force<2>, Force<2>, Force<3>, Squeeze<3>
```

Lift-level starts at 1 and each `Force<Arg>` multiplies it by `Arg`
(`Force::operator()` returns `State<L*Arg,P,K>`). So:
- `Squeeze<2>` is reached at lift-level 1·2·2 = **4** → "could not match 1 against 4"
- `Squeeze<3>` is reached at lift-level 1(after Squeeze, always resets to 1)·2·2·3 = **12** → "could not match 1 against 12"

Checked every other k configured in `main.cpp` (9, 10, 12, 13) for the same
pattern: in all four, `Squeeze` is only ever invoked directly on the initial
state or directly after another `Squeeze` — both sit at lift-level 1 by
construction (`Squeeze` always returns `State<1,P,K>`, and `TightLargePrime`
is lift-level-preserving). k=11 is the only configured k whose `Config`
chains `Force` ops straight into a `Squeeze`, and that's exactly the
ordering that breaks. This is not an environment quirk (confirmed via a
from-scratch invocation with the exact production flags) and not a
compiler-strictness edge case — a non-deduced template parameter mismatch
(`1` vs `4`) is standard C++ behavior, not something a different compiler
version would paper over.

## Why I'm not fixing it this cycle

A correct fix isn't just relaxing the type signature. `Squeeze::iterate`
compares `projected.ansatz.size() == last.ansatz.size()` to detect a fixed
point of repeated lift+project. `last` needs to be a **previously projected**
(lift-level-1) set for that comparison to mean anything. If `last` on the
first call is instead the raw, un-projected lift-level-4 state chained in
from the prior `Force` ops, the fixed-point check compares two
different kinds of things. Fixing this touches solver semantics (Track
A/upstream territory, and the kind of change that needs its own
counter-testing before trusting any resulting "real" data), not a k=13
pruning lemma, which is Track C's actual charter. Flagging the exact
mechanism precisely, so whichever track owns the solver can fix it with
full context, is the right-sized step for one cycle.

## What this changes

The "blocked on real k=11 data" line in cycles 41–44's Next steps was
framed as "keep checking, it'll show up eventually." That framing was
wrong: it cannot show up from the vendored solver as currently checked in,
for any prime, on any machine running this toolchain. The beta_R / class-gap
trend (cycles 42–43) stays a 2-point (k=8, k=10) trend until either (a)
someone patches `Squeeze`'s fixed-point check to handle a non-1 starting
lift-level correctly, or (b) I fall back to a different sieve-derived proxy
that doesn't require compiling k=11 in this vendored form.

## Next

- Do not re-propose "wait for a real k=11 point to appear" as a next step —
  it needs a code fix first, not more waiting.
- If another track patches `Squeeze` for k=11, re-verify the fix compiles
  and re-check whether the resulting `SIEVE_LAYER_DONE` size for the
  smallest prime (23 or 131) looks sane before trusting it as a real point.
- Otherwise, look for a proxy for the beta_R/class-gap trend that doesn't
  require a 3rd real k value from this exact solver path — e.g. check
  whether margin_at()'s R statistic itself (computable without compiling
  the sieve at all, it's a closed-form quantity from cycle 33) shows the
  same growth pattern purely in the abstract k=11 case, decoupled from
  needing a real wall-size regression target.
