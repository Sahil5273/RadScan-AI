/** @type {import('next').NextConfig} */
const STATIC_CACHE = [
  {
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable',
  },
]

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  productionBrowserSourceMaps: false,
  experimental: {
    // Tree-shake lucide-react so only the icons we import ship in the bundle.
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: STATIC_CACHE,
      },
      {
        source: '/:path*.(ico|png|jpg|jpeg|svg|webp|gif|woff|woff2)',
        headers: STATIC_CACHE,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL || 'http://localhost:8000/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
