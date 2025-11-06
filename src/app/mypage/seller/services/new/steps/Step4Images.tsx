'use client'

import { useState } from 'react'

interface Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step4Images({ formData, setFormData }: Props) {
  const [preview, setPreview] = useState<string | null>(null)

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">이미지</h2>

      {/* 썸네일 이미지 */}
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

      {/* 추가 이미지 (선택사항) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          추가 이미지 <span className="text-gray-500 text-xs">(선택사항 - 최대 5개)</span>
        </label>
        <p className="text-sm text-gray-500 mb-4">
          포트폴리오나 작업 과정을 보여주는 추가 이미지를 업로드할 수 있습니다.
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <i className="fas fa-images text-4xl text-gray-400 mb-3"></i>
          <p className="text-gray-600">
            추가 이미지는 Step 5의 포트폴리오 섹션에서 등록할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  )
}
