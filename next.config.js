/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['fit-connect-pro.s3.sa-east-1.amazonaws.com'],
  },
};

module.exports = nextConfig;