'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, Clock, Truck, Home, Star } from 'lucide-react';
import { FoodOrder, FoodOrderStatus, FOOD_ORDER_STATUS } from '@/types/food';

// 임시 주문 데이터
const MOCK_ORDERS: FoodOrder[] = [
  {
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
      address: '서울시 강남구 역삼동',
      detail_address: '',
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
    items: [
      {
        menu_id: '1',
        menu_name: '후라이드 치킨',
        quantity: 1,
        price: 18000,
        options: [],
        total_price: 18000,
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
    subtotal: 23000,
    delivery_fee: 3000,
    platform_fee: 300,
    total_amount: 26000,
    status: 'delivering',
    payment_method: 'card',
    payment_status: 'paid',
    rider_id: 'rider1',
    estimated_delivery_time: new Date(Date.now() + 15 * 60000).toISOString(),
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    order_number: 'F202412070015',
    store_id: '2',
    store: {
      id: '2',
      owner_id: '',
      name: '행복한 중국집',
      category: 'chinese',
      description: '',
      phone: '02-9876-5432',
      address: '서울시 강남구 대치동',
      detail_address: '',
      latitude: 37.5,
      longitude: 127.0,
      min_order_amount: 12000,
      delivery_fee: 2000,
      estimated_prep_time: 30,
      rating: 4.5,
      review_count: 215,
      order_count: 890,
      is_open: true,
      is_approved: true,
      created_at: '',
      updated_at: '',
    },
    customer_id: '',
    delivery_address: '서울시 강남구 삼성동 123',
    delivery_detail_address: '101동 202호',
    delivery_phone: '010-1234-5678',
    items: [
      {
        menu_id: '3',
        menu_name: '짜장면',
        quantity: 2,
        price: 7000,
        options: [],
        total_price: 14000,
      },
      {
        menu_id: '4',
        menu_name: '탕수육 (중)',
        quantity: 1,
        price: 18000,
        options: [],
        total_price: 18000,
      },
    ],
    subtotal: 32000,
    delivery_fee: 2000,
    platform_fee: 300,
    total_amount: 34000,
    status: 'delivered',
    payment_method: 'card',
    payment_status: 'paid',
    delivered_at: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
    created_at: new Date(Date.now() - 25 * 60 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
  },
];

// 상태별 아이콘
const StatusIcon = ({ status }: { status: FoodOrderStatus }) => {
  switch (status) {
    case 'pending':
    case 'accepted':
    case 'preparing':
      return <Clock className="w-5 h-5" />;
    case 'ready':
    case 'picked_up':
    case 'delivering':
      return <Truck className="w-5 h-5" />;
    case 'delivered':
      return <CheckCircle className="w-5 h-5" />;
    default:
      return <Clock className="w-5 h-5" />;
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewOrder = searchParams.get('new') === 'true';

  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'past'>('ongoing');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // 실제로는 Supabase에서 로드
      // const supabase = createClient()
      // const { data: { user } } = await supabase.auth.getUser()
      // const { data } = await supabase
      //   .from('food_orders')
      //   .select('*, store:food_stores(*)')
      //   .eq('customer_id', user?.id)
      //   .order('created_at', { ascending: false })

      // 임시 데이터 사용
      setOrders(MOCK_ORDERS);
    } catch (error) {
      console.error('주문 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 진행중 / 지난 주문 필터링
  const ongoingOrders = orders.filter((o) =>
    ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivering'].includes(o.status)
  );
  const pastOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  const displayOrders = activeTab === 'ongoing' ? ongoingOrders : pastOrders;

  // 시간 포맷
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 새 주문 완료 배너 */}
      {isNewOrder && (
        <div className="bg-green-500 text-white p-4 text-center">
          <CheckCircle className="w-6 h-6 inline-block mr-2" />
          주문이 완료되었습니다!
        </div>
      )}

      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container-1200 px-4 h-14 flex items-center">
          <button onClick={() => router.push('/food')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg">주문내역</h1>
          <div className="w-10"></div>
        </div>

        {/* 탭 */}
        <div className="container-1200 flex border-b">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`flex-1 py-3 text-center font-medium relative ${
              activeTab === 'ongoing' ? 'text-orange-500' : 'text-gray-500'
            }`}
          >
            진행중
            {ongoingOrders.length > 0 && (
              <span className="ml-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {ongoingOrders.length}
              </span>
            )}
            {activeTab === 'ongoing' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 text-center font-medium relative ${
              activeTab === 'past' ? 'text-orange-500' : 'text-gray-500'
            }`}
          >
            지난 주문
            {activeTab === 'past' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></div>
            )}
          </button>
        </div>
      </header>

      <div className="container-1200 pb-24">
        {displayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'ongoing' ? '진행중인 주문이 없어요' : '지난 주문이 없어요'}
            </h2>
            <p className="text-gray-500 text-center mb-6">맛있는 음식을 주문해보세요!</p>
            <Link
              href="/food"
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium"
            >
              음식점 둘러보기
            </Link>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayOrders.map((order) => (
              <Link
                key={order.id}
                href={`/food/orders/${order.id}`}
                className="block bg-white rounded-xl overflow-hidden shadow-sm"
              >
                {/* 상태 바 */}
                <div
                  className={`px-4 py-2 flex items-center gap-2 ${(() => {
                    if (order.status === 'delivered') return 'bg-gray-100 text-gray-600';
                    if (order.status === 'cancelled') return 'bg-red-50 text-red-600';
                    return 'bg-orange-50 text-orange-600';
                  })()}`}
                >
                  <StatusIcon status={order.status} />
                  <span className="font-medium">{FOOD_ORDER_STATUS[order.status].label}</span>
                  <span className="ml-auto text-sm">{formatTime(order.created_at)}</span>
                </div>

                {/* 주문 정보 */}
                <div className="p-4">
                  <div className="flex gap-3">
                    {/* 가게 이미지 */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {order.store?.thumbnail_url ? (
                        <Image
                          src={order.store.thumbnail_url}
                          alt={order.store.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-3xl">🍽️</span>
                      )}
                    </div>

                    {/* 주문 상세 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold">{order.store?.name}</h3>
                      <p className="text-sm text-gray-500 truncate">
                        {order.items
                          .map((item) => `${item.menu_name} ${item.quantity}개`)
                          .join(', ')}
                      </p>
                      <p className="font-medium mt-1">{order.total_amount.toLocaleString()}원</p>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  {order.status === 'delivered' && (
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 py-2 border border-orange-500 text-orange-500 rounded-lg font-medium text-sm">
                        재주문
                      </button>
                      <button className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-1">
                        <Star className="w-4 h-4" />
                        리뷰 작성
                      </button>
                    </div>
                  )}

                  {/* 배달 진행중 - 예상 도착 시간 */}
                  {order.status === 'delivering' && order.estimated_delivery_time && (
                    <div className="mt-4 bg-orange-50 p-3 rounded-lg flex items-center gap-2">
                      <Truck className="w-5 h-5 text-orange-500" />
                      <span className="text-sm text-orange-700">
                        약{' '}
                        {Math.ceil(
                          (new Date(order.estimated_delivery_time).getTime() - Date.now()) / 60000
                        )}
                        분 후 도착 예정
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 하단 네비게이션 (모바일 전용) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t safe-area-bottom md:hidden">
        <div className="container-1200 flex">
          <Link href="/food" className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-400">
            <Home className="w-6 h-6" />
            <span className="text-xs">홈</span>
          </Link>
          <Link
            href="/food/orders"
            className="flex-1 py-3 flex flex-col items-center gap-1 text-orange-500"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-xs font-medium">주문내역</span>
          </Link>
          <Link
            href="/mypage"
            className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-400"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs">마이페이지</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
