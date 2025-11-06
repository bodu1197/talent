'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/mypage/Sidebar'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import Link from 'next/link'

interface Portfolio {
  id: string
  seller_id: string
  title: string
  description: string
  category_id: string | null
  thumbnail_url: string | null
  image_urls: string[]
  project_url: string | null
  tags: string[]
  view_count: number
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
}

interface Props {
  portfolio: Portfolio
  sellerId: string
  categories: Category[]
}

export default function PortfolioEditClient({ portfolio, sellerId, categories }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: portfolio.title,
    description: portfolio.description,
    category_id: portfolio.category_id || '',
    thumbnail_url: portfolio.thumbnail_url || '',
    image_urls: portfolio.image_urls || [],
    project_url: portfolio.project_url || '',
    tags: portfolio.tags || []
  })
  const [tagInput, setTagInput] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([
    portfolio.thumbnail_url,
    ...(portfolio.image_urls || [])
  ].filter(Boolean) as string[])

  // 카테고리 계층 구조 생성
  const categoryTree = useMemo(() => {
    const topLevel = categories.filter(c => !c.parent_id)
    return topLevel.map(parent => ({
      ...parent,
      children: categories.filter(c => c.parent_id === parent.id).map(child => ({
        ...child,
        children: categories.filter(c => c.parent_id === child.id)
      }))
    }))
  }, [categories])

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // 기존 파일에 새 파일 추가 (누적)
    setImageFiles(prev => [...prev, ...files])

    // 미리보기 생성 (기존 미리보기에 새 미리보기 추가)
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...previews])
  }

  // 새 이미지 삭제
  const handleRemoveNewImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
  }

  // 기존 이미지 삭제
  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description) {
      alert('제목과 설명을 입력해주세요')
      return
    }

    try {
      setLoading(true)
      setUploading(true)

      let thumbnail_url = formData.thumbnail_url
      let image_urls = formData.image_urls

      // 새 이미지 파일 업로드
      if (imageFiles.length > 0) {
        const supabase = createClient()
        const uploadedUrls: string[] = []

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `portfolio/${fileName}`

          // Supabase Storage에 직접 업로드
          const { error: uploadError } = await supabase.storage
            .from('portfolio')
            .upload(filePath, file, { upsert: false })

          if (uploadError) {
            logger.error('Image upload failed:', uploadError)
            throw new Error(`이미지 업로드 실패: ${uploadError.message}`)
          }

          // 공개 URL 가져오기
          const { data: { publicUrl } } = supabase.storage
            .from('portfolio')
            .getPublicUrl(filePath)

          uploadedUrls.push(publicUrl)
        }

        // 기존 이미지와 새 이미지 합치기
        const allImages = [...existingImages, ...uploadedUrls]
        thumbnail_url = allImages[0] || ''
        image_urls = allImages.slice(1)
      } else {
        // 새 이미지 업로드가 없는 경우, 기존 이미지만 사용
        thumbnail_url = existingImages[0] || ''
        image_urls = existingImages.slice(1)
      }

      setUploading(false)

      const response = await fetch(`/api/seller/portfolio/${portfolio.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          thumbnail_url,
          image_urls,
          seller_id: sellerId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        logger.error('Portfolio update failed:', {
          status: response.status,
          error: result.error,
          details: result.details
        })
        alert(`수정 실패: ${result.details || result.error || '알 수 없는 오류'}`)
        return
      }

      alert('포트폴리오가 수정되었습니다')
      router.push(`/mypage/seller/portfolio/${portfolio.id}`)
      router.refresh()
    } catch (error) {
      logger.error('Portfolio update error:', error)
      alert('수정에 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'))
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    })
  }

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl">
          <div className="mb-8">
            <Link
              href={`/mypage/seller/portfolio/${portfolio.id}`}
              className="text-gray-600 hover:text-[#0f3460] transition-colors mb-4 inline-block"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              포트폴리오 상세
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">포트폴리오 수정</h1>
            <p className="text-gray-600">작업물 정보를 수정하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                placeholder="포트폴리오 제목을 입력하세요"
                required
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                placeholder="프로젝트에 대한 자세한 설명을 입력하세요"
                required
              />
            </div>

            {/* 기존 이미지 */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기존 이미지 <span className="text-gray-500 text-xs">(첫 이미지가 썸네일이 됩니다)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-[#0f3460] text-white text-xs px-2 py-1 rounded">
                          썸네일
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 새 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                새 이미지 추가 {existingImages.length === 0 && <span className="text-gray-500 text-xs">(첫 이미지가 썸네일이 됩니다)</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
              />
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {existingImages.length === 0 && index === 0 && (
                        <span className="absolute top-2 left-2 bg-[#0f3460] text-white text-xs px-2 py-1 rounded">
                          썸네일
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 프로젝트 URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로젝트 URL
              </label>
              <input
                type="url"
                value={formData.project_url}
                onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                태그
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  placeholder="태그 입력 후 Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
                      >
                        <i className="fas fa-times"></i>
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
                className="flex-1 px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploading ? '이미지 업로드 중...' : loading ? '수정 중...' : '수정하기'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
