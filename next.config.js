const { withSentryConfig } = require("@sentry/nextjs");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false, // Remove X-Powered-By header - Force Rebuild
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hesrwiookkmrfiiwqitj.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "bpvfkkrlyrjkwgwmfrci.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Webpack 설정: 프로덕션에서 eval 사용 금지 (CSP 준수)
  webpack: (config, { dev, isServer }) => {
    // 프로덕션 빌드에서는 eval을 사용하지 않는 source map 사용
    if (!dev && !isServer) {
      config.devtool = 'source-map'; // eval 없이 디버깅 가능
    }

    // 개발 환경에서는 기본 설정 유지 (빠른 디버깅)
    // Next.js 기본값: 'cheap-module-source-map' (eval 사용 안 함)

    return config;
  },
  async headers() {
    // Security headers moved to src/proxy.ts
    return [
      {
        // Root path with cache control
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=60, stale-while-revalidate=120",
          },
        ],
      },
      {
        // RSC requests (React Server Components) - root and simple paths
        source: "/:path*",
        has: [
          {
            type: "query",
            key: "_rsc",
          },
        ],
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0",
          },
        ],
      },
      {
        // RSC requests (React Server Components) - nested paths with segments
        source: "/:segment1/:segment2*",
        has: [
          {
            type: "query",
            key: "_rsc",
          },
        ],
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0",
          },
        ],
      },
      {
        // Static files with caching (all _next/static resources including chunks)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Static chunks specifically (CSS and JS with content hashes)
        source: "/_next/static/chunks/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Static media files (fonts, etc)
        source: "/_next/static/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Images and media with cache busting
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Icon files
        source: "/icon.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Favicon
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

// 번들 분석기와 Sentry 설정 적용
const configWithBundleAnalyzer = withBundleAnalyzer(nextConfig);

// Sentry는 환경 변수가 설정된 경우에만 활성화
const shouldEnableSentry = process.env.SENTRY_ORG && process.env.SENTRY_PROJECT;

module.exports = shouldEnableSentry
  ? withSentryConfig(
    configWithBundleAnalyzer,
    {
      // Sentry 빌드 설정
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    },
    {
      // Sentry 업로드 설정
      widenClientFileUpload: true,
      transpileClientSDK: true,
      tunnelRoute: "/monitoring",
      hideSourceMaps: true,
      disableLogger: true,
      automaticVercelMonitors: true,
    },
  )
  : configWithBundleAnalyzer;
