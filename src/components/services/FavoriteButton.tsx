'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

interface FavoriteButtonProps {
  readonly serviceId: string;
  readonly className?: string;
}

interface FavoriteData {
  id: string;
  service_id: string;
  user_id: string;
  created_at: string;
}

export default function FavoriteButton({ serviceId, className = '' }: FavoriteButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // 찜 상태 확인
  useEffect(() => {
    if (!user) return;

    async function checkFavoriteStatus() {
      try {
        const response = await fetch('/api/user/service-favorites');
        if (response.ok) {
          const { data } = await response.json();
          const favorited = data?.some((fav: FavoriteData) => fav.service_id === serviceId);
          setIsFavorited(favorited);
        }
      } catch (error) {
        logger.error('Failed to check favorite status:', error);
      }
    }

    checkFavoriteStatus();
  }, [user, serviceId]);

  const handleToggleFavorite = async () => {
    // 로그인 체크
    if (!user) {
      if (confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?')) {
        router.push('/auth/login');
      }
      return;
    }

    setLoading(true);

    try {
      if (isFavorited) {
        // 찜 취소
        const response = await fetch(`/api/user/service-favorites?serviceId=${serviceId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsFavorited(false);
          // 페이지 새로고침하여 찜 개수 업데이트
          router.refresh();
        } else {
          toast.error('찜 취소에 실패했습니다.');
        }
      } else {
        // 찜하기
        const response = await fetch('/api/user/service-favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ serviceId }),
        });

        if (response.ok) {
          setIsFavorited(true);
          // 페이지 새로고침하여 찜 개수 업데이트
          router.refresh();
        } else {
          toast.error('찜하기에 실패했습니다.');
        }
      }
    } catch (error) {
      logger.error('Favorite toggle error:', error);
      toast.error('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`w-full py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      aria-label={isFavorited ? '찜 취소하기' : '찜하기'}
      aria-pressed={isFavorited}
    >
      {isFavorited ? (
        <Heart className="w-5 h-5 text-red-500 fill-current" aria-hidden="true" />
      ) : (
        <Heart className="w-5 h-5" aria-hidden="true" />
      )}
      <span>{isFavorited ? '찜 취소' : '찜하기'}</span>
    </button>
  );
}
