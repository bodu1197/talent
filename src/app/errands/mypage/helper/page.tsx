'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Bike,
  MapPin,
  Wallet,
  Star,
  Clock,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  CreditCard,
  CheckCircle,
  FileText,
  ExternalLink,
  Shield,
} from 'lucide-react';
import HelperLocationTracker from '@/components/errands/HelperLocationTracker';
import HelperGuideSection from '@/components/errands/HelperGuideSection';

interface HelperProfile {
  id: string;
  grade: string;
  average_rating: number;
  total_completed: number;
  total_reviews: number;
  is_active: boolean;
  subscription_status: string;
  subscription_expires_at: string | null;
}

interface HelperStats {
  availableBalance: number;
  totalWithdrawn: number;
  totalEarned: number;
  activeJobs: number;
  pendingApplications: number;
}

export default function ErrandHelperDashboard() {
  const { user } = useAuth();
  const [helperProfile, setHelperProfile] = useState<HelperProfile | null>(null);
  const [stats, setStats] = useState<HelperStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHelperData();
    }
  }, [user]);

  async function loadHelperData() {
    try {
      setLoading(true);
      const response = await fetch('/api/helper');
      if (response.ok) {
        const data = await response.json();
        setHelperProfile(data.helperProfile);
        setStats(
          data.stats || {
            availableBalance: 0,
            totalWithdrawn: 0,
            totalEarned: 0,
            activeJobs: 0,
            pendingApplications: 0,
          }
        );
      }
    } catch (error) {
      console.error('헬퍼 데이터 로드 실패:', error);
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
      NEWBIE: 'bg-green-100 text-green-700',
      BRONZE: 'bg-amber-100 text-amber-700',
      SILVER: 'bg-gray-200 text-gray-700',
      GOLD: 'bg-yellow-100 text-yellow-700',
      PLATINUM: 'bg-purple-100 text-purple-700',
      DIAMOND: 'bg-cyan-100 text-cyan-700',
    };
    return colorMap[grade] || 'bg-gray-100 text-gray-700';
  };

  const getSubscriptionLabel = (status: string) => {
    switch (status) {
      case 'active':
        return { text: '구독 중', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'trial':
        return { text: '무료 체험', color: 'bg-blue-100 text-blue-700', icon: Clock };
      case 'expired':
        return { text: '만료됨', color: 'bg-red-100 text-red-700', icon: AlertCircle };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <ErrandMypageLayout mode="helper">
        <div className="p-4 lg:p-0 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        </div>
      </ErrandMypageLayout>
    );
  }

  // 헬퍼 등록이 안 된 경우
  if (!helperProfile) {
    return (
      <ErrandMypageLayout mode="helper">
        <div className="p-4 lg:p-0 space-y-4">
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <Bike className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">라이더로 등록하세요!</h2>
            <p className="text-gray-600 mb-6">심부름을 수행하고 수익을 올려보세요.</p>
            <Link
              href="/errands/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              라이더 등록하기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 제출 서류 안내 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-700" />
              <h3 className="font-bold text-gray-900">제출 서류 안내</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>신분증 사본 (주민등록증, 운전면허증, 여권 중 1개)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>본인 얼굴 사진 (셀카)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>범죄경력회보서 (정부24에서 무료 발급)</span>
              </li>
            </ul>

            {/* 범죄경력회보서 상세 안내 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-red-500" />
                <p className="text-sm font-semibold text-gray-900">범죄경력회보서 제출 안내</p>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                2025년 1월 17일부터 시행된 생활물류서비스산업발전법에 따라 범죄경력회보서 제출이
                의무화되었습니다.
              </p>

              <div className="bg-red-50 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-red-800 mb-1">취업 제한 사유</p>
                <ul className="text-xs text-red-700 space-y-0.5">
                  <li>• 살인·성범죄: 20년 취업 제한</li>
                  <li>• 절도 상습범: 18년 취업 제한</li>
                  <li>• 마약류 범죄: 2~10년 취업 제한</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-800 mb-2">발급 방법</p>
                <ol className="text-xs text-blue-700 space-y-0.5 mb-2">
                  <li>1. 정부24 접속</li>
                  <li>2. &quot;범죄경력회보서&quot; 검색</li>
                  <li>3. &quot;취업용&quot; 선택</li>
                  <li>4. 성범죄경력 조회 포함 체크</li>
                  <li>5. 무료 발급 완료</li>
                </ol>
                <a
                  href="https://www.gov.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline"
                >
                  정부24 바로가기
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </ErrandMypageLayout>
    );
  }

  const isSubscriptionExpired =
    helperProfile.subscription_status === 'expired' ||
    helperProfile.subscription_status === 'cancelled';

  const subscriptionInfo = getSubscriptionLabel(helperProfile.subscription_status);

  return (
    <ErrandMypageLayout mode="helper">
      <div className="p-4 lg:p-0">
        {/* 구독 만료 경고 */}
        {isSubscriptionExpired && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">구독이 만료되었습니다</p>
              <p className="text-red-600 text-sm">심부름 지원을 계속하려면 구독을 갱신해주세요.</p>
            </div>
            <Link
              href="/errands/mypage/helper/subscription"
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium whitespace-nowrap"
            >
              구독 갱신
            </Link>
          </div>
        )}

        {/* 프로필 카드 */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Bike className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-gray-900">라이더</h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(helperProfile.grade)}`}
                  >
                    {getGradeLabel(helperProfile.grade)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{helperProfile.average_rating.toFixed(1)}</span>
                    <span className="text-gray-400">({helperProfile.total_reviews})</span>
                  </div>
                  <div>완료 {helperProfile.total_completed}건</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${subscriptionInfo.color}`}
              >
                <subscriptionInfo.icon className="w-3 h-3" />
                {subscriptionInfo.text}
              </div>
              {helperProfile.subscription_expires_at && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(helperProfile.subscription_expires_at).toLocaleDateString('ko-KR')} 까지
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 위치 추적 / 활동 상태 */}
        <HelperLocationTracker
          isActiveHelper={!isSubscriptionExpired && helperProfile.is_active}
          className="mb-4"
        />

        {/* 수익 요약 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-xs">출금 가능</span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {(stats?.availableBalance || 0).toLocaleString()}원
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">누적 수익</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {(stats?.totalEarned || 0).toLocaleString()}원
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs">출금 완료</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {(stats?.totalWithdrawn || 0).toLocaleString()}원
            </p>
          </div>
        </div>

        {/* 퀵 메뉴 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href="/errands/mypage/helper/available"
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">심부름 찾기</p>
              <p className="text-xs text-gray-500">주변 심부름 보기</p>
            </div>
          </Link>
          <Link
            href="/errands/mypage/helper/jobs"
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">내 작업</p>
              <p className="text-xs text-gray-500">진행중 {stats?.activeJobs || 0}건</p>
            </div>
          </Link>
          <Link
            href="/errands/mypage/helper/earnings"
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">수익 관리</p>
              <p className="text-xs text-gray-500">정산 및 출금</p>
            </div>
          </Link>
          <Link
            href="/errands/mypage/helper/reviews"
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">리뷰</p>
              <p className="text-xs text-gray-500">{helperProfile.total_reviews}개 리뷰</p>
            </div>
          </Link>
        </div>

        {/* 활동 가이드 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <HelperGuideSection />
        </div>
      </div>
    </ErrandMypageLayout>
  );
}
