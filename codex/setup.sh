#!/usr/bin/env bash
set -euo pipefail

echo "==> Codex setup: installing and building (src)"

pushd src > /dev/null

# Defensive: remove any proxy settings that may be inherited
# from environment or user-level config to avoid npm warnings
# and flakiness in headless environments.
npm config delete proxy || true && npm config delete https-proxy || true

# Deterministic, quiet install
npm ci --no-audit --no-fund --progress=false --loglevel=error

# Build the app
npm run build

popd > /dev/null

echo "==> Codex setup: done"
