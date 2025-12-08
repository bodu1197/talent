'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Search, ChevronRight, Star, Clock, Heart, Store, Loader2 } from 'lucide-react';
import {
  FoodStoreCategory,
  FOOD_CATEGORY_LABELS,
  FOOD_CATEGORY_ICONS,
  FoodStore,
  FoodStoreSortOption,
  FOOD_STORE_SORT_LABELS,
} from '@/types/food';
import { createClient } from '@/lib/supabase/client';
import { getCurrentPosition, reverseGeocode } from '@/lib/location/address-api';

// 카테고리 목록
const CATEGORIES: { id: FoodStoreCategory; label: string; icon: string }[] = [
  { id: 'korean', label: '한식', icon: '🍚' },
  { id: 'chinese', label: '중식', icon: '🥟' },
  { id: 'japanese', label: '일식', icon: '🍣' },
  { id: 'chicken', label: '치킨', icon: '🍗' },
  { id: 'pizza', label: '피자', icon: '🍕' },
  { id: 'burger', label: '버거', icon: '🍔' },
  { id: 'snack', label: '분식', icon: '🍜' },
  { id: 'cafe', label: '카페', icon: '☕' },
  { id: 'asian', label: '아시안', icon: '🍛' },
  { id: 'nightfood', label: '야식', icon: '🌙' },
];

