'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ChevronRight,
  MapPin,
  Bike,
} from 'lucide-react';

interface ErrandSummary {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
}

interface RecentErrand {
  id: string;
  title: string;
  status: string;
  category: string;
  total_price: number;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
}

export default function ErrandRequesterDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ErrandSummary>({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
  });
  const [recentErrands, setRecentErrands] = useState<RecentErrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const response = await fetch('/api/errands?mode=my&limit=5');
      if (response.ok) {
        const data = await response.json();
        setRecentErrands(data.errands || []);

        // 요약 계산
        const errands = data.errands || [];
        setSummary({
          total: data.total || errands.length,
          open: errands.filter((e: RecentErrand) => e.status === 'OPEN').length,
          inProgress: errands.filter(
            (e: RecentErrand) => e.status === 'MATCHED' || e.status === 'IN_PROGRESS'
          ).length,
          completed: errands.filter((e: RecentErrand) => e.status === 'COMPLETED').length,
        });
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { text: '요청중', color: 'bg-blue-100 text-blue-700' };
      case 'MATCHED':
        return { text: '매칭됨', color: 'bg-purple-100 text-purple-700' };
      case 'IN_PROGRESS':
        return { text: '진행중', color: 'bg-yellow-100 text-yellow-700' };
      case 'COMPLETED':
        return { text: '완료', color: 'bg-green-100 text-green-700' };
      case 'CANCELLED':
        return { text: '취소됨', color: 'bg-gray-100 text-gray-700' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700' };
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

  return (
    <ErrandMypageLayout mode="requester">
      <div className="p-4 lg:p-0">
        {/* 환영 메시지 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">심부름 요청자 대시보드</h1>
          <p className="text-gray-600 mt-1">심부름 요청 현황을 확인하세요</p>
        </div>

        {/* 빠른 요청 버튼 */}
        <Link
          href="/errands/new"
          className="flex items-center justify-between w-full p-4 bg-blue-600 text-white rounded-xl mb-6 hover:bg-blue-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">새 심부름 요청하기</p>
              <p className="text-sm text-blue-100">배달, 구매대행 등</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6" />
        </Link>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-sm">전체</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? '-' : summary.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">요청중</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{loading ? '-' : summary.open}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">진행중</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {loading ? '-' : summary.inProgress}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">완료</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{loading ? '-' : summary.completed}</p>
          </div>
        </div>

        {/* 최근 심부름 */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">최근 심부름</h2>
            <Link
              href="/errands/mypage/requests"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              전체보기
            </Link>
          </div>

          {loading && <div className="p-8 text-center text-gray-500">불러오는 중...</div>}
          {!loading && recentErrands.length === 0 && (
            <div className="p-8 text-center">
              <Bike className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">아직 요청한 심부름이 없습니다</p>
              <Link
                href="/errands/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                심부름 요청하기
              </Link>
            </div>
          )}
          {!loading && recentErrands.length > 0 && (
            <div className="divide-y divide-gray-100">
              {recentErrands.map((errand) => {
                const status = getStatusLabel(errand.status);
                return (
                  <Link
                    key={errand.id}
                    href={`/errands/${errand.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.text}
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
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-blue-600">
                        {errand.total_price.toLocaleString()}원
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(errand.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 도움말 */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">심부름 이용 안내</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>심부름을 요청하면 주변 심부름꾼에게 알림이 갑니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>지원한 심부름꾼 중 원하는 분을 선택하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>심부름 완료 후 리뷰를 남겨주세요</span>
            </li>
          </ul>
        </div>
      </div>
    </ErrandMypageLayout>
  );
}
