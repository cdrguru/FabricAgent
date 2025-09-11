/**
 * Cloudflare Worker: NPM Registry Proxy
 * 
 * This worker acts as a proxy for npm registry requests to bypass
 * corporate network restrictions in Codex environments.
 * 
 * Deploy this worker to your Cloudflare account and use the worker URL
 * as your npm registry in corporate environments.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only allow npm registry related requests
    const allowedPaths = [
      '/',
      '/-/ping',
      '/-/npm',
      '/-/v1',
      '/-/package',
    ];
    
    const isPackageRequest = url.pathname.startsWith('/') && 
      (url.pathname.includes('/-/') || 
       url.pathname.match(/^\/[@\w]/) || // Package names
       allowedPaths.some(path => url.pathname.startsWith(path)));
    
    if (!isPackageRequest) {
      return new Response('Not Found', { status: 404 });
    }
    
    // Construct the target URL (npm registry)
    const targetUrl = new URL(url.pathname + url.search, 'https://registry.npmjs.org');
    
    // Create new request with the same method and headers
    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });
    
    // Remove any proxy-related headers
    proxyRequest.headers.delete('cf-ray');
    proxyRequest.headers.delete('cf-connecting-ip');
    
    try {
      // Make the request to npm registry
      const response = await fetch(proxyRequest);
      
      // Create new response with CORS headers
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
          // Add cache headers for better performance
          'Cache-Control': url.pathname === '/-/ping' ? 'no-cache' : 'public, max-age=300',
        },
      });
      
      return newResponse;
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response(`Proxy Error: ${error.message}`, { 
        status: 502,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        }
      });
    }
  },
};