export default function FoodMainPage() {
  const router = useRouter();
  const supabase = createClient();

  // 상태
  const [address, setAddress] = useState('');
  const [locationLoading, setLocationLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [stores, setStores] = useState<FoodStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<FoodStoreCategory | null>(null);
  const [sortOption, setSortOption] = useState<FoodStoreSortOption>('distance');
  const [searchQuery, setSearchQuery] = useState('');

  // 위치 가져오기 - 플랫폼의 공통 위치 API 사용
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // 브라우저 위치 가져오기
        const coords = await getCurrentPosition();
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });

        // 서버 API를 통해 역지오코딩 (CORS 문제 없음)
        const result = await reverseGeocode(coords.latitude, coords.longitude);
        if (result) {
          // 간단한 주소 표시 (구/동)
          setAddress(result.region || result.address.split(' ').slice(1, 3).join(' '));
        } else {
          setAddress('현재 위치');
        }
      } catch (error) {
        console.error('위치 가져오기 실패:', error);
        // 위치 권한이 거부되어도 식당 목록은 표시 (거리순 정렬만 비활성화)
        setAddress('');
      } finally {
        setLocationLoading(false);
      }
    };

    fetchLocation();
  }, []);

  // 음식점 목록 조회
  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);

      let query = supabase
        .from('food_stores')
        .select('*')
        .eq('is_verified', true)
        .eq('is_active', true);

      // 카테고리 필터
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      // 정렬
      switch (sortOption) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'review':
          query = query.order('review_count', { ascending: false });
          break;
        case 'order':
          query = query.order('order_count', { ascending: false });
          break;
        case 'delivery':
          query = query.order('estimated_prep_time', { ascending: true });
          break;
        default:
          // 거리순은 클라이언트에서 정렬
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (!error && data) {
        let storeList = data as FoodStore[];

        // 거리 계산 (위치가 있을 경우)
        if (userLocation) {
          storeList = storeList.map((store) => {
            if (store.latitude && store.longitude) {
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                store.latitude,
                store.longitude
              );
              return { ...store, distance };
            }
            return { ...store, distance: 9999999 };
          });

          // 거리순 정렬
          if (sortOption === 'distance') {
            storeList.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          }
        }

        setStores(storeList);
      }

      setLoading(false);
    };

    fetchStores();
  }, [selectedCategory, sortOption, userLocation]);

  // 거리 계산 함수 (Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // 지구 반경 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // 거리 포맷
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/food/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // 주소 표시 렌더링
  const renderAddressDisplay = () => {
    if (locationLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          <span className="text-gray-500">위치 확인 중...</span>
        </>
      );
    }
    if (address) {
      return <span className="font-semibold text-gray-900 truncate">{address}</span>;
    }
    return <span className="text-gray-500">위치를 설정하세요</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 - 주소 & 검색 */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="container-1200">
          {/* 배달 주소 */}
          <div className="px-4 py-3 border-b border-gray-100">
            <button
              onClick={() => router.push('/food/address')}
              className="flex items-center gap-2 text-left w-full max-w-md"
            >
              <MapPin className="w-5 h-5 text-brand-primary flex-shrink-0" />
              {renderAddressDisplay()}
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
            </button>
          </div>

          {/* 검색 바 */}
          <form onSubmit={handleSearch} className="px-4 py-3">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="음식점이나 메뉴를 검색해보세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all"
              />
            </div>
          </form>
        </div>
      </header>

      <div className="container-1200">
        {/* 배너 - 차별화 메시지 */}
        <section className="px-4 py-4">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 md:p-6 text-white">
            <p className="text-xs md:text-sm opacity-90 mb-1">돌파구 동네 배달</p>
            <p className="font-bold text-lg md:text-xl leading-tight">
              배달앱이 30%를 가져갈 때, 우리는 300원만 받습니다
            </p>
            <p className="text-xs md:text-sm mt-2 opacity-80">소상공인과 함께하는 착한 배달</p>
          </div>
        </section>

        {/* 카테고리 - PC에서 그리드 */}
        <section className="px-4 py-2">
          <div className="hidden md:grid md:grid-cols-6 lg:grid-cols-11 gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-primary'
              }`}
            >
              전체
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-primary'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
          {/* 모바일에서 가로 스크롤 */}
          <div className="md:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              전체
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 정렬 옵션 */}
        <section className="px-4 py-2 flex items-center gap-2 flex-wrap">
          {(['distance', 'rating', 'review', 'order'] as FoodStoreSortOption[]).map((option) => (
            <button
              key={option}
              onClick={() => setSortOption(option)}
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                sortOption === option ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {FOOD_STORE_SORT_LABELS[option]}
            </button>
          ))}
        </section>

        {/* 음식점 목록 */}
        <section className="px-4 py-4">
          {/* 로딩 스켈레톤 */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-40 md:h-48 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 빈 상태 */}
          {!loading && stores.length === 0 && (
            <div className="text-center py-16">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">주변에 음식점이 없어요</p>
              <p className="text-sm text-gray-400">다른 위치에서 검색해보세요</p>
            </div>
          )}

          {/* 음식점 카드 리스트 - PC에서 그리드 */}
          {!loading && stores.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store) => (
                <Link
                  key={store.id}
                  href={`/food/store/${store.id}`}
                  className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  {/* 이미지 */}
                  <div className="relative h-40 md:h-48 bg-gray-200">
                    {store.banner_url ? (
                      <Image
                        src={store.banner_url}
                        alt={store.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                        <span className="text-5xl md:text-6xl">
                          {FOOD_CATEGORY_ICONS[store.category]}
                        </span>
                      </div>
                    )}

                    {/* 영업 상태 뱃지 */}
                    {!store.is_open && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold">
                          준비 중
                        </span>
                      </div>
                    )}

                    {/* 찜 버튼 */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // 찜하기 기능 - 추후 구현 예정
                      }}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    >
                      <Heart className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* 정보 */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{store.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm">
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="ml-0.5 font-medium text-gray-900">
                              {store.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-500">리뷰 {store.review_count}</span>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
                        {FOOD_CATEGORY_LABELS[store.category]}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {store.estimated_prep_time}~{store.estimated_prep_time + 10}분
                        </span>
                      </div>
                      {store.distance !== undefined && store.distance < 9999999 && (
                        <>
                          <span className="text-gray-300">·</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{formatDistance(store.distance)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <span className="text-gray-500">
                        최소주문 {store.min_order_amount.toLocaleString()}원
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-500">
                        배달비 {store.delivery_fee.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 사장님 입점 안내 */}
        <section className="px-4 py-6">
          <Link
            href="/food/partner/register"
            className="block bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 md:p-8 text-center hover:border-brand-primary hover:bg-brand-primary/5 transition-colors max-w-2xl mx-auto"
          >
            <Store className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-900 mb-1 text-lg">사장님, 입점하세요!</p>
            <p className="text-sm md:text-base text-gray-500 mb-3">
              건당 300원, 수수료 부담 없이 시작하세요
            </p>
            <span className="inline-flex items-center text-brand-primary text-sm md:text-base font-medium">
              입점 신청하기
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1" />
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}
