/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
      config.resolve.fallback = { fs: false };
      return config;
    },
    async headers() {
      return [
        {
          source: '/favicon.ico',
          headers: [
            {
              key: 'Content-Type',
              value: 'image/x-icon',
            },
          ],
        },
      ];
    },
  }
  