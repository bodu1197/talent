import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '전문가 등록 | 수수료 0원 돌파구',
  description:
    '돌파구에서 전문가로 등록하고 수수료 0원으로 재능을 판매하세요. 디자인, 개발, 마케팅, 영상 등 다양한 분야의 전문가를 모집합니다.',
  keywords: [
    '전문가 등록',
    '프리랜서 등록',
    '수수료 0원',
    '재능 판매',
    '돌파구',
    '외주',
    '프리랜서',
  ],
  openGraph: {
    title: '전문가 등록 | 수수료 0원 돌파구',
    description: '돌파구에서 전문가로 등록하고 수수료 0원으로 재능을 판매하세요.',
    type: 'website',
    url: 'https://dolpagu.com/expert/register',
    siteName: '돌파구',
    images: [
      {
        url: 'https://dolpagu.com/og-default.png',
        width: 1200,
        height: 630,
        alt: '돌파구 전문가 등록',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '전문가 등록 | 수수료 0원 돌파구',
    description: '돌파구에서 전문가로 등록하고 수수료 0원으로 재능을 판매하세요.',
    images: ['https://dolpagu.com/og-default.png'],
  },
  alternates: {
    canonical: 'https://dolpagu.com/expert/register',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD 구조화 데이터
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '전문가 등록',
  description: '돌파구에서 전문가로 등록하고 수수료 0원으로 재능을 판매하세요.',
  url: 'https://dolpagu.com/expert/register',
  mainEntity: {
    '@type': 'Service',
    name: '돌파구 전문가 등록',
    description: '수수료 0원으로 재능을 판매할 수 있는 플랫폼',
    provider: {
      '@type': 'Organization',
      name: '돌파구',
    },
  },
};

export default function ExpertRegisterLayout({ children }: { children: React.ReactNode }) {
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
