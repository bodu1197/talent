'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Store,
  FileText,
  CheckCircle2,
  Upload,
  Search,
  MapPin,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { FoodStoreCategory, FOOD_CATEGORY_LABELS, FOOD_CATEGORY_ICONS } from '@/types/food';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// Daum Postcode 결과 타입
interface DaumPostcodeResult {
  address: string;
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  sido: string;
  sigungu: string;
  bname: string;
}

// 메뉴 아이템 타입
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

// 메뉴 카테고리 타입
interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

// 카테고리 목록
const CATEGORIES: FoodStoreCategory[] = [
  'korean',
  'chinese',
  'japanese',
  'western',
  'chicken',
  'pizza',
  'burger',
  'snack',
  'cafe',
  'asian',
  'lunchbox',
  'nightfood',
  'etc',
];

// 고유 ID 생성 (crypto.randomUUID 사용)
const generateId = () => crypto.randomUUID().slice(0, 9);

// 메뉴 카테고리 상태 업데이트 헬퍼 함수들 (컴포넌트 외부로 분리하여 중첩 수준 감소)
const updateMenuItemInCategory = (
  categories: MenuCategory[],
  categoryId: string,
  itemId: string,
  updateFn: (item: MenuItem) => MenuItem
): MenuCategory[] => {
  return categories.map((cat) => {
    if (cat.id !== categoryId) return cat;
    return {
      ...cat,
      items: cat.items.map((item) => (item.id === itemId ? updateFn(item) : item)),
    };
  });
};

const addItemToCategory = (
  categories: MenuCategory[],
  categoryId: string,
  newItem: MenuItem
): MenuCategory[] => {
  return categories.map((cat) => {
    if (cat.id !== categoryId) return cat;
    return { ...cat, items: [...cat.items, newItem] };
  });
};

const removeItemFromCategory = (
  categories: MenuCategory[],
  categoryId: string,
  itemId: string
): MenuCategory[] => {
  return categories.map((cat) => {
    if (cat.id !== categoryId) return cat;
    return { ...cat, items: cat.items.filter((item) => item.id !== itemId) };
  });
};

