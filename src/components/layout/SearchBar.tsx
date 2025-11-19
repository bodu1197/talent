"use client";

import { useState } from "react";
import Link from "next/link";
import { FaSearch, FaRobot } from "react-icons/fa";

interface SearchBarProps {
  id?: string;
}

export default function SearchBar({ id = "search" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      globalThis.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200" suppressHydrationWarning>
      <div className="container-1200 px-4 py-4">
        {/* 검색창 */}
        <form onSubmit={handleSearch} className="mb-3" role="search">
          <div className="relative w-full h-[52px] flex items-center">
            <label htmlFor={id} className="sr-only">
              서비스 검색
            </label>
            <input
              type="text"
              id={id}
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="어떤 재능이 필요하신가요?"
              className="w-full h-full px-6 py-3 pr-12 border-2 border-gray-300 rounded-full focus:outline-none focus:border-brand-primary transition-colors text-gray-900"
              aria-label="서비스 검색"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-light transition-colors flex-shrink-0 focus:outline-none"
              aria-label="검색 실행"
            >
              <FaSearch aria-hidden="true" />
            </button>
          </div>
        </form>

        {/* 인기 카테고리 */}
        <div
          className="flex flex-wrap gap-2"
          role="navigation"
          aria-label="인기 카테고리"
        >
          <Link
            href="/categories/ai-services"
            className="px-3 py-1.5 text-sm bg-blue-50 text-brand-primary rounded-full font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
            aria-label="AI 서비스 카테고리 보기"
          >
            <FaRobot className="text-sm" aria-hidden="true" /> <span>AI</span>
          </Link>
          <Link
            href="/categories/it-programming"
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
            aria-label="IT/프로그래밍 카테고리 보기"
          >
            IT
          </Link>
          <Link
            href="/categories/design"
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
            aria-label="디자인 카테고리 보기"
          >
            디자인
          </Link>
          <Link
            href="/categories/marketing"
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
            aria-label="마케팅 카테고리 보기"
          >
            마케팅
          </Link>
        </div>
      </div>
    </div>
  );
}
