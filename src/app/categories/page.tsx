import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getAllCategoriesTree } from '@/lib/categories';

// 모바일 카테고리 브라우저는 동적 로드 (초기 번들 크기 감소)
const MobileCategoryBrowser = dynamic(
  () => import('@/components/categories/MobileCategoryBrowser'),
  {
    loading: () => <div className="lg:hidden min-h-screen bg-gray-50 animate-pulse" />,
  }
);

export const metadata = {
  title: '전체 카테고리 - 돌파구 | 수수료 0원 재능 거래',
  description:
    '디자인, 개발, 마케팅, 생활 서비스 등 다양한 카테고리의 전문가를 만나보세요. 돌파구에서 수수료 부담 없이 원하는 재능을 찾으세요.',
  keywords: '돌파구 카테고리, 재능 카테고리, 디자인 외주, 개발 외주, 마케팅 대행, 생활 서비스',
};

export default async function CategoriesPage() {
  // Get all categories with children from database
  const topLevelCategories = await getAllCategoriesTree();

  const getIconClass = (iconName: string) => {
    const iconMap: Record<string, string> = {
      robot: 'fa-robot',
      palette: 'fa-palette',
      scissors: 'fa-scissors',
      code: 'fa-code',
      bullhorn: 'fa-bullhorn',
      camera: 'fa-camera',
      language: 'fa-language',
      'pen-fancy': 'fa-pen-fancy',
      briefcase: 'fa-briefcase',
      book: 'fa-book',
      music: 'fa-music',
      calendar: 'fa-calendar',
      spa: 'fa-spa',
      bullseye: 'fa-bullseye',
      star: 'fa-star',
      'book-open': 'fa-book-open',
      gavel: 'fa-gavel',
      hammer: 'fa-hammer',
      'graduation-cap': 'fa-graduation-cap',
      'chart-line': 'fa-chart-line',
      home: 'fa-home',
      motorcycle: 'fa-motorcycle',
    };
    return `fas ${iconMap[iconName] || 'fa-circle'}`;
  };

  return (
    <>
      {/* 모바일: 좌우 분할 카테고리 브라우저 */}
      <MobileCategoryBrowser categories={topLevelCategories} />

      {/* PC: 기존 그리드 레이아웃 */}
      <div className="hidden lg:block min-h-screen bg-gray-50 py-8 lg:py-12">
        <div className="container-1200 px-4">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">전체 카테고리</h1>
            <p className="text-gray-600">필요한 서비스를 카테고리별로 찾아보세요</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
            {topLevelCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-white rounded-xl p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 lg:mb-4 group-hover:bg-blue-100 transition-colors">
                  <i
                    className={`${getIconClass(category.icon ?? '')} text-xl lg:text-2xl text-brand-primary`}
                  ></i>
                </div>
                <h3 className="font-semibold text-sm lg:text-base text-gray-900 mb-1">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">{category.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