export default function FoodPartnerRegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  // 인증 상태
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPostcodeLoaded, setIsPostcodeLoaded] = useState(false);

  // 인증 체크
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        router.push('/auth/login?redirect=/food/partner/register');
      }
    };
    checkAuth();
  }, [supabase, router]);

  // Daum Postcode 스크립트 로드
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).daum) {
      setIsPostcodeLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => setIsPostcodeLoaded(true);
    document.head.appendChild(script);
  }, []);

  // 폼 상태 (5단계로 확장)
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // 기본 정보
    name: '',
    description: '',
    category: '' as FoodStoreCategory | '',
    phone: '',

    // 주소
    address: '',
    addressDetail: '',
    latitude: null as number | null,
    longitude: null as number | null,

    // 영업 정보
    minOrderAmount: 10000,
    deliveryFee: 3000,
    estimatedPrepTime: 30,

    // 사업자 정보
    businessNumber: '',
    businessName: '',
    businessDocumentUrl: '',

    // 이미지
    logoUrl: '',
    bannerUrl: '',
  });

  // 메뉴 카테고리 상태
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([
    { id: generateId(), name: '인기 메뉴', items: [] },
  ]);

  // 약관 동의 상태
  const [agreements, setAgreements] = useState({
    terms: false,
    fee: false,
  });

  // 입력 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 주소 검색 (다음 주소 API + 서버 좌표 변환)
  const handleAddressSearch = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const daum = (window as any).daum;
    if (!isPostcodeLoaded || !daum) return;

    new daum.Postcode({
      oncomplete: async (data: DaumPostcodeResult) => {
        const address = data.roadAddress || data.jibunAddress || data.address;
        setFormData((prev) => ({ ...prev, address }));

        // 서버 API를 통해 좌표 변환 (CORS 문제 없음)
        try {
          const response = await fetch('/api/address/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.latitude && result.longitude) {
              setFormData((prev) => ({
                ...prev,
                latitude: result.latitude,
                longitude: result.longitude,
              }));
            }
          }
        } catch (error) {
          console.error('좌표 변환 실패:', error);
        }
      },
    }).open();
  };

  // 파일 업로드
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'bannerUrl' | 'businessDocumentUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // 사업자등록증은 비공개 버킷, 나머지는 공개 버킷
    const bucket = field === 'businessDocumentUrl' ? 'business-documents' : 'food-stores';
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${field}_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      console.error('파일 업로드 실패:', error);
      alert('파일 업로드에 실패했습니다. 다시 시도해주세요.');
      return;
    }

    // 사업자등록증은 파일명만 저장 (비공개), 나머지는 공개 URL
    if (field === 'businessDocumentUrl') {
      setFormData((prev) => ({ ...prev, [field]: fileName }));
    } else {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, [field]: urlData.publicUrl }));
    }
  };

  // 메뉴 이미지 업로드
  const handleMenuImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    categoryId: string,
    itemId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/menu_${itemId}_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from('food-stores').upload(fileName, file, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      console.error('메뉴 이미지 업로드 실패:', error);
      return;
    }

    const { data: urlData } = supabase.storage.from('food-stores').getPublicUrl(fileName);

    setMenuCategories((prev) =>
      updateMenuItemInCategory(prev, categoryId, itemId, (item) => ({
        ...item,
        imageUrl: urlData.publicUrl,
      }))
    );
  };

  // 메뉴 카테고리 추가
  const addMenuCategory = () => {
    setMenuCategories((prev) => [...prev, { id: generateId(), name: '', items: [] }]);
  };

  // 메뉴 카테고리 삭제
  const removeMenuCategory = (categoryId: string) => {
    if (menuCategories.length <= 1) {
      alert('최소 1개의 카테고리가 필요합니다.');
      return;
    }
    setMenuCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  };

  // 메뉴 카테고리 이름 변경
  const updateCategoryName = (categoryId: string, name: string) => {
    setMenuCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, name } : cat))
    );
  };

  // 메뉴 아이템 추가
  const addMenuItem = (categoryId: string) => {
    const newItem: MenuItem = {
      id: generateId(),
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
    };
    setMenuCategories((prev) => addItemToCategory(prev, categoryId, newItem));
  };

  // 메뉴 아이템 삭제
  const removeMenuItem = (categoryId: string, itemId: string) => {
    setMenuCategories((prev) => removeItemFromCategory(prev, categoryId, itemId));
  };

  // 메뉴 아이템 업데이트
  const updateMenuItem = (
    categoryId: string,
    itemId: string,
    field: keyof MenuItem,
    value: string | number
  ) => {
    setMenuCategories((prev) =>
      updateMenuItemInCategory(prev, categoryId, itemId, (item) => ({
        ...item,
        [field]: value,
      }))
    );
  };

  // 메뉴 개수 계산
  const totalMenuCount = menuCategories.reduce((sum, cat) => sum + cat.items.length, 0);

  // 메뉴 카테고리 및 아이템 등록 (별도 함수로 분리하여 복잡도 감소)
  const registerMenuCategoriesAndItems = async (storeId: string) => {
    for (let catIndex = 0; catIndex < menuCategories.length; catIndex++) {
      const category = menuCategories[catIndex];

      const { data: catData, error: catError } = await supabase
        .from('food_menu_categories')
        .insert({
          store_id: storeId,
          name: category.name || `카테고리 ${catIndex + 1}`,
          sort_order: catIndex,
        })
        .select()
        .single();

      if (catError) {
        console.error('카테고리 등록 실패:', catError);
        continue;
      }

      await registerMenuItems(storeId, catData.id, category.items, catIndex === 0);
    }
  };

  // 개별 메뉴 아이템 등록
  const registerMenuItems = async (
    storeId: string,
    categoryId: string,
    items: MenuItem[],
    isPopularCategory: boolean
  ) => {
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex];
      if (!item.name || item.price <= 0) continue;

      const { error: menuError } = await supabase.from('food_menus').insert({
        store_id: storeId,
        category_id: categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.imageUrl,
        sort_order: itemIndex,
        is_available: true,
        is_popular: isPopularCategory,
      });

      if (menuError) {
        console.error('메뉴 등록 실패:', menuError);
      }
    }
  };

  // 폼 제출 (store + categories + menus 한번에)
  const handleSubmit = async () => {
    if (!user) {
      alert('로그인이 필요합니다');
      router.push('/auth/login');
      return;
    }

    if (totalMenuCount === 0) {
      alert('최소 1개의 메뉴를 등록해주세요.');
      setStep(3);
      return;
    }

    if (!agreements.terms || !agreements.fee) {
      alert('모든 약관에 동의해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: storeData, error: storeError } = await supabase
        .from('food_stores')
        .insert({
          owner_id: user.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          phone: formData.phone,
          address: formData.address,
          detail_address: formData.addressDetail,
          latitude: formData.latitude,
          longitude: formData.longitude,
          min_order_amount: formData.minOrderAmount,
          delivery_fee: formData.deliveryFee,
          estimated_prep_time: formData.estimatedPrepTime,
          business_number: formData.businessNumber,
          business_name: formData.businessName,
          business_document_url: formData.businessDocumentUrl,
          thumbnail_url: formData.logoUrl,
          banner_url: formData.bannerUrl,
          is_open: false,
          is_verified: false,
          is_active: false,
        })
        .select()
        .single();

      if (storeError) throw storeError;

      await registerMenuCategoriesAndItems(storeData.id);
      setStep(5);
    } catch (error) {
      console.error('입점 신청 실패:', error);
      alert('입점 신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그인 체크
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-500 mb-6">입점 신청을 하려면 먼저 로그인해주세요</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container-1200 flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold">입점 신청</h1>
          <div className="w-9" />
        </div>

        {/* 진행 단계 (5단계) */}
        {step < 5 && (
          <div className="container-1200 px-4 pb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-1 rounded-full ${
                    s <= step ? 'bg-brand-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className={step >= 1 ? 'text-brand-primary font-medium' : ''}>가게 정보</span>
              <span className={step >= 2 ? 'text-brand-primary font-medium' : ''}>영업 정보</span>
              <span className={step >= 3 ? 'text-brand-primary font-medium' : ''}>메뉴 등록</span>
              <span className={step >= 4 ? 'text-brand-primary font-medium' : ''}>사업자 인증</span>
            </div>
          </div>
        )}
      </header>

      {/* 메인 콘텐츠 */}
      <div className="container-1200 md:py-8 pb-24">
        <div className="md:max-w-2xl md:mx-auto">
          {/* Step 1: 가게 정보 */}
          {step === 1 && (
            <div className="p-4 md:bg-white md:rounded-2xl md:shadow-sm space-y-6">
              {/* 가게명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가게명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="예: 맛있는 치킨집"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  업종 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                      className={`flex flex-col items-center p-3 rounded-xl border transition-colors ${
                        formData.category === cat
                          ? 'border-brand-primary bg-brand-primary/5'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="text-2xl mb-1">{FOOD_CATEGORY_ICONS[cat]}</span>
                      <span className="text-xs">{FOOD_CATEGORY_LABELS[cat]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 전화번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가게 전화번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="02-1234-5678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가게 주소 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={handleAddressSearch}
                    disabled={!isPostcodeLoaded}
                    className={`flex-1 flex items-center gap-2 px-4 py-3 border rounded-xl text-left transition-colors ${
                      formData.address
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-gray-300 hover:border-brand-primary hover:bg-gray-50'
                    } ${!isPostcodeLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {formData.address ? (
                      <>
                        <MapPin className="w-5 h-5 text-brand-primary flex-shrink-0" />
                        <span className="text-gray-900 truncate">{formData.address}</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-500">주소를 검색하세요</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  name="addressDetail"
                  value={formData.addressDetail}
                  onChange={handleChange}
                  placeholder="상세 주소 (예: 2층, 101호)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              {/* 가게 소개 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">가게 소개</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="가게를 소개해주세요"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                />
              </div>

              {/* 다음 버튼 */}
              <button
                onClick={() => setStep(2)}
                disabled={
                  !formData.name || !formData.category || !formData.phone || !formData.address
                }
                className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          )}

          {/* Step 2: 영업 정보 */}
          {step === 2 && (
            <div className="p-4 md:bg-white md:rounded-2xl md:shadow-sm space-y-6">
              {/* 최소 주문 금액 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최소 주문 금액
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    원
                  </span>
                </div>
              </div>

              {/* 배달비 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  배달비 (라이더에게 지급)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="deliveryFee"
                    value={formData.deliveryFee}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    원
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  * 배달비는 고객이 결제하며, 라이더에게 지급됩니다
                </p>
              </div>

              {/* 예상 조리 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  평균 조리 시간
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="estimatedPrepTime"
                    value={formData.estimatedPrepTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    분
                  </span>
                </div>
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">가게 로고</label>
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logoUrl')}
                    className="hidden"
                  />
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="로고" className="h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">로고 이미지 업로드</p>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가게 배너 (메인 이미지)
                </label>
                <label className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'bannerUrl')}
                    className="hidden"
                  />
                  {formData.bannerUrl ? (
                    <img
                      src={formData.bannerUrl}
                      alt="배너"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">배너 이미지 업로드</p>
                      <p className="text-xs text-gray-400 mt-1">권장: 800x400px</p>
                    </div>
                  )}
                </label>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border border-gray-300 rounded-xl font-medium"
                >
                  이전
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-brand-primary text-white rounded-xl font-bold"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 메뉴 등록 */}
          {step === 3 && (
            <div className="p-4 md:bg-white md:rounded-2xl md:shadow-sm space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>메뉴를 미리 등록해두세요!</strong>
                  <br />
                  승인 후 바로 영업을 시작할 수 있습니다.
                </p>
              </div>

              {/* 메뉴 카테고리 목록 */}
              {menuCategories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* 카테고리 헤더 */}
                  <div className="bg-gray-50 p-4 flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateCategoryName(category.id, e.target.value)}
                      placeholder="카테고리 이름 (예: 인기 메뉴, 치킨, 사이드)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                    <button
                      onClick={() => removeMenuCategory(category.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 메뉴 아이템 목록 */}
                  <div className="p-4 space-y-4">
                    {category.items.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                        {/* 메뉴 이미지 */}
                        <label className="w-20 h-20 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 flex items-center justify-center overflow-hidden">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMenuImageUpload(e, category.id, item.id)}
                            className="hidden"
                          />
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Upload className="w-6 h-6 text-gray-400" />
                          )}
                        </label>

                        {/* 메뉴 정보 */}
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateMenuItem(category.id, item.id, 'name', e.target.value)
                            }
                            placeholder="메뉴 이름"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                          />
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              updateMenuItem(category.id, item.id, 'description', e.target.value)
                            }
                            placeholder="메뉴 설명 (선택)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={item.price || ''}
                              onChange={(e) =>
                                updateMenuItem(
                                  category.id,
                                  item.id,
                                  'price',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder="가격"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                            />
                            <span className="text-gray-500 text-sm">원</span>
                            <button
                              onClick={() => removeMenuItem(category.id, item.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 메뉴 추가 버튼 */}
                    <button
                      onClick={() => addMenuItem(category.id)}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-brand-primary hover:text-brand-primary flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      메뉴 추가
                    </button>
                  </div>
                </div>
              ))}

              {/* 카테고리 추가 버튼 */}
              <button
                onClick={addMenuCategory}
                className="w-full py-4 border-2 border-dashed border-brand-primary rounded-xl text-brand-primary font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                카테고리 추가
              </button>

              {/* 메뉴 개수 표시 */}
              <div className="text-center text-sm text-gray-500">
                총 {totalMenuCount}개 메뉴 등록됨
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 border border-gray-300 rounded-xl font-medium"
                >
                  이전
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={totalMenuCount === 0}
                  className="flex-1 py-4 bg-brand-primary text-white rounded-xl font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  다음 ({totalMenuCount}개 메뉴)
                </button>
              </div>
            </div>
          )}

          {/* Step 4: 사업자 인증 */}
          {step === 4 && (
            <div className="p-4 md:bg-white md:rounded-2xl md:shadow-sm space-y-6">
              {/* 안내 */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-800">
                  <strong>돌파구는 건당 300원만 받습니다!</strong>
                  <br />
                  배달앱 수수료 15~30%와 비교해보세요.
                </p>
              </div>

              {/* 사업자등록번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사업자등록번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleChange}
                  placeholder="000-00-00000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              {/* 상호명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상호명 (사업자등록증 기준) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="사업자등록증에 기재된 상호명"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              {/* 사업자등록증 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사업자등록증 <span className="text-red-500">*</span>
                </label>
                <label className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'businessDocumentUrl')}
                    className="hidden"
                  />
                  {formData.businessDocumentUrl ? (
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-green-600">업로드 완료</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">사업자등록증 업로드</p>
                      <p className="text-xs text-gray-400 mt-1">이미지 또는 PDF 파일</p>
                    </div>
                  )}
                </label>
              </div>

              {/* 약관 동의 */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={(e) =>
                      setAgreements((prev) => ({ ...prev, terms: e.target.checked }))
                    }
                    className="mt-1 w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    <Link href="/terms/partner" className="text-brand-primary underline">
                      파트너 업무위수탁 약관
                    </Link>
                    에 동의합니다
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreements.fee}
                    onChange={(e) => setAgreements((prev) => ({ ...prev, fee: e.target.checked }))}
                    className="mt-1 w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    건당 300원의 플랫폼 이용료에 동의합니다
                  </span>
                </label>
              </div>

              {/* 등록 요약 */}
              <div className="bg-gray-100 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-2">등록 요약</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>가게명: {formData.name}</p>
                  <p>업종: {formData.category && FOOD_CATEGORY_LABELS[formData.category]}</p>
                  <p>등록 메뉴: {totalMenuCount}개</p>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 border border-gray-300 rounded-xl font-medium"
                >
                  이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    !formData.businessNumber ||
                    !formData.businessName ||
                    !formData.businessDocumentUrl ||
                    !agreements.terms ||
                    !agreements.fee ||
                    isSubmitting
                  }
                  className="flex-1 py-4 bg-brand-primary text-white rounded-xl font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '신청 중...' : '입점 신청'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: 완료 */}
          {step === 5 && (
            <div className="p-4 md:bg-white md:rounded-2xl md:shadow-sm flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">입점 신청 완료!</h2>
              <p className="text-gray-500 mb-2">
                가게 정보와 {totalMenuCount}개의 메뉴가 등록되었습니다.
              </p>
              <p className="text-gray-500 mb-8">
                심사 후 승인되면 바로 영업을 시작할 수 있습니다.
                <br />
                보통 1-2 영업일 내에 처리됩니다.
              </p>
              <div className="space-y-3 w-full max-w-xs">
                <Link
                  href="/food/partner"
                  className="block w-full py-4 bg-brand-primary text-white rounded-xl font-bold text-center"
                >
                  사장님 페이지로 이동
                </Link>
                <Link
                  href="/food"
                  className="block w-full py-4 border border-gray-300 rounded-xl font-medium text-center"
                >
                  홈으로 돌아가기
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
