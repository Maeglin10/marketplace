/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // eslint-config-next 16.x has a known circular JSON issue with legacy .eslintrc format.
  // TypeScript type checking still runs; only the ESLint pass is skipped here.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
