'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageSquare,
  CreditCard,
  Banknote,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { CartItem, FoodStore, PLATFORM_FEE } from '@/types/food';
import { createClient } from '@/lib/supabase/client';

const CART_STORAGE_KEY = 'food_cart';

type PaymentMethod = 'card' | 'cash' | 'transfer';

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [store, setStore] = useState<FoodStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 배달 정보
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [riderMessage, setRiderMessage] = useState('');

  // 결제 방법
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  // 장바구니 로드
  useEffect(() => {
    const loadCart = async () => {
      try {
        // 사용자 정보 로드
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // 프로필에서 기본 주소, 전화번호 가져오기
          const { data: profile } = await supabase
            .from('profiles')
            .select('phone, address')
            .eq('id', user.id)
            .single();

          if (profile) {
            setPhone(profile.phone || '');
            setDeliveryAddress(profile.address || '');
          }
        }

        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          setCartItems(parsed.items || []);
          if (parsed.storeId) {
            loadStoreInfo(parsed.storeId);
          }
        } else {
          router.push('/food/cart');
        }
      } catch (error) {
        console.error('로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [supabase, router]);

  // 가게 정보 로드
  const loadStoreInfo = async (storeId: string) => {
    // 임시 데이터 (실제로는 Supabase에서 로드)
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

  // 주문하기
  const handleSubmitOrder = async () => {
    if (!deliveryAddress || !phone) {
      alert('배달 주소와 연락처를 입력해주세요.');
      return;
    }

    if (!store) {
      alert('가게 정보를 불러오는 중입니다.');
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/food/checkout');
        return;
      }

      // 주문 데이터 생성
      const orderData = {
        store_id: store.id,
        customer_id: user.id,
        delivery_address: deliveryAddress,
        delivery_detail_address: detailAddress,
        delivery_phone: phone,
        request_to_store: requestMessage,
        request_to_rider: riderMessage,
        payment_method: paymentMethod,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        platform_fee: PLATFORM_FEE.STORE,
        total_amount: totalAmount,
        items: cartItems.map((item) => ({
          menu_id: item.menu.id,
          menu_name: item.menu.name,
          quantity: item.quantity,
          price: item.menu.price,
          options:
            item.selectedOptions?.map((opt) => ({
              name: opt.name,
              price: opt.price,
            })) || [],
          total_price: calculateItemPrice(item),
        })),
        status: 'pending',
      };

      // 주문 저장 (실제로는 Supabase에 저장)
      // const { data: order, error } = await supabase
      //   .from('food_orders')
      //   .insert(orderData)
      //   .select()
      //   .single()

      // 임시로 성공 처리 (개발용 - 실제로는 Supabase 저장 결과 사용)
      // eslint-disable-next-line no-console
      console.log('주문 데이터:', orderData);

      // 장바구니 비우기
      localStorage.removeItem(CART_STORAGE_KEY);

      // 주문 완료 페이지로 이동
      // router.push(`/food/orders/${order.id}`)
      router.push('/food/orders?new=true');
    } catch (error) {
      console.error('주문 실패:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 주소 검색
  const handleAddressSearch = () => {
    // 카카오 주소 검색 API
    if (
      typeof window !== 'undefined' &&
      (
        window as unknown as {
          daum?: {
            Postcode: new (config: { oncomplete: (data: { address: string }) => void }) => {
              open: () => void;
            };
          };
        }
      ).daum
    ) {
      new (
        window as unknown as {
          daum: {
            Postcode: new (config: { oncomplete: (data: { address: string }) => void }) => {
              open: () => void;
            };
          };
        }
      ).daum.Postcode({
        oncomplete: function (data: { address: string }) {
          setDeliveryAddress(data.address);
        },
      }).open();
    } else {
      alert('주소 검색 서비스를 불러오는 중입니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 카카오 주소 검색 스크립트 */}
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async />

      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container-1200 px-4 h-14 flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg">주문하기</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="container-1200">
        <div className="md:flex md:gap-6 md:py-6">
          {/* 왼쪽: 배달/결제 정보 */}
          <div className="md:flex-1">
            {/* 배달 주소 */}
            <div className="bg-white mt-2 md:mt-0 p-4 md:rounded-xl">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-orange-500" />
                배달 주소
              </h3>

              <button
                onClick={handleAddressSearch}
                className="w-full p-4 border rounded-xl text-left flex items-center justify-between mb-3"
              >
                <span className={deliveryAddress ? 'text-gray-900' : 'text-gray-400'}>
                  {deliveryAddress || '주소를 검색해주세요'}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <input
                type="text"
                placeholder="상세주소 (동/호수)"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                className="w-full p-4 border rounded-xl"
              />
            </div>

            {/* 연락처 */}
            <div className="bg-white mt-2 p-4 md:rounded-xl">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-orange-500" />
                연락처
              </h3>

              <input
                type="tel"
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-4 border rounded-xl"
              />
            </div>

            {/* 요청사항 */}
            <div className="bg-white mt-2 p-4 md:rounded-xl">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                요청사항
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500 block mb-2">가게 요청사항</label>
                  <input
                    type="text"
                    placeholder="예: 젓가락 많이 주세요"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    className="w-full p-4 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">배달 요청사항</label>
                  <input
                    type="text"
                    placeholder="예: 문 앞에 놓아주세요"
                    value={riderMessage}
                    onChange={(e) => setRiderMessage(e.target.value)}
                    className="w-full p-4 border rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* 결제 수단 */}
            <div className="bg-white mt-2 p-4 md:rounded-xl">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-orange-500" />
                결제 수단
              </h3>

              <div className="space-y-2">
                {/* 카드 결제 */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-4 border rounded-xl flex items-center justify-between ${
                    paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                    <span>카드 결제</span>
                  </div>
                  {paymentMethod === 'card' && <CheckCircle className="w-6 h-6 text-orange-500" />}
                </button>

                {/* 만나서 결제 */}
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full p-4 border rounded-xl flex items-center justify-between ${
                    paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-6 h-6 text-gray-600" />
                    <span>만나서 현금결제</span>
                  </div>
                  {paymentMethod === 'cash' && <CheckCircle className="w-6 h-6 text-orange-500" />}
                </button>

                {/* 계좌이체 */}
                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`w-full p-4 border rounded-xl flex items-center justify-between ${
                    paymentMethod === 'transfer' ? 'border-orange-500 bg-orange-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <span>계좌이체</span>
                  </div>
                  {paymentMethod === 'transfer' && (
                    <CheckCircle className="w-6 h-6 text-orange-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽: 주문 내역 및 결제 금액 (PC에서 사이드바) */}
          <div className="md:w-96 md:flex-shrink-0">
            {/* 주문 내역 */}
            <div className="bg-white mt-2 md:mt-0 p-4 md:rounded-xl">
              <h3 className="font-bold mb-4">주문 내역</h3>

              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <span className="font-medium">{item.menu.name}</span>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-sm text-gray-500">
                          {item.selectedOptions.map((opt) => opt.name).join(', ')}
                        </p>
                      )}
                      <span className="text-sm text-gray-500"> x {item.quantity}</span>
                    </div>
                    <span>{calculateItemPrice(item).toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 결제 금액 */}
            <div className="bg-white mt-2 p-4 md:rounded-xl md:sticky md:top-20">
              <h3 className="font-bold mb-4">결제 금액</h3>

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

              {/* PC용 결제 버튼 */}
              <div className="hidden md:block mt-6">
                <p className="text-sm text-gray-500 mb-4">
                  주문 내용을 확인하였으며, 정보 제공 등에 동의합니다.
                </p>
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting || !deliveryAddress || !phone}
                  className={`w-full py-4 rounded-xl font-bold text-lg ${
                    submitting || !deliveryAddress || !phone
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-orange-500 text-white'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      주문 처리중...
                    </span>
                  ) : (
                    `${totalAmount.toLocaleString()}원 결제하기`
                  )}
                </button>
              </div>
            </div>

            {/* 동의 안내 (모바일) */}
            <div className="p-4 text-sm text-gray-500 md:hidden">
              <p>주문 내용을 확인하였으며, 정보 제공 등에 동의합니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 결제 버튼 (모바일 전용) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-bottom md:hidden">
        <div className="container-1200">
          <button
            onClick={handleSubmitOrder}
            disabled={submitting || !deliveryAddress || !phone}
            className={`w-full py-4 rounded-xl font-bold text-lg ${
              submitting || !deliveryAddress || !phone
                ? 'bg-gray-200 text-gray-400'
                : 'bg-orange-500 text-white'
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                주문 처리중...
              </span>
            ) : (
              `${totalAmount.toLocaleString()}원 결제하기`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
