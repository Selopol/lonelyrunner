#!/usr/bin/env bash
# The experiment worker: runs on Railway (or any box), posts events to the
# web service journal (JOURNAL_API + JOURNAL_TOKEN env).
#
# Env:
#   JOURNAL_API              e.g. https://lonelyrunner.up.railway.app
#   JOURNAL_TOKEN            shared secret, same as web WORKER_TOKEN
#   K13_PROBE_SECONDS        bounded probe length per cycle (default 3600)
#   HUNT_MAX_SPEED           hunt search radius (default 48)
#   BRAIN_EVERY_N_CYCLES     run a notebook cycle via headless Claude every N
#                            cycles (default 6, 0 = off, needs
#                            CLAUDE_CODE_OAUTH_TOKEN from `claude setup-token`)
set -u
cd "$(dirname "$0")/.."

cycle=0
while true; do
  cycle=$((cycle + 1))
  echo "=== worker cycle $cycle $(date -u +%FT%TZ) ==="

  # Track A: bounded probe into the 14-runner case.
  python3 tools/run_solver.py 13 --timeout "${K13_PROBE_SECONDS:-3600}" || true

  # Track B: a hunt pass with a fresh name.
  python3 tools/hunt.py --max-speed "${HUNT_MAX_SPEED:-48}" \
    --pass-name "auto-c${cycle}" || true

  # Track C: notebook cycle on the Claude Max subscription.
  if [ "${BRAIN_EVERY_N_CYCLES:-6}" -gt 0 ] && [ $((cycle % ${BRAIN_EVERY_N_CYCLES:-6})) -eq 0 ]; then
    if command -v claude >/dev/null 2>&1 && [ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
      claude -p "$(cat worker/brain-prompt.md)" \
        --allowedTools "Bash(python3 tools/*),Read,Write,Edit" \
        --max-turns 40 || true
    else
      echo "brain cycle skipped: claude CLI or CLAUDE_CODE_OAUTH_TOKEN missing"
    fi
  fi

  sleep 60
done
