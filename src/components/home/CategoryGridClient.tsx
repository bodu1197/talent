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
  Circle,
  Minus,
  LayoutGrid,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface Props {
  readonly categoriesInFirstRow: Category[];
  readonly remainingCategories: Category[];
  readonly hasMoreCategories: boolean;
  readonly brightColors: string[];
  readonly initialVisibleCount: number;
}

// Icon mapping using lookup table for O(1) access
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

function CategoryIcon({ icon, color }: { icon?: string; color: string }) {
  const iconClass = `${color}`;
  const IconComponent = (icon && ICON_MAP[icon]) || Circle;
  return <IconComponent className={iconClass} />;
}

export default function CategoryGridClient({
  categoriesInFirstRow,
  remainingCategories,
  hasMoreCategories,
  brightColors,
  initialVisibleCount,
}: Props) {
  const [showAllCategories, setShowAllCategories] = useState(false);

  return (
    <>
      <div className="hidden lg:flex flex-wrap gap-x-2 gap-y-3 items-center justify-between">
        {categoriesInFirstRow.map((category, index) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div
              className={`text-4xl lg:text-5xl mb-1 h-14 w-14 lg:h-[72px] lg:w-[72px] flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[index % brightColors.length]} group-hover:text-brand-primary`}
            >
              <CategoryIcon icon={category.icon} color="" />
            </div>
            <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-semibold text-sm lg:text-[15px] text-center">
              {category.name}
            </div>
          </Link>
        ))}

        {hasMoreCategories && (
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="flex flex-col items-center justify-center h-[72px] w-[72px] bg-gray-100 text-gray-500 hover:bg-brand-primary hover:text-white transition-all duration-200 cursor-pointer rounded-lg"
            aria-label={showAllCategories ? '카테고리 간략히 보기' : '모든 카테고리 보기'}
            aria-expanded={showAllCategories}
          >
            <div className="grid grid-cols-2 gap-1">
              {showAllCategories ? (
                <Minus className="w-5 h-5" aria-hidden="true" />
              ) : (
                <LayoutGrid className="w-5 h-5" aria-hidden="true" />
              )}
              {showAllCategories ? (
                <Minus className="w-5 h-5" aria-hidden="true" />
              ) : (
                <LayoutGrid className="w-5 h-5" aria-hidden="true" />
              )}
              {showAllCategories ? (
                <Minus className="w-5 h-5" aria-hidden="true" />
              ) : (
                <LayoutGrid className="w-5 h-5" aria-hidden="true" />
              )}
              {showAllCategories ? (
                <Minus className="w-5 h-5" aria-hidden="true" />
              ) : (
                <LayoutGrid className="w-5 h-5" aria-hidden="true" />
              )}
            </div>
            <span className="text-xs font-medium mt-1">
              {showAllCategories ? '간략히 보기' : '전체 보기'}
            </span>
          </button>
        )}
      </div>

      {showAllCategories && remainingCategories.length > 0 && (
        <div className="hidden lg:flex flex-wrap gap-x-2 gap-y-3 items-center justify-between mt-4">
          {remainingCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`text-4xl lg:text-5xl mb-1 h-14 w-14 lg:h-[72px] lg:w-[72px] flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[(index + initialVisibleCount) % brightColors.length]} group-hover:text-brand-primary`}
              >
                <CategoryIcon icon={category.icon} color="" />
              </div>
              <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-semibold text-sm lg:text-[15px] text-center">
                {category.name}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
