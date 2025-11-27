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

function CategoryIcon({
  icon,
  color,
  size = 'w-6 h-6',
}: {
  icon?: string;
  color: string;
  size?: string;
}) {
  const iconClass = `${size} ${color}`;
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
      <div className="hidden lg:flex flex-wrap gap-x-8 gap-y-4 items-start justify-start">
        {categoriesInFirstRow.map((category, index) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex flex-col items-center group cursor-pointer w-[72px]"
          >
            <div
              className={`flex items-center justify-center transition-all duration-200 ${brightColors[index % brightColors.length]} group-hover:text-brand-primary`}
            >
              <CategoryIcon icon={category.icon} color="" size="w-12 h-12" />
            </div>
            <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-semibold text-sm text-center mt-1 whitespace-nowrap">
              {category.name}
            </div>
          </Link>
        ))}

        {hasMoreCategories && (
          <div className="flex flex-col items-center w-[72px]">
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="flex flex-col items-center justify-center h-12 w-12 bg-gray-100 text-gray-500 hover:bg-brand-primary hover:text-white transition-all duration-200 cursor-pointer rounded-lg"
              aria-label={showAllCategories ? '카테고리 간략히 보기' : '모든 카테고리 보기'}
              aria-expanded={showAllCategories}
            >
              {showAllCategories ? (
                <Minus className="w-6 h-6" aria-hidden="true" />
              ) : (
                <LayoutGrid className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
            <span className="text-gray-500 text-sm font-semibold mt-1">
              {showAllCategories ? '접기' : '더보기'}
            </span>
          </div>
        )}
      </div>

      {showAllCategories && remainingCategories.length > 0 && (
        <div className="hidden lg:flex flex-wrap gap-x-8 gap-y-4 items-start justify-start mt-4">
          {remainingCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex flex-col items-center group cursor-pointer w-[72px]"
            >
              <div
                className={`flex items-center justify-center transition-all duration-200 ${brightColors[(index + initialVisibleCount) % brightColors.length]} group-hover:text-brand-primary`}
              >
                <CategoryIcon icon={category.icon} color="" size="w-12 h-12" />
              </div>
              <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-semibold text-sm text-center mt-1 whitespace-nowrap">
                {category.name}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
