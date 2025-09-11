#!/usr/bin/env bash
set -euo pipefail

echo "==> Codex setup: installing and building (src)"
pushd src >/dev/null

# 0) Clean slate: remove env that can silently force prod-only/omit or stale proxies
unset NPM_CONFIG_HTTP_PROXY NPM_CONFIG_HTTPS_PROXY HTTP_PROXY HTTPS_PROXY http_proxy https_proxy ALL_PROXY all_proxy NO_PROXY no_proxy
unset NPM_CONFIG_PRODUCTION npm_config_production NPM_CONFIG_OMIT npm_config_omit

# 1) Optional enterprise proxy (provided via Codex Secrets)
#    - If HTTPS_PROXY_URL is set, export both upper/lower variants and npm-compatible vars.
if [[ "${HTTPS_PROXY_URL:-}" != "" ]]; then
  export HTTPS_PROXY="${HTTPS_PROXY_URL}"
  export HTTP_PROXY="${HTTPS_PROXY}"
  export https_proxy="${HTTPS_PROXY}"
  export http_proxy="${HTTP_PROXY}"
  export NPM_CONFIG_HTTPS_PROXY="${HTTPS_PROXY}"
  export NPM_CONFIG_HTTP_PROXY="${HTTP_PROXY}"
  # Common safe NO_PROXY baseline (add your internal domains/subnets if needed)
  export NO_PROXY="localhost,127.0.0.1,::1"
fi

# 2) Optional corporate root CA
#    - Provide as base64-encoded PEM via CORP_CA_B64, or a path via CORP_CA_FILE
if [[ -n "${CORP_CA_FILE:-}" && -f "${CORP_CA_FILE}" ]]; then
  CA_FILE="${CORP_CA_FILE}"
  export NODE_EXTRA_CA_CERTS="$CA_FILE"
  npm config set cafile "$CA_FILE" >/dev/null 2>&1 || true
  git config --global http.sslCAInfo "$CA_FILE" >/dev/null 2>&1 || true
elif [[ -n "${CORP_CA_B64:-}" ]]; then
  CA_FILE="/tmp/corp-ca.pem"
  # Try multiple decoders for portability
  if command -v base64 >/dev/null 2>&1; then
    echo "$CORP_CA_B64" | base64 --decode > "$CA_FILE" 2>/dev/null \
      || echo "$CORP_CA_B64" | base64 -D > "$CA_FILE" 2>/dev/null \
      || echo "$CORP_CA_B64" | openssl base64 -d -A > "$CA_FILE"
  else
    echo "$CORP_CA_B64" | openssl base64 -d -A > "$CA_FILE"
  fi
  export NODE_EXTRA_CA_CERTS="$CA_FILE"
  npm config set cafile "$CA_FILE" >/dev/null 2>&1 || true
  git config --global http.sslCAInfo "$CA_FILE" >/dev/null 2>&1 || true
fi

# 3) Resilient npm networking + tidy config
npm config set registry "https://registry.npmjs.org/"
npm config set fetch-retries 5
npm config set fetch-retry-factor 2
npm config set fetch-retry-mintimeout 2000
npm config set fetch-retry-maxtimeout 20000
npm config set prefer-online true || true
npm config delete proxy || true
npm config delete https-proxy || true

# 4) Preflight reachability (non-fatal; hints if we lack a proxy)
if ! npm ping; then
  echo "[warn] npm ping failed. If you are on a corporate network, set HTTPS_PROXY_URL as a Secret."
fi

# 5) Deterministic, quiet install with dev+optional deps and exponential backoff
INSTALL_CMD=(npm ci --include=dev --include=optional --no-audit --no-fund --progress=false --loglevel=error)
max=5
for attempt in $(seq 1 "$max"); do
  echo "npm install attempt $attempt/$max..."
  if "${INSTALL_CMD[@]}"; then
    echo "npm ci succeeded"
    break
  fi
  rc=$?
  if [[ $attempt -eq $max ]]; then
    echo "npm ci failed after $max attempts (rc=$rc)"
    echo "If you are behind a proxy, add HTTPS_PROXY_URL as a Codex Secret."
    exit $rc
  fi
  sleep_for=$(( 2 ** attempt ))
  echo "retrying in ${sleep_for}s..."
  sleep "$sleep_for"
done

# 6) Build
npm run build

popd >/dev/null
echo "==> Codex setup: done"
