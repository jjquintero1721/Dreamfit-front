const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['fit-connect-pro.s3.sa-east-1.amazonaws.com'],
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Sentry configuration options
  silent: true, // Suppresses source map uploading logs during build
  org: 'parzik',
  project: 'dreamfit-frontend',
}, {
  // Additional config options
  hideSourceMaps: true,
  disableLogger: true,
});