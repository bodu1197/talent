import type { Metadata } from 'next';

// 마이페이지는 보호된 페이지이므로 검색엔진 색인 제외
export const metadata: Metadata = {
  title: '심부름 마이페이지 | 돌파구',
  description: '심부름 요청 내역, 헬퍼 활동 관리 및 설정을 확인하세요.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function ErrandMypageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
