'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { startAdvertisingSubscription } from '@/lib/advertising';
import type { AdvertisingDashboard } from '@/types/advertising';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import {
  Gift,
  CheckCircle,
  Megaphone,
  List,
  Tag,
  Rocket,
  Plus,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { logger } from '@/lib/logger';

type TabType = 'stats' | 'active' | 'services';

export default function AdvertisingPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<AdvertisingDashboard | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [services, setServices] = useState<
    Array<{
      id: string;
      title: string;
      thumbnailUrl: string | null;
      hasActiveAd: boolean;
      adDetails?: {
        subscriptionId: string;
        monthlyPrice: number;
        nextBillingDate: string;
        totalImpressions: number;
        totalClicks: number;
        ctr: number;
        createdAt: string;
        status: string;
        isFreePromotion: boolean;
        promotionEndDate: string | null;
      };
    }>
  >([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'bank_transfer'>(
    'bank_transfer'
  );
  const [purchasing, setPurchasing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 섹션 refs
  const statsRef = useRef<HTMLDivElement>(null);
  const activeAdsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  // 탭 변경 시 해당 섹션으로 스크롤
  const scrollToSection = useCallback((tab: TabType) => {
    setActiveTab(tab);
    const refMap = {
      stats: statsRef,
      active: activeAdsRef,
      services: servicesRef,
    };
    const targetRef = refMap[tab];
    if (targetRef.current) {
      const headerOffset = 120; // 탭 헤더 높이 + 여백
      const elementPosition = targetRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  // 할인율 계산: 1개월 20만원(공급가액) → 12개월 10만원(공급가액) (선형 할인)
  const calculateMonthlyPrice = (months: number): number => {
    const basePrice = 200000; // 1개월 기준 20만원 (공급가액)
    const finalPrice = 100000; // 12개월 시 10만원 (공급가액)
    const discountPerMonth = (basePrice - finalPrice) / 11; // 11단계로 할인
    const price = basePrice - discountPerMonth * (months - 1);
    // 100원 단위 제거 (1000원 단위로 반올림)
    return Math.round(price / 1000) * 1000;
  };

  const monthlySupplyPrice = useMemo(() => calculateMonthlyPrice(selectedMonths), [selectedMonths]); // 월 공급가액
  const totalSupplyPrice = useMemo(
    () => monthlySupplyPrice * selectedMonths,
    [monthlySupplyPrice, selectedMonths]
  ); // 총 공급가액
  const totalTaxAmount = useMemo(() => Math.round(totalSupplyPrice * 0.1), [totalSupplyPrice]); // 총 부가세 (10%)
  const totalPrice = useMemo(
    () => totalSupplyPrice + totalTaxAmount,
    [totalSupplyPrice, totalTaxAmount]
  ); // VAT 포함 총액
  const discountRate = useMemo(() => {
    if (selectedMonths === 1) return 0;
    const originalTotal = 200000 * selectedMonths;
    return Math.round(((originalTotal - totalSupplyPrice) / originalTotal) * 100);
  }, [selectedMonths, totalSupplyPrice]);

  useEffect(() => {
    loadDashboard();

    // Supabase Realtime 구독
    const supabase = createClient();
    const channel = supabase
      .channel('advertising-stats-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'advertising_subscriptions',
        },
        () => {
          // 변경된 데이터로 대시보드 새로고침
          loadDashboard();
        }
      )
      .subscribe();

    // 백업용 폴링 (5분마다) - Realtime 연결 실패 시 대비
    const interval = setInterval(() => {
      loadDashboard();
    }, 300000); // 5분

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        setSelectedService('');
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  async function loadDashboard(isManualRefresh = false) {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      }

      const response = await fetch('/api/seller/advertising/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard');
      }

      const data = await response.json();

      setDashboard({
        credits: {
          total: 0,
          promotional: 0,
          purchased: 0,
          expiresAt: null,
        },
        subscriptions: data.subscriptions || [],
        stats: data.stats || {
          totalImpressions: 0,
          totalClicks: 0,
          ctr: 0,
          averagePosition: 0,
        },
        recentActivity: [],
      });

      setServices(data.services || []);

      if (isManualRefresh) {
        toast.success('통계가 업데이트되었습니다');
      }
    } catch (error) {
      logger.error('대시보드 로딩 실패:', error);
      if (isManualRefresh) {
        toast.error('통계 업데이트에 실패했습니다');
      }
    } finally {
      setLoading(false);
      if (isManualRefresh) {
        setRefreshing(false);
      }
    }
  }

  async function handleStartAdvertising() {
    if (!selectedService) {
      toast.error('서비스를 선택해주세요');
      return;
    }

    if (selectedPaymentMethod === 'card') {
      toast.error('카드 결제 기능은 준비 중입니다. 무통장 입금을 이용해주세요.');
      return;
    }

    try {
      setPurchasing(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get seller ID from sellers table
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!seller) {
        toast.error('판매자 정보를 찾을 수 없습니다');
        return;
      }

      const result = await startAdvertisingSubscription(
        user.id,
        selectedService,
        selectedPaymentMethod,
        selectedMonths,
        totalSupplyPrice
      );

      if (selectedPaymentMethod === 'bank_transfer' && result.payment) {
        // 무통장 입금 페이지로 리다이렉트
        globalThis.location.href = `/mypage/seller/advertising/payments/${result.payment.id}`;
      } else {
        toast.success('광고가 시작되었습니다!');
        loadDashboard();
        setSelectedService('');
        setSelectedMonths(1);
      }
    } catch (error: unknown) {
      logger.error('광고 시작 실패:', error);
      const errorMessage = (() => {
        if (error instanceof Error) return error.message;
        if (typeof error === 'string') return error;
        return '광고 시작에 실패했습니다';
      })();
      toast.error(errorMessage);
      // 에러 후 데이터 새로고침하여 UI 동기화
      await loadDashboard();
      setIsModalOpen(false);
      setSelectedService('');
    } finally {
      setPurchasing(false);
    }
  }

  if (loading) {
    return (
      <MypageLayoutWrapper mode="seller">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </MypageLayoutWrapper>
    );
  }

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        {/* 헤더 섹션 */}
        <div className="mb-4 lg:mb-6">
          <h1 className="text-base lg:text-lg font-semibold text-gray-900">광고 관리</h1>
          <p className="text-gray-600 mt-1 text-sm">
            더 많은 고객에게 서비스를 노출하고 매출을 증대시키세요
          </p>
        </div>

        {/* 탭 네비게이션 - 서비스가 여러 개일 때만 표시 */}
        {(services.length > 1 ||
          (dashboard?.subscriptions && dashboard.subscriptions.length > 0)) && (
          <div className="sticky top-0 z-10 bg-gray-50 -mx-4 lg:-mx-6 px-4 lg:px-6 mb-4 lg:mb-6 border-b border-gray-200">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
              {dashboard?.subscriptions && dashboard.subscriptions.length > 0 && (
                <>
                  <button
                    onClick={() => scrollToSection('stats')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === 'stats'
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    성과 통계
                  </button>
                  <button
                    onClick={() => scrollToSection('active')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === 'active'
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Megaphone className="w-4 h-4" />
                    활성 광고
                    <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">
                      {dashboard.subscriptions.length}
                    </span>
                  </button>
                </>
              )}
              {services.length > 0 && (
                <button
                  onClick={() => scrollToSection('services')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === 'services'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                  서비스 관리
                  <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                    {services.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 무료 프로모션 알림 배너 */}
        {services.some((s) => s.adDetails?.isFreePromotion && s.adDetails?.promotionEndDate) && (
          <div className="mb-4 lg:mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 lg:p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm lg:text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  무료 광고 프로모션 진행 중입니다!
                  <Gift className="w-4 h-4 text-blue-500" />
                </h3>
                <p className="text-xs lg:text-sm text-blue-700 mb-3">
                  현재 {services.filter((s) => s.adDetails?.isFreePromotion).length}개의 서비스가
                  무료 광고 프로모션을 이용 중입니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 통계 카드 */}
        {dashboard?.subscriptions && dashboard.subscriptions.length > 0 && (
          <div ref={statsRef}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm lg:text-base font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                광고 성과 통계
              </h2>
              <button
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-1.5 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? '업데이트 중...' : '새로고침'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:gap-4 mb-4 lg:mb-6">
              <div className="bg-white rounded-lg shadow p-3 lg:p-4">
                <p className="text-xs text-gray-600">총 노출수</p>
                <p className="text-sm lg:text-lg font-semibold text-gray-900">
                  {dashboard.stats.totalImpressions.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 lg:p-4">
                <p className="text-xs text-gray-600">총 클릭수</p>
                <p className="text-sm lg:text-lg font-semibold text-gray-900">
                  {dashboard.stats.totalClicks.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 lg:p-4">
                <p className="text-xs text-gray-600">클릭률</p>
                <p className="text-sm lg:text-lg font-semibold text-gray-900">
                  {dashboard.stats.ctr.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 활성 광고 섹션 */}
        {dashboard?.subscriptions && dashboard.subscriptions.length > 0 && (
          <div ref={activeAdsRef} className="mb-4 lg:mb-6">
            <h2 className="text-sm lg:text-base font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <Megaphone className="w-4 h-4 text-green-600" />
              활성 광고
            </h2>
            <div className="space-y-2">
              {dashboard.subscriptions.map((sub) => (
                <div key={sub.id} className="bg-white rounded-lg shadow p-3 lg:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{sub.serviceName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      진행중
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">월 결제</div>
                      <div className="font-semibold">{sub.monthlyPrice.toLocaleString()}원</div>
                    </div>
                    <div>
                      <div className="text-gray-500">다음결제</div>
                      <div className="font-semibold">
                        {new Date(sub.nextBillingDate).toLocaleDateString('ko-KR', {
                          month: 'numeric',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">노출</div>
                      <div className="font-semibold text-blue-600">
                        {sub.totalImpressions.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">클릭</div>
                      <div className="font-semibold text-green-600">
                        {sub.totalClicks.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 서비스 광고 관리 */}
        {services.length > 0 && (
          <div ref={servicesRef}>
            <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <List className="w-4 h-4 text-blue-600" />
              서비스 광고 관리
            </h2>

            {/* 모바일: 카드 레이아웃 */}
            <div className="lg:hidden space-y-2">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-lg shadow p-3">
                  <div className="flex gap-3 mb-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <Image
                        src={service.thumbnailUrl || '/placeholder-service.png'}
                        alt={service.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {service.title}
                      </h3>
                      <div className="mt-1">
                        {(() => {
                          if (!service.hasActiveAd) {
                            return (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                미진행
                              </span>
                            );
                          }
                          if (service.adDetails?.status === 'pending_payment') {
                            return (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                결제 대기중
                              </span>
                            );
                          }
                          return (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              광고 진행중
                            </span>
                          );
                        })()}
                        {service.adDetails?.isFreePromotion &&
                          service.adDetails?.promotionEndDate && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-1">
                              <Gift className="w-3 h-3 mr-1" />
                              무료
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  {service.hasActiveAd && service.adDetails && (
                    <div className="grid grid-cols-3 gap-2 text-center mb-3 py-2 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-500">노출</div>
                        <div className="text-sm font-semibold text-blue-600">
                          {service.adDetails.totalImpressions.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">클릭</div>
                        <div className="text-sm font-semibold text-green-600">
                          {service.adDetails.totalClicks.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">CTR</div>
                        <div className="text-sm font-semibold text-purple-600">
                          {service.adDetails.ctr.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    {(() => {
                      if (!service.hasActiveAd) {
                        return (
                          <button
                            onClick={() => {
                              globalThis.location.href = '/mypage/seller/advertising/bank-transfer';
                            }}
                            className="w-full px-3 py-2 bg-brand-primary text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            광고 신청
                          </button>
                        );
                      }
                      if (service.adDetails?.status === 'pending_payment') {
                        return (
                          <button
                            onClick={() => {
                              setSelectedService(service.id);
                              setIsModalOpen(true);
                            }}
                            className="w-full px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            입금 확인
                          </button>
                        );
                      }
                      return (
                        <button
                          onClick={() => {
                            setSelectedService(service.id);
                            setIsModalOpen(true);
                          }}
                          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          상세보기
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>

            {/* PC: 테이블 레이아웃 */}
            <div className="hidden lg:block bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">서비스</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">상태</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">노출 수</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">클릭 수</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">클릭률</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr
                      key={service.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                            <Image
                              src={service.thumbnailUrl || '/placeholder-service.png'}
                              alt={service.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                              loading="lazy"
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                            {service.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {(() => {
                            if (!service.hasActiveAd) {
                              return (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  미진행
                                </span>
                              );
                            }
                            if (service.adDetails?.status === 'pending_payment') {
                              return (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                                  결제 대기중
                                </span>
                              );
                            }
                            return (
                              <>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                  광고 진행중
                                </span>
                                {service.adDetails?.isFreePromotion &&
                                  service.adDetails?.promotionEndDate && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                      <Gift className="w-3 h-3 mr-1" />
                                      무료 프로모션
                                    </span>
                                  )}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-blue-600">
                        {service.adDetails?.totalImpressions.toLocaleString() || '-'}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-green-600">
                        {service.adDetails?.totalClicks.toLocaleString() || '-'}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-purple-600">
                        {service.adDetails ? `${service.adDetails.ctr.toFixed(2)}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {(() => {
                          if (!service.hasActiveAd) {
                            return (
                              <button
                                onClick={() => {
                                  globalThis.location.href =
                                    '/mypage/seller/advertising/bank-transfer';
                                }}
                                className="px-4 py-2 bg-brand-primary text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                광고 신청
                              </button>
                            );
                          }
                          if (service.adDetails?.status === 'pending_payment') {
                            return (
                              <button
                                onClick={() => {
                                  setSelectedService(service.id);
                                  setIsModalOpen(true);
                                }}
                                className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                              >
                                입금 확인
                              </button>
                            );
                          }
                          return (
                            <button
                              onClick={() => {
                                setSelectedService(service.id);
                                setIsModalOpen(true);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              상세보기
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 모달 팝업 */}
        {isModalOpen && selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black bg-opacity-50 cursor-default"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedService('');
              }}
              aria-label="모달 닫기"
            />
            <dialog
              open
              className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              aria-labelledby="advertising-modal-title"
            >
              {/* 모달 헤더 */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-3 lg:p-4 flex justify-between items-center rounded-t-lg">
                <h2
                  id="advertising-modal-title"
                  className="text-sm lg:text-base font-semibold text-gray-900"
                >
                  {services.find((s) => s.id === selectedService)?.hasActiveAd
                    ? '광고 상세 정보'
                    : '광고 신청'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedService('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="p-3 lg:p-4">
                {(() => {
                  const service = services.find((s) => s.id === selectedService);
                  if (!service) return null;

                  // 광고 진행 중인 경우
                  if (service.hasActiveAd && service.adDetails) {
                    return (
                      <div>
                        <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">
                          {service.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
                          <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">월 결제액</div>
                            <div className="text-base lg:text-lg font-semibold text-gray-900">
                              {service.adDetails.monthlyPrice.toLocaleString()}원
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">다음 결제일</div>
                            <div className="text-sm lg:text-base font-semibold text-gray-900">
                              {new Date(service.adDetails.nextBillingDate).toLocaleDateString(
                                'ko-KR'
                              )}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">광고 시작일</div>
                            <div className="text-sm lg:text-base font-semibold text-gray-900">
                              {new Date(service.adDetails.createdAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">총 노출 수</div>
                            <div className="text-base lg:text-lg font-semibold text-blue-600">
                              {service.adDetails.totalImpressions.toLocaleString()}회
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">총 클릭 수</div>
                            <div className="text-base lg:text-lg font-semibold text-green-600">
                              {service.adDetails.totalClicks.toLocaleString()}회
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">클릭률 (CTR)</div>
                            <div className="text-base lg:text-lg font-semibold text-purple-600">
                              {service.adDetails.ctr.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 광고 신청 폼
                  return (
                    <div>
                      <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">
                        {service.title}
                      </h3>

                      <div className="space-y-4 lg:space-y-6">
                        {/* 계약 기간 선택 */}
                        <div>
                          <label
                            htmlFor="contract-period"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-semibold mr-2">
                              1
                            </span>{' '}
                            계약 기간을 선택하세요
                          </label>
                          <select
                            id="contract-period"
                            value={selectedMonths}
                            onChange={(e) => setSelectedMonths(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all mb-4"
                          >
                            {[1, 3, 6, 12].map((months) => {
                              const price = calculateMonthlyPrice(months);
                              const supplyTotal = price * months;
                              const taxTotal = Math.round(supplyTotal * 0.1);
                              const total = supplyTotal + taxTotal;
                              const discount =
                                months === 1
                                  ? 0
                                  : Math.round(
                                      ((200000 * months - supplyTotal) / (200000 * months)) * 100
                                    );
                              return (
                                <option key={months} value={months}>
                                  {months}개월 - 월 {price.toLocaleString()}원 (총{' '}
                                  {total.toLocaleString()}원, VAT포함)
                                  {discount > 0 && ` - ${discount}% 할인`}
                                </option>
                              );
                            })}
                          </select>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Gift className="w-4 h-4 text-brand-primary" />
                              <span className="text-brand-primary font-semibold text-xs lg:text-sm">
                                첫 광고 50% 할인
                              </span>
                            </div>
                            <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-1">
                              광고 플랜
                            </h3>
                            <p className="text-xs lg:text-sm text-gray-600">
                              카테고리 1페이지 완전 랜덤 노출
                            </p>
                          </div>
                          <div className="text-right mt-3">
                            <div className="text-xl lg:text-2xl font-semibold text-brand-primary">
                              {monthlySupplyPrice.toLocaleString()}원
                            </div>
                            <div className="text-xs lg:text-sm text-gray-600">/ 월 (VAT 별도)</div>
                          </div>
                        </div>

                        {/* VAT 정보 */}
                        <div className="p-3 lg:p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="text-xs lg:text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">공급가액 ({selectedMonths}개월)</span>
                              <span className="font-semibold text-gray-900">
                                {totalSupplyPrice.toLocaleString()}원
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">부가세 (10%)</span>
                              <span className="font-semibold text-gray-900">
                                {totalTaxAmount.toLocaleString()}원
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                              <span className="font-semibold text-gray-900">총 결제금액</span>
                              <span className="font-semibold text-brand-primary text-sm lg:text-base">
                                {totalPrice.toLocaleString()}원
                              </span>
                            </div>
                          </div>
                        </div>

                        {discountRate > 0 && (
                          <div className="p-3 lg:p-4 bg-green-100 border border-green-300 rounded-lg">
                            <div className="flex items-center gap-2 text-green-800">
                              <Tag className="w-4 h-4" />
                              <span className="font-semibold">{discountRate}% 할인 적용!</span>
                            </div>
                            <div className="text-sm text-green-700 mt-1">
                              {selectedMonths}개월 계약 시 공급가액{' '}
                              {totalSupplyPrice.toLocaleString()}원
                              <span className="ml-2 line-through text-green-600">
                                {(200000 * selectedMonths).toLocaleString()}원
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 lg:gap-4 text-xs lg:text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>무제한 노출</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>무제한 클릭</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>실시간 통계</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>공정한 랜덤 노출</span>
                          </div>
                        </div>

                        {/* 결제 방식 선택 */}
                        <div>
                          <label
                            htmlFor="payment-method"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-semibold mr-2">
                              2
                            </span>{' '}
                            결제 방식을 선택하세요
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                            {/* 카드 (준비중) */}
                            <div className="relative border-2 border-gray-200 rounded-lg p-3 lg:p-4 opacity-50 cursor-not-allowed">
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="card"
                                  disabled
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 mb-1">카드 결제</div>
                                  <div className="text-sm text-gray-600">즉시 광고 시작</div>
                                  <div className="text-xs text-orange-600 font-medium mt-1">
                                    준비 중
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 무통장 입금 */}
                            <button
                              type="button"
                              onClick={() => setSelectedPaymentMethod('bank_transfer')}
                              className={`border-2 rounded-lg p-3 lg:p-4 cursor-pointer transition-all text-left w-full ${
                                selectedPaymentMethod === 'bank_transfer'
                                  ? 'border-brand-primary bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="bank_transfer"
                                  checked={selectedPaymentMethod === 'bank_transfer'}
                                  onChange={() => setSelectedPaymentMethod('bank_transfer')}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 mb-1">
                                    무통장 입금
                                  </div>
                                  <div className="text-sm text-gray-600">승인 후 광고 시작</div>
                                  <div className="text-xs text-gray-500 mt-1">1-2일 소요</div>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* 구매 버튼 */}
                        <div className="pt-4">
                          <button
                            onClick={handleStartAdvertising}
                            disabled={purchasing}
                            className="w-full bg-brand-primary text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none text-lg"
                          >
                            {purchasing ? (
                              <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                처리 중...
                              </span>
                            ) : (
                              <>
                                <Rocket className="w-5 h-5 inline mr-2" />
                                광고 시작하기
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </dialog>
          </div>
        )}

        {/* 서비스 없음 */}
        {services.length === 0 &&
          (!dashboard?.subscriptions || dashboard.subscriptions.length === 0) && (
            <div className="bg-white rounded-lg shadow p-3 lg:p-4 text-center">
              <Megaphone className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mb-3 lg:mb-4 mx-auto" />
              <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2">
                광고할 서비스가 없습니다
              </h3>
              <p className="text-xs lg:text-sm text-gray-600 mb-4 lg:mb-6">
                먼저 서비스를 등록해주세요
              </p>
              <a
                href="/mypage/seller/services/new"
                className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-3 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-xs lg:text-sm font-medium"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                서비스 등록하기
              </a>
            </div>
          )}
      </div>
    </MypageLayoutWrapper>
  );
}
