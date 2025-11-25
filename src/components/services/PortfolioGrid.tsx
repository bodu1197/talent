'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FaImage, FaExpandAlt } from 'react-icons/fa';

// Dynamic import for PortfolioModal - only loads when needed
const PortfolioModal = dynamic(() => import('./PortfolioModal'), {
  loading: () => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  ),
  ssr: false,
});

interface Portfolio {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  image_urls: string[];
  youtube_url: string | null;
  project_url: string | null;
  tags: string[];
  created_at: string;
}

interface Props {
  readonly portfolios: Portfolio[];
}

export default function PortfolioGrid({ portfolios }: Props) {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {portfolios.map((portfolio) => (
          <button
            key={portfolio.id}
            onClick={() => setSelectedPortfolio(portfolio)}
            className="group relative bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-brand-primary transition-all"
            style={{ aspectRatio: '35/26' }}
          >
            {portfolio.thumbnail_url ? (
              <Image
                src={portfolio.thumbnail_url}
                alt={portfolio.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FaImage className="text-4xl" />
              </div>
            )}

            {/* 오버레이 */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">{portfolio.title}</h3>
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <FaExpandAlt />
                <span>자세히 보기</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 모달 */}
      {selectedPortfolio && (
        <PortfolioModal portfolio={selectedPortfolio} onClose={() => setSelectedPortfolio(null)} />
      )}
    </>
  );
}
