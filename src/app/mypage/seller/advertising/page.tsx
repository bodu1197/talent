'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getTotalCredits, startAdvertisingSubscription } from '@/lib/advertising';
import type { AdvertisingDashboard } from '@/types/advertising';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';

export default function AdvertisingPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<AdvertisingDashboard | null>(null);
  const [services, setServices] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState(6);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const totalCredits = await getTotalCredits(user.id);

      const { data: creditData } = await supabase
        .from('advertising_credits')
        .select('*')
        .eq('seller_id', user.id)
        .single();

      const { data: subscriptions } = await supabase
        .from('advertising_subscriptions')
        .select(`
          *,
          service:services(id, title)
        `)
        .eq('seller_id', user.id)
        .eq('status', 'active');

      const totalImpressions = subscriptions?.reduce((sum, s) => sum + s.total_impressions, 0) || 0;
      const totalClicks = subscriptions?.reduce((sum, s) => sum + s.total_clicks, 0) || 0;
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      setDashboard({
        credits: {
          total: totalCredits,
          promotional: creditData?.promotion_type ? creditData.amount : 0,
          purchased: 0,
          expiresAt: creditData?.expires_at || null
        },
        subscriptions: subscriptions?.map(s => ({
          id: s.id,
          serviceId: s.service_id,
          serviceName: s.service?.title || '',
          status: s.status,
          nextBillingDate: s.next_billing_date,
          monthlyPrice: s.monthly_price,
          totalImpressions: s.total_impressions,
          totalClicks: s.total_clicks,
          ctr: s.total_impressions > 0 ? (s.total_clicks / s.total_impressions) * 100 : 0
        })) || [],
        stats: {
          totalImpressions,
          totalClicks,
          ctr,
          averagePosition: 0
        },
        recentActivity: []
      });

      const { data: myServices } = await supabase
        .from('services')
        .select('id, title')
        .eq('seller_id', user.id)
        .eq('status', 'active')
        .is('deleted_at', null);

      const advertisedServiceIds = new Set(subscriptions?.map(s => s.service_id) || []);
      const availableServices = myServices?.filter(s => !advertisedServiceIds.has(s.id)) || [];
      setServices(availableServices);

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

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await startAdvertisingSubscription(user.id, selectedService);
      alert('광고가 시작되었습니다!');
      loadDashboard();
    } catch (error) {
      console.error('광고 시작 실패:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      alert('광고 시작에 실패했습니다');
    }
  }

  const plans = [
    { months: 1, price: 150000, monthlyPrice: 150000, savings: 0 },
    { months: 3, price: 420000, monthlyPrice: 140000, savings: 30000 },
    { months: 6, price: 600000, monthlyPrice: 100000, savings: 300000 }
  ];

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
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* 헤더 섹션 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">광고 관리</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              더 많은 고객에게 서비스를 노출하고 매출을 증대시키세요
            </p>
          </div>

          {/* 통계 카드 - 상단 배치 */}
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

          {/* 구독 플랜 섹션 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-brand-primary to-blue-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white mb-2">광고 구독 플랜</h2>
              <p className="text-blue-100">장기 구독 시 최대 33% 할인 혜택을 받으세요</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {plans.map((plan) => (
                  <div
                    key={plan.months}
                    onClick={() => setSelectedPlan(plan.months)}
                    className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 ${
                      selectedPlan === plan.months
                        ? 'border-brand-primary bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {plan.months === 6 && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md">
                          최대 할인
                        </span>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-gray-900 mb-3">
                        {plan.months}<span className="text-2xl text-gray-500">개월</span>
                      </div>

                      {plan.savings > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                          <span className="text-red-700 font-bold text-sm">
                            총 {plan.savings.toLocaleString()}원 절약
                          </span>
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">월</div>
                        <div className="text-3xl font-bold text-brand-primary">
                          {plan.monthlyPrice.toLocaleString()}
                          <span className="text-lg text-gray-500">원</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4 mb-4">
                        <div className="text-xs text-gray-500 mb-1">총 결제금액</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {plan.price.toLocaleString()}원
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`${plan.months}개월 플랜 구매 기능은 준비중입니다`);
                        }}
                        className={`w-full py-3 rounded-lg font-bold transition-colors ${
                          selectedPlan === plan.months
                            ? 'bg-brand-primary text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        선택하기
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 혜택 안내 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                    <i className="fas fa-gift text-white text-sm"></i>
                  </div>
                  광고 서비스 혜택
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">공정한 노출 기회</div>
                      <div className="text-sm text-gray-600">카테고리 1페이지 완전 랜덤 노출</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">무제한 노출</div>
                      <div className="text-sm text-gray-600">노출 횟수 및 클릭 제한 없음</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">투명한 통계</div>
                      <div className="text-sm text-gray-600">실시간 노출/클릭 데이터 제공</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">장기 할인</div>
                      <div className="text-sm text-gray-600">3개월 이상 구독 시 추가 할인</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

          {/* 광고할 서비스 선택 */}
          {services.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-rocket text-blue-600"></i>
                </div>
                새 광고 시작하기
              </h2>
              <div className="max-w-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  광고할 서비스를 선택하세요
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                >
                  <option value="">서비스를 선택하세요</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStartAdvertising}
                  disabled={!selectedService}
                  className="mt-4 w-full bg-brand-primary text-white py-4 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  광고 시작하기
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
