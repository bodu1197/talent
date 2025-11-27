'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bot,
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
  PersonStanding,
  Circle,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  children?: CategoryItem[];
}

interface MobileCategoryBrowserProps {
  categories: CategoryItem[];
}

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
  running: PersonStanding,
};

function CategoryIcon({ icon }: Readonly<{ icon?: string }>) {
  const IconComponent = (icon && ICON_MAP[icon]) || Circle;
  return <IconComponent className="w-5 h-5" />;
}

export default function MobileCategoryBrowser({ categories }: MobileCategoryBrowserProps) {
  const [selectedId, setSelectedId] = useState<string>(categories[0]?.id || '');

  const selectedCategory = categories.find((c) => c.id === selectedId);

  return (
    <div className="lg:hidden flex h-[calc(100vh-120px)] bg-white">
      {/* 왼쪽: 1차 카테고리 목록 (3/7 비율) */}
      <div className="w-[42.8%] bg-gray-50 overflow-y-auto border-r border-gray-200">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedId(category.id)}
            className={`w-full flex items-center gap-2 px-3 py-3 text-left border-b border-gray-100 transition-colors ${
              selectedId === category.id
                ? 'bg-white text-brand-primary font-semibold border-l-2 border-l-brand-primary'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span
              className={`text-lg ${selectedId === category.id ? 'text-brand-primary' : 'text-gray-400'}`}
            >
              <CategoryIcon icon={category.icon} />
            </span>
            <span className="text-sm truncate">{category.name}</span>
          </button>
        ))}
      </div>

      {/* 오른쪽: 2차/3차 카테고리 (4/7 비율) */}
      <div className="w-[57.2%] overflow-y-auto p-3">
        {selectedCategory && (
          <div>
            {/* 선택된 1차 카테고리 전체보기 링크 */}
            <Link
              href={`/categories/${selectedCategory.slug}`}
              className="block text-sm font-semibold text-brand-primary mb-3 pb-2 border-b border-gray-200"
            >
              {selectedCategory.name} 전체보기 →
            </Link>

            {/* 2차 카테고리들 */}
            {selectedCategory.children && selectedCategory.children.length > 0 ? (
              <div className="space-y-4">
                {selectedCategory.children.map((child2) => (
                  <div key={child2.id}>
                    {/* 2차 카테고리 */}
                    <Link
                      href={`/categories/${child2.slug}`}
                      className="block text-sm font-medium text-gray-900 mb-2 hover:text-brand-primary"
                    >
                      {child2.name}
                    </Link>

                    {/* 3차 카테고리들 */}
                    {child2.children && child2.children.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 ml-2">
                        {child2.children.map((child3) => (
                          <Link
                            key={child3.id}
                            href={`/categories/${child3.slug}`}
                            className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-brand-primary hover:text-white transition-colors"
                          >
                            {child3.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">하위 카테고리가 없습니다</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
