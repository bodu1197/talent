'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

export default function MobileSearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="lg:hidden bg-white pt-2 pb-4 px-3">
      <form onSubmit={handleSearch} className="relative" autoComplete="off">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="어떤 재능이 필요하신가요?"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-form-type="other"
          data-lpignore="true"
          role="searchbox"
          aria-label="서비스 검색"
          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-gray-300 focus:outline-none transition-colors text-gray-900 text-sm"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors rounded-full active:scale-100 focus:outline-none isolate"
          style={{
            transform: 'translate3d(0, -50%, 0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform',
          }}
          aria-label="검색"
        >
          <FaSearch className="text-base" />
        </button>
      </form>
    </div>
  );
}
