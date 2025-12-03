'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { FolderTree } from 'lucide-react';
import {
  ServiceFormData,
  ServiceFormProps,
  ServiceType,
  DeliveryMethod,
} from '@/types/service-form';
import LocationInputSection from '@/components/service/LocationInputSection';
import type { LocationData } from '@/components/service/LocationInputSection';

interface Category {
  id: string;
  name: string;
  slug: string;
  level: number;
  parent_id: string | null;
  service_type?: ServiceType;
}

interface Props extends ServiceFormProps {
  readonly setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>;
}

export default function Step1BasicInfo({ formData, setFormData }: Props) {
  const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  // formData에서 초기값 복원 (뒤로가기 시 유지)
  const [selectedLevel1, setSelectedLevel1] = useState(formData.category_ids?.[0] || '');
  const [selectedLevel2, setSelectedLevel2] = useState(formData.category_ids?.[1] || '');
  const [selectedLevel3, setSelectedLevel3] = useState(formData.category_ids?.[2] || '');
  const [isRestoring, setIsRestoring] = useState(
    !!(formData.category_ids && formData.category_ids.length > 0)
  );

  // 위치 기반 기능용 상태
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(
    formData.service_type || null
  );
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
    formData.delivery_method || 'online'
  );

  // 위치 입력이 필요한지 확인
  const needsLocation =
    selectedServiceType === 'offline' ||
    (selectedServiceType === 'both' && deliveryMethod !== 'online');

  // Load level 1 categories on mount
  useEffect(() => {
    async function fetchLevel1Categories() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, level, parent_id, service_type')
          .eq('is_active', true)
          .eq('level', 1)
          .order('display_order', { ascending: true });

        if (error) {
          logger.error('1차 카테고리 로딩 오류:', error);
        } else {
          setLevel1Categories(data || []);
          // 1차 카테고리만 선택한 경우 복원 완료
          if (isRestoring && formData.category_ids && formData.category_ids.length === 1) {
            setIsRestoring(false);
          }
        }
      } catch (error) {
        logger.error('1차 카테고리 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLevel1Categories();
  }, []);

  // Load level 2 categories when level 1 is selected
  useEffect(() => {
    if (!selectedLevel1) {
      setLevel2Categories([]);
      if (!isRestoring) {
        setSelectedLevel2('');
        setLevel3Categories([]);
        setSelectedLevel3('');
      }
      return;
    }

    async function fetchLevel2Categories() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, level, parent_id')
          .eq('is_active', true)
          .eq('parent_id', selectedLevel1)
          .order('display_order', { ascending: true });

        if (error) {
          logger.error('2차 카테고리 로딩 오류:', error);
        } else {
          setLevel2Categories(data || []);
          // 3차 카테고리가 없는 경우 복원 완료
          if (isRestoring && formData.category_ids && formData.category_ids.length <= 2) {
            setIsRestoring(false);
          }
        }
      } catch (error) {
        logger.error('2차 카테고리 로딩 실패:', error);
      }
    }

    fetchLevel2Categories();
  }, [selectedLevel1, isRestoring]);

  // Load level 3 categories when level 2 is selected
  useEffect(() => {
    if (!selectedLevel2) {
      setLevel3Categories([]);
      if (!isRestoring) {
        setSelectedLevel3('');
      }
      return;
    }

    async function fetchLevel3Categories() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, level, parent_id')
          .eq('is_active', true)
          .eq('parent_id', selectedLevel2)
          .order('display_order', { ascending: true });

        if (error) {
          logger.error('3차 카테고리 로딩 오류:', error);
        } else {
          setLevel3Categories(data || []);
          // 복원 완료 후 플래그 해제
          if (isRestoring) {
            setIsRestoring(false);
          }
        }
      } catch (error) {
        logger.error('3차 카테고리 로딩 실패:', error);
      }
    }

    fetchLevel3Categories();
  }, [selectedLevel2, isRestoring]);

  // Update service_type when level 1 category changes
  useEffect(() => {
    if (isRestoring) return;

    if (selectedLevel1) {
      const selectedCategory = level1Categories.find((c) => c.id === selectedLevel1);
      const serviceType = (selectedCategory?.service_type as ServiceType) || 'online';
      setSelectedServiceType(serviceType);

      // 카테고리 변경 시 위치 관련 상태 초기화
      if (serviceType === 'online') {
        setDeliveryMethod('online');
      }
    } else {
      setSelectedServiceType(null);
      setDeliveryMethod('online');
    }
  }, [selectedLevel1, level1Categories, isRestoring]);

  // Update formData when delivery_method changes
  useEffect(() => {
    if (isRestoring) return;

    setFormData((prev: ServiceFormData) => ({
      ...prev,
      delivery_method: deliveryMethod,
    }));
  }, [deliveryMethod, setFormData, isRestoring]);

  // Update final category when level 3 is selected
  useEffect(() => {
    // 복원 중에는 formData 업데이트하지 않음
    if (isRestoring) return;

    // Always update category_ids with all selected levels to preserve hierarchy
    const categories: string[] = [];
    if (selectedLevel1) categories.push(selectedLevel1);
    if (selectedLevel2) categories.push(selectedLevel2);
    if (selectedLevel3) categories.push(selectedLevel3);

    // Only update if different to avoid infinite loops
    setFormData((prev: ServiceFormData) => {
      const prevIds = prev.category_ids || [];
      const isSame =
        prevIds.length === categories.length &&
        prevIds.every((val: string, index: number) => val === categories[index]);

      if (isSame && prev.service_type === selectedServiceType) return prev;

      return {
        ...prev,
        category_ids: categories,
        service_type: selectedServiceType || undefined,
      };
    });
  }, [
    selectedLevel1,
    selectedLevel2,
    selectedLevel3,
    selectedServiceType,
    setFormData,
    isRestoring,
  ]);

  // 위치 변경 핸들러
  const handleLocationChange = (location: LocationData | null) => {
    setFormData((prev: ServiceFormData) => ({
      ...prev,
      location: location,
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-6">기본 정보</h2>

      {/* 카테고리 선택 - 맨 처음으로 이동 */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</legend>
        <div className="space-y-3">
          {/* 1차 카테고리 */}
          <select
            id="step1-category-level1"
            value={selectedLevel1}
            onChange={(e) => setSelectedLevel1(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
            required
            disabled={loading}
            aria-label="1차 카테고리"
          >
            <option value="">{loading ? '1차 카테고리 로딩 중...' : '1차 카테고리 선택'}</option>
            {level1Categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* 2차 카테고리 */}
          {selectedLevel1 && level2Categories.length > 0 && (
            <select
              value={selectedLevel2}
              onChange={(e) => setSelectedLevel2(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
              required
              aria-label="2차 카테고리"
            >
              <option value="">2차 카테고리 선택</option>
              {level2Categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}

          {/* 3차 카테고리 */}
          {selectedLevel2 && level3Categories.length > 0 && (
            <select
              value={selectedLevel3}
              onChange={(e) => setSelectedLevel3(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
              required
              aria-label="3차 카테고리"
            >
              <option value="">3차 카테고리 선택</option>
              {level3Categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}

          {/* 선택된 카테고리 경로 표시 */}
          {(selectedLevel1 || selectedLevel2 || selectedLevel3) && (
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
              <FolderTree className="w-4 h-4 mr-2 inline" />
              선택된 경로:{' '}
              {selectedLevel1 && (
                <span className="font-medium">
                  {level1Categories.find((c) => c.id === selectedLevel1)?.name}
                </span>
              )}
              {selectedLevel2 && (
                <>
                  {' > '}
                  <span className="font-medium">
                    {level2Categories.find((c) => c.id === selectedLevel2)?.name}
                  </span>
                </>
              )}
              {selectedLevel3 && (
                <>
                  {' > '}
                  <span className="font-medium">
                    {level3Categories.find((c) => c.id === selectedLevel3)?.name}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </fieldset>

      {/* 서비스 제공 방식 선택 (both 카테고리일 때만 표시) */}
      {selectedServiceType === 'both' && (
        <fieldset className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <legend className="text-sm font-medium text-blue-700 mb-3">서비스 제공 방식 *</legend>
          <p className="text-sm text-gray-600 mb-3">
            이 카테고리는 온라인과 오프라인 모두 가능합니다. 제공 방식을 선택해주세요.
          </p>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="delivery_method"
                value="online"
                checked={deliveryMethod === 'online'}
                onChange={() => setDeliveryMethod('online')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">온라인 제공</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="delivery_method"
                value="offline"
                checked={deliveryMethod === 'offline'}
                onChange={() => setDeliveryMethod('offline')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">오프라인 방문</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="delivery_method"
                value="both"
                checked={deliveryMethod === 'both'}
                onChange={() => setDeliveryMethod('both')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">둘 다 가능</span>
            </label>
          </div>
        </fieldset>
      )}

      {/* 위치 입력 섹션 (오프라인 또는 both 카테고리일 때 표시) */}
      {needsLocation && (
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <LocationInputSection
            value={formData.location}
            onChange={handleLocationChange}
            required={selectedServiceType === 'offline'}
            label="서비스 제공 위치"
            placeholder="주소를 검색하거나 현재 위치를 사용하세요"
            helpText="오프라인 서비스는 위치 정보가 필요합니다. 고객에게 거리가 표시됩니다."
          />
        </div>
      )}

      {/* 오프라인 서비스 안내 */}
      {selectedServiceType === 'offline' && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
          <svg
            className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <strong>오프라인 서비스</strong>입니다. 고객이 내 위치 근처에서 검색하면 노출됩니다.
          </span>
        </div>
      )}

      {/* 서비스 제목 */}
      <div>
        <label htmlFor="service-title" className="block text-sm font-medium text-gray-700 mb-2">
          서비스 제목 *
        </label>
        <input
          id="service-title"
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev: ServiceFormData) => ({ ...prev, title: e.target.value }))
          }
          placeholder="예: 전문 로고 디자인 작업"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
          required
        />
      </div>
    </div>
  );
}
