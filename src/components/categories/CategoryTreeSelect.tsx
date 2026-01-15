'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Folder, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface CategoryTreeSelectProps {
  readonly categories: Category[]; // 2차 카테고리 배열 (각각 children으로 3차 포함)
  readonly currentCategoryId: string;
  readonly rootCategoryName: string;
  readonly rootCategorySlug: string;
}

export default function CategoryTreeSelect({
  categories,
  currentCategoryId,
  rootCategoryName,
  rootCategorySlug,
}: CategoryTreeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 현재 1차 카테고리가 선택된 상태인지 확인
  const isRootSelected = !categories.some(
    (cat) => cat.id === currentCategoryId || cat.children?.some((c) => c.id === currentCategoryId)
  );

  // 모든 카테고리 펼치기
  const expandAll = () => {
    const allIds = new Set<string>();
    categories.forEach((cat) => {
      if (cat.children && cat.children.length > 0) {
        allIds.add(cat.id);
      }
    });
    setExpandedCategories(allIds);
  };

  // 드롭다운 열 때 모든 하위 카테고리 펼치기
  const handleOpen = () => {
    if (!isOpen) {
      expandAll();
    }
    setIsOpen(!isOpen);
  };

  // 개별 카테고리 토글
  const toggleCategory = (categoryId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 카테고리가 없으면 렌더링하지 않음
  if (categories.length === 0) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* 드롭다운 버튼 */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors w-full sm:w-auto"
      >
        <Folder className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">전체 카테고리</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* 전체 보기 옵션 */}
          <Link
            href={`/categories/${rootCategorySlug}`}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
              isRootSelected
                ? 'bg-brand-primary/10 text-brand-primary font-medium'
                : 'text-gray-700'
            }`}
          >
            {isRootSelected && <Check className="w-4 h-4" />}
            <span className={isRootSelected ? '' : 'ml-6'}>{rootCategoryName} 전체</span>
          </Link>

          <div className="border-t border-gray-100" />

          {/* 2차/3차 카테고리 트리 */}
          {categories.map((category) => {
            const hasChildren = category.children && category.children.length > 0;
            const isSelected = category.id === currentCategoryId;
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div key={category.id}>
                {/* 2차 카테고리 */}
                <div className="flex items-center">
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={(e) => toggleCategory(category.id, e)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <ChevronRight
                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </button>
                  )}
                  <Link
                    href={`/categories/${category.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex-1 flex items-center gap-2 px-2 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      isSelected
                        ? 'bg-brand-primary/10 text-brand-primary font-medium'
                        : 'text-gray-700'
                    } ${!hasChildren ? 'ml-8' : ''}`}
                  >
                    {isSelected && <Check className="w-4 h-4" />}
                    <span className={isSelected || hasChildren ? '' : 'ml-6'}>{category.name}</span>
                  </Link>
                </div>

                {/* 3차 카테고리 (펼쳐진 경우에만 표시) */}
                {hasChildren && isExpanded && (
                  <div className="bg-gray-50 ml-6 border-l-2 border-gray-200">
                    {category.children?.map((child) => {
                      const isChildSelected = child.id === currentCategoryId;
                      return (
                        <Link
                          key={child.id}
                          href={`/categories/${child.slug}`}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-2 pl-4 pr-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            isChildSelected
                              ? 'bg-brand-primary/10 text-brand-primary font-medium'
                              : 'text-gray-600'
                          }`}
                        >
                          {isChildSelected && <Check className="w-4 h-4" />}
                          <span className={isChildSelected ? '' : 'ml-6'}>{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
