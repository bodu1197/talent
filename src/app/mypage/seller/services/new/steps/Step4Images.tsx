'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import TemplateSelector from '@/components/services/TemplateSelector';
import toast from 'react-hot-toast';

import { logger } from '@/lib/logger';
import { X, Check, ImagePlus, Sparkles } from 'lucide-react';
import { generateThumbnailWithText, type GradientTemplate } from '@/lib/template-generator';
import { ServiceFormProps } from '@/types/service-form';

// Dynamic import for TextOverlayEditor - only loads when template mode is selected
const TextOverlayEditor = dynamic(() => import('@/components/services/TextOverlayEditor'), {
  loading: () => <div className="py-8 text-center text-gray-500">Loading editor...</div>,
  ssr: false,
});

interface TextStyle {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  textAlign: CanvasTextAlign;
  fontWeight: string;
  shadowBlur: number;
}

export default function Step4Images({ formData, setFormData }: ServiceFormProps) {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'template'>('file');
  const [selectedTemplate, setSelectedTemplate] = useState<GradientTemplate | null>(null);
  const [textStyle, setTextStyle] = useState<TextStyle | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 다이얼로그 열기
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

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
      // formData 업데이트
      setFormData({ ...formData, thumbnail_file: file });

      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setFormData({ ...formData, thumbnail_file: null, thumbnail_url: '' });
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
      setFormData({ ...formData, thumbnail_file: file });

      // 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(blob);
      setThumbnailPreview(previewUrl);

      toast.success('썸네일이 생성되었습니다!');
    } catch (error) {
      logger.error('썸네일 생성 오류:', error);
      toast.error('썸네일 생성에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-6">이미지</h2>

      {/* 썸네일 이미지 */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">서비스 썸네일 *</p>

        {/* 업로드 방식 선택 탭 */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">썸네일 생성 방식을 선택하세요</p>
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setUploadMode('file');
                if (uploadMode === 'template') {
                  removeThumbnail();
                }
              }}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                uploadMode === 'file'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              내 이미지 사용
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadMode('template');
                if (uploadMode === 'file') {
                  removeThumbnail();
                }
              }}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                uploadMode === 'template'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-3 h-3 mr-1 inline" />
              템플릿으로 생성
            </button>
          </div>
        </div>

        {/* 파일 업로드 모드 */}
        {uploadMode === 'file' && (
          <div>
            {/* 숨겨진 파일 인풋 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />

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
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                  aria-label="썸네일 삭제"
                >
                  <X className="w-3 h-3 mr-1 inline" />
                  삭제
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <ImagePlus className="text-gray-400 w-12 h-12 mb-4 mx-auto" />
                <p className="text-gray-600 mb-4">서비스를 대표할 이미지를 업로드하세요</p>

                {/* 명확한 업로드 버튼 */}
                <button
                  type="button"
                  onClick={handleFileButtonClick}
                  className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-medium shadow-sm"
                >
                  <ImagePlus className="w-4 h-4 mr-2 inline" />
                  이미지 선택하기
                </button>

                <p className="text-sm text-gray-500 mt-4">권장 크기: 652×488px (최대 5MB)</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF 형식 지원</p>
              </div>
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
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                  aria-label="썸네일 다시 만들기"
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
                    <TextOverlayEditor template={selectedTemplate} onTextChange={setTextStyle} />

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
    </div>
  );
}
