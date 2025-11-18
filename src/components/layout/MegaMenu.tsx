"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CategoryItem } from "@/lib/categories";
import { FaRobot, FaChevronRight, FaFire, FaBars } from "react-icons/fa";
import * as FaIcons from "react-icons/fa";

interface MegaMenuProps {
  categories: CategoryItem[];
}

export default function MegaMenu({ categories }: MegaMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 동적 아이콘 렌더링 헬퍼
  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;

    // fa- 접두사 제거 및 PascalCase 변환
    const iconKey =
      "Fa" +
      iconName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");

    const IconComponent = (
      FaIcons as Record<
        string,
        React.ComponentType<{ className?: string; "aria-hidden"?: string }>
      >
    )[iconKey];

    if (IconComponent) {
      return <IconComponent className="text-lg" aria-hidden="true" />;
    }
    return null;
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 현재 활성 카테고리의 하위 카테고리 가져오기
  const getActiveSubCategories = (): CategoryItem["children"] => {
    if (!activeCategory) return [];
    const category = categories.find((cat) => cat.id === activeCategory);
    return category?.children || [];
  };

  return (
    <div className="hidden lg:flex items-center gap-4 relative" ref={menuRef}>
      {/* 전체 카테고리 버튼 */}
      <button
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg font-medium transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="전체 카테고리 메뉴"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FaBars className="text-sm" aria-hidden="true" />
        <span className="text-sm">전체 카테고리</span>
      </button>

      {/* 인기 카테고리 퀵링크 */}
      <div className="flex items-center gap-4">
        {/* AI 서비스 (고정) */}
        <Link
          href="/categories/ai-services"
          className="text-sm text-brand-primary font-medium hover:text-brand-light flex items-center gap-1"
          onClick={handleCategoryClick}
          aria-label="AI 서비스 카테고리 보기"
        >
          <FaRobot className="text-xs" aria-hidden="true" /> AI 서비스
        </Link>

        {/* IT/프로그래밍 (고정) */}
        <Link
          href="/categories/it-programming"
          className="text-sm text-gray-700 hover:text-gray-900"
          onClick={handleCategoryClick}
          aria-label="IT/프로그래밍 카테고리 보기"
        >
          IT/프로그래밍
        </Link>

        {/* 서비스 수 순으로 상위 3개 표시 (AI, IT 제외) */}
        {categories
          .filter(
            (cat) =>
              cat.id !== "ai-services" && cat.id !== "it-programming",
          )
          .sort(
            (a, b) => (b.service_count || 0) - (a.service_count || 0),
          )
          .slice(0, 3)
          .map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="text-sm text-gray-700 hover:text-gray-900"
              onClick={handleCategoryClick}
              aria-label={`${cat.name} 카테고리 보기`}
            >
              {cat.name}
            </Link>
          ))}
      </div>

      {/* 메가 메뉴 드롭다운 */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 w-screen max-w-5xl bg-white border border-gray-200 rounded-lg shadow-xl z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-6">
            <div className="grid grid-cols-12 gap-6">
              {/* 왼쪽: 대분류 카테고리 */}
              <div className="col-span-4 border-r border-gray-200 pr-6 max-h-[500px] overflow-y-auto scrollbar-hide">
                <div>
                  {categories.map((category) => (
                    <div key={category.id} className="mb-1">
                      <Link
                        href={`/categories/${category.slug}`}
                        className={`flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                          activeCategory === category.id
                            ? "bg-gray-100 text-gray-800"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onMouseEnter={() => handleCategoryHover(category.id)}
                        onClick={handleCategoryClick}
                        aria-label={`${category.name} 카테고리로 이동`}
                      >
                        <div className="flex items-center gap-2">
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
                        <FaChevronRight
                          className="text-xs text-gray-400"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* 오른쪽: 하위 카테고리 */}
              <div className="col-span-8">
                {activeCategory && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      {getActiveSubCategories()?.map((subCategory) => (
                        <div
                          key={subCategory.id}
                          className="flex flex-col gap-2"
                        >
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
                              {subCategory.children.slice(0, 5).map((item) => (
                                <li key={item.id}>
                                  <Link
                                    href={`/categories/${item.slug}`}
                                    className="text-xs text-gray-600 hover:text-brand-primary"
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
                  </>
                )}

                {/* 기본 상태 - 인기 카테고리 */}
                {!activeCategory && (
                  <div>
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                      <FaFire className="text-red-500" /> 인기 카테고리
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {categories
                        .flatMap(
                          (cat) =>
                            cat.children?.flatMap(
                              (sub) => sub.children || [],
                            ) || [],
                        )
                        .slice(0, 12)
                        .map((item) => (
                          <Link
                            key={item.id}
                            href={`/categories/${item.slug}`}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-brand-primary transition-colors text-sm"
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
        </div>
      )}
    </div>
  );
}
