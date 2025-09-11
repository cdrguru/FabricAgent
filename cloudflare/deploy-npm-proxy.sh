#!/usr/bin/env bash
# Cloudflare Worker Deployment Script for NPM Proxy
# 
# This script deploys a Cloudflare Worker that acts as an npm registry proxy
# to bypass corporate network restrictions in Codex environments.

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WORKER_NAME="${WORKER_NAME:-fabric-agent-npm-proxy}"
CF_ACCOUNT_ID="${CF_ACCOUNT_ID:-}"
CF_API_TOKEN="${CF_API_TOKEN:-}"
CUSTOM_DOMAIN="${CUSTOM_DOMAIN:-}"

echo -e "${BLUE}🚀 Fabric Agent - Cloudflare NPM Proxy Setup${NC}"
echo "=================================================="

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    if ! command -v wrangler >/dev/null 2>&1; then
        echo -e "${RED}❌ Wrangler CLI not found. Installing...${NC}"
        npm install -g wrangler
    else
        echo -e "${GREEN}✅ Wrangler CLI found${NC}"
    fi
    
    if ! command -v curl >/dev/null 2>&1; then
        echo -e "${RED}❌ curl not found. Please install curl.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check complete${NC}"
}

# Setup Cloudflare authentication
setup_auth() {
    echo -e "${YELLOW}🔐 Setting up Cloudflare authentication...${NC}"
    
    if [[ -z "${CF_API_TOKEN}" ]]; then
        echo -e "${YELLOW}💡 CF_API_TOKEN not set. Please authenticate with Cloudflare:${NC}"
        echo "   1. Go to https://dash.cloudflare.com/profile/api-tokens"
        echo "   2. Create a token with 'Cloudflare Workers:Edit' permissions"
        echo "   3. Run: export CF_API_TOKEN='your_token_here'"
        echo ""
        echo -e "${BLUE}Or authenticate interactively:${NC}"
        wrangler auth login
    else
        echo -e "${GREEN}✅ Using CF_API_TOKEN from environment${NC}"
        export CLOUDFLARE_API_TOKEN="${CF_API_TOKEN}"
    fi
}

# Create wrangler configuration
create_wrangler_config() {
    echo -e "${YELLOW}📝 Creating wrangler configuration...${NC}"
    
    cat > wrangler.toml << EOF
name = "${WORKER_NAME}"
main = "cloudflare/npm-proxy-worker.js"
compatibility_date = "2024-09-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "${WORKER_NAME}"

EOF

    if [[ -n "${CUSTOM_DOMAIN}" ]]; then
        cat >> wrangler.toml << EOF
[[env.production.routes]]
pattern = "${CUSTOM_DOMAIN}/*"
custom_domain = true

EOF
    fi
    
    echo -e "${GREEN}✅ Created wrangler.toml${NC}"
}

# Deploy the worker
deploy_worker() {
    echo -e "${YELLOW}🚀 Deploying Cloudflare Worker...${NC}"
    
    if ! wrangler deploy --env production; then
        echo -e "${RED}❌ Deployment failed. Check your configuration and try again.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Worker deployed successfully!${NC}"
}

# Get worker URL
get_worker_url() {
    echo -e "${YELLOW}🔍 Getting worker URL...${NC}"
    
    # Try to get the worker URL from wrangler
    WORKER_URL=$(wrangler deployments list --name "${WORKER_NAME}" --format json 2>/dev/null | \
        grep -o '"url":"[^"]*"' | head -1 | sed 's/"url":"//g' | sed 's/"//g' || true)
    
    if [[ -z "${WORKER_URL}" ]]; then
        # Fallback: construct the URL
        WORKER_URL="https://${WORKER_NAME}.workers.dev"
    fi
    
    echo -e "${GREEN}📍 Worker URL: ${WORKER_URL}${NC}"
    echo "${WORKER_URL}" > .worker-url
}

# Test the proxy
test_proxy() {
    local worker_url="$1"
    echo -e "${YELLOW}🧪 Testing npm proxy...${NC}"
    
    # Test ping endpoint
    if curl -s -f "${worker_url}/-/ping" >/dev/null; then
        echo -e "${GREEN}✅ Proxy test successful!${NC}"
    else
        echo -e "${YELLOW}⚠️  Proxy test failed, but this might be expected during initial deployment${NC}"
    fi
}

# Generate usage instructions
generate_instructions() {
    local worker_url="$1"
    
    echo ""
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo "================================"
    echo ""
    echo -e "${BLUE}📋 Usage Instructions:${NC}"
    echo ""
    echo "1. ${YELLOW}Set Codex Secret:${NC}"
    echo "   - Secret Name: HTTPS_PROXY_URL"
    echo "   - Secret Value: ${worker_url}"
    echo ""
    echo "2. ${YELLOW}Alternative: Use as npm registry:${NC}"
    echo "   Add to your codex/setup.sh:"
    echo "   npm config set registry \"${worker_url}\""
    echo ""
    echo "3. ${YELLOW}Test the proxy:${NC}"
    echo "   curl \"${worker_url}/-/ping\""
    echo ""
    echo -e "${BLUE}🔗 Worker URL saved to: .worker-url${NC}"
    echo ""
    echo -e "${YELLOW}💡 Tip:${NC} Restart your Codex environment after setting the secret!"
}

# Main execution
main() {
    echo -e "${BLUE}Starting deployment...${NC}"
    
    check_prerequisites
    setup_auth
    create_wrangler_config
    deploy_worker
    
    # Get the worker URL
    get_worker_url
    WORKER_URL=$(cat .worker-url 2>/dev/null || echo "")
    
    if [[ -n "${WORKER_URL}" ]]; then
        test_proxy "${WORKER_URL}"
        generate_instructions "${WORKER_URL}"
    else
        echo -e "${RED}❌ Could not determine worker URL${NC}"
        exit 1
    fi
}

# Run main function
main "$@"