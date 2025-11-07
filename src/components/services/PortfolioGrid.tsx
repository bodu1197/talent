'use client'

import { useState } from 'react'
import PortfolioModal from './PortfolioModal'

interface Portfolio {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  image_urls: string[]
  youtube_url: string | null
  project_url: string | null
  tags: string[]
  created_at: string
}

interface Props {
  portfolios: Portfolio[]
  getYoutubeVideoId: (url: string | null) => string | null
}

export default function PortfolioGrid({ portfolios, getYoutubeVideoId }: Props) {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {portfolios.map((portfolio) => (
          <button
            key={portfolio.id}
            onClick={() => setSelectedPortfolio(portfolio)}
            className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-[#0f3460] transition-all"
          >
            {portfolio.thumbnail_url ? (
              <img
                src={portfolio.thumbnail_url}
                alt={portfolio.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <i className="fas fa-image text-4xl"></i>
              </div>
            )}

            {/* 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                {portfolio.title}
              </h3>
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <i className="fas fa-expand-alt"></i>
                <span>자세히 보기</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 모달 */}
      {selectedPortfolio && (
        <PortfolioModal
          portfolio={selectedPortfolio}
          onClose={() => setSelectedPortfolio(null)}
          getYoutubeVideoId={getYoutubeVideoId}
        />
      )}
    </>
  )
}
