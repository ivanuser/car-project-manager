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
  webpack: (config, { isServer, dev }) => {
    // Handle Cloudflare sockets specifically
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // This handles the cloudflare:sockets error
    config.module.rules.push({
      test: /cloudflare:sockets/,
      use: 'null-loader',
    });
    
    // Also mock the pg-native module
    config.module.rules.push({
      test: /pg-native/,
      use: 'null-loader',
    });
    
    // Add fallbacks for Node.js modules
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      dns: false,
      child_process: false,
      path: false,
    };
    
    // Handle pg module on client side
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        pg: false, // Prevent pg from being imported on the client side
      };
    }
    
    return config;
  },
  // Exclude specific server-only modules from client bundles
  experimental: {
    serverComponentsExternalPackages: ['pg', 'pg-native', 'pg-cloudflare'],
  },
}

export default nextConfig
