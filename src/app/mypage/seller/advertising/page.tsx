'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { startAdvertisingSubscription } from '@/lib/advertising';
import type { AdvertisingDashboard } from '@/types/advertising';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';

export default function AdvertisingPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<AdvertisingDashboard | null>(null);
  const [services, setServices] = useState<Array<{
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
  }>>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'bank_transfer'>('bank_transfer');
  const [purchasing, setPurchasing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 할인율 계산: 1개월 20만원(공급가액) → 12개월 10만원(공급가액) (선형 할인)
  const calculateMonthlyPrice = (months: number): number => {
    const basePrice = 200000; // 1개월 기준 20만원 (공급가액)
    const finalPrice = 100000; // 12개월 시 10만원 (공급가액)
    const discountPerMonth = (basePrice - finalPrice) / 11; // 11단계로 할인
    const price = basePrice - (discountPerMonth * (months - 1));
    // 100원 단위 제거 (1000원 단위로 반올림)
    return Math.round(price / 1000) * 1000;
  };

  const monthlySupplyPrice = useMemo(() => calculateMonthlyPrice(selectedMonths), [selectedMonths]); // 월 공급가액
  const totalSupplyPrice = useMemo(() => monthlySupplyPrice * selectedMonths, [monthlySupplyPrice, selectedMonths]); // 총 공급가액
  const totalTaxAmount = useMemo(() => Math.round(totalSupplyPrice * 0.1), [totalSupplyPrice]); // 총 부가세 (10%)
  const totalPrice = useMemo(() => totalSupplyPrice + totalTaxAmount, [totalSupplyPrice, totalTaxAmount]); // VAT 포함 총액
  const discountRate = useMemo(() => {
    if (selectedMonths === 1) return 0;
    const originalTotal = 200000 * selectedMonths;
    return Math.round(((originalTotal - totalSupplyPrice) / originalTotal) * 100);
  }, [selectedMonths, totalSupplyPrice]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
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
          expiresAt: null
        },
        subscriptions: data.subscriptions || [],
        stats: data.stats || {
          totalImpressions: 0,
          totalClicks: 0,
          ctr: 0,
          averagePosition: 0
        },
        recentActivity: []
      });

      setServices(data.services || []);

    } catch (error) {
      console.error('대시보드 로딩 실패:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } finally {
      setLoading(false);
    }
  }

  async function handleStartAdvertising() {
    if (!selectedService) {
      alert('서비스를 선택해주세요');
      return;
    }

    if (selectedPaymentMethod === 'card') {
      alert('카드 결제 기능은 준비 중입니다. 무통장 입금을 이용해주세요.');
      return;
    }

    try {
      setPurchasing(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get seller ID from sellers table
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!seller) {
        alert('판매자 정보를 찾을 수 없습니다');
        return;
      }

      const result = await startAdvertisingSubscription(user.id, selectedService, selectedPaymentMethod, selectedMonths, totalSupplyPrice);

      if (selectedPaymentMethod === 'bank_transfer' && result.payment) {
        // 무통장 입금 페이지로 리다이렉트
        window.location.href = `/mypage/seller/advertising/payments/${result.payment.id}`;
      } else {
        alert('광고가 시작되었습니다!');
        loadDashboard();
        setSelectedService('');
        setSelectedMonths(1);
      }
    } catch (error: unknown) {
      console.error('광고 시작 실패:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : '광고 시작에 실패했습니다');
      alert(errorMessage);
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
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* 헤더 섹션 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">광고 관리</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              더 많은 고객에게 서비스를 노출하고 매출을 증대시키세요
            </p>
          </div>

          {/* 무료 프로모션 알림 배너 */}
          {services.some(s => s.adDetails?.isFreePromotion && s.adDetails?.promotionEndDate) && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-gift text-white text-xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">
                    무료 광고 프로모션 진행 중입니다! 🎉
                  </h3>
                  <p className="text-blue-700 mb-3">
                    현재 {services.filter(s => s.adDetails?.isFreePromotion).length}개의 서비스가 무료 광고 프로모션을 이용 중입니다.
                    프로모션 기간 동안 광고 비용 없이 서비스를 홍보하세요!
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {services
                      .filter(s => s.adDetails?.isFreePromotion && s.adDetails?.promotionEndDate)
                      .map(service => {
                        const endDate = new Date(service.adDetails!.promotionEndDate!);
                        const today = new Date();
                        const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <div key={service.id} className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-200">
                            <i className="fas fa-check-circle text-green-500"></i>
                            <span className="font-medium text-gray-900">{service.title}</span>
                            <span className="text-sm text-blue-600 font-semibold">
                              ({daysLeft > 0 ? `${daysLeft}일 남음` : '종료'})
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 통계 카드 */}
          {dashboard?.subscriptions && dashboard.subscriptions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">총 노출수</span>
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <i className="fas fa-eye text-blue-600"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {dashboard.stats.totalImpressions.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">이번 달 기준</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">총 클릭수</span>
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <i className="fas fa-mouse-pointer text-green-600"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {dashboard.stats.totalClicks.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">이번 달 기준</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">클릭률</span>
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-purple-600"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {dashboard.stats.ctr.toFixed(2)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">CTR (Click Through Rate)</p>
              </div>
            </div>
          )}

          {/* 활성 광고 섹션 */}
          {dashboard?.subscriptions && dashboard.subscriptions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-bullhorn text-green-600"></i>
                </div>
                활성 광고
              </h2>
              <div className="space-y-4">
                {dashboard.subscriptions.map(sub => (
                  <div key={sub.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{sub.serviceName}</h3>
                        <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                          광고 진행중
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 mb-1">월 결제액</div>
                        <div className="font-bold text-gray-900">{sub.monthlyPrice.toLocaleString()}원</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">다음 결제일</div>
                        <div className="font-bold text-gray-900">
                          {new Date(sub.nextBillingDate).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">노출수</div>
                        <div className="font-bold text-blue-600">{sub.totalImpressions.toLocaleString()}회</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">클릭수</div>
                        <div className="font-bold text-green-600">
                          {sub.totalClicks.toLocaleString()}회 ({sub.ctr.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 서비스 광고 관리 테이블 */}
          {services.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-list text-blue-600"></i>
                </div>
                서비스 광고 관리
              </h2>

              {/* 테이블 */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">서비스</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">상태</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">노출 수</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">클릭 수</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">평균 클릭률</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">신청 정보</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(service => (
                      <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        {/* 서비스 썸네일 + 제목 (툴팁) */}
                        <td className="py-3 px-4">
                          <div className="group relative">
                            <img
                              src={service.thumbnailUrl || '/placeholder-service.png'}
                              alt={service.title}
                              className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                            />
                            {/* 툴팁 */}
                            <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-10 bg-gray-900 text-white text-sm py-1 px-3 rounded shadow-lg whitespace-nowrap">
                              {service.title}
                            </div>
                          </div>
                        </td>

                        {/* 상태 */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {service.hasActiveAd ? (
                              service.adDetails?.status === 'pending_payment' ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                                  결제 대기중
                                </span>
                              ) : (
                                <>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    광고 진행중
                                  </span>
                                  {service.adDetails?.isFreePromotion && service.adDetails?.promotionEndDate && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                      <i className="fas fa-gift mr-1 text-xs"></i>
                                      무료 프로모션 ({(() => {
                                        const endDate = new Date(service.adDetails.promotionEndDate);
                                        const today = new Date();
                                        const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                        return daysLeft > 0 ? `${daysLeft}일 남음` : '종료';
                                      })()})
                                    </span>
                                  )}
                                </>
                              )
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                미진행
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 노출 수 */}
                        <td className="py-3 px-4 text-center font-semibold text-blue-600">
                          {service.adDetails?.totalImpressions.toLocaleString() || '-'}
                        </td>

                        {/* 클릭 수 */}
                        <td className="py-3 px-4 text-center font-semibold text-green-600">
                          {service.adDetails?.totalClicks.toLocaleString() || '-'}
                        </td>

                        {/* 평균 클릭률 */}
                        <td className="py-3 px-4 text-center font-semibold text-purple-600">
                          {service.adDetails ? `${service.adDetails.ctr.toFixed(2)}%` : '-'}
                        </td>

                        {/* 신청 정보 */}
                        <td className="py-3 px-4 text-center">
                          {service.hasActiveAd ? (
                            service.adDetails?.status === 'pending_payment' ? (
                              <button
                                onClick={() => {
                                  // console.log('입금 확인 클릭:', service.id);
                                  setSelectedService(service.id);
                                  setIsModalOpen(true);
                                }}
                                className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                              >
                                입금 확인
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  // console.log('상세보기 클릭:', service.id);
                                  setSelectedService(service.id);
                                  setIsModalOpen(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                상세보기
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => {
                                window.location.href = '/mypage/seller/advertising/bank-transfer';
                              }}
                              className="px-4 py-2 bg-brand-primary text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              광고 신청
                            </button>
                          )}
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
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedService('');
              }}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 모달 헤더 */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center rounded-t-2xl">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {services.find(s => s.id === selectedService)?.hasActiveAd ? '광고 상세 정보' : '광고 신청'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedService('');
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 모달 내용 */}
                <div className="p-8">
                  {(() => {
                    const service = services.find(s => s.id === selectedService);
                    if (!service) return null;

                    // 광고 진행 중인 경우
                    if (service.hasActiveAd && service.adDetails) {
                      return (
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">월 결제액</div>
                              <div className="text-2xl font-bold text-gray-900">{service.adDetails.monthlyPrice.toLocaleString()}원</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">다음 결제일</div>
                              <div className="text-lg font-bold text-gray-900">
                                {new Date(service.adDetails.nextBillingDate).toLocaleDateString('ko-KR')}
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">광고 시작일</div>
                              <div className="text-lg font-bold text-gray-900">
                                {new Date(service.adDetails.createdAt).toLocaleDateString('ko-KR')}
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">총 노출 수</div>
                              <div className="text-2xl font-bold text-blue-600">{service.adDetails.totalImpressions.toLocaleString()}회</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">총 클릭 수</div>
                              <div className="text-2xl font-bold text-green-600">{service.adDetails.totalClicks.toLocaleString()}회</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">클릭률 (CTR)</div>
                              <div className="text-2xl font-bold text-purple-600">{service.adDetails.ctr.toFixed(2)}%</div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // 광고 신청 폼
                    return (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>

                        <div className="space-y-6">
                          {/* 계약 기간 선택 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold mr-2">1</span>
                              계약 기간을 선택하세요
                            </label>
                    <select
                      value={selectedMonths}
                      onChange={(e) => setSelectedMonths(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all mb-4"
                    >
                      {[1, 3, 6, 12].map(months => {
                        const price = calculateMonthlyPrice(months);
                        const supplyTotal = price * months;
                        const taxTotal = Math.round(supplyTotal * 0.1);
                        const total = supplyTotal + taxTotal;
                        const discount = months === 1 ? 0 : Math.round(((200000 * months - supplyTotal) / (200000 * months)) * 100);
                        return (
                          <option key={months} value={months}>
                            {months}개월 - 월 {price.toLocaleString()}원 (총 {total.toLocaleString()}원, VAT포함)
                            {discount > 0 && ` - ${discount}% 할인`}
                          </option>
                        );
                      })}
                    </select>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">광고 플랜</h3>
                          <p className="text-sm text-gray-600">카테고리 1페이지 완전 랜덤 노출</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-brand-primary">{monthlySupplyPrice.toLocaleString()}원</div>
                          <div className="text-sm text-gray-600">/ 월 (VAT 별도)</div>
                        </div>
                      </div>

                      {/* VAT 정보 */}
                      <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">공급가액 ({selectedMonths}개월)</span>
                            <span className="font-bold text-gray-900">{totalSupplyPrice.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">부가세 (10%)</span>
                            <span className="font-bold text-gray-900">{totalTaxAmount.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="font-bold text-gray-900">총 결제금액</span>
                            <span className="font-bold text-brand-primary text-lg">{totalPrice.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>

                      {discountRate > 0 && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800">
                            <i className="fas fa-tag"></i>
                            <span className="font-bold">{discountRate}% 할인 적용!</span>
                          </div>
                          <div className="text-sm text-green-700 mt-1">
                            {selectedMonths}개월 계약 시 공급가액 {totalSupplyPrice.toLocaleString()}원
                            <span className="ml-2 line-through text-green-600">{(200000 * selectedMonths).toLocaleString()}원</span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-green-600"></i>
                          <span>무제한 노출</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-green-600"></i>
                          <span>무제한 클릭</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-green-600"></i>
                          <span>실시간 통계</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-green-600"></i>
                          <span>공정한 랜덤 노출</span>
                        </div>
                      </div>
                            </div>
                          </div>

                          {/* 결제 방식 선택 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold mr-2">2</span>
                              결제 방식을 선택하세요
                            </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 카드 (준비중) */}
                      <div className="relative border-2 border-gray-200 rounded-lg p-4 opacity-50 cursor-not-allowed">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            disabled
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 mb-1">카드 결제</div>
                            <div className="text-sm text-gray-600">즉시 광고 시작</div>
                            <div className="text-xs text-orange-600 font-medium mt-1">준비 중</div>
                          </div>
                        </div>
                      </div>

                      {/* 무통장 입금 */}
                      <div
                        onClick={() => setSelectedPaymentMethod('bank_transfer')}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
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
                            <div className="font-bold text-gray-900 mb-1">무통장 입금</div>
                            <div className="text-sm text-gray-600">승인 후 광고 시작</div>
                            <div className="text-xs text-gray-500 mt-1">1-2일 소요</div>
                          </div>
                        </div>
                      </div>
                            </div>
                          </div>

                          {/* 구매 버튼 */}
                          <div className="pt-4">
                            <button
                              onClick={handleStartAdvertising}
                              disabled={purchasing}
                              className="w-full bg-brand-primary text-white py-4 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none text-lg"
                            >
                              {purchasing ? (
                                <span className="flex items-center justify-center gap-2">
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  처리 중...
                                </span>
                              ) : (
                                <>
                                  <i className="fas fa-rocket mr-2"></i>
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
              </div>
            </div>
          )}

          {/* 서비스 없음 */}
          {services.length === 0 && (!dashboard?.subscriptions || dashboard.subscriptions.length === 0) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <i className="fas fa-bullhorn text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-xl font-bold text-gray-900 mb-2">광고할 서비스가 없습니다</h3>
              <p className="text-gray-600 mb-6">먼저 서비스를 등록해주세요</p>
              <a
                href="/mypage/seller/services/new"
                className="inline-flex items-center px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <i className="fas fa-plus mr-2"></i>
                서비스 등록하기
              </a>
            </div>
          )}

        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
