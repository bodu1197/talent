'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <div className="bg-white lg:hidden fixed top-16 left-0 right-0 z-40">
      <div className="container-1200 px-4 py-4">
        {/* 검색창 */}
        <form onSubmit={handleSearch} className="mb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="어떤 재능이 필요하신가요?"
              className="w-full px-6 py-3 pr-12 border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#0f3460] transition-colors text-gray-900"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0f3460] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#1a4b7d] transition-colors"
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        </form>

        {/* 인기 카테고리 */}
        <div className="flex flex-wrap gap-2">
          <Link href="/categories/ai-services" className="px-3 py-1.5 text-sm bg-blue-50 text-[#0f3460] rounded-full font-medium hover:bg-blue-100 transition-colors flex items-center gap-2">
            <i className="fas fa-robot text-sm"></i> <span>AI</span>
          </Link>
          <Link href="/categories/it-programming" className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
            IT
          </Link>
          <Link href="/categories/design" className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
            디자인
          </Link>
          <Link href="/categories/marketing" className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
            마케팅
          </Link>
        </div>
      </div>
    </div>
  )
}
