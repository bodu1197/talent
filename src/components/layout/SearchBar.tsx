"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  id?: string;
  recommendedTerms?: Array<{ name: string; slug: string; count: number }>;
}

export default function SearchBar({ id = "search", recommendedTerms = [] }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      const searchUrl = `/search?q=${encodeURIComponent(trimmedQuery)}`;
      setIsFocused(false);
      router.push(searchUrl);
    }
  };

  const handleTermClick = (term: string) => {
    setSearchQuery(term);
    setIsFocused(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white lg:bg-transparent" suppressHydrationWarning>
      <div className="container-1200 px-4 py-4">
        {/* 검색창 */}
        <div ref={searchRef} className="relative w-full">
          <form onSubmit={handleSearch} autoComplete="off" role="search">
            <div className="relative w-full">
              <label htmlFor={id} className="sr-only">
                서비스 검색
              </label>
              <input
                type="text"
                id={`search-${Math.random().toString(36).substring(7)}`}
                name={`search-${Math.random().toString(36).substring(7)}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="어떤 재능이 필요하신가요?"
                className="w-full px-6 py-3 pr-12 border-2 border-gray-300 rounded-full focus:outline-none focus:border-brand-primary transition-colors text-gray-900"
                aria-label="서비스 검색"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-form-type="other"
              />
              <button
                type="submit"
                onMouseDown={(e) => e.preventDefault()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-light transition-colors"
                aria-label="검색 실행"
              >
                <FaSearch aria-hidden="true" />
              </button>
            </div>
          </form>

          {/* 추천 검색어 드롭다운 */}
          {isFocused && recommendedTerms && recommendedTerms.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-3 font-semibold">추천 검색어</p>
                <div className="space-y-1">
                  {recommendedTerms.slice(0, 10).map((term) => (
                    <button
                      key={term.slug}
                      type="button"
                      onClick={() => handleTermClick(term.name)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 group"
                    >
                      <FaSearch className="text-gray-400 text-sm group-hover:text-brand-primary transition-colors" />
                      <span className="text-gray-700 group-hover:text-brand-primary transition-colors">
                        {term.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
