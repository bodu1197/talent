'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import TemplateSelector from '@/components/services/TemplateSelector';
import toast from 'react-hot-toast';

import { Sparkles } from 'lucide-react';
import { type GradientTemplate, generateThumbnailWithText } from '@/lib/template-generator';
import {
  ArrowLeft,
  Upload,
  Palette,
  X,
  Check,
  CloudUpload,
  Undo,
  Trash2,
  Info,
  Loader2,
} from 'lucide-react';

// Dynamic import for TextOverlayEditor - only loads when template mode is selected
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
}

interface ServiceData {
  id: string;
  title: string;
  thumbnail_url?: string | null;
  service_categories?: Array<{ category_id: string }>;
  description?: string;
  price?: number;
  delivery_days?: number;
  revision_count?: number;
  tax_invoice_available?: boolean;
  search_keywords?: string;
  status?: string;
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

interface ServiceFormData {
  title: string;
  description: string;
  price: string;
  deliveryDays: string;
  revisionCount: string;
  taxInvoiceAvailable?: boolean;
  searchKeywords?: string;
  category_ids: string[];
}

interface ServiceRevision {
  id: string;
  service_id: string;
  seller_id: string;
  title: string;
  status: string;
}

interface Props {
  readonly service: ServiceData;
  readonly sellerId: string;
  readonly categoryHierarchy?: {
    level1: string | null;
    level2: string | null;
    level3: string | null;
  } | null;
}

// Helper: Validate thumbnail requirements
function validateThumbnailRequirements(
  uploadMode: 'file' | 'template',
  selectedTemplate: GradientTemplate | null,
  thumbnailFile: File | null,
  originalThumbnailUrl: string | null
): void {
  if (uploadMode === 'template' && selectedTemplate && !thumbnailFile) {
    throw new Error(
      '템플릿을 선택하셨습니다.\n"썸네일 생성하기" 버튼을 눌러 썸네일을 먼저 생성해주세요.'
    );
  }

  if (uploadMode === 'template' && !thumbnailFile && !originalThumbnailUrl) {
    throw new Error(
      '썸네일 이미지가 필요합니다.\n템플릿을 선택하고 "썸네일 생성하기" 버튼을 눌러주세요.'
    );
  }
}

// Helper: Upload thumbnail file to storage
async function uploadThumbnail(
  supabase: SupabaseClient,
  thumbnailFile: File,
  userId: string
): Promise<string> {
  const fileExt = thumbnailFile.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `service-thumbnails/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('services')
    .upload(filePath, thumbnailFile);

  if (uploadError) {
    logger.error('Thumbnail upload error:', uploadError);
    throw new Error('썸네일 업로드에 실패했습니다.');
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('services').getPublicUrl(filePath);

  return publicUrl;
}

// Helper: Determine final thumbnail URL
function determineThumbnailUrl(
  thumbnailFile: File | null,
  thumbnailPreview: string | null,
  originalThumbnailUrl: string | null,
  uploadedUrl?: string
): string | null {
  if (thumbnailFile && uploadedUrl) {
    return uploadedUrl;
  }
  if (!thumbnailPreview && originalThumbnailUrl) {
    return null;
  }
  return originalThumbnailUrl;
}

// Helper: Create service revision for active services
async function createServiceRevision(
  supabase: SupabaseClient,
  serviceId: string,
  sellerId: string,
  formData: ServiceFormData,
  thumbnailUrl: string | null
): Promise<ServiceRevision> {
  const { data: revision, error: revisionError } = await supabase
    .from('service_revisions')
    .insert({
      service_id: serviceId,
      seller_id: sellerId,
      title: formData.title,
      description: formData.description,
      price: Number.parseInt(formData.price) || 0,
      delivery_days: Number.parseInt(formData.deliveryDays) || 7,
      revision_count:
        formData.revisionCount === 'unlimited' ? 999 : Number.parseInt(formData.revisionCount) || 0,
      thumbnail_url: thumbnailUrl,
      status: 'pending',
      revision_note: '서비스 정보 수정',
    })
    .select()
    .single();

  if (revisionError) {
    logger.error('Revision create error:', revisionError);
    throw new Error('수정본 생성에 실패했습니다: ' + revisionError.message);
  }

  return revision;
}

// Helper: Update service directly for non-active services
async function updateServiceDirectly(
  supabase: SupabaseClient,
  serviceId: string,
  serviceStatus: string,
  formData: ServiceFormData,
  thumbnailUrl: string | null
): Promise<string> {
  const updateData: Record<string, unknown> = {
    title: formData.title,
    description: formData.description,
    price: Number.parseInt(formData.price) || 0,
    delivery_days: Number.parseInt(formData.deliveryDays) || 7,
    revision_count:
      formData.revisionCount === 'unlimited' ? 999 : Number.parseInt(formData.revisionCount) || 0,
    thumbnail_url: thumbnailUrl,
    updated_at: new Date().toISOString(),
  };

  if (serviceStatus === 'suspended') {
    updateData.status = 'pending';
  }

  const { error: serviceError } = await supabase
    .from('services')
    .update(updateData)
    .eq('id', serviceId);

  if (serviceError) {
    logger.error('Service update error:', serviceError);
    throw new Error('서비스 수정에 실패했습니다: ' + serviceError.message);
  }

  return serviceStatus;
}

// Helper: Update service categories for revision
async function updateRevisionCategories(
  supabase: SupabaseClient,
  revisionId: string,
  categoryIds: string[]
): Promise<void> {
  if (categoryIds.length === 0) return;

  const categoryInserts = categoryIds.map((catId) => ({
    revision_id: revisionId,
    category_id: catId,
  }));

  await supabase.from('service_revision_categories').insert(categoryInserts);
}

// Helper: Update service categories directly
async function updateDirectServiceCategories(
  supabase: SupabaseClient,
  serviceId: string,
  categoryIds: string[]
): Promise<void> {
  if (categoryIds.length === 0) return;

  // Delete existing categories
  await supabase.from('service_categories').delete().eq('service_id', serviceId);

  // Insert all new categories
  const categoryInserts = categoryIds.map((catId) => ({
    service_id: serviceId,
    category_id: catId,
  }));

  await supabase.from('service_categories').insert(categoryInserts);
}

// Helper: Get authenticated user
async function getAuthenticatedUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('로그인이 필요합니다.');
  }

  return user;
}

export default function EditServiceClient({ service, sellerId, categoryHierarchy }: Props) {
  const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel1, setSelectedLevel1] = useState(categoryHierarchy?.level1 || '');
  const [selectedLevel2, setSelectedLevel2] = useState(categoryHierarchy?.level2 || '');
  const [selectedLevel3, setSelectedLevel3] = useState(categoryHierarchy?.level3 || '');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    service.thumbnail_url || null
  );
  const originalThumbnailUrl = service.thumbnail_url || null; // 원본 이미지 URL 저장

  // 템플릿 관련 상태
  const [uploadMode, setUploadMode] = useState<'file' | 'template'>('file');
  const [selectedTemplate, setSelectedTemplate] = useState<GradientTemplate | null>(null);
  const [textStyle, setTextStyle] = useState<TextStyleConfig | null>(null);

  const [formData, setFormData] = useState({
    title: service.title || '',
    category_ids: [] as string[],
    description: service.description || '',
    price: String(service.price || ''),
    deliveryDays: String(service.delivery_days || ''),
    revisionCount:
      service.revision_count === 999 ? 'unlimited' : String(service.revision_count || '0'),
  });

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
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 새로 업로드한 파일 취소 (원본으로 복원)
  const cancelNewThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(originalThumbnailUrl);
    setSelectedTemplate(null);
    setTextStyle(null);
  };

  // 기존 이미지 완전 삭제
  const deleteThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setSelectedTemplate(null);
    setTextStyle(null);
  };

  // 템플릿 기반 썸네일 생성
  const generateTemplateThumbnail = async () => {
    if (!selectedTemplate || !textStyle?.text.trim()) {
      toast.error('템플릿과 텍스트를 입력해주세요.');
      return;
    }

    try {
      const blob = await generateThumbnailWithText(
        selectedTemplate,
        {
          text: textStyle.text,
          x: textStyle.x,
          y: textStyle.y,
          fontSize: textStyle.fontSize,
          fontFamily: 'Noto Sans KR, sans-serif',
          color: textStyle.color,
          textAlign: textStyle.textAlign,
          fontWeight: textStyle.fontWeight,
          shadowBlur: textStyle.shadowBlur,
          shadowColor: 'rgba(0,0,0,0.5)',
        },
        652,
        488
      );

      // Blob을 File로 변환
      const file = new File([blob], `thumbnail-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      setThumbnailFile(file);

      // 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(blob);
      setThumbnailPreview(previewUrl);

      toast.success('썸네일이 생성되었습니다!');
    } catch (error) {
      logger.error('썸네일 생성 오류:', error);
      toast.error('썸네일 생성에 실패했습니다.');
    }
  };

  // Load level 1 categories on mount
  useEffect(() => {
    async function fetchLevel1Categories() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, level, parent_id')
          .eq('is_active', true)
          .eq('level', 1)
          .order('display_order', { ascending: true });

        if (error) {
          logger.error('1차 카테고리 로딩 오류:', error);
        } else {
          setLevel1Categories(data || []);
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
      setSelectedLevel2('');
      setLevel3Categories([]);
      setSelectedLevel3('');
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
        }
      } catch (error) {
        logger.error('2차 카테고리 로딩 실패:', error);
      }
    }

    fetchLevel2Categories();
  }, [selectedLevel1]);

  // Load level 3 categories when level 2 is selected
  useEffect(() => {
    if (!selectedLevel2) {
      setLevel3Categories([]);
      setSelectedLevel3('');
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
        }
      } catch (error) {
        logger.error('3차 카테고리 로딩 실패:', error);
      }
    }

    fetchLevel3Categories();
  }, [selectedLevel2]);

  // Update category_ids with all selected levels
  useEffect(() => {
    const categories: string[] = [];
    if (selectedLevel1) categories.push(selectedLevel1);
    if (selectedLevel2) categories.push(selectedLevel2);
    if (selectedLevel3) categories.push(selectedLevel3);

    setFormData((prev) => {
      const isSame =
        prev.category_ids.length === categories.length &&
        prev.category_ids.every((val, index) => val === categories[index]);

      if (isSame) return prev;

      return { ...prev, category_ids: categories };
    });
  }, [selectedLevel1, selectedLevel2, selectedLevel3]);

  // Helper: Process active service updates
  async function processActiveServiceUpdate(
    supabase: SupabaseClient,
    thumbnail_url: string | null
  ): Promise<void> {
    const revision = await createServiceRevision(
      supabase,
      service.id,
      sellerId,
      formData,
      thumbnail_url
    );

    if (formData.category_ids.length > 0) {
      await updateRevisionCategories(supabase, revision.id, formData.category_ids);
    }

    toast.success('수정 요청이 제출되었습니다. 관리자 승인 후 반영됩니다.');
  }

  // Helper: Process non-active service updates
  async function processNonActiveServiceUpdate(
    supabase: SupabaseClient,
    thumbnail_url: string | null
  ): Promise<void> {
    const originalStatus = await updateServiceDirectly(
      supabase,
      service.id,
      service.status!,
      formData,
      thumbnail_url
    );

    if (formData.category_ids.length > 0) {
      await updateDirectServiceCategories(supabase, service.id, formData.category_ids);
    }

    const message =
      originalStatus === 'suspended'
        ? '서비스가 성공적으로 수정되었습니다. 관리자 승인 후 다시 활성화됩니다.'
        : '서비스가 성공적으로 수정되었습니다!';

    toast.success(message);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Early validation
    try {
      validateThumbnailRequirements(
        uploadMode,
        selectedTemplate,
        thumbnailFile,
        originalThumbnailUrl
      );
    } catch (error) {
      toast.error((error as Error).message);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const user = await getAuthenticatedUser(supabase);

      // Handle thumbnail upload if needed
      const uploadedUrl = thumbnailFile
        ? await uploadThumbnail(supabase, thumbnailFile, user.id)
        : undefined;

      const thumbnail_url = determineThumbnailUrl(
        thumbnailFile,
        thumbnailPreview,
        originalThumbnailUrl,
        uploadedUrl
      );

      // Process based on service status
      if (service.status === 'active') {
        await processActiveServiceUpdate(supabase, thumbnail_url);
      } else {
        await processNonActiveServiceUpdate(supabase, thumbnail_url);
      }

      globalThis.location.href = '/mypage/seller/services';
    } catch (error) {
      logger.error('Service update error:', error);
      toast.error(
        error instanceof Error && error.message.includes(':')
          ? error.message
          : '서비스 수정 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="py-8 px-4">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <Link
            href="/mypage/seller/services"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>서비스 관리로</span>
          </Link>
        </div>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-base md:text-lg font-bold text-gray-900">서비스 수정</h1>
          <p className="text-gray-600 mt-1 text-sm">서비스 정보를 수정하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-sm md:text-base font-bold text-gray-900 mb-6">기본 정보</h2>

            <div className="space-y-4">
              {/* 썸네일 이미지 - 최상단 */}
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  썸네일 이미지 {!service.thumbnail_url && '*'}{' '}
                  <span className="text-xs text-gray-500">(권장: 652×488px)</span>
                </div>

                {/* 업로드 방식 선택 */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode('file');
                      setThumbnailFile(null);
                      setThumbnailPreview(originalThumbnailUrl);
                      setSelectedTemplate(null);
                      setTextStyle(null);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      uploadMode === 'file'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2 inline" />
                    파일 업로드
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode('template');
                      setThumbnailFile(null);
                      setThumbnailPreview(null);
                      setSelectedTemplate(null);
                      setTextStyle(null);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      uploadMode === 'template'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Palette className="w-4 h-4 mr-2 inline" />
                    템플릿 사용
                  </button>
                </div>

                {/* 파일 업로드 모드 */}
                {uploadMode === 'file' && (
                  <div className="space-y-3">
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img
                          src={thumbnailPreview}
                          alt="썸네일 미리보기"
                          className="w-full h-64 object-cover rounded-lg border border-gray-300"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          {/* 새로 업로드한 파일인 경우 취소 버튼 */}
                          {thumbnailFile && (
                            <button
                              type="button"
                              onClick={cancelNewThumbnail}
                              className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                            >
                              <Undo className="w-3 h-3 mr-1 inline" />
                              취소
                            </button>
                          )}
                          {/* 기존 이미지 삭제 버튼 */}
                          <button
                            type="button"
                            onClick={deleteThumbnail}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            <Trash2 className="w-3 h-3 mr-1 inline" />
                            삭제
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-brand-primary transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                        />
                        <CloudUpload className="text-gray-400 w-10 h-10 mb-3 inline-block" />
                        <p className="text-gray-600 font-medium">클릭하여 이미지 선택</p>
                        <p className="text-sm text-gray-500 mt-2">
                          권장 크기: 652×488px (최대 5MB)
                        </p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF 형식 지원</p>
                        {originalThumbnailUrl && (
                          <p className="text-xs text-red-500 mt-2">
                            ※ 기존 이미지가 삭제되었습니다. 새 이미지를 선택하세요.
                          </p>
                        )}
                      </label>
                    )}
                  </div>
                )}

                {/* 템플릿 모드 */}
                {uploadMode === 'template' && (
                  <div className="space-y-6">
                    {/* 기존 이미지 교체 안내 */}
                    {originalThumbnailUrl && !thumbnailFile && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Info className="text-amber-600 w-4 h-4 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-amber-900 mb-1">
                              기존 이미지 교체
                            </p>
                            <p className="text-xs text-amber-700">
                              템플릿으로 새 썸네일을 생성하면 기존 이미지가 삭제되고 새 이미지로
                              교체됩니다. 기존 이미지를 유지하려면 "파일 업로드" 모드로 전환하세요.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {thumbnailPreview && thumbnailFile ? (
                      <div className="relative">
                        <img
                          src={thumbnailPreview}
                          alt="생성된 썸네일"
                          className="w-full rounded-lg border-2 border-green-500"
                          style={{ aspectRatio: '652/488' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnailFile(null);
                            setThumbnailPreview(null);
                            setSelectedTemplate(null);
                            setTextStyle(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          <X className="w-3 h-3 mr-1 inline" />
                          다시 만들기
                        </button>
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm">
                          <Check className="w-3 h-3 mr-1 inline" />
                          생성 완료
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* 템플릿 선택 */}
                        <TemplateSelector
                          onSelect={setSelectedTemplate}
                          selectedTemplateId={selectedTemplate?.id}
                        />

                        {/* 텍스트 편집 */}
                        {selectedTemplate && (
                          <div className="border-t pt-6">
                            <TextOverlayEditor
                              template={selectedTemplate}
                              onTextChange={setTextStyle}
                            />

                            {/* 생성 버튼 */}
                            <div className="mt-6">
                              <button
                                type="button"
                                onClick={generateTemplateThumbnail}
                                disabled={!textStyle?.text?.trim()}
                                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                <Sparkles className="w-4 h-4 mr-2 inline" />
                                썸네일 생성하기 (652×488px)
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 서비스 제목 */}
              <div>
                <label
                  htmlFor="service-title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  서비스 제목 *
                </label>
                <input
                  id="service-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="예: 전문 로고 디자인 작업"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</div>
                <div className="space-y-3">
                  {/* 1차 카테고리 */}
                  <select
                    value={selectedLevel1}
                    onChange={(e) => setSelectedLevel1(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                    disabled={loading}
                    aria-label="1차 카테고리"
                  >
                    <option value="">
                      {loading ? '1차 카테고리 로딩 중...' : '1차 카테고리 선택'}
                    </option>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
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
                      <span className="font-medium">선택된 카테고리:</span>{' '}
                      {level1Categories.find((c) => c.id === selectedLevel1)?.name}
                      {selectedLevel2 &&
                        ` > ${level2Categories.find((c) => c.id === selectedLevel2)?.name}`}
                      {selectedLevel3 &&
                        ` > ${level3Categories.find((c) => c.id === selectedLevel3)?.name}`}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="service-description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  서비스 설명 *
                </label>
                <textarea
                  id="service-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  placeholder="서비스에 대해 자세히 설명해주세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* 가격 및 작업 조건 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-sm md:text-base font-bold text-gray-900 mb-6">가격 및 작업 조건</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="service-price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    가격 (원) *
                  </label>
                  <input
                    id="service-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="50000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="service-delivery-days"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    작업 기간 (일) *
                  </label>
                  <input
                    id="service-delivery-days"
                    type="number"
                    value={formData.deliveryDays}
                    onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                    placeholder="7"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="revisionCount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  수정 횟수 *
                </label>
                <select
                  id="revisionCount"
                  value={formData.revisionCount}
                  onChange={(e) => setFormData({ ...formData, revisionCount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  required
                >
                  <option value="0">수정 불가</option>
                  <option value="1">1회</option>
                  <option value="2">2회</option>
                  <option value="3">3회</option>
                  <option value="unlimited">무제한</option>
                </select>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-sm md:text-base font-bold text-gray-900 mb-6">추가 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">빠른 작업 가능 (24시간 이내 시작)</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">상업적 이용 가능</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">원본 파일 제공</span>
                </label>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <Link
              href="/mypage/seller/services"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                  등록 중...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2 inline" />
                  서비스 등록
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MypageLayoutWrapper>
  );
}
