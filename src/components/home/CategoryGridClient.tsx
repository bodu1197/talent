'use client';

import Link from 'next/link';
import { Circle } from 'lucide-react';
import { CATEGORY_ICON_MAP } from '@/lib/categories/icons';

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
}

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
  const IconComponent = (icon && CATEGORY_ICON_MAP[icon]) || Circle;
  return <IconComponent className={iconClass} />;
}

export default function CategoryGridClient({
  categoriesInFirstRow,
  remainingCategories,
  brightColors,
}: Props) {
  // 모든 카테고리를 합쳐서 항상 표시
  const allCategories = [...categoriesInFirstRow, ...remainingCategories];

  return (
    <div className="hidden lg:flex flex-wrap gap-x-8 gap-y-4 items-start justify-start">
      {allCategories.map((category, index) => (
        <Link
          key={category.id}
          href={category.slug === 'errands' ? '/errands' : `/categories/${category.slug}`}
          className="flex flex-col items-center group cursor-pointer w-[72px]"
          prefetch={false}
        >
          <div
            className={`flex items-center justify-center transition-all duration-200 ${brightColors[index % brightColors.length]} group-hover:text-brand-primary`}
          >
            <CategoryIcon icon={category.icon} color="" size="w-10 h-10" />
          </div>
          <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-semibold text-sm text-center mt-1 whitespace-nowrap">
            {category.name}
          </div>
        </Link>
      ))}
    </div>
  );
}
