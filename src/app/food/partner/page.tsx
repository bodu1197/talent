'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  ClipboardList,
  UtensilsCrossed,
  BarChart3,
  Settings,
  Bell,
  Power,
  Clock,
  MapPin,
  Phone,
  Check,
  X,
  ChefHat,
  Bike,
  CheckCircle2,
} from 'lucide-react';
import {
  FoodStore,
  FoodOrder,
  FoodOrderStatus,
  FOOD_ORDER_STATUS_LABELS,
  FOOD_ORDER_STATUS_COLORS,
} from '@/types/food';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function FoodPartnerDashboard() {
  const router = useRouter();
  const supabase = createClient();

  // 상태
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [store, setStore] = useState<FoodStore | null>(null);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'preparing' | 'ready'>('new');
  const [todayStats, setTodayStats] = useState({ count: 0, revenue: 0 });

  // 인증 체크
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        router.push('/auth/login?redirect=/food/partner');
      }
    };
    checkAuth();
  }, [supabase, router]);

  // 가게 정보 로드
  useEffect(() => {
    if (!user) return;

    const fetchStore = async () => {
      const { data } = await supabase
        .from('food_stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (data) {
        setStore(data as FoodStore);
      }
      setLoading(false);
    };

    fetchStore();
  }, [user]);

  // 주문 목록 로드
  const fetchOrders = useCallback(async () => {
    if (!store) return;

    const { data } = await supabase
      .from('food_orders')
      .select('*')
      .eq('store_id', store.id)
      .in('status', ['pending', 'accepted', 'preparing', 'ready'])
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data as FoodOrder[]);
    }

    // 오늘 통계
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: statsData } = await supabase
      .from('food_orders')
      .select('total_amount')
      .eq('store_id', store.id)
      .eq('status', 'delivered')
      .gte('created_at', today.toISOString());

    if (statsData) {
      setTodayStats({
        count: statsData.length,
        revenue: statsData.reduce((sum, o) => sum + o.total_amount, 0),
      });
    }
  }, [store]);

  useEffect(() => {
    if (store) {
      fetchOrders();

      // 실시간 구독
      const channel = supabase
        .channel('food-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'food_orders',
            filter: `store_id=eq.${store.id}`,
          },
          () => {
            fetchOrders();
            // 새 주문 알림 소리
            if (typeof window !== 'undefined') {
              const audio = new Audio('/sounds/new-order.mp3');
              audio.play().catch(() => {});
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [store, fetchOrders]);

  // 영업 상태 토글
  const toggleOpen = async () => {
    if (!store) return;

    const { error } = await supabase
      .from('food_stores')
      .update({ is_open: !store.is_open })
      .eq('id', store.id);

    if (!error) {
      setStore((prev) => prev && { ...prev, is_open: !prev.is_open });
    }
  };

  // 주문 상태 변경
  const updateOrderStatus = async (orderId: string, newStatus: FoodOrderStatus) => {
    const updates: Record<string, unknown> = { status: newStatus };

    // 상태별 타임스탬프 추가
    const now = new Date().toISOString();
    if (newStatus === 'accepted') updates.accepted_at = now;
    if (newStatus === 'preparing') updates.cooking_at = now;
    if (newStatus === 'ready') updates.ready_at = now;

    const { error } = await supabase.from('food_orders').update(updates).eq('id', orderId);

    if (!error) {
      fetchOrders();
    }
  };

  // 주문 필터
  const newOrders = orders.filter((o) => o.status === 'pending');
  const cookingOrders = orders.filter((o) => o.status === 'accepted' || o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  // 로그인 체크
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-primary text-white rounded-xl font-medium"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  // 가게 미등록
  if (!loading && !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">아직 등록된 가게가 없어요</h2>
          <p className="text-gray-500 mb-6">입점 신청을 먼저 해주세요</p>
          <Link
            href="/food/partner/register"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-primary text-white rounded-xl font-medium"
          >
            입점 신청하기
          </Link>
        </div>
      </div>
    );
  }

  // 승인 대기
  if (!loading && store && !store.is_verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Clock className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">승인 대기 중입니다</h2>
          <p className="text-gray-500 mb-2">입점 신청이 접수되었습니다.</p>
          <p className="text-sm text-gray-400">보통 1-2 영업일 내에 승인됩니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 animate-pulse">
        <div className="h-20 bg-gray-200" />
        <div className="p-4 space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24 md:pb-6">
      {/* 헤더 - 영업 상태 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-1200 flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${store?.is_open ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            <span className="font-bold text-lg">{store?.is_open ? '영업중' : '영업종료'}</span>
          </div>
          <button
            onClick={toggleOpen}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
              store?.is_open ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
            }`}
          >
            <Power className="w-4 h-4" />
            {store?.is_open ? '영업 종료' : '영업 시작'}
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="container-1200 md:flex md:gap-6 md:py-6">
        {/* PC 사이드바 네비게이션 */}
        <aside className="hidden md:block md:w-64 md:flex-shrink-0">
          <nav className="bg-white rounded-2xl p-4 sticky top-20 space-y-2">
            <Link
              href="/food/partner"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 text-brand-primary font-medium"
            >
              <ClipboardList className="w-5 h-5" />
              주문관리
            </Link>
            <Link
              href="/food/partner/menu"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
            >
              <UtensilsCrossed className="w-5 h-5" />
              메뉴관리
            </Link>
            <Link
              href="/food/partner/stats"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
            >
              <BarChart3 className="w-5 h-5" />
              매출현황
            </Link>
            <Link
              href="/food/partner/store"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
            >
              <Settings className="w-5 h-5" />
              가게관리
            </Link>
          </nav>
        </aside>

        {/* 메인 영역 */}
        <div className="md:flex-1">
          {/* 오늘 매출 */}
          <section className="bg-white mx-4 md:mx-0 mt-4 md:mt-0 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">오늘 매출</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayStats.revenue.toLocaleString()}원
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">주문</p>
                <p className="text-2xl font-bold text-brand-primary">{todayStats.count}건</p>
              </div>
            </div>
          </section>

          {/* 주문 탭 */}
          <section className="mt-4">
            <div className="bg-white md:rounded-2xl px-4 py-3 flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('new')}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-colors relative ${
                  activeTab === 'new' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                신규 주문
                {newOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                    {newOrders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('preparing')}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-colors ${
                  activeTab === 'preparing'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                조리중 ({cookingOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('ready')}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-colors ${
                  activeTab === 'ready' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                픽업대기 ({readyOrders.length})
              </button>
            </div>

            {/* 주문 목록 */}
            <div className="px-4 md:px-0 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 신규 주문 */}
              {activeTab === 'new' && (
                <>
                  {newOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center lg:col-span-2">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">새로운 주문이 없습니다</p>
                    </div>
                  ) : (
                    newOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onAccept={() => updateOrderStatus(order.id, 'accepted')}
                        onReject={() => updateOrderStatus(order.id, 'cancelled')}
                      />
                    ))
                  )}
                </>
              )}

              {/* 조리중 */}
              {activeTab === 'preparing' && (
                <>
                  {cookingOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center lg:col-span-2">
                      <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">조리중인 주문이 없습니다</p>
                    </div>
                  ) : (
                    cookingOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onComplete={() => updateOrderStatus(order.id, 'ready')}
                      />
                    ))
                  )}
                </>
              )}

              {/* 픽업대기 */}
              {activeTab === 'ready' && (
                <>
                  {readyOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center lg:col-span-2">
                      <Bike className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">픽업 대기중인 주문이 없습니다</p>
                    </div>
                  ) : (
                    readyOrders.map((order) => <OrderCard key={order.id} order={order} isReady />)
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* 하단 네비게이션 (모바일 전용) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom md:hidden">
        <div className="container-1200 grid grid-cols-4 h-16">
          <Link
            href="/food/partner"
            className="flex flex-col items-center justify-center text-brand-primary"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs mt-1">주문관리</span>
          </Link>
          <Link
            href="/food/partner/menu"
            className="flex flex-col items-center justify-center text-gray-500"
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span className="text-xs mt-1">메뉴관리</span>
          </Link>
          <Link
            href="/food/partner/stats"
            className="flex flex-col items-center justify-center text-gray-500"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs mt-1">매출현황</span>
          </Link>
          <Link
            href="/food/partner/store"
            className="flex flex-col items-center justify-center text-gray-500"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs mt-1">가게관리</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

// 주문 카드 컴포넌트
function OrderCard({
  order,
  onAccept,
  onReject,
  onComplete,
  isReady,
}: {
  order: FoodOrder;
  onAccept?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
  isReady?: boolean;
}) {
  const items = order.items as Array<{
    menu_name: string;
    quantity: number;
    options?: Array<{ name: string }>;
  }>;

  const createdAt = new Date(order.created_at);
  const timeAgo = Math.floor((Date.now() - createdAt.getTime()) / 60000);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* 헤더 */}
      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">#{order.order_number.slice(-4)}</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              FOOD_ORDER_STATUS_COLORS[order.status]
            }`}
          >
            {FOOD_ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {timeAgo < 60 ? `${timeAgo}분 전` : `${Math.floor(timeAgo / 60)}시간 전`}
        </span>
      </div>

      {/* 메뉴 목록 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {item.menu_name} x {item.quantity}
                </p>
                {item.options && item.options.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {item.options.map((opt) => opt.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-gray-500">총 금액</span>
          <span className="font-bold text-lg">{order.total_amount.toLocaleString()}원</span>
        </div>
      </div>

      {/* 요청사항 */}
      {order.request_to_store && (
        <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100">
          <p className="text-sm text-yellow-800">
            <strong>요청:</strong> {order.request_to_store}
          </p>
        </div>
      )}

      {/* 배달 정보 */}
      <div className="px-4 py-3 text-sm text-gray-600 space-y-1">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{order.delivery_address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{order.delivery_phone}</span>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="px-4 py-3 border-t border-gray-100">
        {order.status === 'pending' && onAccept && onReject && (
          <div className="flex gap-3">
            <button
              onClick={onReject}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              거절
            </button>
            <button
              onClick={onAccept}
              className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              접수
            </button>
          </div>
        )}

        {(order.status === 'accepted' || order.status === 'preparing') && onComplete && (
          <button
            onClick={onComplete}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <ChefHat className="w-5 h-5" />
            조리 완료
          </button>
        )}

        {isReady && (
          <div className="flex items-center justify-center gap-2 py-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">라이더 픽업 대기중</span>
          </div>
        )}
      </div>
    </div>
  );
}
