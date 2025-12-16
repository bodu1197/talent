'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { Package, MapPin, Clock, User, ChevronRight, Plus, Bike } from 'lucide-react';
import { getStatusLabel, getCategoryLabel } from '@/lib/errands/helpers';

interface Errand {
  id: string;
  title: string;
  status: string;
  category: string;
  total_price: number;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
  helper?: {
    name: string;
  } | null;
  applications_count?: number;
}

type StatusFilter = 'all' | 'OPEN' | 'MATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export default function ErrandRequestsPage() {
  const { user } = useAuth();
  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (user) {
      loadErrands();
    }
  }, [user, statusFilter]);

  async function loadErrands() {
    try {
      setLoading(true);
      const statusParam = statusFilter === 'all' ? '' : `&status=${statusFilter}`;
      const response = await fetch(`/api/errands?mode=my${statusParam}`);
      if (response.ok) {
        const data = await response.json();
        setErrands(data.errands || []);
      }
    } catch (error) {
      console.error('심부름 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  const statusTabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'OPEN', label: '요청중' },
    { value: 'MATCHED', label: '매칭됨' },
    { value: 'IN_PROGRESS', label: '진행중' },
    { value: 'COMPLETED', label: '완료' },
    { value: 'CANCELLED', label: '취소' },
  ];

  return (
    <ErrandMypageLayout mode="requester">
      <div className="p-4 lg:p-0">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">내 심부름</h1>
            <p className="text-sm text-gray-600">요청한 심부름 내역</p>
          </div>
          <Link
            href="/errands/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">새 요청</span>
          </Link>
        </div>

        {/* 상태 필터 탭 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 심부름 목록 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          </div>
        )}
        {!loading && errands.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">
              {statusFilter === 'all'
                ? '아직 요청한 심부름이 없습니다'
                : '해당 상태의 심부름이 없습니다'}
            </p>
            <Link
              href="/errands/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              심부름 요청하기
            </Link>
          </div>
        )}
        {!loading && errands.length > 0 && (
          <div className="space-y-3">
            {errands.map((errand) => {
              const status = getStatusLabel(errand.status);
              return (
                <Link
                  key={errand.id}
                  href={`/errands/${errand.id}`}
                  className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                      >
                        {status.text}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getCategoryLabel(errand.category)}
                      </span>
                    </div>
                    <p className="font-bold text-blue-600">
                      {errand.total_price.toLocaleString()}원
                    </p>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-2">{errand.title}</h3>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="truncate">{errand.pickup_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="truncate">{errand.delivery_address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(errand.created_at).toLocaleDateString('ko-KR')}
                      </div>
                      {errand.status === 'OPEN' && errand.applications_count !== undefined && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <User className="w-3 h-3" />
                          지원 {errand.applications_count}명
                        </div>
                      )}
                      {errand.helper && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Bike className="w-3 h-3" />
                          {errand.helper.name}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ErrandMypageLayout>
  );
}
