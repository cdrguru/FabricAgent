#!/usr/bin/env bash
set -euo pipefail

echo "==> Codex setup: installing and building (src)"
pushd src >/dev/null
trap 'popd >/dev/null' EXIT

# 0) Neutralize env that can break installs (proxies/production/omit)
unset NPM_CONFIG_HTTP_PROXY NPM_CONFIG_HTTPS_PROXY HTTP_PROXY HTTPS_PROXY http_proxy https_proxy ALL_PROXY all_proxy NO_PROXY no_proxy
unset npm_config_http_proxy npm_config_https_proxy
unset NPM_CONFIG_PRODUCTION npm_config_production
unset NPM_CONFIG_OMIT npm_config_omit
unset NPM_CONFIG_INCLUDE npm_config_include

# 1) Resilient npm networking
npm config set registry https://registry.npmjs.org/
npm config set fetch-retries 5
npm config set fetch-retry-factor 2
npm config set fetch-retry-mintimeout 2000
npm config set fetch-retry-maxtimeout 20000
npm config set prefer-online true || true
npm config delete proxy >/dev/null 2>&1 || true
npm config delete https-proxy >/dev/null 2>&1 || true

# 2) Optional preflight reachability
npm ping || echo "[warn] npm ping failed; proceeding with retries"

# Ensure a clean install to avoid flakiness
rm -rf node_modules || true

# 3) Deterministic, quiet install with backoff
INSTALL_CMD=(npm ci --include=dev --include=optional --no-audit --no-fund --progress=false --loglevel=error)
if [[ ! -f package-lock.json ]]; then
  INSTALL_CMD=(npm install --no-audit --no-fund --progress=false --loglevel=error)
fi

max=5
for attempt in $(seq 1 "$max"); do
  echo "npm install attempt $attempt/$max..."
  if "${INSTALL_CMD[@]}"; then
    echo "npm install succeeded"
    break
  fi
  rc=$?
  if [[ $attempt -eq $max ]]; then
    echo "npm install failed after $max attempts (rc=$rc)"; exit "$rc"
  fi
  sleep_for=$(( 2 ** attempt ))
  echo "retrying in ${sleep_for}s..."
  sleep "$sleep_for"
done

# 4) Build the app
npm run build

echo "==> Codex setup: done"