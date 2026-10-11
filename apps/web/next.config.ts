import type { NextConfig } from 'next';

// No security headers are set here, deliberately — chapter 19 and decision 015.
// The target set is drafted in the Figma architecture and ships as its own pull
// request. When it does, the CSP goes in middleware, not here: a static header
// cannot carry the per-request nonce that Next's inline scripts need.
const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // R2 public bucket, behind the custom domain.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.vows.lk' }],
  },
  experimental: {
    typedRoutes: true,
  },
};

export default config;
