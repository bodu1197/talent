import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '심부름 요청하기 | 돌파구',
  description:
    '배달, 구매대행, 서류 전달 등 필요한 심부름을 요청하세요. 내 주변 헬퍼가 빠르게 해결해드립니다.',
  keywords: ['심부름 요청', '배달 요청', '구매대행', '돌파구 심부름'],
  openGraph: {
    title: '심부름 요청하기 | 돌파구',
    description: '배달, 구매대행, 서류 전달 등 필요한 심부름을 요청하세요.',
    type: 'website',
    url: 'https://dolpagu.com/errands/new',
    siteName: '돌파구',
    images: [
      {
        url: 'https://dolpagu.com/og-errands.png',
        width: 1200,
        height: 630,
        alt: '돌파구 심부름 요청',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '심부름 요청하기 | 돌파구',
    description: '배달, 구매대행, 서류 전달 등 필요한 심부름을 요청하세요.',
    images: ['https://dolpagu.com/og-errands.png'],
  },
  alternates: {
    canonical: 'https://dolpagu.com/errands/new',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ErrandNewLayout({ children }: { readonly children: React.ReactNode }) {
  return <>{children}</>;
}
