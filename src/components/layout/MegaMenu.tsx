'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { CategoryItem } from '@/lib/categories';
import {
  Bot,
  ChevronRight,
  Flame,
  Palette,
  Scissors,
  Code,
  Megaphone,
  Camera,
  Languages,
  PenTool,
  Briefcase,
  BookOpen,
  Music,
  Calendar,
  Sparkles,
  Target,
  Star,
  Library,
  Gavel,
  Hammer,
  GraduationCap,
  TrendingUp,
  Home,
  Bike,
  Circle,
} from 'lucide-react';

interface MegaMenuProps {
  readonly categories: CategoryItem[];
}

// 아이콘 매핑 테이블 (O(1) 접근)
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  robot: Bot,
  palette: Palette,
  scissors: Scissors,
  code: Code,
  bullhorn: Megaphone,
  camera: Camera,
  language: Languages,
  'pen-fancy': PenTool,
  briefcase: Briefcase,
  book: BookOpen,
  music: Music,
  calendar: Calendar,
  spa: Sparkles,
  bullseye: Target,
  star: Star,
  'book-open': Library,
  gavel: Gavel,
  hammer: Hammer,
  'graduation-cap': GraduationCap,
  'chart-line': TrendingUp,
  home: Home,
  motorcycle: Bike,
};

export default function MegaMenu({ categories }: MegaMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 동적 아이콘 렌더링 헬퍼
  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;

    const IconComponent = ICON_MAP[iconName] || Circle;
    return <IconComponent className="w-5 h-5" aria-hidden="true" />;
  };

  // 마우스 벗어날 때 지연 후 닫기
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
      setIsOpen(false);
    }, 300);
  };

  // 마우스 진입 시 타이머 취소
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // 카테고리 호버
  const handleCategoryHover = (categoryId: string) => {
    handleMouseEnter();
    setActiveCategory(categoryId);
    setIsOpen(true);
  };

  // 카테고리 클릭 시 메뉴 닫기
  const handleCategoryClick = () => {
    setIsOpen(false);
    setActiveCategory(null);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 현재 활성 카테고리의 하위 카테고리 가져오기
  const getActiveSubCategories = (): CategoryItem['children'] => {
    if (!activeCategory) return [];
    const category = categories.find((cat) => cat.id === activeCategory);
    return category?.children || [];
  };

  return (
    <div className="hidden lg:block fixed top-20 left-0 right-0 bg-white z-40" ref={menuRef}>
      {/* 메인 카테고리 바 */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container-1200">
          <nav className="flex items-center justify-between">
            <div className="flex items-center">
              {/* 전체 카테고리 버튼 */}
              <button
                className="flex items-center gap-2 pl-0 pr-4 py-3 hover:bg-gray-50 font-medium border-r border-gray-200 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="전체 카테고리 메뉴"
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span>전체 카테고리</span>
              </button>

              {/* 인기 카테고리 퀵링크 - 서비스 수 순으로 상위 6개 표시 */}
              <div className="flex items-center gap-6 px-6">
                {[...categories]
                  .sort((a, b) => (b.service_count || 0) - (a.service_count || 0))
                  .slice(0, 6)
                  .map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      className="hover:text-gray-900"
                      onClick={handleCategoryClick}
                      aria-label={`${cat.name} 카테고리 보기`}
                    >
                      {cat.name}
                    </Link>
                  ))}
              </div>
            </div>

            {/* AI Hub 버튼 */}
            <Link
              href="/ai"
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm mr-4"
              aria-label="AI Hub 페이지로 이동"
            >
              <Bot className="w-4 h-4" aria-hidden="true" />
              <span>AI Hub</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* 메가 메뉴 드롭다운 */}
      {isOpen && (
        <nav
          className="absolute left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label="카테고리 메가 메뉴"
        >
          <div className="container-1200 py-6">
            <div className="grid grid-cols-12 gap-8">
              {/* 왼쪽: 대분류 카테고리 */}
              <div className="col-span-3 border-r border-gray-200 pr-6 max-h-[600px] overflow-y-auto scrollbar-hide">
                <div>
                  {categories.map((category) => (
                    <div key={category.id} className="mb-1">
                      <Link
                        href={`/categories/${category.slug}`}
                        className={`flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                          activeCategory === category.id
                            ? 'bg-gray-100 text-gray-800'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onMouseEnter={() => handleCategoryHover(category.id)}
                        onClick={handleCategoryClick}
                        aria-label={`${category.name} 카테고리로 이동`}
                      >
                        <div className="flex items-center gap-3">
                          {category.icon && renderIcon(category.icon)}
                          <span>{category.name}</span>
                          {category.is_ai && (
                            <span
                              className="text-xs bg-blue-100 text-brand-primary px-1.5 py-0.5 rounded"
                              aria-label="AI 카테고리"
                            >
                              AI
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-400" aria-hidden="true" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* 오른쪽: 하위 카테고리 */}
              <div className="col-span-9">
                {activeCategory && (
                  <>
                    <div className="grid grid-cols-4 gap-4">
                      {getActiveSubCategories()?.map((subCategory) => (
                        <div key={subCategory.id} className="flex flex-col gap-2">
                          <h4 className="font-semibold text-sm">
                            <Link
                              href={`/categories/${subCategory.slug}`}
                              className="hover:text-brand-primary"
                              onClick={handleCategoryClick}
                            >
                              {subCategory.name}
                            </Link>
                          </h4>
                          {subCategory.children && (
                            <ul className="flex flex-col gap-1">
                              {subCategory.children.map((item) => (
                                <li key={item.id}>
                                  <Link
                                    href={`/categories/${item.slug}`}
                                    className="text-xs text-gray-600 hover:text-brand-primary flex items-center gap-1"
                                    onClick={handleCategoryClick}
                                  >
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* AI 카테고리인 경우 키워드 표시 */}
                  </>
                )}

                {/* 기본 상태 - 인기 카테고리 */}
                {!activeCategory && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-red-500" /> 인기 카테고리
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {categories
                        .flatMap((cat) => cat.children?.flatMap((sub) => sub.children || []) || [])
                        .slice(0, 16)
                        .map((item) => (
                          <Link
                            key={item.id}
                            href={`/categories/${item.slug}`}
                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-brand-primary transition-colors"
                            onClick={handleCategoryClick}
                          >
                            <span className="font-medium">{item.name}</span>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
