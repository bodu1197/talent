import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '심부름 헬퍼 등록 | 돌파구',
  description:
    '돌파구 심부름 헬퍼로 등록하고 부수입을 올려보세요. 자유로운 시간에 배달, 구매대행 심부름을 수행하고 수익을 얻으세요.',
  keywords: ['심부름 헬퍼', '배달 알바', '구매대행', '부수입', '헬퍼 등록', '돌파구 헬퍼'],
  openGraph: {
    title: '심부름 헬퍼 등록 | 돌파구',
    description:
      '돌파구 심부름 헬퍼로 등록하고 부수입을 올려보세요. 자유로운 시간에 배달, 구매대행 심부름을 수행하고 수익을 얻으세요.',
    type: 'website',
    url: 'https://dolpagu.com/errands/register',
    siteName: '돌파구',
    images: [
      {
        url: 'https://dolpagu.com/og-errands.png',
        width: 1200,
        height: 630,
        alt: '돌파구 심부름 헬퍼 등록',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '심부름 헬퍼 등록 | 돌파구',
    description: '돌파구 심부름 헬퍼로 등록하고 부수입을 올려보세요.',
    images: ['https://dolpagu.com/og-errands.png'],
  },
  alternates: {
    canonical: 'https://dolpagu.com/errands/register',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ErrandRegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
