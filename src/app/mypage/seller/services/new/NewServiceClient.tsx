'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import TemplateSelector from '@/components/services/TemplateSelector';
import toast from 'react-hot-toast';

import { Sparkles, MapPin } from 'lucide-react';
import { type GradientTemplate, generateThumbnailWithText } from '@/lib/template-generator';
import { ArrowLeft, Upload, Palette, X, Check, CloudUpload, Loader2 } from 'lucide-react';
import { isOfflineCategory } from '@/lib/constants/categories';

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

interface Props {
  readonly sellerId: string;
}

export default function NewServiceClient({ sellerId }: Props) {
  const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel1, setSelectedLevel1] = useState('');
  const [selectedLevel2, setSelectedLevel2] = useState('');
  const [selectedLevel3, setSelectedLevel3] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // 템플릿 관련 상태
  const [uploadMode, setUploadMode] = useState<'file' | 'template'>('file');
  const [selectedTemplate, setSelectedTemplate] = useState<GradientTemplate | null>(null);
  const [textStyle, setTextStyle] = useState<TextStyleConfig | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    deliveryDays: '',
    revisionCount: '0',
    taxInvoiceAvailable: false,
    searchKeywords: '',
    location: null as {
      address: string;
      latitude: number;
      longitude: number;
      region: string;
    } | null,
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

  const removeThumbnail = () => {
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

  // Update final category - use the deepest level selected
  useEffect(() => {
    // Priority: Level 3 > Level 2 > Level 1
    if (selectedLevel3) {
      setFormData((prev) => ({ ...prev, category: selectedLevel3 }));
    } else if (selectedLevel2) {
      setFormData((prev) => ({ ...prev, category: selectedLevel2 }));
    } else if (selectedLevel1) {
      setFormData((prev) => ({ ...prev, category: selectedLevel1 }));
    } else {
      // Reset category if nothing selected
      setFormData((prev) => ({ ...prev, category: '' }));
    }
  }, [selectedLevel3, selectedLevel2, selectedLevel1]);

  // 오프라인 카테고리 여부 확인 (1차 카테고리 기준)
  const selectedLevel1Category = level1Categories.find((c) => c.id === selectedLevel1);
  const showLocationInput = selectedLevel1Category
    ? isOfflineCategory(selectedLevel1Category.slug)
    : false;

  // 오프라인 카테고리 아닐 때 위치 정보 초기화
  useEffect(() => {
    if (!showLocationInput && formData.location) {
      setFormData((prev) => ({ ...prev, location: null }));
    }
  }, [showLocationInput, formData.location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 템플릿 모드에서 썸네일을 생성하지 않은 경우 체크
    if (uploadMode === 'template' && selectedTemplate && !thumbnailFile) {
      toast.error(
        '템플릿을 선택하셨습니다.\n"썸네일 생성하기" 버튼을 눌러 썸네일을 먼저 생성해주세요.'
      );
      return;
    }

    if (!thumbnailFile) {
      toast.error('썸네일 이미지를 선택해주세요.');
      return;
    }

    if (!formData.category) {
      toast.error('카테고리를 선택해주세요.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      // 2. Upload thumbnail
      const fileExt = thumbnailFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `service-thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('services')
        .upload(filePath, thumbnailFile);

      if (uploadError) {
        logger.error('Thumbnail upload error:', uploadError);
        toast.error('썸네일 업로드에 실패했습니다.');
        return;
      }

      // 3. Get thumbnail public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('services').getPublicUrl(filePath);

      // 4. Create slug from title
      const slug = formData.title
        .toLowerCase()
        .replaceAll(/[^a-z0-9가-힣]/g, '-')
        .replaceAll(/-+/g, '-')
        .substring(0, 100);

      // 5. Insert service (위치 정보 포함)
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .insert({
          seller_id: sellerId,
          title: formData.title,
          slug: `${slug}-${Date.now()}`,
          description: formData.description,
          price: Math.max(1000, Number.parseInt(formData.price) || 1000),
          delivery_days: Math.max(1, Number.parseInt(formData.deliveryDays) || 7),
          revision_count:
            formData.revisionCount === 'unlimited'
              ? 999
              : Math.max(0, Number.parseInt(formData.revisionCount) || 0),
          thumbnail_url: publicUrl,
          search_keywords: formData.searchKeywords || null,
          status: 'pending',
          // 서비스별 위치 정보 저장
          location_address: formData.location?.address || null,
          location_latitude: formData.location?.latitude || null,
          location_longitude: formData.location?.longitude || null,
          location_region: formData.location?.region || null,
        })
        .select()
        .single();

      if (serviceError) {
        logger.error('Service insert error:', serviceError);
        toast.error('서비스 등록에 실패했습니다: ' + serviceError.message);
        return;
      }

      // 6. Insert service category
      const { error: categoryError } = await supabase.from('service_categories').insert({
        service_id: service.id,
        category_id: formData.category,
        is_primary: true,
      });

      if (categoryError) {
        logger.error('Category insert error:', categoryError);
      }

      toast.success('서비스가 성공적으로 등록되었습니다!\n관리자 승인 후 판매가 시작됩니다.');
      globalThis.location.href = '/mypage/seller/services';
    } catch (error) {
      logger.error('Service registration error:', error);
      toast.error('서비스 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        {/* 상단 네비게이션 */}
        <div className="mb-4 lg:mb-6">
          <Link
            href="/mypage/seller/services"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm lg:text-base">서비스 관리로</span>
          </Link>
        </div>

        {/* 페이지 헤더 */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-base lg:text-lg font-semibold text-gray-900">서비스 등록</h1>
          <p className="text-gray-600 mt-1 text-sm">새로운 서비스를 등록하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">
              기본 정보
            </h2>

            <div className="space-y-3 lg:space-y-4">
              {/* 썸네일 이미지 - 최상단 */}
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  썸네일 이미지 * <span className="text-xs text-gray-500">(권장: 652×488px)</span>
                </p>

                {/* 업로드 방식 선택 */}
                <div className="flex gap-2 mb-3 lg:mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode('file');
                      removeThumbnail();
                    }}
                    className={`flex-1 px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm font-medium rounded-lg transition-all ${
                      uploadMode === 'file'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Upload className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 inline" />
                    파일 업로드
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode('template');
                      removeThumbnail();
                    }}
                    className={`flex-1 px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm font-medium rounded-lg transition-all ${
                      uploadMode === 'template'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Palette className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 inline" />
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
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1.5 text-xs lg:px-3 lg:py-1 lg:text-sm rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          <X className="w-3 h-3 mr-1 inline" />
                          삭제
                        </button>
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
                      </label>
                    )}
                  </div>
                )}

                {/* 템플릿 모드 */}
                {uploadMode === 'template' && (
                  <div className="space-y-6">
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img
                          src={thumbnailPreview}
                          alt="생성된 썸네일"
                          className="w-full rounded-lg border-2 border-green-500"
                          style={{ aspectRatio: '652/488' }}
                        />
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1.5 text-xs lg:px-3 lg:py-1 lg:text-sm rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          <X className="w-3 h-3 mr-1 inline" />
                          다시 만들기
                        </button>
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1.5 text-xs lg:px-3 lg:py-1 lg:text-sm rounded-lg font-medium">
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
                            <div className="mt-4 lg:mt-6">
                              <button
                                type="button"
                                onClick={generateTemplateThumbnail}
                                disabled={!textStyle?.text?.trim()}
                                className="w-full px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 inline" />
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
                  htmlFor="new-service-title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  서비스 제목 *
                </label>
                <input
                  id="new-service-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="예: 전문 로고 디자인 작업"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  required
                />
              </div>

              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</legend>
                <div className="space-y-3">
                  {/* 1차 카테고리 */}
                  <select
                    id="category-level1"
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
                      id="category-level2"
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
                      id="category-level3"
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
              </fieldset>

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
                  onChange={(e) => {
                    // 한글, 영문, 숫자, 띄어쓰기만 허용 (특수문자, 이모지 제거)
                    const value = e.target.value.replaceAll(/[^\w가-힣\s]/g, '');
                    setFormData({ ...formData, searchKeywords: value });
                  }}
                  placeholder="로고 디자인 브랜딩 CI 기업"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p>
                    • 검색 키워드는 서비스 설명에 노출되지 않지만, 서비스 제목, 서비스 타입과 함께
                    검색 대상 단어로 사용됩니다.
                  </p>
                  <p>
                    • 띄어쓰기로 구분하여 여러 키워드를 입력할 수 있으며, 최대 100글자까지 입력
                    가능합니다. 특수문자 및 이모지는 입력할 수 없습니다.
                  </p>
                  <p>
                    • 서비스와 연관된 짧은 단어를 여러 개 입력하는 것이 검색 노출 향상에 도움이
                    됩니다. (다만, 동일 키워드 중복 입력은 검색 결과와 무관합니다.)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 가격 및 작업 조건 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">
              가격 및 작업 조건
            </h2>

            <div className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
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
                    min="1000"
                    max="10000000"
                    value={formData.price}
                    onChange={(e) => {
                      const value = e.target.value.replaceAll(/\D/g, '');
                      setFormData({ ...formData, price: value });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    placeholder="50000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="delivery-days"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    작업 기간 (일) *
                  </label>
                  <input
                    id="delivery-days"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.deliveryDays}
                    onChange={(e) => {
                      const value = e.target.value.replaceAll(/\D/g, '');
                      setFormData({ ...formData, deliveryDays: value });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
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
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">
              추가 정보
            </h2>

            <div className="space-y-3 lg:space-y-4">
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
                    checked={formData.taxInvoiceAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxInvoiceAvailable: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">세금계산서 발행 가능</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  체크 시 구매자에게 세금계산서 발행이 가능함을 표시합니다.
                </p>
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

          {/* 서비스 제공 지역 (오프라인 카테고리에서만 표시) */}
          {showLocationInput && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 mb-4 lg:mb-6">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-primary" />
                서비스 제공 지역
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                오프라인/대면 서비스의 경우, 서비스 제공 가능 지역을 입력해주세요. 구매자가 &quot;내
                주변&quot; 검색 시 노출됩니다.
              </p>

              <div className="space-y-4">
                {formData.location ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-green-800">위치가 설정되었습니다</p>
                        <p className="text-sm text-green-700 mt-1">{formData.location.address}</p>
                        <p className="text-xs text-green-600 mt-1">
                          지역: {formData.location.region}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, location: null })}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        if ('geolocation' in navigator) {
                          toast.loading('위치를 가져오는 중...', { id: 'location' });
                          // eslint-disable-next-line sonarjs/no-intrusive-permissions -- 오프라인 서비스 위치 등록에 필요
                          navigator.geolocation.getCurrentPosition(
                            async (position) => {
                              const { latitude, longitude } = position.coords;
                              // Reverse geocoding using a simple approximation for Korean addresses
                              try {
                                const response = await fetch(
                                  `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ko`
                                );
                                const data = await response.json();
                                const address = data.display_name || '위치 정보';
                                // Extract region (시/군/구)
                                const region =
                                  data.address?.city ||
                                  data.address?.county ||
                                  data.address?.town ||
                                  data.address?.district ||
                                  data.address?.state ||
                                  '알 수 없음';

                                setFormData({
                                  ...formData,
                                  location: {
                                    address,
                                    latitude,
                                    longitude,
                                    region,
                                  },
                                });
                                toast.success('위치가 설정되었습니다!', { id: 'location' });
                              } catch {
                                // Fallback without reverse geocoding
                                setFormData({
                                  ...formData,
                                  location: {
                                    address: `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`,
                                    latitude,
                                    longitude,
                                    region: '직접 입력 필요',
                                  },
                                });
                                toast.success('좌표가 저장되었습니다. 지역을 직접 입력해주세요.', {
                                  id: 'location',
                                });
                              }
                            },
                            (error) => {
                              logger.error('Geolocation error:', error);
                              toast.error(
                                '위치를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.',
                                {
                                  id: 'location',
                                }
                              );
                            },
                            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                          );
                        } else {
                          toast.error('이 브라우저는 위치 서비스를 지원하지 않습니다.');
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-5 h-5" />
                      현재 위치 가져오기
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      브라우저에서 위치 권한을 허용해야 합니다
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 제출 버튼 */}
          <div className="flex gap-2 lg:gap-3">
            <Link
              href="/mypage/seller/services"
              className="flex-1 px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin mr-1 lg:mr-2 inline" />
                  등록 중...
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 inline" />
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
