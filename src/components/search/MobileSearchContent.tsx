'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSearch } from 'react-icons/fa';
import {
  FaRobot,
  FaPalette,
  FaCut,
  FaCode,
  FaBullhorn,
  FaCamera,
  FaLanguage,
  FaPenFancy,
  FaBriefcase,
  FaBook,
  FaMusic,
  FaCalendar,
  FaSpa,
  FaBullseye,
  FaStar,
  FaBookOpen,
  FaGavel,
  FaHammer,
  FaGraduationCap,
  FaChartLine,
  FaHome,
  FaMotorcycle,
  FaRunning,
  FaCircle,
} from 'react-icons/fa';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  children?: CategoryItem[];
}

interface MobileSearchContentProps {
  categories: CategoryItem[];
}

const ICON_MAP: Record<string, React.ComponentType> = {
  robot: FaRobot,
  palette: FaPalette,
  scissors: FaCut,
  code: FaCode,
  bullhorn: FaBullhorn,
  camera: FaCamera,
  language: FaLanguage,
  'pen-fancy': FaPenFancy,
  briefcase: FaBriefcase,
  book: FaBook,
  music: FaMusic,
  calendar: FaCalendar,
  spa: FaSpa,
  bullseye: FaBullseye,
  star: FaStar,
  'book-open': FaBookOpen,
  gavel: FaGavel,
  hammer: FaHammer,
  'graduation-cap': FaGraduationCap,
  'chart-line': FaChartLine,
  home: FaHome,
  motorcycle: FaMotorcycle,
  running: FaRunning,
};

function CategoryIcon({ icon }: Readonly<{ icon?: string }>) {
  const IconComponent = (icon && ICON_MAP[icon]) || FaCircle;
  return <IconComponent />;
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
];

// 생활서비스 카테고리 slugs
const LIFE_SERVICE_SLUGS = ['errands', 'beauty-fashion', 'home-repair'];

export default function MobileSearchContent({ categories }: MobileSearchContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeywordSearch = (keyword: string) => {
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  // 생활서비스 카테고리 필터링 (하위 카테고리 포함)
  const lifeServiceCategories = categories.filter((cat) =>
    LIFE_SERVICE_SLUGS.includes(cat.slug)
  );

  return (
    <div className="lg:hidden bg-white min-h-screen pb-20">
      {/* 1. 검색창 섹션 - MobileSearchBar와 100% 동일 */}
      <div className="bg-white pt-2 pb-4 px-3">
        <form onSubmit={handleSearch} className="relative" autoComplete="off">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="어떤 재능이 필요하신가요?"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-form-type="other"
            data-lpignore="true"
            role="searchbox"
            aria-label="서비스 검색"
            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-gray-300 focus:outline-none transition-colors text-gray-900 text-sm"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors rounded-full"
            aria-label="검색"
          >
            <FaSearch className="text-base" />
          </button>
        </form>
      </div>

      {/* 2. 추천 검색어 섹션 */}
      <div className="px-3 pb-6">
        <h3 className="font-semibold text-gray-900 mb-3">추천 검색어</h3>
        <div className="flex flex-wrap gap-2">
          {['로고 디자인', 'AI 이미지', '영상 편집', '번역', '블로그 작성', 'PPT 디자인', '웹 개발', '앱 개발'].map(
            (keyword) => (
              <button
                key={keyword}
                type="button"
                className="px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-gray-200 hover:text-brand-primary transition-colors"
                onClick={() => handleKeywordSearch(keyword)}
              >
                {keyword}
              </button>
            )
          )}
        </div>
      </div>

      {/* 3. 내주변 전문가 섹션 - 카드 형태 */}
      <div className="px-3 pb-6">
        <h3 className="font-semibold text-gray-900 mb-3">내주변 전문가</h3>
        <div className="space-y-3">
          {lifeServiceCategories.map((category, index) => (
            <div
              key={category.id}
              className={`rounded-xl p-4 ${bgColors[index % bgColors.length]}`}
            >
              {/* 카테고리 헤더 */}
              <Link
                href={`/categories/${category.slug}`}
                className="flex items-center gap-3 mb-3"
              >
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
        </div>
      </div>
    </div>
  );
}
