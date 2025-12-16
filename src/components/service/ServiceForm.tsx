'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import TemplateSelector from '@/components/services/TemplateSelector';
import toast from 'react-hot-toast';
import { Upload, Palette, X, CloudUpload, Sparkles } from 'lucide-react';
import { type GradientTemplate, generateThumbnailWithText } from '@/lib/template-generator';
import type { ServiceType, LocationData } from '@/types/service-form';

// Dynamic import for TextOverlayEditor
const TextOverlayEditor = dynamic(() => import('@/components/services/TextOverlayEditor'), {
  loading: () => <div className="py-8 text-center text-gray-500">Loading editor...</div>,
  ssr: false,
});

interface Category {
  id: string;
  name: string;
  slug: string;
  level: number;
  parent_id: string | null;
  service_type?: ServiceType;
}

interface TextStyleConfig {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  textAlign: CanvasTextAlign;
  fontWeight: string;
  shadowBlur: number;
}

export interface ServiceFormState {
  title: string;
  category: string;
  description: string;
  price: string;
  deliveryDays: string;
  revisionCount: string;
  taxInvoiceAvailable: boolean;
  searchKeywords: string;
  location: LocationData | null;
  thumbnailFile: File | null;
  thumbnailPreview: string | null;
}

export interface ServiceFormProps {
  initialData?: Partial<ServiceFormState>;
  mode: 'create' | 'edit';
  sellerId: string;
  onSubmit: (data: ServiceFormState, publicThumbnailUrl: string | null) => Promise<void>;
  onCancel: () => void;
  // Category hierarchy for edit mode
  initialCategoryHierarchy?: {
    level1: string | null;
    level2: string | null;
    level3: string | null;
  };
}

