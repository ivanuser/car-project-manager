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
  webpack: (config, { isServer }) => {
    // This fixes the "cloudflare:sockets" error by ignoring it in webpack
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        pg: false,
        'pg-native': false,
        'cloudflare:sockets': false,
      };
    }
    
    return config;
  },
  // Prevent server-only modules from being included in client bundles
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
}

export default nextConfig
