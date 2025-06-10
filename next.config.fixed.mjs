/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Updated webpack config for Next.js 15 compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace all pg-related imports with false for client-side
      config.resolve.alias = {
        ...config.resolve.alias,
        pg: false,
        'pg-native': false,
        'pg-cloudflare': false,
        'pg-protocol': false,
        'pg-cursor': false,
        'pg-pool': false,
        'pg-connection-string': false,
      };
      
      // Add fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
      };
    }
    
    // Handle problematic modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // Use null-loader for problematic pg-cloudflare
    config.module.rules.push({
      test: /node_modules[/\\]pg-cloudflare/,
      use: 'null-loader',
    });
    
    // Ignore cloudflare:sockets scheme
    config.module.rules.push({
      test: /cloudflare:sockets/,
      use: 'null-loader',
    });
    
    // Externalize server-only modules
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('pg-native', 'pg-cloudflare');
    }
    
    return config;
  },
  // Updated for Next.js 15: moved from experimental.serverComponentsExternalPackages
  serverExternalPackages: [
    'pg',
    'pg-native',
    'pg-cloudflare',
    'pg-protocol',
    'pg-cursor',
    'pg-pool',
    'pg-connection-string'
  ],
}

export default nextConfig
