'use client';

import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCategoryLabel } from '@/lib/errands/category';
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Package,
  Phone,
  MessageSquare,
} from 'lucide-react';

interface Errand {
  id: string;
  title: string;
  status: string;
  category: string;
  total_price: number;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
  requester: {
    id: string;
    name: string;
    profile_image: string | null;
  };
}

type TabType = 'active' | 'pending' | 'completed';

export default function HelperJobsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadErrands();
    }
  }, [user, activeTab]);

  async function loadErrands() {
    try {
      setLoading(true);
      let status = '';
      if (activeTab === 'active') {
        status = 'IN_PROGRESS,MATCHED';
      } else if (activeTab === 'pending') {
        status = 'PENDING';
      } else {
        status = 'COMPLETED';
      }

      const response = await fetch(`/api/errands?mode=helper&status=${status}`);
      if (response.ok) {
        const data = await response.json();
        setErrands(data.errands || []);
      }
    } catch (error) {
      logger.error('심부름 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'MATCHED':
        return { text: '매칭됨', color: 'bg-purple-100 text-purple-700', icon: CheckCircle };
      case 'IN_PROGRESS':
        return { text: '진행중', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
      case 'COMPLETED':
        return { text: '완료', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'PENDING':
        return { text: '지원 대기', color: 'bg-blue-100 text-blue-700', icon: Clock };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
    }
  };

  const tabs = [
    { id: 'active' as TabType, label: '진행중' },
    { id: 'pending' as TabType, label: '지원 대기' },
    { id: 'completed' as TabType, label: '완료' },
  ];

  return (
    <ErrandMypageLayout mode="helper">
      <div className="p-4 lg:p-0">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">내 작업</h1>
          <p className="text-gray-600 mt-1">진행중인 심부름과 완료된 작업을 확인하세요</p>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 심부름 목록 */}
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
                {activeTab === 'active' && '진행중인 작업이 없습니다'}
                {activeTab === 'pending' && '대기중인 지원이 없습니다'}
                {activeTab === 'completed' && '완료된 작업이 없습니다'}
              </p>
              {activeTab !== 'completed' && (
                <Link
                  href="/errands/mypage/helper/available"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  심부름 찾기
                </Link>
              )}
            </div>
          )}

          {!loading &&
            errands.map((errand) => {
              const status = getStatusLabel(errand.status);
              const StatusIcon = status.icon;
              return (
                <div key={errand.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <Link
                    href={`/errands/${errand.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
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
                      <p className="text-xs text-gray-400 mt-1">
                        요청자: {errand.requester?.name || '알 수 없음'}
                      </p>
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

                  {/* 진행중인 작업의 경우 빠른 액션 버튼 */}
                  {(errand.status === 'MATCHED' || errand.status === 'IN_PROGRESS') && (
                    <div className="flex border-t border-gray-100">
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <Phone className="w-4 h-4" />
                        연락하기
                      </button>
                      <div className="w-px bg-gray-100" />
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        채팅
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </ErrandMypageLayout>
  );
}
