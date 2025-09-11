#!/usr/bin/env bash
set -euo pipefail
echo "==> Codex maintenance: deps + quick health check"

pushd src >/dev/null

# Neutralize noisy inherited proxies
unset NPM_CONFIG_HTTP_PROXY NPM_CONFIG_HTTPS_PROXY HTTP_PROXY HTTPS_PROXY http_proxy https_proxy ALL_PROXY all_proxy NO_PROXY no_proxy
unset npm_config_http_proxy npm_config_https_proxy
npm config delete proxy >/dev/null 2>&1 || true
npm config delete https-proxy >/dev/null 2>&1 || true

# Reinstall only if lockfile changed or node_modules is missing
LOCKSUM_FILE=.codex_lock.sha256
CURRENT_LOCKSUM="$(sha256sum package-lock.json | awk '{print $1}')"
CACHED_LOCKSUM="$(cat "$LOCKSUM_FILE" 2>/dev/null || true)"

if [[ ! -d node_modules || "$CURRENT_LOCKSUM" != "$CACHED_LOCKSUM" ]]; then
  echo "-> Dependencies changed or missing; running npm ci..."
  rm -rf node_modules
  npm ci --include=dev --include=optional --no-audit --no-fund --progress=false --loglevel=error
  echo "$CURRENT_LOCKSUM" > "$LOCKSUM_FILE"
else
  echo "-> Dependencies up to date; skipping install."
fi

# Lightweight guardrails
npm run -s typecheck || true
npm run -s lint || true
popd >/dev/null

echo "==> Codex maintenance: done"