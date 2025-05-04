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
  // Add webpack configuration to handle Cloudflare specific modules
  webpack: (config, { isServer, nextRuntime }) => {
    // Avoid Cloudflare Worker runtime errors
    if (isServer && nextRuntime === 'nodejs') {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        dns: false,
        tls: false,
        fs: false,
        module: false,
      };
    }

    // Handle cloudflare:sockets scheme
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /cloudflare:sockets/,
      use: 'null-loader',
    });

    return config;
  },
}

export default nextConfig
