'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import { ArrowLeft, Pencil, Trash2, Eye, Calendar, Youtube, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface Portfolio {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category_id: string | null;
  thumbnail_url: string | null;
  image_urls: string[];
  project_url: string | null;
  youtube_url: string | null;
  tags: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  readonly portfolio: Portfolio;
  readonly sellerId: string;
}

export default function PortfolioDetailClient({ portfolio, sellerId: _sellerId }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 썸네일 + 추가 이미지 배열
  const allImages = [portfolio.thumbnail_url, ...(portfolio.image_urls || [])].filter(
    Boolean
  ) as string[];

  // YouTube 비디오 ID 추출
  const getYoutubeVideoId = (url: string | null): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = pattern.exec(url);
      if (match) return match[1];
    }
    return null;
  };

  const youtubeVideoId = getYoutubeVideoId(portfolio.youtube_url);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      setDeleting(true);

      const response = await fetch(`/api/seller/portfolio/${portfolio.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      toast.success('포트폴리오가 삭제되었습니다');
      router.push('/mypage/seller/portfolio');
      router.refresh();
    } catch (error) {
      logger.error('Portfolio delete error:', error);
      toast.error('삭제에 실패했습니다');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="w-full max-w-[1200px] py-4 px-4 lg:py-8 lg:px-6 mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/mypage/seller/portfolio"
                className="text-gray-600 hover:text-brand-primary transition-colors"
              >
                <ArrowLeft className="inline w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                포트폴리오 목록
              </Link>
              <div className="flex gap-2">
                <Link
                  href={`/mypage/seller/portfolio/${portfolio.id}/edit`}
                  className="px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="inline w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                  수정
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Trash2 className="inline w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                  {deleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>

            <h1 className="text-base lg:text-lg font-semibold text-gray-900">{portfolio.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span>
                <Eye className="inline w-4 h-4 lg:w-5 lg:h-5 mr-1" />
                {portfolio.view_count || 0} 조회
              </span>
              <span>
                <Calendar className="inline w-4 h-4 lg:w-5 lg:h-5 mr-1" />
                {new Date(portfolio.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>

          {/* 이미지 갤러리 */}
          {allImages.length > 0 && (
            <div className="mb-6 lg:mb-8">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* 메인 이미지 */}
                <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
                  <img
                    src={allImages[currentImageIndex]}
                    alt={portfolio.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* 썸네일 네비게이션 */}
                {allImages.length > 1 && (
                  <div className="p-4 lg:p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex gap-2 overflow-x-auto">
                      {allImages.map((image, index) => (
                        <button
                          key={`image-${image}`}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            currentImageIndex === index
                              ? 'border-brand-primary ring-2 ring-brand-primary ring-opacity-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${portfolio.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* YouTube 영상 */}
          {youtubeVideoId && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 mb-6">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
                <Youtube className="inline w-4 h-4 lg:w-5 lg:h-5 text-red-600 mr-2" />
                프로젝트 영상
              </h2>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title={portfolio.title}
                  style={{ border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* 설명 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 mb-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">프로젝트 설명</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {portfolio.description}
            </p>
          </div>

          {/* 프로젝트 URL */}
          {portfolio.project_url && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 mb-6">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
                프로젝트 링크
              </h2>
              <a
                href={portfolio.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline break-all"
              >
                <ExternalLink className="inline w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                {portfolio.project_url}
              </a>
            </div>
          )}

          {/* 태그 */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">태그</h2>
              <div className="flex flex-wrap gap-2">
                {portfolio.tags.map((tag, index) => (
                  <span
                    key={`tag-${tag}-${index}`}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
