import type { NextConfig } from 'next';

// Security headers live in chapter 19 of architecture.md. The CSP is assembled
// in middleware instead of here, because it needs a per-request nonce for the
// inline scripts Next injects. Keep the static headers here.
const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // R2 public bucket + the custom domain in front of it.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.vows.lk' }],
  },
  experimental: {
    typedRoutes: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default config;
