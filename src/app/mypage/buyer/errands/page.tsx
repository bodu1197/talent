'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { logger } from '@/lib/logger';
import type { ErrandStatus } from '@/types/errand';
import { RotateCcw, MapPin, Clock, User, MessageSquare, Plus, Bike } from 'lucide-react';

interface Errand {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: ErrandStatus;
  pickup_address: string;
  delivery_address: string;
  total_price: number;
  created_at: string;
  scheduled_at: string | null;
  requester: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  helper: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
}

interface ErrandFilter {
  status: ErrandStatus | 'all';
  searchQuery: string;
}

function BuyerErrandsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const statusFromUrl = (searchParams.get('status') as ErrandStatus | 'all') || 'all';

  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    OPEN: 0,
    MATCHED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  });

  const [filters, setFilters] = useState<ErrandFilter>({
    status: statusFromUrl,
    searchQuery: '',
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, status: statusFromUrl }));
  }, [statusFromUrl]);

  useEffect(() => {
    if (user) {
      loadErrands();
    }
  }, [user, filters.status]);

  async function loadErrands() {
    try {
      setLoading(true);
      setError(null);

      const statusParam = filters.status === 'all' ? '' : `&status=${filters.status}`;
      const response = await fetch(`/api/errands?mode=my${statusParam}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '심부름 목록을 불러올 수 없습니다');
      }

      const { errands: errandData, total } = await response.json();
      setErrands(errandData || []);

      // Calculate status counts
      const counts = {
        all: total || 0,
        OPEN: 0,
        MATCHED: 0,
        IN_PROGRESS: 0,
        COMPLETED: 0,
        CANCELLED: 0,
      };

      errandData?.forEach((errand: Errand) => {
        if (errand.status in counts) {
          counts[errand.status as keyof typeof counts]++;
        }
      });

      if (filters.status === 'all') {
        setStatusCounts(counts);
      }
    } catch (err: unknown) {
      logger.error('심부름 조회 실패:', err);
      setError(err instanceof Error ? err.message : '심부름 내역을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }

  const filteredErrands = errands.filter((errand) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = errand.title.toLowerCase().includes(query);
      const matchesAddress =
        errand.pickup_address.toLowerCase().includes(query) ||
        errand.delivery_address.toLowerCase().includes(query);
      if (!matchesTitle && !matchesAddress) return false;
    }
    return true;
  });

  const tabs = [
    { value: 'all', label: '전체', count: statusCounts.all },
    { value: 'OPEN', label: '요청중', count: statusCounts.OPEN },
    { value: 'MATCHED', label: '매칭됨', count: statusCounts.MATCHED },
    { value: 'IN_PROGRESS', label: '진행중', count: statusCounts.IN_PROGRESS },
    { value: 'COMPLETED', label: '완료', count: statusCounts.COMPLETED },
    { value: 'CANCELLED', label: '취소', count: statusCounts.CANCELLED },
  ];

  const resetFilters = () => {
    setFilters({
      status: 'all',
      searchQuery: '',
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '요청중';
      case 'MATCHED':
        return '매칭됨';
      case 'IN_PROGRESS':
        return '진행중';
      case 'COMPLETED':
        return '완료';
      case 'CANCELLED':
        return '취소됨';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-700';
      case 'MATCHED':
        return 'bg-purple-100 text-purple-700';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
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

  if (loading) {
    return (
      <MypageLayoutWrapper mode="buyer">
        <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
          <LoadingSpinner message="심부름 내역을 불러오는 중..." />
        </div>
      </MypageLayoutWrapper>
    );
  }

  if (error) {
    return (
      <MypageLayoutWrapper mode="buyer">
        <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
          <ErrorState message={error} retry={loadErrands} />
        </div>
      </MypageLayoutWrapper>
    );
  }

  return (
    <MypageLayoutWrapper mode="buyer">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div>
            <h1 className="text-base lg:text-lg font-semibold text-gray-900">심부름 내역</h1>
            <p className="text-gray-600 mt-1 text-sm">요청한 심부름 내역을 확인하세요</p>
          </div>
          <Link
            href="/errands/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">심부름 요청</span>
          </Link>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 lg:mb-6">
          <div className="flex items-center overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() =>
                  setFilters({ ...filters, status: tab.value as ErrandStatus | 'all' })
                }
                className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  filters.status === tab.value
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      filters.status === tab.value
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 검색 필터 */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4 mb-4 lg:mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label
                htmlFor="errand-search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                검색
              </label>
              <input
                id="errand-search"
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="제목 또는 주소로 검색"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* 결과 카운트 */}
        <div className="mb-4 text-sm text-gray-600">
          총 <span className="font-semibold text-gray-900">{filteredErrands.length}</span> 건의
          심부름
        </div>

        {/* 심부름 목록 */}
        <div className="space-y-4">
          {filteredErrands.length > 0 ? (
            filteredErrands.map((errand) => (
              <div
                key={errand.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          errand.status
                        )}`}
                      >
                        {getStatusLabel(errand.status)}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {getCategoryLabel(errand.category)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{errand.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-primary">
                      {errand.total_price.toLocaleString()}원
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500">출발:</span> {errand.pickup_address}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500">도착:</span> {errand.delivery_address}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>
                      {new Date(errand.created_at).toLocaleDateString('ko-KR', {
                        timeZone: 'Asia/Seoul',
                      })}
                    </span>
                  </div>
                  {errand.helper && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-500" />
                      <span>심부름꾼: {errand.helper.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/errands/${errand.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors text-sm font-medium"
                  >
                    <Bike className="w-4 h-4" />
                    상세보기
                  </Link>
                  {errand.status === 'IN_PROGRESS' && (
                    <Link
                      href={`/chat?errand=${errand.id}`}
                      className="inline-flex items-center justify-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      <MessageSquare className="w-4 h-4" />
                      채팅
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon="fa-inbox"
              title="심부름 내역이 없습니다"
              description="새로운 심부름을 요청해보세요"
              action={{
                label: '심부름 요청하기',
                href: '/errands/new',
              }}
            />
          )}
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}

export default function BuyerErrandsPage() {
  return (
    <Suspense
      fallback={
        <MypageLayoutWrapper mode="buyer">
          <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
            <LoadingSpinner message="페이지 로딩 중..." />
          </div>
        </MypageLayoutWrapper>
      }
    >
      <BuyerErrandsContent />
    </Suspense>
  );
}
