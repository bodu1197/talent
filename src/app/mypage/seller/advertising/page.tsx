'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getTotalCredits, startAdvertisingSubscription } from '@/lib/advertising';
import type { AdvertisingDashboard } from '@/types/advertising';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';

export default function AdvertisingPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<AdvertisingDashboard | null>(null);
  const [services, setServices] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'credit' | 'card' | 'bank_transfer'>('credit');
  const [purchasing, setPurchasing] = useState(false);

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

    if (selectedPaymentMethod === 'credit' && (!dashboard || dashboard.credits.total < 100000)) {
      alert('크레딧이 부족합니다. 다른 결제 방식을 선택해주세요.');
      return;
    }

    if (selectedPaymentMethod === 'card') {
      alert('카드 결제 기능은 준비 중입니다. 크레딧 또는 무통장 입금을 이용해주세요.');
      return;
    }

    try {
      setPurchasing(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await startAdvertisingSubscription(user.id, selectedService, selectedPaymentMethod);

      if (selectedPaymentMethod === 'bank_transfer') {
        alert('무통장 입금 신청이 완료되었습니다.\n\n입금 계좌 정보가 알림으로 전송되었습니다.\n입금 후 관리자 확인까지 1-2일이 소요됩니다.');
      } else {
        alert('광고가 시작되었습니다!');
      }

      loadDashboard();
      setSelectedService('');
    } catch (error) {
      console.error('광고 시작 실패:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      alert('광고 시작에 실패했습니다');
    } finally {
      setPurchasing(false);
    }
  }

  const canPurchaseWithCredit = useMemo(() => {
    return dashboard && dashboard.credits.total >= 100000;
  }, [dashboard]);

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

          {/* 크레딧 잔액 카드 */}
          {dashboard && dashboard.credits.total > 0 && (
            <div className="bg-brand-primary rounded-2xl shadow-lg p-8 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-2">사용 가능한 크레딧</p>
                  <p className="text-4xl font-bold">
                    {dashboard.credits.total.toLocaleString()}원
                  </p>
                  {dashboard.credits.expiresAt && (
                    <p className="text-blue-100 text-sm mt-2">
                      만료일: {new Date(dashboard.credits.expiresAt).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                </div>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-coins text-4xl"></i>
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

          {/* 새 광고 시작하기 */}
          {services.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-rocket text-blue-600"></i>
                </div>
                새 광고 시작하기
              </h2>

              <div className="space-y-6">
                {/* Step 1: 서비스 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold mr-2">1</span>
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
                </div>

                {/* Step 2: 플랜 정보 */}
                {selectedService && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold mr-2">2</span>
                      광고 플랜
                    </label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">월정액 플랜</h3>
                          <p className="text-sm text-gray-600">카테고리 1페이지 완전 랜덤 노출</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-brand-primary">100,000원</div>
                          <div className="text-sm text-gray-600">/ 월</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
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
                )}

                {/* Step 3: 결제 방식 선택 */}
                {selectedService && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold mr-2">3</span>
                      결제 방식을 선택하세요
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 크레딧 */}
                      <div
                        onClick={() => canPurchaseWithCredit && setSelectedPaymentMethod('credit')}
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPaymentMethod === 'credit'
                            ? 'border-brand-primary bg-blue-50'
                            : canPurchaseWithCredit
                            ? 'border-gray-200 hover:border-gray-300'
                            : 'border-gray-200 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="credit"
                            checked={selectedPaymentMethod === 'credit'}
                            disabled={!canPurchaseWithCredit}
                            onChange={() => setSelectedPaymentMethod('credit')}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 mb-1">크레딧</div>
                            <div className="text-sm text-gray-600 mb-2">즉시 광고 시작</div>
                            {dashboard && (
                              <div className="text-xs">
                                <span className={canPurchaseWithCredit ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                  잔액: {dashboard.credits.total.toLocaleString()}원
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {!canPurchaseWithCredit && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                            <span className="text-sm text-red-600 font-medium">크레딧 부족</span>
                          </div>
                        )}
                      </div>

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
                )}

                {/* 구매 버튼 */}
                {selectedService && (
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
                )}
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
