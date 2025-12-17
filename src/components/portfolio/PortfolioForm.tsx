'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { CheckCircle, X, Loader2, Video, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface Service {
  id: string;
  title: string;
  status: string;
}

interface PortfolioFormData {
  title: string;
  description: string;
  category_id: string;
  service_id: string;
  youtube_url: string;
  tags: string[];
  images: File[];
}

interface PortfolioFormProps {
  readonly sellerId: string;
  readonly categories: Category[];
  readonly services: Service[];
  readonly initialData?: Partial<PortfolioFormData> & {
    readonly id?: string;
    readonly existing_images?: string[];
  };
  readonly mode: 'create' | 'edit';
}

// Helper function to read file as data URL
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export default function PortfolioForm({
  sellerId,
  categories,
  services,
  initialData,
  mode,
}: PortfolioFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // 폼 데이터
  const [formData, setFormData] = useState<PortfolioFormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    category_id: initialData?.category_id ?? '',
    service_id: initialData?.service_id ?? '',
    youtube_url: initialData?.youtube_url ?? '',
    tags: initialData?.tags || [],
    images: [],
  });

  // 기존 이미지 (수정 모드)
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.existing_images || []
  );

  // 이미지 미리보기
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // YouTube 비디오 ID 추출
  const extractYoutubeVideoId = useCallback((url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  }, []);

  // YouTube 썸네일 URL
  const youtubeThumbnail = useMemo(() => {
    const videoId = extractYoutubeVideoId(formData.youtube_url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  }, [formData.youtube_url, extractYoutubeVideoId]);

  // YouTube URL 변경 핸들러
  const handleYoutubeUrlChange = useCallback(
    (url: string) => {
      setFormData((prev) => ({ ...prev, youtube_url: url }));
      const videoId = extractYoutubeVideoId(url);
      if (url && !videoId) {
        toast.error('올바른 YouTube URL을 입력해주세요');
      }
    },
    [extractYoutubeVideoId]
  );

  // 이미지 미리보기 생성 헬퍼
  const generatePreviews = useCallback(async (files: File[]) => {
    const previews = await Promise.all(files.map(readFileAsDataURL));
    setImagePreviews((prev) => [...prev, ...previews]);
  }, []);

  // 이미지 파일 선택
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length + formData.images.length + existingImages.length > 5) {
        toast.error('최대 5개까지 업로드 가능합니다');
        return;
      }

      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
      generatePreviews(files);
    },
    [formData.images.length, existingImages.length, generatePreviews]
  );

  // 새 이미지 삭제
  const handleRemoveImage = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // 기존 이미지 삭제
  const handleRemoveExistingImage = useCallback((url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  }, []);

  // 태그 추가
  const handleAddTag = useCallback(() => {
    if (!tagInput.trim()) return;
    if (formData.tags.includes(tagInput.trim())) {
      toast.error('이미 추가된 태그입니다');
      return;
    }
    if (formData.tags.length >= 5) {
      toast.error('최대 5개까지 추가 가능합니다');
      return;
    }
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
    setTagInput('');
  }, [tagInput, formData.tags]);

  // 태그 삭제
  const handleRemoveTag = useCallback((tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }, []);

  // 이미지 업로드 헬퍼
  const uploadImages = useCallback(
    async (supabase: ReturnType<typeof createClient>) => {
      const uploadedUrls: string[] = [];
      for (const file of formData.images) {
        const fileName = `${sellerId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('portfolios')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('portfolios').getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }
      return uploadedUrls;
    },
    [formData.images, sellerId]
  );

  // 제출
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.title.trim()) {
        toast.error('제목을 입력해주세요');
        return;
      }
      if (!formData.description.trim()) {
        toast.error('설명을 입력해주세요');
        return;
      }
      if (!formData.category_id) {
        toast.error('카테고리를 선택해주세요');
        return;
      }
      if (!formData.youtube_url && formData.images.length === 0 && existingImages.length === 0) {
        toast.error('YouTube URL 또는 이미지를 최소 1개 이상 추가해주세요');
        return;
      }

      try {
        setLoading(true);
        const supabase = createClient();

        const uploadedUrls = await uploadImages(supabase);
        const allImages = [...existingImages, ...uploadedUrls];

        const portfolioData = {
          seller_id: sellerId,
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id,
          service_id: formData.service_id || null,
          youtube_url: formData.youtube_url || null,
          tags: formData.tags,
          images: allImages,
        };

        if (mode === 'create') {
          const { error } = await supabase.from('portfolios').insert(portfolioData);
          if (error) throw error;
          toast.success('포트폴리오가 등록되었습니다');
        } else {
          const { error } = await supabase
            .from('portfolios')
            .update(portfolioData)
            .eq('id', initialData?.id);
          if (error) throw error;
          toast.success('포트폴리오가 수정되었습니다');
        }

        router.push('/mypage/seller/portfolio');
        router.refresh();
      } catch (error) {
        logger.error('Portfolio submit error:', error);
        toast.error(
          mode === 'create' ? '포트폴리오 등록에 실패했습니다' : '포트폴리오 수정에 실패했습니다'
        );
      } finally {
        setLoading(false);
      }
    },
    [formData, existingImages, sellerId, mode, initialData?.id, router, uploadImages]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 제목 */}
      <div>
        <label htmlFor="portfolio-title" className="block text-sm font-medium text-gray-700 mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          id="portfolio-title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="포트폴리오 제목을 입력하세요"
          maxLength={100}
        />
      </div>

      {/* 설명 */}
      <div>
        <label
          htmlFor="portfolio-description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          설명 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="portfolio-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="포트폴리오에 대한 설명을 입력하세요"
          rows={5}
          maxLength={1000}
        />
      </div>

      {/* 카테고리 */}
      <div>
        <label
          htmlFor="portfolio-category"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          id="portfolio-category"
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 연관 서비스 */}
      <div>
        <label htmlFor="portfolio-service" className="block text-sm font-medium text-gray-700 mb-2">
          연관 서비스 (선택)
        </label>
        <select
          id="portfolio-service"
          value={formData.service_id}
          onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          <option value="">서비스 선택</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.title}
            </option>
          ))}
        </select>
      </div>

      {/* YouTube URL */}
      <div>
        <label htmlFor="portfolio-youtube" className="block text-sm font-medium text-gray-700 mb-2">
          YouTube URL (선택)
        </label>
        <div className="space-y-2">
          <input
            id="portfolio-youtube"
            type="url"
            value={formData.youtube_url}
            onChange={(e) => handleYoutubeUrlChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {youtubeThumbnail && (
            <div className="relative">
              <img
                src={youtubeThumbnail}
                alt="YouTube thumbnail"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Video className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white opacity-80" />
            </div>
          )}
        </div>
      </div>

      {/* 이미지 업로드 */}
      <div>
        <label htmlFor="portfolio-images" className="block text-sm font-medium text-gray-700 mb-2">
          이미지 (최대 5개)
        </label>
        <div className="space-y-4">
          {/* 기존 이미지 */}
          {existingImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {existingImages.map((url, index) => (
                <div key={`existing-${url}`} className="relative">
                  <img
                    src={url}
                    alt={`기존 이미지 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(url)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 새 이미지 미리보기 */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={`new-${preview}`} className="relative">
                  <img
                    src={preview}
                    alt={`새 이미지 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 업로드 버튼 */}
          {formData.images.length + existingImages.length < 5 && (
            <label htmlFor="portfolio-images" className="block">
              <input
                id="portfolio-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand-primary transition-colors">
                <ImagePlus className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">이미지 추가하기</p>
                <p className="text-sm text-gray-400 mt-1">
                  {formData.images.length + existingImages.length}/5
                </p>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* 태그 */}
      <div>
        <label htmlFor="portfolio-tags" className="block text-sm font-medium text-gray-700 mb-2">
          태그 (최대 5개)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            id="portfolio-tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="태그 입력 후 Enter"
            maxLength={20}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            추가
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {mode === 'create' ? '등록 중...' : '수정 중...'}
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              {mode === 'create' ? '등록하기' : '수정하기'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
