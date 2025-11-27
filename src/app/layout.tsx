import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ChatUnreadProvider } from '@/components/providers/ChatUnreadProvider';
import { ErrorBoundary } from '@/components/providers/ErrorBoundary';
import { QueryProvider } from '@/components/providers/QueryProvider';
import ToastProvider from '@/components/providers/ToastProvider';
import { headers } from 'next/headers';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import ConditionalMegaMenuWrapper from '@/components/layout/ConditionalMegaMenuWrapper';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';

// Optimized font loading with next/font
// 실제 사용되는 weight만 로드하여 preload 경고 방지
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
  variable: '--font-noto-sans-kr',
});

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
      '판매자와 구매자 모두 수수료 0원! 디자인, 영상, 개발, 마케팅 등 다양한 재능을 자유롭게 거래하세요. 돌파구에서 새로운 기회를 찾아보세요.',
    keywords:
      '돌파구, 재능거래, 수수료0원, 무료플랫폼, 프리랜서, 재능마켓, 디자인외주, 영상제작, 개발외주, 마케팅',
    openGraph: {
      title: '돌파구 - 수수료 0원 재능 거래 플랫폼',
      description: '판매자·구매자 모두 수수료 0원! 부담 없이 시작하는 재능 거래',
      type: 'website',
      locale: 'ko_KR',
      siteName: '돌파구',
    },
    twitter: {
      card: 'summary_large_image',
      title: '돌파구 - 수수료 0원 재능 거래 플랫폼',
      description: '판매자·구매자 모두 수수료 0원! 부담 없이 시작하는 재능 거래',
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

  const schemaOrgData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '돌파구',
    url: 'https://dolpagu.com',
    description:
      '판매자와 구매자 모두 수수료 0원! 디자인, 영상, 개발, 마케팅 등 다양한 재능을 자유롭게 거래하세요.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://dolpagu.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: '돌파구',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dolpagu.com/icon.svg',
      },
    },
  };

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '돌파구',
    alternateName: 'Dolpagu',
    url: 'https://dolpagu.com',
    logo: 'https://dolpagu.com/icon.svg',
    description:
      '수수료 0원 재능 거래 플랫폼. 판매자와 구매자 모두 중개 수수료 없이 거래할 수 있습니다.',
    areaServed: 'KR',
    serviceType: ['재능 거래', '프리랜서 매칭', '디자인 외주', '개발 외주', '마케팅 대행'],
  };

  return (
    <html lang="ko" suppressHydrationWarning className={notoSansKR.variable}>
      <head>
        {/* Set window.__nonce__ for third-party libraries like goober */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.__nonce__ = "${nonce}";`,
          }}
        />
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
          <QueryProvider>
            <AuthProvider>
              <ChatUnreadProvider>
                <ConditionalLayout
                  megaMenu={shouldHideMegaMenu ? null : <ConditionalMegaMenuWrapper />}
                >
                  {children}
                </ConditionalLayout>
              </ChatUnreadProvider>
            </AuthProvider>
          </QueryProvider>
          <ToastProvider />
        </ErrorBoundary>
      </body>
    </html>
  );
}
