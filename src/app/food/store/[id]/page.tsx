'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, Clock, Heart, Share2, Minus, Plus, X } from 'lucide-react';
import {
  FoodStore,
  FoodMenu,
  FoodMenuCategory,
  FoodMenuOptionGroup,
  FOOD_CATEGORY_ICONS,
  FOOD_CATEGORY_LABELS,
} from '@/types/food';
import { createClient } from '@/lib/supabase/client';

interface MenuWithOptions extends FoodMenu {
  option_groups: (FoodMenuOptionGroup & {
    items: { id: string; name: string; price: number; is_sold_out: boolean }[];
  })[];
}

// 장바구니 아이템 타입 (로컬)
interface LocalCartItem {
  menu_id: string;
  name: string;
  price: number;
  quantity: number;
  options: {
    group_name: string;
    items: { name: string; price: number }[];
  }[];
  total_price: number;
}

export default function FoodStorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: storeId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  // 상태
  const [store, setStore] = useState<FoodStore | null>(null);
  const [menuCategories, setMenuCategories] = useState<FoodMenuCategory[]>([]);
  const [menus, setMenus] = useState<MenuWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'info' | 'review'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // 장바구니 상태
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuWithOptions | null>(null);
  const [menuQuantity, setMenuQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 음식점 정보
      const { data: storeData } = await supabase
        .from('food_stores')
        .select('*')
        .eq('id', storeId)
        .single();

      if (storeData) {
        setStore(storeData as FoodStore);
      }

      // 메뉴 카테고리
      const { data: categoryData } = await supabase
        .from('food_menu_categories')
        .select('*')
        .eq('store_id', storeId)
        .order('sort_order');

      if (categoryData) {
        setMenuCategories(categoryData as FoodMenuCategory[]);
      }

      // 메뉴 + 옵션
      const { data: menuData } = await supabase
        .from('food_menus')
        .select(
          `
          *,
          option_groups:food_menu_option_groups(
            *,
            items:food_menu_option_items(*)
          )
        `
        )
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('sort_order');

      if (menuData) {
        setMenus(menuData as MenuWithOptions[]);
      }

      // 로컬 장바구니 로드
      const savedCart = localStorage.getItem(`food_cart_${storeId}`);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      setLoading(false);
    };

    fetchData();
  }, [storeId]);

  // 장바구니 저장
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem(`food_cart_${storeId}`, JSON.stringify(cart));
    } else {
      localStorage.removeItem(`food_cart_${storeId}`);
    }
  }, [cart, storeId]);

  // 메뉴 선택 (바텀시트 열기)
  const openMenuSheet = (menu: MenuWithOptions) => {
    if (menu.is_sold_out) return;
    setSelectedMenu(menu);
    setMenuQuantity(1);
    setSelectedOptions({});
  };

  // 옵션 선택
  const toggleOption = (groupId: string, itemId: string, maxSelect: number) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];

      if (current.includes(itemId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== itemId) };
      }

      if (maxSelect === 1) {
        return { ...prev, [groupId]: [itemId] };
      }

      if (current.length < maxSelect) {
        return { ...prev, [groupId]: [...current, itemId] };
      }

      return prev;
    });
  };

  // 장바구니에 추가
  const addToCart = () => {
    if (!selectedMenu) return;

    // 필수 옵션 체크
    const requiredGroups = selectedMenu.option_groups.filter((g) => g.is_required);
    for (const group of requiredGroups) {
      if (!selectedOptions[group.id] || selectedOptions[group.id].length === 0) {
        alert(`${group.name}을(를) 선택해주세요`);
        return;
      }
    }

    // 옵션 가격 계산
    let optionPrice = 0;
    const options: LocalCartItem['options'] = [];

    for (const group of selectedMenu.option_groups) {
      const selectedItems = selectedOptions[group.id] || [];
      if (selectedItems.length > 0) {
        const items = group.items
          .filter((item) => selectedItems.includes(item.id))
          .map((item) => {
            optionPrice += item.price;
            return { name: item.name, price: item.price };
          });
        options.push({ group_name: group.name, items });
      }
    }

    const price = selectedMenu.sale_price || selectedMenu.price;
    const totalPrice = (price + optionPrice) * menuQuantity;

    const newItem: LocalCartItem = {
      menu_id: selectedMenu.id,
      name: selectedMenu.name,
      price: price,
      quantity: menuQuantity,
      options,
      total_price: totalPrice,
    };

    setCart((prev) => [...prev, newItem]);
    setSelectedMenu(null);
  };

  // 장바구니 총액
  const cartTotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 카테고리별 메뉴 필터
  const filteredMenus = selectedCategory
    ? menus.filter((m) => m.category_id === selectedCategory)
    : menus;

  // 인기 메뉴
  const popularMenus = menus.filter((m) => m.is_popular);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="h-56 bg-gray-200" />
        <div className="p-4 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">음식점을 찾을 수 없습니다</p>
          <button onClick={() => router.back()} className="mt-4 text-brand-primary">
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="container-1200">
        {/* 헤더 이미지 */}
        <div className="relative h-56 md:h-72 lg:h-80 bg-gray-200 md:rounded-b-2xl md:overflow-hidden">
          {store.banner_url ? (
            <Image src={store.banner_url} alt={store.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
              <span className="text-7xl">{FOOD_CATEGORY_ICONS[store.category]}</span>
            </div>
          )}

          {/* 상단 버튼들 */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </button>
              <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* 영업 상태 */}
          {!store.is_open && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-6 py-3 rounded-full text-lg font-semibold">
                현재 준비 중입니다
              </span>
            </div>
          )}
        </div>

        {/* 음식점 정보 */}
        <div className="bg-white px-4 py-5 border-b border-gray-100">
          <div className="flex items-start gap-3">
            {store.logo_url && (
              <Image
                src={store.logo_url}
                alt={store.name}
                width={56}
                height={56}
                className="rounded-xl"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded">
                  {FOOD_CATEGORY_LABELS[store.category]}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-0.5 font-semibold text-gray-900">
                    {store.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500">리뷰 {store.review_count}</span>
              </div>
            </div>
          </div>

          {/* 배달 정보 */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {store.estimated_prep_time}~{store.estimated_prep_time + 10}분
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>최소주문</span>
              <span className="font-medium">{store.min_order_amount.toLocaleString()}원</span>
            </div>
            <div className="flex items-center gap-1">
              <span>배달비</span>
              <span className="font-medium">{store.delivery_fee.toLocaleString()}원</span>
            </div>
          </div>

          {store.description && <p className="mt-3 text-sm text-gray-500">{store.description}</p>}
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white sticky top-0 z-40 border-b border-gray-200">
          <div className="flex">
            {(['menu', 'info', 'review'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'text-brand-primary border-brand-primary'
                    : 'text-gray-500 border-transparent'
                }`}
              >
                {{ menu: '메뉴', info: '정보', review: '리뷰' }[tab]}
              </button>
            ))}
          </div>
        </div>

        {/* 메뉴 탭 */}
        {activeTab === 'menu' && (
          <div>
            {/* 메뉴 카테고리 */}
            {menuCategories.length > 0 && (
              <div className="bg-white px-4 py-3 border-b border-gray-100 overflow-x-auto">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === null
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    전체
                  </button>
                  {menuCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 인기 메뉴 */}
            {!selectedCategory && popularMenus.length > 0 && (
              <div className="bg-white mt-2 px-4 py-4">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  인기 메뉴
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {popularMenus.map((menu) => (
                    <MenuCard key={menu.id} menu={menu} onClick={() => openMenuSheet(menu)} />
                  ))}
                </div>
              </div>
            )}

            {/* 전체 메뉴 */}
            <div className="bg-white mt-2 px-4 py-4">
              {!selectedCategory && popularMenus.length > 0 && (
                <h2 className="font-bold text-gray-900 mb-3">전체 메뉴</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredMenus.map((menu) => (
                  <MenuCard key={menu.id} menu={menu} onClick={() => openMenuSheet(menu)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 정보 탭 */}
        {activeTab === 'info' && (
          <div className="bg-white mt-2 px-4 py-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">영업시간</h3>
              <p className="text-sm text-gray-600">
                매일{' '}
                {(store.business_hours as Record<string, { open: string; close: string } | null>)
                  .mon?.open || '09:00'}{' '}
                -{' '}
                {(store.business_hours as Record<string, { open: string; close: string } | null>)
                  .mon?.close || '21:00'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">주소</h3>
              <p className="text-sm text-gray-600">{store.address}</p>
              {store.detail_address && (
                <p className="text-sm text-gray-500">{store.detail_address}</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">전화번호</h3>
              <a href={`tel:${store.phone}`} className="text-sm text-brand-primary">
                {store.phone}
              </a>
            </div>
          </div>
        )}

        {/* 리뷰 탭 */}
        {activeTab === 'review' && (
          <div className="bg-white mt-2 px-4 py-8 text-center">
            <p className="text-gray-500">아직 리뷰가 없습니다</p>
          </div>
        )}

        {/* 장바구니 바 */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
            <div className="container-1200">
              <Link
                href={`/food/cart?store=${storeId}`}
                className="flex items-center justify-between bg-brand-primary text-white rounded-xl px-5 py-4 max-w-xl md:mx-auto"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full px-2.5 py-1 text-sm font-semibold">
                    {cartCount}
                  </div>
                  <span className="font-medium">장바구니 보기</span>
                </div>
                <span className="font-bold">{cartTotal.toLocaleString()}원</span>
              </Link>
            </div>
          </div>
        )}
      </div>
      {/* container-1200 닫기 */}

      {/* 메뉴 옵션 바텀시트 */}
      {selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedMenu(null)} />
          <div className="relative w-full md:w-[500px] md:max-w-[90vw] bg-white rounded-t-3xl md:rounded-2xl max-h-[85vh] overflow-y-auto safe-area-bottom">
            {/* 헤더 */}
            <div className="sticky top-0 bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg">{selectedMenu.name}</h2>
              <button
                onClick={() => setSelectedMenu(null)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 메뉴 이미지 & 설명 */}
            <div className="p-4">
              {selectedMenu.image_url && (
                <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                  <Image
                    src={selectedMenu.image_url}
                    alt={selectedMenu.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {selectedMenu.description && (
                <p className="text-sm text-gray-600 mb-2">{selectedMenu.description}</p>
              )}
              <div className="flex items-center gap-2">
                {selectedMenu.sale_price ? (
                  <>
                    <span className="text-lg font-bold">
                      {selectedMenu.sale_price.toLocaleString()}원
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {selectedMenu.price.toLocaleString()}원
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold">{selectedMenu.price.toLocaleString()}원</span>
                )}
              </div>
            </div>

            {/* 옵션 선택 */}
            {selectedMenu.option_groups.map((group) => (
              <div key={group.id} className="px-4 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">
                    {group.name}
                    {group.is_required && <span className="ml-2 text-xs text-red-500">필수</span>}
                  </h3>
                  {group.max_select > 1 && (
                    <span className="text-xs text-gray-500">최대 {group.max_select}개</span>
                  )}
                </div>
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const isSelected = (selectedOptions[group.id] || []).includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleOption(group.id, item.id, group.max_select)}
                        disabled={item.is_sold_out}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                          isSelected ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200'
                        } ${item.is_sold_out ? 'opacity-50' : ''}`}
                      >
                        <span className={isSelected ? 'font-medium' : ''}>
                          {item.name}
                          {item.is_sold_out && (
                            <span className="ml-2 text-xs text-red-500">품절</span>
                          )}
                        </span>
                        {item.price > 0 && (
                          <span className="text-sm text-gray-600">
                            +{item.price.toLocaleString()}원
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* 수량 선택 */}
            <div className="px-4 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="font-semibold">수량</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setMenuQuantity(Math.max(1, menuQuantity - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-lg w-8 text-center">{menuQuantity}</span>
                  <button
                    onClick={() => setMenuQuantity(menuQuantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 담기 버튼 */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={addToCart}
                className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold text-lg"
              >
                {(() => {
                  let optionPrice = 0;
                  for (const group of selectedMenu.option_groups) {
                    const selectedItems = selectedOptions[group.id] || [];
                    for (const itemId of selectedItems) {
                      const item = group.items.find((i) => i.id === itemId);
                      if (item) optionPrice += item.price;
                    }
                  }
                  const price = selectedMenu.sale_price || selectedMenu.price;
                  const total = (price + optionPrice) * menuQuantity;
                  return `${total.toLocaleString()}원 담기`;
                })()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 메뉴 카드 컴포넌트
function MenuCard({ menu, onClick }: { menu: MenuWithOptions; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={menu.is_sold_out}
      className={`w-full flex gap-4 p-3 rounded-xl border border-gray-100 text-left hover:bg-gray-50 transition-colors ${
        menu.is_sold_out ? 'opacity-60' : ''
      }`}
    >
      {/* 이미지 */}
      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        {menu.image_url ? (
          <Image src={menu.image_url} alt={menu.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
        )}
        {menu.is_sold_out && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">품절</span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 truncate">{menu.name}</h3>
          {menu.is_popular && (
            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">인기</span>
          )}
          {menu.is_new && (
            <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-600 rounded">NEW</span>
          )}
        </div>
        {menu.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{menu.description}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          {menu.sale_price ? (
            <>
              <span className="font-bold text-gray-900">{menu.sale_price.toLocaleString()}원</span>
              <span className="text-sm text-gray-400 line-through">
                {menu.price.toLocaleString()}원
              </span>
            </>
          ) : (
            <span className="font-bold text-gray-900">{menu.price.toLocaleString()}원</span>
          )}
        </div>
      </div>
    </button>
  );
}
