import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '심부름 서비스 | 돌파구',
  description:
    '급하게 필요한 물건 배달, 구매대행, 서류 전달까지! 내 주변 헬퍼가 빠르게 해결해드립니다. 돌파구 심부름 서비스로 시간을 절약하세요.',
  keywords: [
    '심부름',
    '배달',
    '구매대행',
    '퀵서비스',
    '헬퍼',
    '대행',
    '돌파구',
    '심부름 앱',
    '심부름 서비스',
  ],
  openGraph: {
    title: '심부름 서비스 | 돌파구',
    description:
      '급하게 필요한 물건 배달, 구매대행, 서류 전달까지! 내 주변 헬퍼가 빠르게 해결해드립니다.',
    type: 'website',
    url: 'https://dolpagu.com/errands',
    siteName: '돌파구',
    images: [
      {
        url: 'https://dolpagu.com/og-errands.png',
        width: 1200,
        height: 630,
        alt: '돌파구 심부름 서비스',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '심부름 서비스 | 돌파구',
    description:
      '급하게 필요한 물건 배달, 구매대행, 서류 전달까지! 내 주변 헬퍼가 빠르게 해결해드립니다.',
    images: ['https://dolpagu.com/og-errands.png'],
  },
  alternates: {
    canonical: 'https://dolpagu.com/errands',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD 구조화 데이터
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: '돌파구 심부름 서비스',
  description:
    '급하게 필요한 물건 배달, 구매대행, 서류 전달까지! 내 주변 헬퍼가 빠르게 해결해드립니다.',
  url: 'https://dolpagu.com/errands',
  provider: {
    '@type': 'Organization',
    name: '돌파구',
    url: 'https://dolpagu.com',
  },
  serviceType: ['배달', '구매대행', '심부름'],
  areaServed: {
    '@type': 'Country',
    name: '대한민국',
  },
};

export default function ErrandsLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
