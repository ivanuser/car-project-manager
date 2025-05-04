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
    // Directly handle the cloudflare:sockets error with null-loader
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /cloudflare:sockets/,
      use: 'null-loader',
    });

    // Add fallbacks for Node.js modules that aren't available in Cloudflare
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
      };
    }

    return config;
  },
}

export default nextConfig
