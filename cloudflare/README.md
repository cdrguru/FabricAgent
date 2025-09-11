# Cloudflare NPM Proxy for Fabric Agent

This directory contains a Cloudflare Worker solution to bypass corporate network restrictions that cause `ENETUNREACH` errors in Codex environments.

## 🎯 Problem Solved

- **ENETUNREACH errors** when accessing npm registry from corporate networks
- **Corporate proxy restrictions** blocking external package downloads
- **Codex environment networking issues** preventing successful builds

## 🌐 Solution

A Cloudflare Worker that acts as a proxy between your Codex environment and the npm registry, leveraging Cloudflare's global edge network to bypass corporate restrictions.

## 📂 Files

- `npm-proxy-worker.js` - The Cloudflare Worker code
- `deploy-npm-proxy.sh` - Automated deployment script
- `README.md` - This documentation

## 🚀 Quick Setup

### Prerequisites

1. **Cloudflare Account** (free tier works)
2. **Cloudflare API Token** with Workers permissions
3. **Wrangler CLI** (will be installed automatically)

### Deployment

1. **Run the deployment script:**
   ```bash
   chmod +x cloudflare/deploy-npm-proxy.sh
   cd /Users/pmd/myghprod/fabric_agent
   ./cloudflare/deploy-npm-proxy.sh
   ```

2. **Set Cloudflare API Token** (if not already set):
   ```bash
   export CF_API_TOKEN="your_cloudflare_api_token"
   ```

3. **Follow the prompts** - the script will:
   - Install Wrangler CLI if needed
   - Deploy the worker to Cloudflare
   - Test the deployment
   - Provide usage instructions

### Usage in Codex

After deployment, you'll get a worker URL like `https://fabric-agent-npm-proxy.workers.dev`

**Option 1: Use as Proxy (Recommended)**
```bash
# Set this as a Codex Secret:
HTTPS_PROXY_URL=https://fabric-agent-npm-proxy.workers.dev
```

**Option 2: Use as npm Registry**
Add to your `codex/setup.sh`:
```bash
npm config set registry "https://fabric-agent-npm-proxy.workers.dev"
```

## 🧪 Testing

Test the proxy manually:
```bash
# Test ping endpoint
curl "https://your-worker.workers.dev/-/ping"

# Test package lookup
curl "https://your-worker.workers.dev/react"
```

## 🔧 Customization

### Custom Domain (Optional)

To use a custom domain instead of `.workers.dev`:

1. **Set environment variable:**
   ```bash
   export CUSTOM_DOMAIN="npm-proxy.yourdomain.com"
   ```

2. **Run deployment:**
   ```bash
   ./cloudflare/deploy-npm-proxy.sh
   ```

3. **Add DNS record** in Cloudflare Dashboard:
   - Type: `CNAME`
   - Name: `npm-proxy`
   - Target: `fabric-agent-npm-proxy.workers.dev`

### Worker Configuration

Edit `npm-proxy-worker.js` to customize:
- **Allowed paths** - restrict which npm endpoints are accessible
- **Cache headers** - adjust caching behavior
- **CORS settings** - modify cross-origin policies
- **Error handling** - customize error responses

## 🛠️ Manual Deployment

If you prefer to deploy manually:

1. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler auth login
   ```

3. **Create wrangler.toml:**
   ```toml
   name = "fabric-agent-npm-proxy"
   main = "cloudflare/npm-proxy-worker.js"
   compatibility_date = "2024-09-01"
   ```

4. **Deploy:**
   ```bash
   wrangler deploy
   ```

## 🔍 How It Works

1. **Request Flow:**
   ```
   Codex → Cloudflare Worker → npm registry → Response
   ```

2. **Path Handling:**
   - Allows npm registry paths (`/-/ping`, `/package-name`, etc.)
   - Blocks non-npm requests (security)
   - Forwards all headers and methods

3. **Caching:**
   - Package metadata: 5 minutes
   - Ping requests: no cache
   - Tarballs: 1 hour (if implemented)

## 🚨 Troubleshooting

### Common Issues

1. **401 Unauthorized during deployment:**
   - Check your Cloudflare API token permissions
   - Ensure token has "Cloudflare Workers:Edit" scope

2. **502 Bad Gateway from worker:**
   - Check worker logs in Cloudflare Dashboard
   - Verify npm registry is accessible

3. **CORS errors in browser:**
   - Worker includes CORS headers automatically
   - Check browser console for specific error details

4. **Still getting ENETUNREACH:**
   - Verify the worker URL is correct in Codex secrets
   - Test the worker URL manually with curl
   - Check Codex environment proxy settings

### Debug Commands

```bash
# Check worker logs
wrangler tail fabric-agent-npm-proxy

# Test specific endpoints
curl -v "https://your-worker.workers.dev/-/ping"
curl -v "https://your-worker.workers.dev/react/latest"

# Check npm configuration in Codex
npm config list
env | grep -i proxy
```

## 🔒 Security Notes

- Worker only allows npm registry related requests
- No authentication passthrough (npm registry is public)
- CORS headers allow cross-origin requests (required for proxy usage)
- Consider rate limiting for production usage

## 💡 Benefits

✅ **Bypasses corporate firewalls** - Uses Cloudflare's edge network  
✅ **No infrastructure costs** - Cloudflare Workers free tier  
✅ **Global performance** - Cached at edge locations  
✅ **Easy deployment** - Single script setup  
✅ **Secure** - Only allows npm registry traffic  

## 📋 Next Steps

1. Deploy the worker using the script
2. Add the worker URL to your Codex environment as `HTTPS_PROXY_URL`
3. Restart Codex environment
4. Enjoy successful npm installs! 🎉

---

**Built for Fabric Agent enterprise environments**  
**Updated**: September 11, 2025