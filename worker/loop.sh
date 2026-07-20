#!/usr/bin/env bash
# The experiment worker. Two independent loops run side by side:
#   brain   — Claude reasoning against the bottleneck, nonstop
#   compute — hunt passes and bounded probes into the 14-runner case
# Both post events to the journal (JOURNAL_API + JOURNAL_TOKEN).
#
# Env:
#   JOURNAL_API, JOURNAL_TOKEN      the web service and its shared secret
#   CLAUDE_CODE_OAUTH_TOKEN         from `claude setup-token`
#   K13_PROBE_SECONDS               probe length per pass (default 3600)
#   HUNT_MAX_SPEED                  hunt search radius (default 48)
#   BRAIN_ENABLED                   1 (default) or 0 to park the brain
set -u
cd "$(dirname "$0")/.."

brain_loop() {
  local n=0 start dur
  while true; do
    if [ "${BRAIN_ENABLED:-1}" != "1" ] || [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ] \
       || ! command -v claude >/dev/null 2>&1; then
      echo "[brain] parked (no token or disabled)"
      sleep 300
      continue
    fi
    n=$((n + 1))
    echo "[brain] cycle $n $(date -u +%FT%TZ)"
    start=$(date +%s)
    claude -p "$(cat worker/brain-prompt.md)" \
      --allowedTools "Read,Write,Edit,Glob,Grep,Bash(python3:*),Bash(cat:*),Bash(ls:*),Bash(head:*),Bash(tail:*),Bash(grep:*)" \
      --max-turns 40 < /dev/null || true
    dur=$(( $(date +%s) - start ))
    echo "[brain] cycle $n ended after ${dur}s"
    # A cycle that dies in under a minute means an error or a rate limit.
    # Back off then, but come straight back when work is real.
    if [ "$dur" -lt 60 ]; then sleep 300; else sleep 15; fi
  done
}

compute_loop() {
  local c=0
  while true; do
    c=$((c + 1))
    echo "[compute] cycle $c $(date -u +%FT%TZ)"
    python3 tools/hunt.py --max-speed "${HUNT_MAX_SPEED:-48}" \
      --pass-name "auto-c${c}" || true
    python3 tools/run_solver.py 13 --timeout "${K13_PROBE_SECONDS:-3600}" || true
    sleep 20
  done
}

brain_loop &
compute_loop
