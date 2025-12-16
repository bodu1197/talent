'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CategoryItem } from '@/lib/categories';
import { CATEGORY_ICON_MAP } from '@/lib/categories/icons';
import { Circle, ChevronRight } from 'lucide-react';

interface CategorySidebarProps {
  readonly categories: CategoryItem[];
  readonly currentCategoryId: string;
  readonly categoryPath: CategoryItem[];
}

function getCategoryIcon(icon?: string) {
  const IconComponent = (icon && CATEGORY_ICON_MAP[icon]) || Circle;
  return <IconComponent className="w-5 h-5" />;
}

export default function CategorySidebar({
  categories,
  currentCategoryId,
  categoryPath,
}: CategorySidebarProps) {
  const pathIds = new Set(categoryPath.map((c) => c.id));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(pathIds);

  const toggleCategory = (categoryId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="py-2">
          {/* 전체 카테고리 트리 표시 */}
          {categories.map((category1) => (
            <div key={category1.id} className="mb-1">
              {/* 1차 카테고리 */}
              <Link
                href={`/categories/${category1.slug}`}
                className={`flex items-center justify-between pl-0 pr-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  category1.id === currentCategoryId
                    ? 'bg-gray-100 text-gray-800'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  if (category1.children && category1.children.length > 0) {
                    toggleCategory(category1.id, e);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {category1.icon && (
                    <span className="text-lg">{getCategoryIcon(category1.icon)}</span>
                  )}
                  <span>{category1.name}</span>
                </div>
                {category1.children && category1.children.length > 0 && (
                  <ChevronRight
                    className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                      expandedCategories.has(category1.id) ? 'rotate-90' : ''
                    }`}
                  />
                )}
              </Link>

              {/* 2차 카테고리 (펼쳐져 있으면 표시) */}
              {category1.children && category1.children.length > 0 && (
                <div
                  className={`bg-gray-50 border-l-2 border-gray-200 ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedCategories.has(category1.id)
                      ? 'max-h-[2000px] opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  {category1.children.map((category2) => (
                    <div key={category2.id}>
                      <Link
                        href={`/categories/${category2.slug}`}
                        className={`flex items-center justify-between px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          category2.id === currentCategoryId
                            ? 'bg-gray-200 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                        onClick={(e) => {
                          if (category2.children && category2.children.length > 0) {
                            toggleCategory(category2.id, e);
                          }
                        }}
                      >
                        <span>{category2.name}</span>
                        {category2.children && category2.children.length > 0 && (
                          <ChevronRight
                            className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                              expandedCategories.has(category2.id) ? 'rotate-90' : ''
                            }`}
                          />
                        )}
                      </Link>

                      {/* 3차 카테고리 (펼쳐져 있으면 표시) */}
                      {category2.children && category2.children.length > 0 && (
                        <div
                          className={`bg-white border-l border-gray-200 ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                            expandedCategories.has(category2.id)
                              ? 'max-h-[2000px] opacity-100'
                              : 'max-h-0 opacity-0'
                          }`}
                        >
                          {category2.children.map((category3) => (
                            <Link
                              key={category3.id}
                              href={`/categories/${category3.slug}`}
                              className={`relative block px-4 py-2 text-xs transition-all duration-200 ${
                                category3.id === currentCategoryId
                                  ? 'text-gray-900 font-semibold bg-gray-100 before:absolute before:left-0 before:top-0 before:w-1 before:h-full before:bg-brand-primary'
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                              }`}
                            >
                              {category3.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