export default function ServiceForm({
  initialData,
  mode,
  sellerId,
  onSubmit,
  onCancel,
  initialCategoryHierarchy,
}: ServiceFormProps) {
  // Categories State
  const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(true);

  const [selectedLevel1, setSelectedLevel1] = useState(initialCategoryHierarchy?.level1 || '');
  const [selectedLevel2, setSelectedLevel2] = useState(initialCategoryHierarchy?.level2 || '');
  const [selectedLevel3, setSelectedLevel3] = useState(initialCategoryHierarchy?.level3 || '');

  // Form State
  const [formData, setFormData] = useState<ServiceFormState>({
    title: initialData?.title || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    deliveryDays: initialData?.deliveryDays || '',
    revisionCount: initialData?.revisionCount || '0',
    taxInvoiceAvailable: initialData?.taxInvoiceAvailable || false,
    searchKeywords: initialData?.searchKeywords || '',
    location: initialData?.location || null,
    thumbnailFile: initialData?.thumbnailFile || null,
    thumbnailPreview: initialData?.thumbnailPreview || null,
  });

  const [loading, setLoading] = useState(false);

  // Thumbnail Template State
  const [uploadMode, setUploadMode] = useState<'file' | 'template'>('file');
  const [selectedTemplate, setSelectedTemplate] = useState<GradientTemplate | null>(null);
  const [textStyle, setTextStyle] = useState<TextStyleConfig | null>(null);
  const originalThumbnailUrl = initialData?.thumbnailPreview || null; // For restore

  // --- Category Logic ---
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

        if (error) throw error;
        setLevel1Categories(data || []);
      } catch (error) {
        logger.error('1차 카테고리 로딩 실패:', error);
      } finally {
        setLoadingCategory(false);
      }
    }
    fetchLevel1Categories();
  }, []);

  useEffect(() => {
    if (!selectedLevel1) {
      setLevel2Categories([]);
      setSelectedLevel2('');
      return;
    }
    async function fetchLevel2() {
      const supabase = createClient();
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .eq('parent_id', selectedLevel1)
        .order('display_order');
      setLevel2Categories(data || []);
    }
    fetchLevel2();
  }, [selectedLevel1]);

  useEffect(() => {
    if (!selectedLevel2) {
      setLevel3Categories([]);
      setSelectedLevel3('');
      return;
    }
    async function fetchLevel3() {
      const supabase = createClient();
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .eq('parent_id', selectedLevel2)
        .order('display_order');
      setLevel3Categories(data || []);
    }
    fetchLevel3();
  }, [selectedLevel2]);

  // Update final category in formData
  useEffect(() => {
    let finalCat = '';
    if (selectedLevel3) finalCat = selectedLevel3;
    else if (selectedLevel2) finalCat = selectedLevel2;
    else if (selectedLevel1) finalCat = selectedLevel1;

    setFormData((prev) => ({ ...prev, category: finalCat }));
  }, [selectedLevel1, selectedLevel2, selectedLevel3]);

  // --- Thumbnail Logic ---
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('파일 크기는 5MB를 초과할 수 없습니다.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        return;
      }
      setFormData((prev) => ({ ...prev, thumbnailFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, thumbnailPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setFormData((prev) => ({ ...prev, thumbnailFile: null, thumbnailPreview: null }));
    setSelectedTemplate(null);
    setTextStyle(null);
  };

  const cancelNewThumbnail = () => {
    setFormData((prev) => ({
      ...prev,
      thumbnailFile: null,
      thumbnailPreview: originalThumbnailUrl,
    }));
    setSelectedTemplate(null);
    setTextStyle(null);
  };

  const generateTemplateThumbnail = async () => {
    if (!selectedTemplate || !textStyle?.text.trim()) {
      toast.error('템플릿과 텍스트를 입력해주세요.');
      return;
    }
    try {
      const blob = await generateThumbnailWithText(
        selectedTemplate,
        { ...textStyle, fontFamily: 'Noto Sans KR' },
        652,
        488
      );
      const file = new File([blob], `thumbnail-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setFormData((prev) => ({
        ...prev,
        thumbnailFile: file,
        thumbnailPreview: URL.createObjectURL(blob),
      }));
      toast.success('썸네일 생성 완료!');
    } catch (e) {
      logger.error('Thumbnail gen error', e);
      toast.error('썸네일 생성 실패');
    }
  };

  // --- Helper: Upload Thumbnail ---
  const uploadThumbnail = async (): Promise<string | null> => {
    if (!formData.thumbnailFile) return null;
    const supabase = createClient();
    const fileExt = formData.thumbnailFile.name.split('.').pop();
    const fileName = `${sellerId}-${Date.now()}.${fileExt}`;
    const filePath = `service-thumbnails/${fileName}`;

    const { error } = await supabase.storage
      .from('services')
      .upload(filePath, formData.thumbnailFile);
    if (error) {
      logger.error('Thumbnail upload error', error);
      throw new Error('썸네일 업로드 실패');
    }
    const { data } = supabase.storage.from('services').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMode === 'template' && selectedTemplate && !formData.thumbnailFile) {
      toast.error('썸네일 생성하기 버튼을 눌러주세요.');
      return;
    }
    if (!formData.thumbnailPreview && !formData.thumbnailFile) {
      toast.error('썸네일 이미지를 선택해주세요.');
      return;
    }
    if (!formData.category) {
      toast.error('카테고리를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      let publicUrl = null;
      // If new file exists, upload it. If not, we might be editing and kept old url.
      if (formData.thumbnailFile) {
        publicUrl = await uploadThumbnail();
      } else {
        // Keep existing URL if edit mode
        publicUrl = originalThumbnailUrl;
      }

      await onSubmit(formData, publicUrl);
    } catch (error) {
      console.error(error);
      toast.error('처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      {/* 1. 기본 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 mb-4 lg:mb-6">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">기본 정보</h2>
        <div className="space-y-4">
          {/* 썸네일 */}
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">
              썸네일 이미지 <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-1">(권장: 652×488px)</span>
            </div>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('file');
                  if (mode === 'create') removeThumbnail();
                  else cancelNewThumbnail();
                }}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border ${uploadMode === 'file' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-200'}`}
              >
                <Upload className="w-4 h-4 mr-2 inline" /> 파일 업로드
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode('template');
                  if (mode === 'create') removeThumbnail();
                  else cancelNewThumbnail();
                }}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border ${uploadMode === 'template' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-200'}`}
              >
                <Palette className="w-4 h-4 mr-2 inline" /> 템플릿 사용
              </button>
            </div>

            {uploadMode === 'file' && (
              <div className="mt-2">
                {formData.thumbnailPreview ? (
                  <div className="relative w-full max-w-md">
                    <img
                      src={formData.thumbnailPreview}
                      alt="썸네일 미리보기"
                      className="w-full h-auto rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={mode === 'create' ? removeThumbnail : cancelNewThumbnail}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      aria-label="이미지 삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="service-thumbnail"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-primary hover:bg-gray-50"
                  >
                    <CloudUpload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">클릭하여 이미지 업로드</span>
                    <input
                      id="service-thumbnail"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      aria-label="썸네일 파일 선택"
                    />
                  </label>
                )}
              </div>
            )}

            {uploadMode === 'template' && (
              <div className="space-y-4">
                {formData.thumbnailPreview ? (
                  <div className="relative w-full max-w-md">
                    <img
                      src={formData.thumbnailPreview}
                      alt="생성된 썸네일"
                      className="w-full h-auto rounded-lg border border-green-500"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded"
                    >
                      다시 만들기
                    </button>
                  </div>
                ) : (
                  <>
                    <TemplateSelector
                      onSelect={setSelectedTemplate}
                      selectedTemplateId={selectedTemplate?.id}
                    />
                    {selectedTemplate && (
                      <div className="border-t pt-4">
                        <TextOverlayEditor
                          template={selectedTemplate}
                          onTextChange={setTextStyle}
                        />
                        <button
                          type="button"
                          onClick={generateTemplateThumbnail}
                          className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" /> 썸네일 생성하기
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* 제목 */}
          <div>
            <label htmlFor="service-title" className="block text-sm font-medium text-gray-700 mb-2">
              서비스 제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="service-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"
              placeholder="예: 전문 로고 디자인 작업"
              required
            />
          </div>

          {/* 카테고리 */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </legend>
            <div className="space-y-3">
              <select
                id="category-level1"
                value={selectedLevel1}
                onChange={(e) => setSelectedLevel1(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                aria-label="1차 카테고리"
                required
              >
                <option value="">{loadingCategory ? '로딩 중...' : '1차 카테고리 선택'}</option>
                {level1Categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {selectedLevel1 && level2Categories.length > 0 && (
                <select
                  id="category-level2"
                  value={selectedLevel2}
                  onChange={(e) => setSelectedLevel2(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  aria-label="2차 카테고리"
                  required
                >
                  <option value="">2차 카테고리 선택</option>
                  {level2Categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
              {selectedLevel2 && level3Categories.length > 0 && (
                <select
                  id="category-level3"
                  value={selectedLevel3}
                  onChange={(e) => setSelectedLevel3(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  aria-label="3차 카테고리"
                  required
                >
                  <option value="">3차 카테고리 선택</option>
                  {level3Categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </fieldset>

          {/* 설명 */}
          <div>
            <label htmlFor="service-desc" className="block text-sm font-medium text-gray-700 mb-2">
              서비스 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="service-desc"
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>

          {/* 검색 키워드 */}
          <div>
            <label
              htmlFor="search-keywords"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              검색 키워드
            </label>
            <input
              id="search-keywords"
              type="text"
              maxLength={100}
              value={formData.searchKeywords}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  searchKeywords: e.target.value.replaceAll(/[^\w가-힣\s]/g, ''),
                })
              }
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="예: 로고 브랜딩 디자인 (띄어쓰기 구분)"
            />
          </div>
        </div>
      </div>

      {/* 2. 가격 및 작업 조건 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">가격 및 작업 조건</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="service-price" className="block text-sm font-medium text-gray-700 mb-2">
              가격 (원) <span className="text-red-500">*</span>
            </label>
            <input
              id="service-price"
              type="number"
              min="1000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label htmlFor="delivery-days" className="block text-sm font-medium text-gray-700 mb-2">
              작업 기간 (일) <span className="text-red-500">*</span>
            </label>
            <input
              id="delivery-days"
              type="number"
              min="1"
              value={formData.deliveryDays}
              onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="revision-count" className="block text-sm font-medium text-gray-700 mb-2">
            수정 횟수 <span className="text-red-500">*</span>
          </label>
          <select
            id="revision-count"
            value={formData.revisionCount}
            onChange={(e) => setFormData({ ...formData, revisionCount: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="0">수정 불가</option>
            <option value="1">1회</option>
            <option value="2">2회</option>
            <option value="3">3회</option>
            <option value="unlimited">무제한</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark disabled:opacity-50"
        >
          {(() => {
            if (loading) return '저장 중...';
            if (mode === 'create') return '서비스 등록';
            return '수정 완료';
          })()}
        </button>
      </div>
    </form>
  );
}
