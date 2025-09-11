#!/usr/bin/env bash
set -euo pipefail

echo "==> Codex setup: installing and building (src)"

pushd src > /dev/null

# Neutralize inherited proxies and production/omit flags from the environment
# (These override npmrc, so we must UNSET them explicitly.)
unset NPM_CONFIG_HTTP_PROXY NPM_CONFIG_HTTPS_PROXY HTTP_PROXY HTTPS_PROXY http_proxy https_proxy ALL_PROXY all_proxy NO_PROXY no_proxy
unset npm_config_http_proxy npm_config_https_proxy
unset NPM_CONFIG_PRODUCTION npm_config_production
unset NPM_CONFIG_OMIT npm_config_omit
unset NPM_CONFIG_INCLUDE npm_config_include

# Also clear any persisted proxy config set in npm files
npm config delete proxy || true
npm config delete https-proxy || true

# Ensure a clean install to avoid flakiness
rm -rf node_modules

# Deterministic, quiet install
# Explicitly include dev and optional deps in case upstream toggles omit/production
npm ci --include=dev --include=optional --no-audit --no-fund --progress=false --loglevel=error

# Build the app
npm run build

popd > /dev/null

echo "==> Codex setup: done"
