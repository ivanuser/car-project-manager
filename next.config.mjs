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
  // Completely block pg module from client-side
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace all pg-related imports with an empty module
      config.resolve.alias = {
        ...config.resolve.alias,
        pg: false,
        'pg-native': false,
        'pg-cloudflare': false,
        'pg-protocol': false,
        'pg-cursor': false,
        'pg-pool': false,
        'pg-connection-string': false
      };
      
      // Fallbacks for problematic modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        path: false,
        // This specifically handles cloudflare:sockets
        'cloudflare:sockets': false
      };
    }
    
    // Force skip cloudflare:sockets 
    // This creates a rule to ignore this specific URL scheme
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /cloudflare:sockets/,
      loader: 'null-loader',
      type: 'javascript/auto'
    });
    
    return config;
  },
  experimental: {
    // Force pg modules to not be included in client bundles
    serverComponentsExternalPackages: [
      'pg',
      'pg-native',
      'pg-cloudflare',
      'pg-protocol',
      'pg-cursor',
      'pg-pool',
      'pg-connection-string'
    ],
  },
}

export default nextConfig
