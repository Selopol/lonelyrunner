#!/usr/bin/env python3
"""Wrapper around the vendored record-holders' solver (solver/upstream).

Patches K into main.cpp, compiles with clang++, runs (optionally bounded by
a time limit), streams the raw log to journal/raw/, and appends hash-chained
events to the journal as real milestones happen:

  RUN_STARTED -> SIEVE_LAYER_DONE / PRIME_VERIFIED ... -> RUN_DONE | RUN_ABORTED

Usage:
  run_solver.py K [--timeout SECONDS]     e.g. run_solver.py 8
"""
import os
import platform
import re
import subprocess
import sys
import time
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from journal import append, sha256_file

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPSTREAM = os.path.join(ROOT, "solver", "upstream")


def machine_info():
    try:
        cpu = subprocess.run(["sysctl", "-n", "machdep.cpu.brand_string"],
                             capture_output=True, text=True).stdout.strip()
        cores = subprocess.run(["sysctl", "-n", "hw.ncpu"],
                               capture_output=True, text=True).stdout.strip()
        return f"{cpu} ({cores} cores)"
    except Exception:
        return platform.processor() or platform.machine()


def main():
    k = int(sys.argv[1])
    timeout = None
    if "--timeout" in sys.argv:
        timeout = int(sys.argv[sys.argv.index("--timeout") + 1])

    src = open(os.path.join(UPSTREAM, "main.cpp")).read()
    patched, n = re.subn(r"constexpr int K = \d+;", f"constexpr int K = {k};", src)
    assert n == 1, "could not patch K in main.cpp"
    build_dir = os.path.join(ROOT, "solver", "build")
    os.makedirs(build_dir, exist_ok=True)
    main_path = os.path.join(build_dir, f"main_k{k}.cpp")
    open(main_path, "w").write(patched)

    binary = os.path.join(build_dir, f"lrc_k{k}")
    t0 = time.time()
    cc = subprocess.run(
        ["clang++", "-std=c++23", "-march=native", "-O3",
         "-I", UPSTREAM, main_path, "-o", binary],
        capture_output=True, text=True)
    compile_s = round(time.time() - t0, 1)
    if cc.returncode != 0:
        print(cc.stderr[-2000:])
        sys.exit(1)

    run_id = f"k{k}-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
    raw_dir = os.path.join(ROOT, "journal", "raw")
    os.makedirs(raw_dir, exist_ok=True)
    raw_path = os.path.join(raw_dir, f"{run_id}.log")

    append("RUN_STARTED", {
        "run_id": run_id, "k": k, "track": "A",
        "command": f"lrc_k{k} (upstream main.cpp, K={k})",
        "compiler": "clang++ -std=c++23 -march=native -O3",
        "compile_s": compile_s, "machine": machine_info(),
        "timeout_s": timeout, "raw_log": f"journal/raw/{run_id}.log",
    })

    t0 = time.time()
    current_p = None
    aborted = False
    proc = subprocess.Popen([binary], stdout=subprocess.PIPE,
                            stderr=subprocess.STDOUT, text=True)
    with open(raw_path, "w") as raw:
        try:
            for line in proc.stdout:
                raw.write(line)
                raw.flush()
                m = re.search(r"Parameters: p = (\d+), k = (\d+)", line)
                if m:
                    current_p = int(m.group(1))
                m = re.search(r"\[FindCover\] Step 1 \(l=1\): S size = (\d+)", line)
                if m and current_p:
                    append("SIEVE_LAYER_DONE", {
                        "run_id": run_id, "k": k, "p": current_p,
                        "layer": "I(k,p,1)", "size": int(m.group(1)),
                        "elapsed_s": round(time.time() - t0, 1)})
                m = re.search(r"Subproof Mod (\d+) Done", line)
                if m:
                    append("PRIME_VERIFIED", {
                        "run_id": run_id, "k": k, "p": int(m.group(1)),
                        "elapsed_s": round(time.time() - t0, 1)})
                if timeout and time.time() - t0 > timeout:
                    proc.kill()
                    aborted = True
                    break
        except KeyboardInterrupt:
            proc.kill()
            aborted = True
    proc.wait()
    wall = round(time.time() - t0, 1)

    final = {
        "run_id": run_id, "k": k, "wall_s": wall,
        "raw_log": f"journal/raw/{run_id}.log",
        "raw_sha256": sha256_file(raw_path),
    }
    if aborted:
        final["reason"] = f"time limit {timeout}s (bounded profiling job)"
        append("RUN_ABORTED", final)
        print(f"ABORTED after {wall}s (bounded), raw log {raw_path}")
    else:
        append("RUN_DONE", final)
        print(f"DONE in {wall}s, raw log {raw_path}")


if __name__ == "__main__":
    main()
