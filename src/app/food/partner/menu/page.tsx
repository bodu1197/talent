'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
  Store,
  ClipboardList,
  UtensilsCrossed,
  BarChart3,
  Settings,
} from 'lucide-react';
import { FoodStore, FoodMenu, FoodMenuCategory } from '@/types/food';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function FoodPartnerMenuPage() {
  const router = useRouter();
  const supabase = createClient();

  // 인증 상태
  const [user, setUser] = useState<User | null>(null);

  // 상태
  const [store, setStore] = useState<FoodStore | null>(null);
  const [categories, setCategories] = useState<FoodMenuCategory[]>([]);
  const [menus, setMenus] = useState<FoodMenu[]>([]);
  const [loading, setLoading] = useState(true);

  // 모달 상태
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FoodMenuCategory | null>(null);
  const [editingMenu, setEditingMenu] = useState<FoodMenu | null>(null);

  // 폼 상태
  const [categoryName, setCategoryName] = useState('');
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: 0,
    salePrice: null as number | null,
    categoryId: '',
    imageUrl: '',
    isPopular: false,
    isNew: false,
    isSoldOut: false,
  });

  // 인증 체크
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
      if (!currentUser) {
        router.push('/auth/login?redirect=/food/partner/menu');
      }
    };
    checkAuth();
  }, [supabase, router]);

  // 데이터 로드
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // 가게 정보
      const { data: storeData } = await supabase
        .from('food_stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (storeData) {
        setStore(storeData as FoodStore);

        // 카테고리
        const { data: catData } = await supabase
          .from('food_menu_categories')
          .select('*')
          .eq('store_id', storeData.id)
          .order('sort_order');

        if (catData) setCategories(catData as FoodMenuCategory[]);

        // 메뉴
        const { data: menuData } = await supabase
          .from('food_menus')
          .select('*')
          .eq('store_id', storeData.id)
          .order('sort_order');

        if (menuData) setMenus(menuData as FoodMenu[]);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  // 카테고리 저장
  const saveCategory = async () => {
    if (!store || !categoryName.trim()) return;

    if (editingCategory) {
      // 수정
      await supabase
        .from('food_menu_categories')
        .update({ name: categoryName })
        .eq('id', editingCategory.id);
    } else {
      // 추가
      await supabase.from('food_menu_categories').insert({
        store_id: store.id,
        name: categoryName,
        sort_order: categories.length,
      });
    }

    // 새로고침
    const { data } = await supabase
      .from('food_menu_categories')
      .select('*')
      .eq('store_id', store.id)
      .order('sort_order');

    if (data) setCategories(data as FoodMenuCategory[]);

    setShowCategoryModal(false);
    setCategoryName('');
    setEditingCategory(null);
  };

  // 카테고리 삭제
  const deleteCategory = async (id: string) => {
    if (!confirm('카테고리를 삭제하시겠습니까?\n해당 카테고리의 메뉴는 미분류로 변경됩니다.'))
      return;

    await supabase.from('food_menu_categories').delete().eq('id', id);

    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // 메뉴 저장
  const saveMenu = async () => {
    if (!store || !menuForm.name.trim() || menuForm.price <= 0) return;

    const menuData = {
      store_id: store.id,
      name: menuForm.name,
      description: menuForm.description,
      price: menuForm.price,
      sale_price: menuForm.salePrice,
      category_id: menuForm.categoryId || null,
      image_url: menuForm.imageUrl,
      is_popular: menuForm.isPopular,
      is_new: menuForm.isNew,
      is_sold_out: menuForm.isSoldOut,
      is_active: true,
      sort_order: menus.length,
    };

    if (editingMenu) {
      await supabase.from('food_menus').update(menuData).eq('id', editingMenu.id);
    } else {
      await supabase.from('food_menus').insert(menuData);
    }

    // 새로고침
    const { data } = await supabase
      .from('food_menus')
      .select('*')
      .eq('store_id', store.id)
      .order('sort_order');

    if (data) setMenus(data as FoodMenu[]);

    closeMenuModal();
  };

  // 메뉴 삭제
  const deleteMenu = async (id: string) => {
    if (!confirm('메뉴를 삭제하시겠습니까?')) return;

    await supabase.from('food_menus').delete().eq('id', id);
    setMenus((prev) => prev.filter((m) => m.id !== id));
  };

  // 품절 토글
  const toggleSoldOut = async (menu: FoodMenu) => {
    await supabase.from('food_menus').update({ is_sold_out: !menu.is_sold_out }).eq('id', menu.id);

    setMenus((prev) =>
      prev.map((m) => (m.id === menu.id ? { ...m, is_sold_out: !m.is_sold_out } : m))
    );
  };

  // 메뉴 모달 열기
  const openMenuModal = (menu?: FoodMenu) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuForm({
        name: menu.name,
        description: menu.description || '',
        price: menu.price,
        salePrice: menu.sale_price,
        categoryId: menu.category_id || '',
        imageUrl: menu.image_url || '',
        isPopular: menu.is_popular,
        isNew: menu.is_new,
        isSoldOut: menu.is_sold_out,
      });
    } else {
      setEditingMenu(null);
      setMenuForm({
        name: '',
        description: '',
        price: 0,
        salePrice: null,
        categoryId: '',
        imageUrl: '',
        isPopular: false,
        isNew: false,
        isSoldOut: false,
      });
    }
    setShowMenuModal(true);
  };

  // 메뉴 모달 닫기
  const closeMenuModal = () => {
    setShowMenuModal(false);
    setEditingMenu(null);
    setMenuForm({
      name: '',
      description: '',
      price: 0,
      salePrice: null,
      categoryId: '',
      imageUrl: '',
      isPopular: false,
      isNew: false,
      isSoldOut: false,
    });
  };

  // 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/menu_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from('food-stores').upload(fileName, file);

    if (!error) {
      const { data: urlData } = supabase.storage.from('food-stores').getPublicUrl(fileName);

      setMenuForm((prev) => ({ ...prev, imageUrl: urlData.publicUrl }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 animate-pulse">
        <div className="h-14 bg-gray-200" />
        <div className="p-4 space-y-4">
          <div className="h-20 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">가게 정보를 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  // 카테고리별 메뉴 그룹핑
  const menusByCategory = categories.map((cat) => ({
    category: cat,
    menus: menus.filter((m) => m.category_id === cat.id),
  }));

  const uncategorizedMenus = menus.filter((m) => !m.category_id);

  return (
    <div className="min-h-screen bg-gray-100 pb-24 md:pb-6">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-1200 flex items-center justify-between px-4 h-14">
          <h1 className="font-bold text-lg">메뉴 관리</h1>
          <button
            onClick={() => openMenuModal()}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            메뉴 추가
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
            >
              <ClipboardList className="w-5 h-5" />
              주문관리
            </Link>
            <Link
              href="/food/partner/menu"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 text-brand-primary font-medium"
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
          {/* 카테고리 관리 */}
          <section className="bg-white mt-2 md:mt-0 md:rounded-2xl px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">메뉴 카테고리</h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryName('');
                  setShowCategoryModal(true);
                }}
                className="text-sm text-brand-primary font-medium"
              >
                + 추가
              </button>
            </div>

            {categories.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">카테고리를 추가해보세요</p>
            ) : (
              <div className="flex gap-2 overflow-x-auto md:flex-wrap pb-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
                  >
                    <span className="text-sm">{cat.name}</span>
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCategoryName(cat.name);
                        setShowCategoryModal(true);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 메뉴 목록 */}
          <section className="mt-2 md:mt-4">
            {/* 카테고리별 메뉴 */}
            {menusByCategory.map(({ category, menus: catMenus }) => (
              <div key={category.id} className="bg-white mb-2 md:rounded-2xl md:overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold">{category.name}</h3>
                </div>
                {catMenus.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">메뉴가 없습니다</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {catMenus.map((menu) => (
                      <MenuRow
                        key={menu.id}
                        menu={menu}
                        onEdit={() => openMenuModal(menu)}
                        onDelete={() => deleteMenu(menu.id)}
                        onToggleSoldOut={() => toggleSoldOut(menu)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 미분류 메뉴 */}
            {uncategorizedMenus.length > 0 && (
              <div className="bg-white mb-2 md:rounded-2xl md:overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-500">미분류</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {uncategorizedMenus.map((menu) => (
                    <MenuRow
                      key={menu.id}
                      menu={menu}
                      onEdit={() => openMenuModal(menu)}
                      onDelete={() => deleteMenu(menu.id)}
                      onToggleSoldOut={() => toggleSoldOut(menu)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 메뉴 없음 */}
            {menus.length === 0 && (
              <div className="bg-white px-4 py-12 text-center md:rounded-2xl">
                <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">등록된 메뉴가 없습니다</p>
                <button
                  onClick={() => openMenuModal()}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium"
                >
                  첫 메뉴 등록하기
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 카테고리 모달 */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCategoryModal(false)}
          />
          <div className="relative bg-white w-full md:w-[400px] md:max-w-[90vw] rounded-t-3xl md:rounded-2xl p-6 safe-area-bottom">
            <h3 className="font-bold text-lg mb-4">
              {editingCategory ? '카테고리 수정' : '카테고리 추가'}
            </h3>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="카테고리명 (예: 메인메뉴, 사이드)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={saveCategory}
                className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메뉴 모달 */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 hidden md:block" onClick={closeMenuModal} />
          <div className="relative bg-white w-full h-full md:w-[600px] md:h-auto md:max-h-[90vh] md:rounded-2xl overflow-y-auto">
            {/* 헤더 */}
            <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
              <div className="flex items-center justify-between px-4 h-14">
                <button onClick={closeMenuModal}>
                  <X className="w-6 h-6" />
                </button>
                <h2 className="font-bold">{editingMenu ? '메뉴 수정' : '메뉴 추가'}</h2>
                <button onClick={saveMenu} className="text-brand-primary font-semibold">
                  저장
                </button>
              </div>
            </header>

            <div className="p-4 space-y-6 pb-20 md:pb-6">
              {/* 이미지 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메뉴 사진</label>
                <label className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {menuForm.imageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={menuForm.imageUrl}
                        alt="메뉴 사진"
                        fill
                        className="object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setMenuForm((prev) => ({ ...prev, imageUrl: '' }));
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">사진 추가</p>
                    </div>
                  )}
                </label>
              </div>

              {/* 메뉴명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메뉴명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="메뉴명을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메뉴 설명</label>
                <textarea
                  value={menuForm.description}
                  onChange={(e) =>
                    setMenuForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="메뉴를 설명해주세요"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none"
                />
              </div>

              {/* 가격 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가격 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={menuForm.price || ''}
                      onChange={(e) =>
                        setMenuForm((prev) => ({
                          ...prev,
                          price: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      원
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">할인가</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={menuForm.salePrice || ''}
                      onChange={(e) =>
                        setMenuForm((prev) => ({
                          ...prev,
                          salePrice: e.target.value ? parseInt(e.target.value) : null,
                        }))
                      }
                      placeholder="선택"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      원
                    </span>
                  </div>
                </div>
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                <select
                  value={menuForm.categoryId}
                  onChange={(e) => setMenuForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                >
                  <option value="">미분류</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 옵션 */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={menuForm.isPopular}
                    onChange={(e) =>
                      setMenuForm((prev) => ({ ...prev, isPopular: e.target.checked }))
                    }
                    className="w-5 h-5 rounded"
                  />
                  <span>인기 메뉴로 표시</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={menuForm.isNew}
                    onChange={(e) => setMenuForm((prev) => ({ ...prev, isNew: e.target.checked }))}
                    className="w-5 h-5 rounded"
                  />
                  <span>신메뉴로 표시</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={menuForm.isSoldOut}
                    onChange={(e) =>
                      setMenuForm((prev) => ({ ...prev, isSoldOut: e.target.checked }))
                    }
                    className="w-5 h-5 rounded"
                  />
                  <span>품절 처리</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 (모바일 전용) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom md:hidden">
        <div className="container-1200 grid grid-cols-4 h-16">
          <Link
            href="/food/partner"
            className="flex flex-col items-center justify-center text-gray-500"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs mt-1">주문관리</span>
          </Link>
          <Link
            href="/food/partner/menu"
            className="flex flex-col items-center justify-center text-brand-primary"
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

// 메뉴 행 컴포넌트
function MenuRow({
  menu,
  onEdit,
  onDelete,
  onToggleSoldOut,
}: {
  menu: FoodMenu;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSoldOut: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* 이미지 */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        {menu.image_url ? (
          <Image src={menu.image_url} alt={menu.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
        )}
        {menu.is_sold_out && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500">품절</span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <h4 className="font-medium text-gray-900 truncate">{menu.name}</h4>
          {menu.is_popular && (
            <span className="text-xs px-1 py-0.5 bg-red-100 text-red-600 rounded">인기</span>
          )}
          {menu.is_new && (
            <span className="text-xs px-1 py-0.5 bg-green-100 text-green-600 rounded">NEW</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {menu.sale_price ? (
            <>
              <span className="font-semibold">{menu.sale_price.toLocaleString()}원</span>
              <span className="text-sm text-gray-400 line-through">
                {menu.price.toLocaleString()}원
              </span>
            </>
          ) : (
            <span className="font-semibold">{menu.price.toLocaleString()}원</span>
          )}
        </div>
      </div>

      {/* 액션 */}
      <div className="relative">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showActions && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1 min-w-[120px]">
              <button
                onClick={() => {
                  setShowActions(false);
                  onEdit();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                수정
              </button>
              <button
                onClick={() => {
                  setShowActions(false);
                  onToggleSoldOut();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                {menu.is_sold_out ? '품절 해제' : '품절 처리'}
              </button>
              <button
                onClick={() => {
                  setShowActions(false);
                  onDelete();
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
