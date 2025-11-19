"use client";

import { useEffect } from "react";
import Image from "next/image";
import { FaTimes, FaExternalLinkAlt } from "react-icons/fa";

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
  readonly portfolio: Portfolio;
  readonly onClose: () => void;
}

export default function PortfolioModal({ portfolio, onClose }: Props) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  // YouTube URL에서 비디오 ID 추출
  const getYoutubeVideoId = (url: string | null): string | null => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const youtubeVideoId = getYoutubeVideoId(portfolio.youtube_url);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClose();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="모달 닫기"
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
          }
        }}
        role="dialog"
        tabIndex={-1}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          aria-label="포트폴리오 닫기"
        >
          <FaTimes className="text-gray-700" aria-hidden="true" />
        </button>

        {/* YouTube 영상 (우선 표시) */}
        {youtubeVideoId ? (
          <div className="w-full aspect-video bg-black overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeVideoId}`}
              title={portfolio.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : portfolio.thumbnail_url ? (
          // YouTube가 없을 때만 썸네일 표시
          <div className="w-full aspect-video bg-gray-100 overflow-hidden relative">
            <Image
              src={portfolio.thumbnail_url}
              alt={portfolio.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>
        ) : null}

        {/* 내용 */}
        <div className="p-8">
          {/* 제목 */}
          <h2 className="text-3xl font-bold mb-4">{portfolio.title}</h2>

          {/* 설명 */}
          <div className="prose prose-lg max-w-none mb-6 whitespace-pre-wrap text-gray-700">
            {portfolio.description}
          </div>

          {/* 추가 이미지 */}
          {portfolio.image_urls && portfolio.image_urls.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">추가 이미지</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {portfolio.image_urls.map((url: string, idx: number) => (
                  <div
                    key={idx}
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative"
                  >
                    <Image
                      src={url}
                      alt={`${portfolio.title} - ${idx + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 프로젝트 URL */}
          {portfolio.project_url && (
            <div className="mb-6">
              <a
                href={portfolio.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-brand-primary font-medium"
              >
                <FaExternalLinkAlt />
                <span>프로젝트 보기</span>
              </a>
            </div>
          )}

          {/* 태그 */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {portfolio.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
