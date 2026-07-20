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

# Credentials for the brain. CLAUDE_CREDS_B64 carries a base64 of the
# Claude Code credentials file (subscription OAuth, refreshes itself);
# CLAUDE_CODE_OAUTH_TOKEN is the alternative from `claude setup-token`.
install_creds() {
  [ -n "${CLAUDE_CREDS_B64:-}" ] || return 1
  mkdir -p "$HOME/.claude"
  echo "$CLAUDE_CREDS_B64" | base64 -d > "$HOME/.claude/.credentials.json"
  chmod 600 "$HOME/.claude/.credentials.json"
  echo "brain credentials installed at $HOME/.claude/.credentials.json"
}

# $HOME/.claude is a volume, so a token refreshed by the CLI outlives the
# container. Only seed it when the volume is empty: overwriting a refreshed
# credential with the stale one from the environment would expire the brain.
if [ -s "$HOME/.claude/.credentials.json" ]; then
  echo "brain credentials already on the volume, keeping them"
else
  install_creds || echo "no credentials available"
fi

# This container's disk is wiped on every redeploy; the journal is not.
# Rebuild the lab notebook from it before any thinking starts.
python3 tools/memory.py restore || true

brain_loop() {
  local n=0 start dur fast=0
  while true; do
    if [ "${BRAIN_ENABLED:-1}" != "1" ] || ! command -v claude >/dev/null 2>&1 \
       || { [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ] && [ ! -s "$HOME/.claude/.credentials.json" ]; }; then
      echo "[brain] parked (no credentials or disabled)"
      sleep 300
      continue
    fi
    n=$((n + 1))
    echo "[brain] cycle $n $(date -u +%FT%TZ)"
    start=$(date +%s)
    claude -p "$(cat worker/brain-prompt.md)" \
      --allowedTools "Read,Write,Edit,Glob,Grep,Bash(python3:*),Bash(cat:*),Bash(ls:*),Bash(head:*),Bash(tail:*),Bash(grep:*)" \
      --max-turns "${BRAIN_MAX_TURNS:-160}" < /dev/null || true
    dur=$(( $(date +%s) - start ))
    echo "[brain] cycle $n ended after ${dur}s"
    # A cycle that dies in under a minute means an error or a rate limit.
    # Back off then, but come straight back when work is real.
    if [ "$dur" -lt 60 ]; then
      fast=$((fast + 1))
      # Three quick deaths in a row look like broken credentials rather than
      # a rate limit: reseed from the environment once, then keep backing off.
      # Do NOT reseed from the environment here. The volume copy may have been
      # refreshed since boot, and overwriting it with the stale environment one
      # is a way to turn a recoverable failure into a permanent one. Repeated
      # short cycles mean the credentials need a human, so back off hard and
      # stop filling the log.
      if [ "$fast" -ge 3 ]; then
        echo "[brain] repeated auth failures: the credentials need renewing (claude setup-token)"
        sleep 1800
      else
        sleep 300
      fi
    else
      fast=0
      sleep 15
    fi
  done
}

compute_loop() {
  local c=0
  while true; do
    c=$((c + 1))
    echo "[compute] cycle $c $(date -u +%FT%TZ)"
    # Track B alternates: neighbours on odd cycles, parametric families on
    # even ones, and the family reach grows as the cycles accumulate.
    if [ $((c % 2)) -eq 1 ]; then
      python3 tools/hunt.py --max-speed "${HUNT_MAX_SPEED:-48}" \
        --pass-name "auto-c${c}" || true
    else
      reach=$(( 60 + c * 10 ))
      [ "$reach" -gt 400 ] && reach=400
      python3 tools/families.py --max-speed "$reach" \
        --pass-name "fam-c${c}" || true
    fi
    # One probe, one prime nobody has measured yet: the list used to restart
    # from its head every time and re-measure what we already knew.
    p=$(python3 tools/next_prime.py 2>/dev/null || echo "")
    if [ -n "$p" ]; then
      echo "[compute] probing p=$p"
      python3 tools/run_solver.py 13 --primes "$p" \
        --timeout "${K13_PROBE_SECONDS:-3600}" || true
    else
      python3 tools/run_solver.py 13 --timeout "${K13_PROBE_SECONDS:-3600}" || true
    fi
    sleep 20
  done
}

brain_loop &
compute_loop
