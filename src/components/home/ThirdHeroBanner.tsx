'use client';

import {
  HomeIcon,
  MicIcon,
  SparklesIcon,
  WrenchIcon,
  ChatBubbleIcon,
  PuzzleIcon,
} from '@/components/home/HeroIcons';
import GradientCategoryBanner, {
  BannerCategoryConfig,
} from '@/components/common/GradientCategoryBanner';

// 카테고리 설정 (아이콘, 스타일) - slug는 실제 카테고리 slug와 일치해야 함
const categoryConfig = [
  {
    slug: 'life-service',
    title: '생활 서비스',
    subtitle: '청소 · 수리 · 이사 · 정리수납',
    description: '내 주변 전문가가 직접 방문해요',
    icon: HomeIcon,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    slug: 'event',
    title: '이벤트',
    subtitle: 'MC · 사회자 · 공연 · 행사',
    description: '가까운 곳에서 특별한 순간을',
    icon: MicIcon,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    slug: 'beauty-fashion',
    title: '뷰티 · 패션',
    subtitle: '메이크업 · 헤어 · 네일 · 스타일링',
    description: '동네에서 만나는 뷰티 전문가',
    icon: SparklesIcon,
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    slug: 'custom-order',
    title: '주문제작',
    subtitle: '맞춤 제작 · 커스텀 상품 · 핸드메이드',
    description: '근처 공방에서 나만의 것을',
    icon: WrenchIcon,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    slug: 'counseling-coaching',
    title: '상담 · 코칭',
    subtitle: '심리상담 · 커리어 · 라이프 코칭',
    description: '가까운 전문가와 1:1 상담',
    icon: ChatBubbleIcon,
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    slug: 'hobby-handmade',
    title: '취미 · 핸드메이드',
    subtitle: '공예 · DIY · 클래스 · 원데이',
    description: '동네 원데이클래스 발견하기',
    icon: PuzzleIcon,
    gradient: 'from-fuchsia-500 to-pink-600',
  },
];

export default function ThirdHeroBanner() {
  const slugs = categoryConfig.map((c) => c.slug).join(',');
  const categories: BannerCategoryConfig[] = categoryConfig.map((c) => ({
    ...c,
    href: `/categories/${c.slug}`,
  }));

  return (
    <GradientCategoryBanner
      title={
        <>
          <span className="text-orange-700">내 주변</span>의 프리미엄 전문가
        </>
      }
      description="가까운 곳에서 직접 만나는 전문가 서비스"
      categories={categories}
      fetchCountsUrl={`/api/categories/service-counts?slugs=${slugs}`}
      getBadgeText={(count, hasServices) => (hasServices ? `서비스 ${count}개` : '내주변 서비스')}
      getCtaText={(hasServices) => (hasServices ? '서비스 보기' : '전문가 찾기')}
    />
  );
}
