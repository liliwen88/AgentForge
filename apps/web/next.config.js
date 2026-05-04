/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@agentforge/components'],
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;