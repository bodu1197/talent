'use client'

import { useState } from 'react'
import TemplateSelector from '@/components/services/TemplateSelector'
import { generateThumbnailWithText, type GradientTemplate } from '@/lib/template-generator'
import { logger } from '@/lib/logger'

interface Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step4Images({ formData, setFormData }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [useTemplate, setUseTemplate] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<GradientTemplate | null>(null)
  const [templateText, setTemplateText] = useState('')
  const [generatingTemplate, setGeneratingTemplate] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.')
      return
    }

    // 파일 형식 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    setFormData({ ...formData, thumbnail_file: file })

    // 미리보기
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setFormData({ ...formData, thumbnail_file: null, thumbnail_url: '' })
    setPreview(null)
  }

  // 템플릿 선택 핸들러
  const handleTemplateSelect = (template: GradientTemplate) => {
    setSelectedTemplate(template)
  }

  // 템플릿으로 이미지 생성
  const handleGenerateTemplate = async () => {
    if (!selectedTemplate) {
      alert('템플릿을 선택해주세요')
      return
    }

    if (!templateText.trim()) {
      alert('텍스트를 입력해주세요')
      return
    }

    if (templateText.length > 25) {
      alert('텍스트는 최대 25자까지 입력 가능합니다')
      return
    }

    try {
      setGeneratingTemplate(true)

      const blob = await generateThumbnailWithText(
        selectedTemplate,
        {
          text: templateText,
          x: 0.5,
          y: 0.5,
          fontSize: 60,
          fontFamily: 'Pretendard, sans-serif',
          color: '#ffffff',
          textAlign: 'center',
          fontWeight: 'bold',
          shadowBlur: 20,
          shadowColor: 'rgba(0,0,0,0.5)'
        }
      )

      const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' })
      setFormData({ ...formData, thumbnail_file: file })

      // 미리보기 생성
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      alert('썸네일이 생성되었습니다!')
    } catch (error) {
      logger.error('템플릿 생성 실패:', error)
      alert('템플릿 생성에 실패했습니다')
    } finally {
      setGeneratingTemplate(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">이미지</h2>

      {/* 업로드 방식 선택 */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setUseTemplate(false)}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
            !useTemplate
              ? 'border-[#0f3460] bg-blue-50 text-[#0f3460]'
              : 'border-gray-300 text-gray-700 hover:border-gray-400'
          }`}
        >
          <i className="fas fa-upload mr-2"></i>
          이미지 직접 업로드
        </button>
        <button
          type="button"
          onClick={() => setUseTemplate(true)}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
            useTemplate
              ? 'border-[#0f3460] bg-blue-50 text-[#0f3460]'
              : 'border-gray-300 text-gray-700 hover:border-gray-400'
          }`}
        >
          <i className="fas fa-magic mr-2"></i>
          템플릿으로 생성
        </button>
      </div>

      {!useTemplate ? (
        <>
          {/* 직접 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              서비스 썸네일 <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-4">
              고객이 가장 먼저 보는 이미지입니다. 서비스를 잘 나타내는 매력적인 이미지를 사용하세요.
            </p>

            {!preview && !formData.thumbnail_file ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#0f3460] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <i className="fas fa-cloud-upload-alt text-5xl text-gray-400 mb-4"></i>
                  <p className="text-gray-700 font-medium mb-2">
                    클릭하여 이미지 업로드
                  </p>
                  <p className="text-sm text-gray-500">
                    권장 크기: 1200 x 630px | 최대 5MB | JPG, PNG
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview || formData.thumbnail_url}
                  alt="Service thumbnail"
                  className="w-full h-64 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                  <i className="fas fa-times"></i>
                </button>
                <div className="mt-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="thumbnail-reupload"
                  />
                  <label
                    htmlFor="thumbnail-reupload"
                    className="inline-block px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    다른 이미지 선택
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 이미지 가이드 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              <i className="fas fa-info-circle text-blue-600 mr-2"></i>
              좋은 썸네일 이미지 만들기
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-green-600 mt-1"></i>
                <span><strong>고품질:</strong> 선명하고 고해상도의 이미지 사용</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-green-600 mt-1"></i>
                <span><strong>대표성:</strong> 서비스를 잘 표현하는 이미지 선택</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-green-600 mt-1"></i>
                <span><strong>간결함:</strong> 너무 많은 텍스트나 요소는 피하기</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-green-600 mt-1"></i>
                <span><strong>일관성:</strong> 브랜드나 작업 스타일과 일치</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-times text-red-600 mt-1"></i>
                <span><strong>저작권:</strong> 타인의 이미지 무단 사용 금지</span>
              </li>
            </ul>
          </div>
        </>
      ) : (
        <>
          {/* 템플릿으로 생성 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              배너 텍스트 입력 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              maxLength={25}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent mb-2"
              placeholder="서비스 제목 또는 핵심 문구 (최대 25자)"
            />
            <p className="text-sm text-gray-500 mb-6">
              {templateText.length} / 25자
            </p>

            {/* 템플릿 선택 */}
            <TemplateSelector
              onSelect={handleTemplateSelect}
              selectedTemplateId={selectedTemplate?.id}
            />

            {/* 생성 버튼 */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleGenerateTemplate}
                disabled={!selectedTemplate || !templateText.trim() || generatingTemplate}
                className="flex-1 py-3 bg-[#0f3460] text-white rounded-lg font-medium hover:bg-[#1a4d8f] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {generatingTemplate ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    생성 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>
                    썸네일 생성하기
                  </>
                )}
              </button>
            </div>

            {/* 미리보기 */}
            {preview && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">생성된 썸네일</h4>
                <div className="relative">
                  <img
                    src={preview}
                    alt="Generated thumbnail"
                    className="w-full rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
