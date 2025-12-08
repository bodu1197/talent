'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Phone, MapPin, CheckCircle, Clock, Truck, Home, XCircle } from 'lucide-react';
import { FoodOrder, FoodOrderStatus, FOOD_ORDER_STATUS } from '@/types/food';
import { createClient } from '@/lib/supabase/client';

// 주문 단계
const ORDER_STEPS: { status: FoodOrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'pending', label: '주문 접수중', icon: <Clock className="w-6 h-6" /> },
  { status: 'accepted', label: '주문 확인', icon: <CheckCircle className="w-6 h-6" /> },
  { status: 'preparing', label: '조리중', icon: '🍳' },
  { status: 'ready', label: '조리 완료', icon: '✅' },
  { status: 'picked_up', label: '픽업 완료', icon: <Truck className="w-6 h-6" /> },
  { status: 'delivering', label: '배달중', icon: '🛵' },
  { status: 'delivered', label: '배달 완료', icon: <Home className="w-6 h-6" /> },
];

// 임시 주문 데이터
const MOCK_ORDER: FoodOrder = {
  id: '1',
  order_number: 'F202412080001',
  store_id: '1',
  store: {
    id: '1',
    owner_id: '',
    name: '맛있는 치킨집',
    category: 'chicken',
    description: '',
    phone: '02-1234-5678',
    address: '서울시 강남구 역삼동 123-45',
    detail_address: '1층',
    latitude: 37.5,
    longitude: 127.0,
    min_order_amount: 15000,
    delivery_fee: 3000,
    estimated_prep_time: 25,
    rating: 4.8,
    review_count: 324,
    order_count: 1520,
    is_open: true,
    is_approved: true,
    created_at: '',
    updated_at: '',
  },
  customer_id: '',
  delivery_address: '서울시 강남구 삼성동 123',
  delivery_detail_address: '101동 202호',
  delivery_phone: '010-1234-5678',
  request_to_store: '젓가락 많이 주세요',
  request_to_rider: '문 앞에 놓아주세요',
  items: [
    {
      menu_id: '1',
      menu_name: '후라이드 치킨',
      quantity: 1,
      price: 18000,
      options: [{ name: '양념 추가', price: 1000 }],
      total_price: 19000,
    },
    {
      menu_id: '2',
      menu_name: '콜라 1.5L',
      quantity: 2,
      price: 2500,
      options: [],
      total_price: 5000,
    },
  ],
  subtotal: 24000,
  delivery_fee: 3000,
  platform_fee: 300,
  total_amount: 27000,
  status: 'delivering',
  payment_method: 'card',
  payment_status: 'paid',
  rider_id: 'rider1',
  rider: {
    id: 'rider1',
    name: '김배달',
    phone: '010-9999-8888',
  },
  estimated_delivery_time: new Date(Date.now() + 15 * 60000).toISOString(),
  created_at: new Date(Date.now() - 30 * 60000).toISOString(),
  accepted_at: new Date(Date.now() - 28 * 60000).toISOString(),
  preparing_at: new Date(Date.now() - 25 * 60000).toISOString(),
  ready_at: new Date(Date.now() - 10 * 60000).toISOString(),
  picked_up_at: new Date(Date.now() - 5 * 60000).toISOString(),
  updated_at: new Date().toISOString(),
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const supabase = createClient();

  const [order, setOrder] = useState<FoodOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();

    // 실시간 주문 상태 구독
    const channel = supabase
      .channel(`food_order_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'food_orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) => (prev ? { ...prev, ...payload.new } : null));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, supabase]);

  const loadOrder = async () => {
    try {
      // 실제로는 Supabase에서 로드
      // const { data } = await supabase
      //   .from('food_orders')
      //   .select('*, store:food_stores(*)')
      //   .eq('id', orderId)
      //   .single()

      // 임시 데이터 사용
      setOrder(MOCK_ORDER);
    } catch (error) {
      console.error('주문 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 현재 단계 인덱스
  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const index = ORDER_STEPS.findIndex((step) => step.status === order.status);
    return index >= 0 ? index : 0;
  };

  // 시간 포맷
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  // 남은 시간
  const getRemainingTime = () => {
    if (!order?.estimated_delivery_time) return null;
    const remaining = new Date(order.estimated_delivery_time).getTime() - Date.now();
    if (remaining <= 0) return '곧 도착';
    const minutes = Math.ceil(remaining / 60000);
    return `약 ${minutes}분`;
  };

  // 전화 걸기
  const callPhone = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <XCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-lg font-medium mb-2">주문을 찾을 수 없어요</h2>
        <button onClick={() => router.push('/food/orders')} className="text-orange-500">
          주문 내역으로 돌아가기
        </button>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();
  const isCompleted = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container-1200 px-4 h-14 flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg">주문 상세</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="container-1200">
        <div className="md:flex md:gap-6 md:py-6">
          {/* 왼쪽: 주문 상태 및 정보 */}
          <div className="md:flex-1">
            {/* 주문 상태 */}
            <div className="bg-white p-6 md:rounded-xl">
              {/* 상태 아이콘 & 텍스트 */}
              <div className="text-center mb-6">
                <div
                  className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 ${(() => {
                    if (isCompleted) return 'bg-green-100';
                    if (isCancelled) return 'bg-red-100';
                    return 'bg-orange-100';
                  })()}`}
                >
                  {(() => {
                    if (isCompleted) return '✅';
                    if (isCancelled) return '❌';
                    return '🛵';
                  })()}
                </div>
                <h2 className={`text-xl font-bold ${isCancelled ? 'text-red-600' : ''}`}>
                  {FOOD_ORDER_STATUS[order.status].label}
                </h2>
                {!isCompleted && !isCancelled && getRemainingTime() && (
                  <p className="text-gray-500 mt-1">{getRemainingTime()} 후 도착 예정</p>
                )}
              </div>

              {/* 진행 단계 */}
              {!isCancelled && (
                <div className="relative">
                  {/* 진행 바 배경 */}
                  <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded"></div>
                  {/* 진행 바 */}
                  <div
                    className="absolute top-4 left-0 h-1 bg-orange-500 rounded transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%` }}
                  ></div>

                  {/* 단계 표시 */}
                  <div className="relative flex justify-between">
                    {ORDER_STEPS.map((step, index) => {
                      const isPassed = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;

                      return (
                        <div key={step.status} className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 ${
                              isPassed ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
                            } ${isCurrent ? 'ring-4 ring-orange-100' : ''}`}
                          >
                            {typeof step.icon === 'string' ? (
                              step.icon
                            ) : (
                              <span className="scale-75">{step.icon}</span>
                            )}
                          </div>
                          <span
                            className={`text-xs mt-2 text-center ${
                              isPassed ? 'text-orange-600 font-medium' : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 라이더 정보 (배달중일 때만) */}
            {order.rider && ['picked_up', 'delivering'].includes(order.status) && (
              <div className="bg-white mt-2 p-4 md:rounded-xl">
                <h3 className="font-bold mb-3">배달 라이더</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      🛵
                    </div>
                    <div>
                      <p className="font-medium">{order.rider.name} 라이더</p>
                      <p className="text-sm text-gray-500">{order.rider.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => callPhone(order.rider!.phone)}
                    className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* 배달 주소 */}
            <div className="bg-white mt-2 p-4 md:rounded-xl">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                배달 주소
              </h3>
              <p className="text-gray-700">{order.delivery_address}</p>
              {order.delivery_detail_address && (
                <p className="text-gray-500">{order.delivery_detail_address}</p>
              )}
              <p className="text-gray-500 mt-1">{order.delivery_phone}</p>

              {/* 요청사항 */}
              {(order.request_to_store || order.request_to_rider) && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  {order.request_to_store && (
                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-500">가게:</span>
                      <span>{order.request_to_store}</span>
                    </div>
                  )}
                  {order.request_to_rider && (
                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-500">배달:</span>
                      <span>{order.request_to_rider}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 가게 정보 */}
            <div className="bg-white mt-2 p-4 md:rounded-xl">
              <h3 className="font-bold mb-3">주문 가게</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    🍗
                  </div>
                  <div>
                    <p className="font-medium">{order.store?.name}</p>
                    <p className="text-sm text-gray-500">{order.store?.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => callPhone(order.store!.phone)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500"
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽: 주문 내역 및 결제 정보 (PC에서 사이드바) */}
          <div className="md:w-96 md:flex-shrink-0">
            {/* 주문 내역 */}
            <div className="bg-white mt-2 md:mt-0 p-4 md:rounded-xl">
              <h3 className="font-bold mb-3">주문 내역</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <span className="font-medium">{item.menu_name}</span>
                      {item.options && item.options.length > 0 && (
                        <p className="text-sm text-gray-500">
                          {item.options.map((opt: { name: string }) => opt.name).join(', ')}
                        </p>
                      )}
                      <span className="text-sm text-gray-500"> x {item.quantity}</span>
                    </div>
                    <span>{item.total_price.toLocaleString()}원</span>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>주문금액</span>
                  <span>{order.subtotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>배달비</span>
                  <span>{order.delivery_fee.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>총 결제금액</span>
                  <span className="text-orange-500">{order.total_amount.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="bg-white mt-2 p-4 md:rounded-xl">
              <h3 className="font-bold mb-3">결제 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">결제 수단</span>
                  <span>
                    {{ card: '카드 결제', cash: '현금 결제', transfer: '계좌이체' }[
                      order.payment_method
                    ] || order.payment_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">주문 번호</span>
                  <span>{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">주문 시간</span>
                  <span>{formatTime(order.created_at)}</span>
                </div>
              </div>
            </div>

            {/* 주문 타임라인 */}
            <div className="bg-white mt-2 p-4 md:rounded-xl">
              <h3 className="font-bold mb-3">주문 진행</h3>
              <div className="space-y-3">
                {order.created_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-gray-500 w-16">{formatTime(order.created_at)}</span>
                    <span>주문 접수</span>
                  </div>
                )}
                {order.accepted_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-gray-500 w-16">{formatTime(order.accepted_at)}</span>
                    <span>주문 확인</span>
                  </div>
                )}
                {order.preparing_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-gray-500 w-16">{formatTime(order.preparing_at)}</span>
                    <span>조리 시작</span>
                  </div>
                )}
                {order.ready_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-gray-500 w-16">{formatTime(order.ready_at)}</span>
                    <span>조리 완료</span>
                  </div>
                )}
                {order.picked_up_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-gray-500 w-16">{formatTime(order.picked_up_at)}</span>
                    <span>라이더 픽업</span>
                  </div>
                )}
                {order.delivered_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-500 w-16">{formatTime(order.delivered_at)}</span>
                    <span>배달 완료</span>
                  </div>
                )}
              </div>
            </div>

            {/* 하단 버튼 */}
            {isCompleted && (
              <div className="p-4 md:px-0 space-y-2">
                <button
                  onClick={() => router.push(`/food/store/${order.store_id}`)}
                  className="w-full py-4 border border-orange-500 text-orange-500 rounded-xl font-bold"
                >
                  재주문하기
                </button>
                <button className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold">
                  리뷰 작성하기
                </button>
              </div>
            )}

            {/* 주문 취소 버튼 (접수 전에만) */}
            {order.status === 'pending' && (
              <div className="p-4 md:px-0">
                <button className="w-full py-4 border border-gray-300 text-gray-500 rounded-xl">
                  주문 취소
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
