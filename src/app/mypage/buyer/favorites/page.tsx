'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Service } from '@/types';
import { FaLock, FaHeart, FaBox, FaStar, FaCheckCircle, FaTimes, FaRegHeart } from 'react-icons/fa';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import toast from 'react-hot-toast';

interface FavoriteItem {
  service_id: string;
  created_at: string;
  service: Service;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/service-favorites');

        if (response.ok) {
          const { data } = await response.json();
          setFavorites(data || []);
        }
      } catch (error) {
        console.error(
          'Failed to fetch favorites:',
          JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
        );
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (serviceId: string) => {
    if (!confirm('찜 목록에서 제거하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/service-favorites?serviceId=${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(favorites.filter((fav) => fav.service_id !== serviceId));
      } else {
        toast.error('찜 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error(
        'Remove favorite error:',
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      );
      toast.error('오류가 발생했습니다.');
    }
  };

  if (!user) {
    return (
      <MypageLayoutWrapper mode="buyer">
        <div className="py-8 px-4">
          <div className="max-w-md mx-auto text-center">
            <FaLock className="text-6xl text-gray-300 mb-4" />
            <h2 className="text-base md:text-lg font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">찜한 서비스를 확인하려면 로그인해주세요.</p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </MypageLayoutWrapper>
    );
  }

  if (loading) {
    return (
      <MypageLayoutWrapper mode="buyer">
        <div className="py-8 px-4">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-base md:text-lg font-bold mb-2">찜한 서비스</h1>
            <p className="text-xs md:text-sm text-gray-600">
              관심있는 서비스를 저장하고 관리하세요
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={`favorite-skeleton-${i}`} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg" style={{ aspectRatio: '210/160' }}></div>
                <div className="mt-2 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MypageLayoutWrapper>
    );
  }

  return (
    <MypageLayoutWrapper mode="buyer">
      <div className="py-8 px-4">
        <div className="mb-6 lg:mb-8 pt-12 lg:pt-0">
          <div className="flex items-center gap-3 mb-2">
            <FaHeart className="text-red-500 text-2xl" />
            <h1 className="text-base md:text-lg font-bold">찜한 서비스</h1>
            {favorites.length > 0 && (
              <span className="text-lg text-gray-500">({favorites.length}개)</span>
            )}
          </div>
          <p className="text-xs md:text-sm text-gray-600">관심있는 서비스를 저장하고 관리하세요</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <FaRegHeart className="text-6xl text-gray-300 mb-4" />
            <h3 className="text-sm md:text-base font-bold mb-2">찜한 서비스가 없습니다</h3>
            <p className="text-gray-600 mb-6">마음에 드는 서비스를 찜해보세요</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors"
            >
              서비스 둘러보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favorites.map((favorite) => {
              const { service } = favorite;
              if (!service) return null;

              return (
                <div key={service.id} className="group relative">
                  {/* 제거 버튼 */}
                  <button
                    onClick={() => handleRemoveFavorite(service.id)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    title="찜 취소"
                  >
                    <FaTimes />
                  </button>

                  <Link href={`/services/${service.id}`} className="block">
                    {/* 썸네일 */}
                    <div
                      className="bg-gray-100 rounded-lg overflow-hidden w-full relative"
                      style={{ aspectRatio: '210/160' }}
                    >
                      {service.thumbnail_url ? (
                        <img
                          src={service.thumbnail_url}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <FaBox className="text-4xl text-gray-400" />
                        </div>
                      )}

                      {/* 찜 아이콘 표시 */}
                      <div className="absolute top-2 left-2">
                        <div className="px-2 py-1 bg-red-500 text-white text-xs rounded shadow-lg">
                          <FaHeart />
                        </div>
                      </div>
                    </div>

                    {/* 서비스 정보 */}
                    <div className="mt-2">
                      {/* 판매자 */}
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center text-white text-[8px] font-bold">
                          {service.seller?.display_name?.[0] || 'S'}
                        </div>
                        <span className="text-xs text-gray-600 truncate">
                          {service.seller?.display_name}
                        </span>
                        {service.seller?.is_verified && (
                          <FaCheckCircle className="text-[10px] text-blue-500" />
                        )}
                      </div>

                      {/* 제목 */}
                      <h3 className="font-medium text-sm line-clamp-2 group-hover:text-brand-primary transition-colors mb-1">
                        {service.title}
                      </h3>

                      {/* 평점 및 주문 수 */}
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <span className="flex items-center gap-1">
                          <FaStar className="text-yellow-400" />
                          {(service.rating || 0).toFixed(1)}
                        </span>
                        <span>({service.order_count || 0})</span>
                      </div>

                      {/* 가격 */}
                      <p className="text-brand-primary font-bold text-sm">
                        {(service.price || 0).toLocaleString()}원
                      </p>

                      {/* 찜한 날짜 */}
                      <div className="mt-1">
                        <span className="text-[10px] text-gray-400">
                          {new Date(favorite.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MypageLayoutWrapper>
  );
}
