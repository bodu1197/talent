import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '자주 묻는 질문 (FAQ) - 돌파구 | 수수료 0원 재능 거래 플랫폼',
  description:
    '돌파구 이용에 대한 자주 묻는 질문과 답변입니다. 수수료, 정산, 환불, 전문가 등록 등 궁금한 점을 확인하세요.',
  keywords: '돌파구 FAQ, 자주 묻는 질문, 수수료 0원, 프리랜서 정산, 환불 정책, 전문가 등록',
  openGraph: {
    title: '자주 묻는 질문 (FAQ) - 돌파구',
    description:
      '돌파구 이용에 대한 자주 묻는 질문과 답변. 수수료, 정산, 환불 등 궁금한 점을 확인하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function FAQLayout({ children }: { readonly children: React.ReactNode }) {
  return <>{children}</>;
}
