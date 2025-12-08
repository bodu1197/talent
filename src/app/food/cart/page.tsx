'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Trash2, Plus, Minus, Clock, AlertTriangle } from 'lucide-react';
import { CartItem, FoodStore, PLATFORM_FEE } from '@/types/food';

// 장바구니 키
const CART_STORAGE_KEY = 'food_cart';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [store, setStore] = useState<FoodStore | null>(null);
  const [loading, setLoading] = useState(true);

  // 장바구니 로드
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          setCartItems(parsed.items || []);
          if (parsed.storeId) {
            // 가게 정보 로드 (실제로는 API 호출)
            loadStoreInfo(parsed.storeId);
          }
        }
      } catch (error) {
        console.error('장바구니 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // 가게 정보 로드 (실제로는 Supabase API)
  const loadStoreInfo = async (storeId: string) => {
    // 임시 데이터
    setStore({
      id: storeId,
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
    });
  };

  // 장바구니 저장
  const saveCart = (items: CartItem[]) => {
    const cartData = {
      storeId: store?.id,
      items: items,
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    setCartItems(items);
  };

  // 수량 변경
  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...cartItems];
    const newQuantity = newItems[index].quantity + delta;

    if (newQuantity <= 0) {
      // 삭제
      newItems.splice(index, 1);
    } else {
      newItems[index].quantity = newQuantity;
    }

    saveCart(newItems);
  };

  // 아이템 삭제
  const removeItem = (index: number) => {
    const newItems = cartItems.filter((_, i) => i !== index);
    saveCart(newItems);
  };

  // 전체 삭제
  const clearCart = () => {
    localStorage.removeItem(CART_STORAGE_KEY);
    setCartItems([]);
    setStore(null);
  };

  // 금액 계산
  const calculateItemPrice = (item: CartItem): number => {
    let total = item.menu.price;
    item.selectedOptions?.forEach((option) => {
      total += option.price;
    });
    return total * item.quantity;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  const deliveryFee = store?.delivery_fee || 0;
  const totalAmount = subtotal + deliveryFee;
  const isMinOrderMet = !store || subtotal >= store.min_order_amount;
  const remainingForMinOrder = store ? Math.max(0, store.min_order_amount - subtotal) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="sticky top-0 z-50 bg-white border-b">
          <div className="container-1200 px-4 h-14 flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-center font-bold text-lg">장바구니</h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* 빈 장바구니 */}
        <div className="container-1200 flex flex-col items-center justify-center py-20 px-4">
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있어요</h2>
          <p className="text-gray-500 text-center mb-6">맛있는 음식을 담아보세요!</p>
          <Link href="/food" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium">
            음식점 둘러보기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container-1200 px-4 h-14 flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg">장바구니</h1>
          <button onClick={clearCart} className="text-gray-500 text-sm">
            전체삭제
          </button>
        </div>
      </header>

      <div className="container-1200">
        <div className="md:flex md:gap-6 md:py-6">
          {/* 왼쪽: 장바구니 아이템 */}
          <div className="md:flex-1">
            {/* 가게 정보 */}
            {store && (
              <div className="bg-white p-4 border-b md:rounded-xl md:mb-4">
                <Link href={`/food/store/${store.id}`} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🍗</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold">{store.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        {store.estimated_prep_time}~{store.estimated_prep_time + 10}분
                      </span>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </Link>
              </div>
            )}

            {/* 장바구니 아이템 */}
            <div className="bg-white mt-2 md:mt-0 md:rounded-xl">
              <div className="p-4 border-b">
                <h3 className="font-bold">주문 메뉴</h3>
              </div>

              {cartItems.map((item, index) => (
                <div key={index} className="p-4 border-b">
                  <div className="flex gap-3">
                    {/* 메뉴 이미지 */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.menu.image_url ? (
                        <Image
                          src={item.menu.image_url}
                          alt={item.menu.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* 메뉴 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">{item.menu.name}</h4>
                        <button
                          onClick={() => removeItem(index)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* 선택 옵션 */}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          {item.selectedOptions.map((opt) => opt.name).join(', ')}
                        </p>
                      )}

                      {/* 가격 & 수량 */}
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold">
                          {calculateItemPrice(item).toLocaleString()}원
                        </span>

                        <div className="flex items-center gap-3 bg-gray-100 rounded-lg">
                          <button
                            onClick={() => updateQuantity(index, -1)}
                            className="w-8 h-8 flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, 1)}
                            className="w-8 h-8 flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 메뉴 추가 */}
              {store && (
                <Link
                  href={`/food/store/${store.id}`}
                  className="flex items-center justify-center gap-2 p-4 text-orange-500 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  메뉴 추가하기
                </Link>
              )}
            </div>
          </div>

          {/* 오른쪽: 결제 금액 (PC에서 사이드바) */}
          <div className="md:w-80 md:flex-shrink-0">
            {/* 결제 금액 */}
            <div className="bg-white mt-2 md:mt-0 p-4 md:rounded-xl md:sticky md:top-20">
              <h3 className="font-bold mb-4">결제금액</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>주문금액</span>
                  <span>{subtotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>배달비</span>
                  <span>{deliveryFee.toLocaleString()}원</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>총 결제금액</span>
                  <span className="text-orange-500">{totalAmount.toLocaleString()}원</span>
                </div>
              </div>

              {/* PC용 주문 버튼 */}
              <div className="hidden md:block mt-6">
                {!isMinOrderMet && (
                  <div className="flex items-center gap-2 text-orange-500 mb-3 text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    <span>최소주문금액까지 {remainingForMinOrder.toLocaleString()}원 남았어요</span>
                  </div>
                )}
                <button
                  onClick={() => router.push('/food/checkout')}
                  disabled={!isMinOrderMet}
                  className={`w-full py-4 rounded-xl font-bold text-lg ${
                    isMinOrderMet ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {totalAmount.toLocaleString()}원 주문하기
                </button>
              </div>
            </div>

            {/* 플랫폼 안내 */}
            <div className="bg-orange-50 mx-4 md:mx-0 mt-4 p-4 rounded-xl">
              <p className="text-sm text-orange-800">
                <strong>돌파구 동네배달</strong>은 음식점에서 판매수수료를 받지 않아요!
                <br />
                가게당 {PLATFORM_FEE.STORE}원의 플랫폼 이용료만 부과됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 주문 버튼 (모바일 전용) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-bottom md:hidden">
        <div className="container-1200">
          {/* 최소주문금액 경고 */}
          {!isMinOrderMet && (
            <div className="flex items-center gap-2 text-orange-500 mb-3 text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>최소주문금액까지 {remainingForMinOrder.toLocaleString()}원 남았어요</span>
            </div>
          )}

          <button
            onClick={() => router.push('/food/checkout')}
            disabled={!isMinOrderMet}
            className={`w-full py-4 rounded-xl font-bold text-lg ${
              isMinOrderMet ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
            }`}
          >
            {totalAmount.toLocaleString()}원 주문하기
          </button>
        </div>
      </div>
    </div>
  );
}
