const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false, // Remove X-Powered-By header
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hesrwiookkmrfiiwqitj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async headers() {
    const securityHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Content-Security-Policy',
        value: "frame-ancestors 'none'",
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
    ]

    return [
      {
        // Root path with cache control
        source: '/',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=120',
          },
        ],
      },
      {
        // RSC requests (React Server Components) - root and simple paths
        source: '/:path*',
        has: [
          {
            type: 'query',
            key: '_rsc',
          },
        ],
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, max-age=0',
          },
        ],
      },
      {
        // RSC requests (React Server Components) - nested paths with segments
        source: '/:segment1/:segment2*',
        has: [
          {
            type: 'query',
            key: '_rsc',
          },
        ],
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, max-age=0',
          },
        ],
      },
      {
        // All other routes
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Static files with caching (all _next/static resources including chunks)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Static chunks specifically (CSS and JS with content hashes)
        source: '/_next/static/chunks/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Static media files (fonts, etc)
        source: '/_next/static/media/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Images and media with cache busting
        source: '/images/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Icon files
        source: '/icon.svg',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Favicon
        source: '/favicon.ico',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes
        source: '/api/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
// module.exports = withSentryConfig(
//   nextConfig,
//   {
//     // Sentry 빌드 설정
//     silent: true,
//     org: process.env.SENTRY_ORG,
//     project: process.env.SENTRY_PROJECT,
//   },
//   {
//     // Sentry 업로드 설정
//     widenClientFileUpload: true,
//     transpileClientSDK: true,
//     tunnelRoute: '/monitoring',
//     hideSourceMaps: true,
//     disableLogger: true,
//     automaticVercelMonitors: true,
//   }
// )