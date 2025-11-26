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

// 생활서비스 카테고리 slugs
const LIFE_SERVICE_SLUGS = ['errands', 'home-repair', 'beauty-fashion', 'events', 'sports-leisure'];

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

  // 생활서비스 카테고리 필터링
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
      <div className="px-4 pb-6">
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

      {/* 3. 내주변 생활서비스 섹션 */}
      <div className="px-4 pb-6">
        <h3 className="font-semibold text-gray-900 mb-3">내주변 생활서비스</h3>
        <div className="grid grid-cols-5 gap-2">
          {lifeServiceCategories.map((category, index) => (
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
              <span className="text-xs text-gray-700 text-center font-medium group-hover:text-brand-primary">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. 전체 카테고리 섹션 */}
      <div className="px-4 pb-6">
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
