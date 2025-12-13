'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchFormProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string; // Container className
  inputClassName?: string;
  buttonClassName?: string;
  iconClassName?: string;
  onSubmit?: (query: string) => void;
}

export default function SearchForm({
  initialQuery = '',
  placeholder = '어떤 재능이 필요하신가요?',
  className = '',
  inputClassName = '',
  buttonClassName = '',
  iconClassName = 'w-5 h-5',
  onSubmit,
}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(query);
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`} autoComplete="off">
      <label htmlFor="search-input" className="sr-only">
        서비스 검색
      </label>
      <input
        type="text"
        id="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        role="searchbox"
        className={`focus-visible:outline-none w-full border-2 border-gray-300 rounded-full focus:rounded-full hover:border-gray-300 focus:outline-none focus:border-gray-300 focus:shadow-none transition-none text-gray-900 ${inputClassName}`}
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
        }}
      />
      <button
        type="submit"
        className={`absolute right-2 top-1/2 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors rounded-full hover:bg-gray-100 active:scale-100 focus:outline-none isolate ${buttonClassName}`}
        style={{
          transform: 'translate3d(0, -50%, 0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
        }}
        aria-label="검색"
      >
        <Search className={iconClassName} />
      </button>
    </form>
  );
}
