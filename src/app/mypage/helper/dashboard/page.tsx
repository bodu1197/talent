'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import { useAuth } from '@/components/providers/AuthProvider';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import {
  Bike,
  Wallet,
  Star,
  MapPin,
  Clock,
  TrendingUp,
  CreditCard,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface HelperStats {
  availableBalance: number;
  totalWithdrawn: number;
  totalEarned: number;
}

interface HelperProfile {
  id: string;
  user_id: string;
  grade: string;
  average_rating: number;
  total_completed: number;
  total_reviews: number;
  is_active: boolean;
  subscription_status: string;
  subscription_expires_at: string | null;
  user: {
    id: string;
    name: string;
    profile_image: string | null;
  } | null;
}

export default function HelperDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [helperProfile, setHelperProfile] = useState<HelperProfile | null>(null);
  const [stats, setStats] = useState<HelperStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/mypage/helper/dashboard');
      return;
    }

    if (user) {
      loadHelperData();
    }
  }, [user, authLoading, router]);

  async function loadHelperData() {
    try {
      setLoading(true);
      const response = await fetch('/api/helper');

      if (!response.ok) {
        throw new Error('헬퍼 정보를 불러올 수 없습니다');
      }

      const data = await response.json();
      setHelperProfile(data.helperProfile);
      setStats(data.stats);
    } catch (err) {
      logger.error('헬퍼 정보 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  const getGradeLabel = (grade: string) => {
    const gradeMap: Record<string, string> = {
      NEWBIE: '뉴비',
      BRONZE: '브론즈',
      SILVER: '실버',
      GOLD: '골드',
      PLATINUM: '플래티넘',
      DIAMOND: '다이아몬드',
    };
    return gradeMap[grade] || grade;
  };

  const getGradeColor = (grade: string) => {
    const colorMap: Record<string, string> = {
      NEWBIE: 'text-green-600 bg-green-100',
      BRONZE: 'text-amber-700 bg-amber-100',
      SILVER: 'text-gray-600 bg-gray-200',
      GOLD: 'text-yellow-600 bg-yellow-100',
      PLATINUM: 'text-purple-600 bg-purple-100',
      DIAMOND: 'text-cyan-600 bg-cyan-100',
    };
    return colorMap[grade] || 'text-gray-600 bg-gray-100';
  };

  const getSubscriptionStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '구독 중';
      case 'trial':
        return '무료 체험';
      case 'expired':
        return '만료됨';
      case 'cancelled':
        return '해지됨';
      default:
        return status;
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'trial':
        return 'text-blue-600 bg-blue-100';
      case 'expired':
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (authLoading || loading) {
    return (
      <MypageLayoutWrapper mode="helper">
        <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
          <LoadingSpinner message="심부름꾼 정보를 불러오는 중..." />
        </div>
      </MypageLayoutWrapper>
    );
  }

  // 헬퍼 등록이 안 된 경우
  if (!helperProfile) {
    return (
      <MypageLayoutWrapper mode="helper">
        <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Bike className="w-16 h-16 mx-auto text-orange-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">심부름꾼으로 등록하세요!</h2>
            <p className="text-gray-600 mb-6">
              심부름을 수행하고 수익을 올려보세요.
              <br />첫 달은 무료로 체험할 수 있습니다.
            </p>
            <Link
              href="/mypage/helper/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              심부름꾼 등록하기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </MypageLayoutWrapper>
    );
  }

  // 구독 만료 경고
  const isSubscriptionExpired =
    helperProfile.subscription_status === 'expired' ||
    helperProfile.subscription_status === 'cancelled';

  return (
    <MypageLayoutWrapper mode="helper">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        {/* 구독 만료 경고 */}
        {isSubscriptionExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">구독이 만료되었습니다</p>
              <p className="text-red-600 text-sm">심부름 지원을 계속하려면 구독을 갱신해주세요.</p>
            </div>
            <Link
              href="/mypage/helper/subscription"
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium whitespace-nowrap"
            >
              구독 갱신
            </Link>
          </div>
        )}

        {/* 프로필 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Bike className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">
                    {helperProfile.user?.name || '심부름꾼'}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(
                      helperProfile.grade
                    )}`}
                  >
                    {getGradeLabel(helperProfile.grade)}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{helperProfile.average_rating.toFixed(1)}</span>
                    <span className="text-gray-400">({helperProfile.total_reviews}개 리뷰)</span>
                  </div>
                  <div>완료 {helperProfile.total_completed}건</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getSubscriptionStatusColor(
                  helperProfile.subscription_status
                )}`}
              >
                {getSubscriptionStatusLabel(helperProfile.subscription_status)}
              </span>
              {helperProfile.subscription_expires_at && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(helperProfile.subscription_expires_at).toLocaleDateString('ko-KR')} 까지
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 수익 요약 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-sm">출금 가능</span>
            </div>
            <p className="text-xl font-bold text-brand-primary">
              {stats?.availableBalance.toLocaleString() || 0}원
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">누적 수익</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {stats?.totalEarned.toLocaleString() || 0}원
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm">출금 완료</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {stats?.totalWithdrawn.toLocaleString() || 0}원
            </p>
          </div>
        </div>

        {/* 퀵 메뉴 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link
            href="/mypage/helper/available"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col items-center text-center"
          >
            <MapPin className="w-8 h-8 text-orange-500 mb-2" />
            <span className="font-medium text-gray-900">심부름 찾기</span>
            <span className="text-sm text-gray-500">주변 심부름 보기</span>
          </Link>
          <Link
            href="/mypage/helper/errands"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col items-center text-center"
          >
            <Clock className="w-8 h-8 text-blue-500 mb-2" />
            <span className="font-medium text-gray-900">내 심부름</span>
            <span className="text-sm text-gray-500">진행중인 심부름</span>
          </Link>
          <Link
            href="/mypage/helper/earnings"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col items-center text-center"
          >
            <Wallet className="w-8 h-8 text-green-500 mb-2" />
            <span className="font-medium text-gray-900">수익 관리</span>
            <span className="text-sm text-gray-500">정산 및 출금</span>
          </Link>
          <Link
            href="/mypage/helper/reviews"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col items-center text-center"
          >
            <Star className="w-8 h-8 text-yellow-500 mb-2" />
            <span className="font-medium text-gray-900">리뷰 관리</span>
            <span className="text-sm text-gray-500">받은 리뷰 보기</span>
          </Link>
        </div>

        {/* 활동 안내 */}
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <h3 className="font-semibold text-orange-700 mb-2">심부름꾼 활동 가이드</h3>
          <ul className="space-y-2 text-sm text-orange-600">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>주변 심부름을 찾아 지원하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>요청자가 수락하면 심부름을 시작하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>심부름 완료 후 대금을 정산받으세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>좋은 리뷰를 받으면 등급이 올라갑니다</span>
            </li>
          </ul>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
