'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { CheckCircle, X, Loader2, Youtube } from 'lucide-react';
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

interface Props {
  readonly sellerId: string;
  readonly categories: Category[];
  readonly services: Service[];
}

export default function PortfolioNewClient({ sellerId, categories, services }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    thumbnail_url: '',
    image_urls: [] as string[],
    project_url: '',
    youtube_url: '',
    service_ids: [] as string[], // 다중 선택으로 변경
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [fetchingYoutubeThumbnail, setFetchingYoutubeThumbnail] = useState(false);

  // Helper: Build child categories
  const buildChildCategories = useCallback(
    (parentId: string) => {
      return categories
        .filter((c) => c.parent_id === parentId)
        .map((child) => ({
          ...child,
          children: categories.filter((c) => c.parent_id === child.id),
        }));
    },
    [categories]
  );

  // 카테고리 계층 구조 생성 (향후 확장용)
  // eslint-disable-next-line sonarjs/no-unused-vars
  const _categoryTree = useMemo(() => {
    const topLevel = categories.filter((c) => !c.parent_id);
    return topLevel.map((parent) => ({
      ...parent,
      children: buildChildCategories(parent.id),
    }));
  }, [categories, buildChildCategories]);

  // YouTube URL에서 비디오 ID 추출
  const extractYoutubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(url);
      if (match) return match[1];
    }
    return null;
  };

  // YouTube URL 입력 핸들러
  const handleYoutubeUrlChange = async (url: string) => {
    setFormData({ ...formData, youtube_url: url });

    if (!url) {
      setYoutubeVideoId('');
      return;
    }

    const videoId = extractYoutubeVideoId(url);
    if (videoId) {
      setYoutubeVideoId(videoId);

      // YouTube 썸네일 자동 다운로드
      try {
        setFetchingYoutubeThumbnail(true);

        // YouTube 썸네일 URL (maxresdefault가 없으면 hqdefault 사용)
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        // 썸네일 이미지를 Blob으로 가져오기
        const response = await fetch(thumbnailUrl);
        if (response.ok) {
          const blob = await response.blob();
          const file = new File([blob], `youtube-${videoId}.jpg`, {
            type: 'image/jpeg',
          });
          setImageFiles((prev) => [file, ...prev]);
          const preview = URL.createObjectURL(blob);
          setImagePreviews((prev) => [preview, ...prev]);
        } else {
          // maxresdefault가 없으면 hqdefault 시도
          const fallbackUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          const fallbackResponse = await fetch(fallbackUrl);
          const blob = await fallbackResponse.blob();

          // Blob을 File로 변환
          const file = new File([blob], `youtube-${videoId}.jpg`, {
            type: 'image/jpeg',
          });

          // 기존 이미지 파일 배열에 추가
          setImageFiles((prev) => [file, ...prev]);

          // 미리보기 생성
          const preview = URL.createObjectURL(blob);
          setImagePreviews((prev) => [preview, ...prev]);
        }
      } catch (error) {
        logger.error('Failed to fetch YouTube thumbnail:', error);
      } finally {
        setFetchingYoutubeThumbnail(false);
      }
    } else {
      setYoutubeVideoId('');
    }
  };

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 기존 파일에 새 파일 추가 (누적)
    setImageFiles((prev) => [...prev, ...files]);

    // 미리보기 생성 (기존 미리보기에 새 미리보기 추가)
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  // 이미지 삭제
  const handleRemoveImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('제목과 설명을 입력해주세요');
      return;
    }

    try {
      setLoading(true);
      setUploading(true);

      let thumbnail_url = formData.thumbnail_url;
      let image_urls = formData.image_urls;

      // 이미지 파일 업로드 (클라이언트에서 직접 Supabase Storage에 업로드)
      if (imageFiles.length > 0) {
        const supabase = createClient();
        const uploadedUrls: string[] = [];

        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${fileExt}`;
          const filePath = `portfolio/${fileName}`;

          // Supabase Storage에 직접 업로드
          const { error: uploadError } = await supabase.storage
            .from('portfolio')
            .upload(filePath, file, { upsert: false });

          if (uploadError) {
            logger.error('Image upload failed:', uploadError);
            throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
          }

          // 공개 URL 가져오기
          const {
            data: { publicUrl },
          } = supabase.storage.from('portfolio').getPublicUrl(filePath);

          uploadedUrls.push(publicUrl);
        }

        // 첫 번째 이미지를 썸네일로, 나머지를 포트폴리오 이미지로
        thumbnail_url = uploadedUrls[0];
        image_urls = uploadedUrls.slice(1);
      }

      setUploading(false);

      const response = await fetch('/api/seller/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          thumbnail_url,
          image_urls,
          seller_id: sellerId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        logger.error('Portfolio creation failed:', {
          status: response.status,
          error: result.error,
          details: result.details,
        });
        toast.error(`등록 실패: ${result.details || result.error || '알 수 없는 오류'}`);
        return;
      }

      toast.success('포트폴리오가 등록되었습니다');
      router.push('/mypage/seller/portfolio');
      router.refresh();
    } catch (error) {
      logger.error('Portfolio creation error:', error);
      toast.error(
        '등록에 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류')
      );
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="w-full max-w-[1200px] px-4 py-4 sm:py-6 lg:py-8 mx-auto">
        <div className="max-w-3xl">
          <div className="mb-8">
            <h1 className="text-base md:text-lg font-semibold text-gray-900">포트폴리오 등록</h1>
            <p className="text-gray-600 mt-1 text-sm">작업물을 등록하여 고객에게 보여주세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label
                htmlFor="portfolio-title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                id="portfolio-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="포트폴리오 제목을 입력하세요"
                required
              />
            </div>

            {/* 연동 서비스 선택 (다중 선택) */}
            {services.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연동 서비스{' '}
                  <span className="text-gray-500 text-xs">
                    (다중 선택 가능 - 선택한 서비스의 상세 페이지에 이 포트폴리오가 표시됩니다)
                  </span>
                </label>
                <div className="border border-gray-300 rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.service_ids.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              service_ids: [...formData.service_ids, service.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              service_ids: formData.service_ids.filter((id) => id !== service.id),
                            });
                          }
                        }}
                        className="mt-1 w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{service.title}</p>
                        {service.status === 'pending' && (
                          <p className="text-xs text-gray-500 mt-1">승인 대기중</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                {formData.service_ids.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    <CheckCircle className="inline w-4 h-4 text-green-600 mr-1" />
                    {formData.service_ids.length}개의 서비스에 연결됩니다
                  </p>
                )}
              </div>
            )}

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
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="프로젝트에 대한 자세한 설명을 입력하세요"
                required
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label
                htmlFor="portfolio-images"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이미지 업로드{' '}
                <span className="text-gray-500 text-xs">(첫 이미지가 썸네일이 됩니다)</span>
              </label>
              <input
                id="portfolio-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={`preview-${preview}`} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-brand-primary text-white text-xs px-2 py-1 rounded">
                          썸네일
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        aria-label={`이미지 ${index + 1} 제거`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 프로젝트 URL */}
            <div>
              <label
                htmlFor="portfolio-project-url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                프로젝트 URL
              </label>
              <input
                id="portfolio-project-url"
                type="url"
                value={formData.project_url}
                onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            {/* YouTube URL */}
            <div>
              <label
                htmlFor="portfolio-youtube-url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                YouTube 영상 URL{' '}
                <span className="text-gray-500 text-xs">(영상이 포트폴리오에 삽입됩니다)</span>
              </label>
              <input
                id="portfolio-youtube-url"
                type="url"
                value={formData.youtube_url}
                onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={fetchingYoutubeThumbnail}
              />
              {fetchingYoutubeThumbnail && (
                <p className="mt-2 text-sm text-gray-600">
                  <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                  YouTube 썸네일을 가져오는 중...
                </p>
              )}
              {youtubeVideoId && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <Youtube className="inline w-4 h-4 text-red-600 mr-2" />
                    YouTube 영상 미리보기
                  </p>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                      title="YouTube video preview"
                      style={{ border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>

            {/* 태그 */}
            <div>
              <label
                htmlFor="portfolio-tag-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                태그
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  id="portfolio-tag-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="태그 입력 후 Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  aria-label="태그 추가"
                >
                  추가
                </button>
              </div>
              {formData.tags.length > 0 && (
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
                        aria-label={`${tag} 태그 제거`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {(() => {
                  if (uploading) return '이미지 업로드 중...';
                  if (loading) return '등록 중...';
                  return '등록하기';
                })()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
