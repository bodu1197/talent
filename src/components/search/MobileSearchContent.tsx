'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileSearchBar from '@/components/home/MobileSearchBar';
import { Plus } from 'lucide-react';
import { OFFLINE_CATEGORY_SLUGS } from '@/lib/constants/categories';
import { CategoryIcon } from '@/lib/categories/icons';

interface CategoryItem {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly icon?: string;
  readonly children?: CategoryItem[];
}

interface MobileSearchContentProps {
  readonly categories: CategoryItem[];
}

const brightColors = [
  'text-red-500',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-purple-500',
  'text-pink-500',
  'text-indigo-500',
  'text-teal-500',
  'text-orange-500',
  'text-cyan-500',
  'text-lime-500',
  'text-fuchsia-500',
];

const bgColors = [
  'bg-red-50',
  'bg-blue-50',
  'bg-green-50',
  'bg-yellow-50',
  'bg-purple-50',
  'bg-pink-50',
  'bg-orange-50',
  'bg-teal-50',
];

// 내 주변 전문가 카테고리 slugs (오프라인/대면 서비스)
// OFFLINE_CATEGORY_SLUGS를 사용하여 일관성 유지

export default function MobileSearchContent({ categories }: MobileSearchContentProps) {
  const router = useRouter();

  const handleKeywordSearch = (keyword: string) => {
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  // 내 주변 전문가 카테고리 필터링 (오프라인/대면 서비스)
  const nearbyCategories = categories.filter((cat) =>
    OFFLINE_CATEGORY_SLUGS.includes(cat.slug as (typeof OFFLINE_CATEGORY_SLUGS)[number])
  );

  return (
    <div className="lg:hidden bg-white min-h-screen pb-20">
      {/* 1. 검색창 섹션 - MobileSearchBar 컴포넌트 그대로 사용 */}
      <MobileSearchBar />

      {/* 2. 추천 검색어 섹션 */}
      <div className="px-3 pb-6">
        <h3 className="font-semibold text-gray-900 mb-3">추천 검색어</h3>
        <div className="flex flex-wrap gap-2">
          {[
            '로고 디자인',
            'AI 이미지',
            '영상 편집',
            '번역',
            '블로그 작성',
            'PPT 디자인',
            '웹 개발',
            '앱 개발',
          ].map((keyword) => (
            <button
              key={keyword}
              type="button"
              className="px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-gray-200 hover:text-brand-primary transition-colors"
              onClick={() => handleKeywordSearch(keyword)}
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 내주변 전문가 섹션 - 카드 형태 */}
      <div className="px-3 pb-6">
        <h3 className="font-semibold text-gray-900 mb-3">내주변 전문가</h3>
        <div className="space-y-3">
          {nearbyCategories.map((category, index) => (
            <div
              key={category.id}
              className={`rounded-xl p-4 ${bgColors[index % bgColors.length]}`}
            >
              {/* 카테고리 헤더 */}
              <Link href={`/categories/${category.slug}`} className="flex items-center gap-3 mb-3">
                <div
                  className={`text-2xl h-10 w-10 flex items-center justify-center rounded-full bg-white ${brightColors[index % brightColors.length]}`}
                >
                  <CategoryIcon icon={category.icon} />
                </div>
                <span className="font-semibold text-gray-900">{category.name}</span>
              </Link>

              {/* 하위 카테고리 */}
              {category.children && category.children.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.slug}`}
                      className="px-3 py-1.5 bg-white rounded-full text-sm text-gray-700 hover:text-brand-primary transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. 전체 카테고리 섹션 */}
      <div className="px-3 pb-6">
        <h3 className="font-semibold text-gray-900 mb-3">전체 카테고리</h3>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex flex-col items-center group"
            >
              <div
                className={`text-2xl mb-1 h-12 w-12 flex items-center justify-center rounded-full bg-gray-50 transition-all duration-200 ${brightColors[index % brightColors.length]} group-hover:text-brand-primary`}
              >
                <CategoryIcon icon={category.icon} />
              </div>
              <span className="text-xs text-gray-700 text-center font-medium group-hover:text-brand-primary line-clamp-1">
                {category.name}
              </span>
            </Link>
          ))}
          {/* + 상세보기 아이콘 */}
          <Link href="/categories" className="flex flex-col items-center group">
            <div className="text-2xl mb-1 h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 group-hover:text-brand-primary transition-all duration-200">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs text-gray-700 text-center font-medium group-hover:text-brand-primary">
              상세보기
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
