# Deploy (Railway, two services, one repo)

## 1. Web (the site + journal API)

- New service from this repo, defaults are fine (Nixpacks detects Node,
  `npm start`).
- Attach a **volume** mounted at `/data`.
- Variables:
  - `JOURNAL_DIR=/data`
  - `WORKER_TOKEN=<long random string>`  (openssl rand -hex 24)
- Generate a domain. On first boot the volume journal is seeded from the
  repo copy (all events up to the last push).

## 2. Worker (solver + hunt + brain)

- Second service from the SAME repo.
- Build > **Dockerfile Path = `Dockerfile.worker`**.
- Variables:
  - `JOURNAL_API=https://<web-domain>`
  - `JOURNAL_TOKEN=<same value as WORKER_TOKEN>`
  - `CLAUDE_CODE_OAUTH_TOKEN=<see below>`
  - optional: `K13_PROBE_SECONDS=3600`, `HUNT_MAX_SPEED=48`,
    `BRAIN_ENABLED=0` to park the brain
- No domain needed. Scale CPU as budget allows: the solver threads scale
  with cores automatically.

## 3. The Claude Max subscription token (Track C)

On the Mac, once:

```bash
claude setup-token
```

Follow the browser flow, copy the long-lived token it prints, paste it into
the worker's `CLAUDE_CODE_OAUTH_TOKEN`.

Alternative that needs no terminal: base64 the credentials file of a
logged-in Claude Code and set it as `CLAUDE_CREDS_B64`. On macOS that file
lives in the Keychain, not on disk:

```bash
security find-generic-password -s "Claude Code-credentials" -w | base64
```

The worker writes it to `~/.claude/.credentials.json` at boot and refreshes
its own access token from there. Either way the brain then runs back to back;
the loop backs off for five minutes whenever a cycle dies in under a minute,
which is what a rate limit looks like. Set `BRAIN_ENABLED=0` to park it.

## 4. Day-2 notes

- The journal of record lives on the web volume once deployed. The repo
  copy is the seed and a periodic mirror: download
  `https://<web-domain>/journal/events.jsonl` and commit it now and then so
  the repo stays a faithful archive.
- `python3 tools/journal.py verify` works on any downloaded copy.
- Local Mac runs still work and still append to the deployed chain: set
  `JOURNAL_API` + `JOURNAL_TOKEN` in the shell before running the tools.
