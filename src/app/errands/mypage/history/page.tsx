'use client';

import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import ProfileImage from '@/components/common/ProfileImage';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  Package,
  Star,
} from 'lucide-react';

interface CompletedErrand {
  id: string;
  title: string;
  category: string;
  status: string;
  total_price: number;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
  completed_at: string | null;
  helper: {
    id: string;
    name: string;
    profile_image: string | null;
  } | null;
  has_review: boolean;
}

type FilterType = 'all' | 'completed' | 'cancelled';

export default function ErrandHistoryPage() {
  const { user } = useAuth();
  const [errands, setErrands] = useState<CompletedErrand[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, filter]);

  async function loadHistory() {
    try {
      setLoading(true);
      let status = '';
      if (filter === 'completed') {
        status = 'COMPLETED';
      } else if (filter === 'cancelled') {
        status = 'CANCELLED';
      } else {
        status = 'COMPLETED,CANCELLED';
      }

      const response = await fetch(`/api/errands?mode=requester&status=${status}`);
      if (response.ok) {
        const data = await response.json();
        setErrands(data.errands || []);
      }
    } catch (error) {
      logger.error('완료 내역 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { text: '완료', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'CANCELLED':
        return { text: '취소', color: 'bg-red-100 text-red-700', icon: XCircle };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
    }
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      DELIVERY: '배달',
      SHOPPING: '구매대행',
      MOVING: '이사/운반',
      QUEUEING: '줄서기',
      PET_CARE: '반려동물',
      CLEANING: '청소',
      BUG_CATCHING: '벌레 잡기',
      DOCUMENT: '서류',
      OTHER: '기타',
    };
    return categoryMap[category] || category;
  };

  const filters = [
    { id: 'all' as FilterType, label: '전체' },
    { id: 'completed' as FilterType, label: '완료' },
    { id: 'cancelled' as FilterType, label: '취소' },
  ];

  return (
    <ErrandMypageLayout mode="requester">
      <div className="p-4 lg:p-0">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">완료 내역</h1>
          <p className="text-gray-600 mt-1">완료된 심부름 내역을 확인하세요</p>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 완료 내역 목록 */}
        <div className="space-y-4">
          {loading && (
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto" />
              <p className="mt-4 text-gray-500">불러오는 중...</p>
            </div>
          )}

          {!loading && errands.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">
                {filter === 'completed' && '완료된 심부름이 없습니다'}
                {filter === 'cancelled' && '취소된 심부름이 없습니다'}
                {filter === 'all' && '완료 내역이 없습니다'}
              </p>
              <Link
                href="/errands"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                심부름 요청하기
              </Link>
            </div>
          )}

          {!loading &&
            errands.map((errand) => {
              const statusInfo = getStatusInfo(errand.status);
              const StatusIcon = statusInfo.icon;
              return (
                <div key={errand.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <Link
                    href={`/errands/${errand.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.text}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getCategoryLabel(errand.category)}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 truncate">{errand.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{errand.pickup_address}</span>
                      </div>
                      {errand.helper && (
                        <div className="flex items-center gap-2 mt-2">
                          <ProfileImage
                            src={errand.helper.profile_image}
                            alt={errand.helper.name}
                            size={20}
                          />
                          <span className="text-xs text-gray-600">
                            라이더: {errand.helper.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900">
                        {errand.total_price.toLocaleString()}원
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 justify-end mt-1">
                        <Calendar className="w-3 h-3" />
                        {errand.completed_at
                          ? new Date(errand.completed_at).toLocaleDateString('ko-KR')
                          : new Date(errand.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </Link>

                  {/* 리뷰 작성 버튼 (완료된 심부름만) */}
                  {errand.status === 'COMPLETED' && errand.helper && (
                    <div className="flex border-t border-gray-100">
                      {errand.has_review ? (
                        <div className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          리뷰 작성 완료
                        </div>
                      ) : (
                        <Link
                          href={`/errands/${errand.id}/review`}
                          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                        >
                          <Star className="w-4 h-4" />
                          리뷰 작성하기
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* 통계 요약 */}
        {!loading && errands.length > 0 && (
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">이용 통계</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {errands.filter((e) => e.status === 'COMPLETED').length}
                </p>
                <p className="text-xs text-gray-500">완료</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {errands.filter((e) => e.status === 'CANCELLED').length}
                </p>
                <p className="text-xs text-gray-500">취소</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {errands
                    .filter((e) => e.status === 'COMPLETED')
                    .reduce((sum, e) => sum + e.total_price, 0)
                    .toLocaleString()}
                  원
                </p>
                <p className="text-xs text-gray-500">총 이용 금액</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrandMypageLayout>
  );
}
