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

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 크레딧 조회
      const totalCredits = await getTotalCredits(user.id);

      const { data: creditData } = await supabase
        .from('advertising_credits')
        .select('*')
        .eq('seller_id', user.id)
        .single();

      // 활성 구독 조회
      const { data: subscriptions } = await supabase
        .from('advertising_subscriptions')
        .select(`
          *,
          service:services(id, title)
        `)
        .eq('seller_id', user.id)
        .eq('status', 'active');

      // 통계 계산
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

      // 내 서비스 목록 조회 (광고 미등록)
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
      console.error('대시보드 로딩 실패:', error);
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
      console.error('광고 시작 실패:', error);
      alert('광고 시작에 실패했습니다');
    }
  }

  if (loading) {
    return (
      <MypageLayoutWrapper mode="seller">
        <div className="container mx-auto p-6">
          <div className="text-center">로딩 중...</div>
        </div>
      </MypageLayoutWrapper>
    );
  }

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">광고 관리</h1>

      {/* 크레딧 정보 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">💰 광고 크레딧</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">현재 잔액</span>
            <span className="text-2xl font-bold text-blue-600">
              {dashboard?.credits?.total.toLocaleString()}원
            </span>
          </div>
          {dashboard?.credits?.promotional && dashboard.credits.promotional > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">프로모션 크레딧</span>
              <span className="text-gray-700">
                {dashboard.credits.promotional.toLocaleString()}원
                {dashboard.credits.expiresAt && (
                  <span className="ml-2 text-xs">
                    (만료: {new Date(dashboard.credits.expiresAt).toLocaleDateString()})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 활성 광고 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">📊 활성 광고</h2>
        {dashboard?.subscriptions && dashboard.subscriptions.length > 0 ? (
          <div className="space-y-4">
            {dashboard.subscriptions.map(sub => (
              <div key={sub.id} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{sub.serviceName}</h3>
                  <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                    활성
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">월 결제액:</span>
                    <span className="ml-2 font-medium">{sub.monthlyPrice.toLocaleString()}원</span>
                  </div>
                  <div>
                    <span className="text-gray-600">다음 결제:</span>
                    <span className="ml-2 font-medium">
                      {new Date(sub.nextBillingDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">노출:</span>
                    <span className="ml-2 font-medium">{sub.totalImpressions.toLocaleString()}회</span>
                  </div>
                  <div>
                    <span className="text-gray-600">클릭:</span>
                    <span className="ml-2 font-medium">
                      {sub.totalClicks.toLocaleString()}회 (CTR: {sub.ctr.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">활성 광고가 없습니다</p>
        )}
      </div>

      {/* 새 광고 시작 */}
      {services.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">✨ 새 서비스 광고 시작</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">서비스 선택</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">서비스를 선택하세요</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-bold mb-2">광고 플랜 정보</h3>
              <ul className="space-y-1 text-sm">
                <li>✓ 월 100,000원 정액제</li>
                <li>✓ 카테고리 1페이지 완전 랜덤 노출</li>
                <li>✓ 무제한 노출 및 클릭</li>
                <li>✓ 모든 광고 100% 공평한 기회</li>
              </ul>
              <p className="mt-3 text-xs text-gray-600">
                * 크레딧 잔액: {dashboard?.credits?.total.toLocaleString()}원
                {dashboard?.credits && dashboard.credits.total >= 100000 && (
                  <span className="ml-2 text-green-600 font-medium">
                    (즉시 광고 시작 가능)
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={handleStartAdvertising}
              disabled={!selectedService}
              className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              광고 시작하기
            </button>
          </div>
        </div>
      )}

      {/* 이번 달 통계 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">📈 이번 달 통계</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {dashboard?.stats?.totalImpressions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">총 노출</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {dashboard?.stats?.totalClicks.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">총 클릭</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {dashboard?.stats?.ctr.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">클릭률 (CTR)</div>
          </div>
        </div>
      </div>
      </div>
    </MypageLayoutWrapper>
  );
}
