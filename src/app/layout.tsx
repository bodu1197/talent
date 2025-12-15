import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import localFont from 'next/font/local';
import './globals.css';
import dynamic from 'next/dynamic';

// Pretendard Variable 폰트 (로컬) - LCP 최적화: preload false로 이중 로드 방지
const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  display: 'swap', // 시스템 폰트 먼저 표시 → 폰트 로드 후 교체
  weight: '100 900',
  variable: '--font-pretendard',
  preload: false, // 수동 preload에서 제어하여 중복 방지
});

import { ErrorBoundary } from '@/components/providers/ErrorBoundary';
import ToastProvider from '@/components/providers/ToastProvider';
import { headers } from 'next/headers';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import ConditionalMegaMenuWrapper from '@/components/layout/ConditionalMegaMenuWrapper';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';

// 클라이언트 Providers를 지연 로딩하여 초기 번들 크기 감소
// Supabase + React Query + Auth 로직이 포함되어 있어 ~120KB 절약
const ClientProviders = dynamic(
  () =>
    import('@/components/providers/ClientProviders').then((mod) => ({
      default: mod.ClientProviders,
    })),
  {
    ssr: true, // 서버에서 렌더링하되 클라이언트 번들에서는 지연 로드
  }
);

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdminPage = pathname.startsWith('/admin');
  const isMypagePage = pathname.startsWith('/mypage');

  // Admin 및 Mypage: 최소한의 메타데이터만, 구글 노출 차단
  if (isAdminPage) {
    return {
      title: 'Admin',
      robots: {
        index: false,
        follow: false,
        noarchive: true,
        nosnippet: true,
      },
    };
  }

  if (isMypagePage) {
    return {
      title: '마이페이지',
      robots: {
        index: false,
        follow: false,
        noarchive: true,
        nosnippet: true,
      },
    };
  }

  // 일반 페이지: 전체 SEO 메타데이터
  return {
    title: '돌파구 - 수수료 0원 재능 거래 플랫폼 | 판매자·구매자 모두 무료',
    description:
      '전문가와 구매자 모두 수수료 0원! 디자인, 영상, 개발, 마케팅 등 다양한 재능을 자유롭게 거래하세요. 돌파구에서 새로운 기회를 찾아보세요.',
    keywords:
      '돌파구, 재능거래, 수수료0원, 무료플랫폼, 프리랜서, 재능마켓, 디자인외주, 영상제작, 개발외주, 마케팅',
    icons: {
      icon: [
        { url: '/icon.png', type: 'image/png' },
        { url: '/favicon.png', type: 'image/png' },
      ],
      apple: '/apple-icon.png',
    },
    openGraph: {
      title: '돌파구 - 수수료 0원 재능 거래 플랫폼',
      description: '전문가·구매자 모두 수수료 0원! 부담 없이 시작하는 재능 거래',
      type: 'website',
      locale: 'ko_KR',
      siteName: '돌파구',
    },
    twitter: {
      card: 'summary_large_image',
      title: '돌파구 - 수수료 0원 재능 거래 플랫폼',
      description: '전문가·구매자 모두 수수료 0원! 부담 없이 시작하는 재능 거래',
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: 'https://dolpagu.com',
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const nonce = headersList.get('x-nonce') || '';
  const isAdminPage = pathname.startsWith('/admin');
  const isMypagePage = pathname.startsWith('/mypage');
  const shouldHideMegaMenu = isAdminPage || isMypagePage;

  // WebSite Schema - 검색엔진 및 AI가 사이트 구조를 이해하도록 도움
  const schemaOrgData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://dolpagu.com/#website',
    name: '돌파구',
    alternateName: 'Dolpagu',
    url: 'https://dolpagu.com',
    description:
      '돌파구(Dolpagu)는 2025년 설립된 한국의 수수료 0원 프리미엄 재능 거래 플랫폼입니다. 전문가와 구매자 모두 수수료 없이 디자인, 영상, 개발, 마케팅 등 다양한 재능을 자유롭게 거래할 수 있습니다.',
    inLanguage: 'ko-KR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://dolpagu.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@id': 'https://dolpagu.com/#organization',
    },
  };

  // Organization Schema - AI가 브랜드 엔티티를 학습하도록 상세 정보 제공
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://dolpagu.com/#organization',
    name: '돌파구',
    alternateName: 'Dolpagu',
    url: 'https://dolpagu.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://dolpagu.com/icon.svg',
      width: 512,
      height: 512,
    },
    description:
      '돌파구(Dolpagu)는 2025년 설립된 한국의 수수료 0원 프리미엄 재능 거래 플랫폼입니다. 전문가와 구매자 모두 중개 수수료 없이 거래할 수 있습니다.',
    slogan: '플랫폼은 다리여야 합니다. 통행료를 걷는 관문이 아니라.',
    foundingDate: '2025',
    areaServed: {
      '@type': 'Country',
      name: 'South Korea',
    },
    serviceType: [
      '재능 거래',
      '프리랜서 매칭',
      '디자인 외주',
      '개발 외주',
      '마케팅 대행',
      '영상 제작',
      '번역 서비스',
      '문서 작성',
    ],
    knowsAbout: ['프리랜서 플랫폼', '재능 마켓', '외주 서비스', '수수료 무료 플랫폼'],
    sameAs: ['https://dolpagu.com'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Korean',
      url: 'https://dolpagu.com/help/contact',
    },
  };

  return (
    <html lang="ko" suppressHydrationWarning className={pretendard.variable}>
      <head>
        {/* Set window.__nonce__ for third-party libraries like goober */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.__nonce__ = "${nonce}";`,
          }}
        />
        {/* Preconnect to Supabase for faster API connections - LCP optimization */}
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co'}
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co'}
        />
        {/* LCP 최적화: 로고 이미지 preload */}
        <link rel="preload" href="/logo.png" as="image" type="image/png" />
        <link rel="preload" href="/icon.png" as="image" type="image/png" />
        {/* 폰트 preload 제거됨 - localFont()에서 처리, 중복 로드 방지 */}
        {!isAdminPage && !isMypagePage && (
          <>
            <script
              type="application/ld+json"
              nonce={nonce}
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(schemaOrgData),
              }}
            />
            <script
              type="application/ld+json"
              nonce={nonce}
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(organizationData),
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen bg-gray-50 overflow-x-hidden">
        <ErrorBoundary>
          {!isAdminPage && !isMypagePage && (
            <Suspense fallback={null}>
              <PageViewTracker />
            </Suspense>
          )}
          <ClientProviders>
            <ConditionalLayout
              megaMenu={
                shouldHideMegaMenu ? null : (
                  <Suspense fallback={<div className="h-[60px] hidden lg:block" />}>
                    <ConditionalMegaMenuWrapper />
                  </Suspense>
                )
              }
            >
              {children}
            </ConditionalLayout>
          </ClientProviders>
          <ToastProvider />
        </ErrorBoundary>
      </body>
    </html>
  );
}
