'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ServiceCard from '@/components/services/ServiceCard';
import { Service } from '@/types';

interface CategoryTab {
  id: string;
  name: string;
  slug: string;
}

interface RecommendedServicesClientProps {
  readonly categories: CategoryTab[];
  readonly servicesByCategory: Record<string, Service[]>;
}

export default function RecommendedServicesClient({
  categories,
  servicesByCategory,
}: RecommendedServicesClientProps) {
  // 첫 번째 카테고리를 기본 탭으로 설정
  const [activeTab, setActiveTab] = useState<string>(categories[0]?.id || '');
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // 카테고리가 변경되면 첫 번째 탭으로 설정
  useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => c.id === activeTab)) {
      setActiveTab(categories[0].id);
    }
  }, [categories, activeTab]);

  // 스크롤 상태 체크 - requestAnimationFrame으로 강제 리플로우 방지
  useEffect(() => {
    let rafId: number;

    const checkScroll = () => {
      // requestAnimationFrame으로 레이아웃 읽기를 다음 프레임으로 지연
      rafId = requestAnimationFrame(() => {
        const container = tabContainerRef.current;
        if (container) {
          setShowLeftArrow(container.scrollLeft > 0);
          setShowRightArrow(
            container.scrollLeft < container.scrollWidth - container.clientWidth - 5
          );
        }
      });
    };

    checkScroll();
    const container = tabContainerRef.current;
    container?.addEventListener('scroll', checkScroll, { passive: true });
    globalThis.window.addEventListener('resize', checkScroll);

    return () => {
      cancelAnimationFrame(rafId);
      container?.removeEventListener('scroll', checkScroll);
      globalThis.window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = tabContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // 현재 탭에 맞는 서비스 가져오기
  const currentServices = servicesByCategory[activeTab] || [];

  // 카테고리가 없으면 섹션 숨김
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-4 lg:py-8 bg-gray-50">
      <div className="container-1200">
        <div className="mb-6">
          <h2 className="text-mobile-lg lg:text-xl font-semibold mb-2">추천 서비스</h2>
          <p className="text-mobile-md text-gray-600">믿을 수 있는 검증된 전문가들의 서비스</p>
        </div>

        {/* 탭 UI - 스크롤 가능 */}
        <div className="relative mb-6">
          {/* 왼쪽 화살표 - 모바일만 */}
          {showLeftArrow && (
            <button
              onClick={() => scrollTabs('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 lg:hidden"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* 탭 컨테이너 - PC: 한 줄 표시 / 모바일: 스크롤 */}
          <div
            ref={tabContainerRef}
            className="flex gap-1 lg:gap-1.5 overflow-x-auto scrollbar-hide px-1 py-1 lg:justify-center"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium rounded-full whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* 오른쪽 화살표 - 모바일만 */}
          {showRightArrow && (
            <button
              onClick={() => scrollTabs('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 lg:hidden"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* 서비스 그리드 */}
        {currentServices.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentServices.slice(0, 15).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">해당 카테고리의 서비스가 없습니다.</div>
        )}
      </div>
    </section>
  );
}
