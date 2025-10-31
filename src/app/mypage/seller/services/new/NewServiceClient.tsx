'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type PackageType = 'basic' | 'standard' | 'premium'

interface Category {
  id: string
  name: string
  slug: string
  level: number
  parent_id: string | null
}

interface Props {
  sellerId: string
  categories: any[]
}

export default function NewServiceClient({ sellerId }: Props) {
  const [activePackage, setActivePackage] = useState<PackageType>('basic')
  const [level1Categories, setLevel1Categories] = useState<Category[]>([])
  const [level2Categories, setLevel2Categories] = useState<Category[]>([])
  const [level3Categories, setLevel3Categories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel1, setSelectedLevel1] = useState('')
  const [selectedLevel2, setSelectedLevel2] = useState('')
  const [selectedLevel3, setSelectedLevel3] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    packages: {
      basic: { price: '', deliveryDays: '', revisionCount: '0', features: [''] },
      standard: { price: '', deliveryDays: '', revisionCount: '1', features: [''] },
      premium: { price: '', deliveryDays: '', revisionCount: '2', features: [''] }
    }
  })

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB를 초과할 수 없습니다.')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
  }

  // Load level 1 categories on mount
  useEffect(() => {
    async function fetchLevel1Categories() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, level, parent_id')
          .eq('is_active', true)
          .eq('level', 1)
          .order('display_order', { ascending: true })

        if (error) {
          console.error('1차 카테고리 로딩 오류:', error)
        } else {
          setLevel1Categories(data || [])
        }
      } catch (error) {
        console.error('1차 카테고리 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLevel1Categories()
  }, [])

  // Load level 2 categories when level 1 is selected
  useEffect(() => {
    if (!selectedLevel1) {
      setLevel2Categories([])
      setSelectedLevel2('')
      setLevel3Categories([])
      setSelectedLevel3('')
      return
    }

    async function fetchLevel2Categories() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, level, parent_id')
          .eq('is_active', true)
          .eq('parent_id', selectedLevel1)
          .order('display_order', { ascending: true })

        if (error) {
          console.error('2차 카테고리 로딩 오류:', error)
        } else {
          setLevel2Categories(data || [])
        }
      } catch (error) {
        console.error('2차 카테고리 로딩 실패:', error)
      }
    }

    fetchLevel2Categories()
  }, [selectedLevel1])

  // Load level 3 categories when level 2 is selected
  useEffect(() => {
    if (!selectedLevel2) {
      setLevel3Categories([])
      setSelectedLevel3('')
      return
    }

    async function fetchLevel3Categories() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, level, parent_id')
          .eq('is_active', true)
          .eq('parent_id', selectedLevel2)
          .order('display_order', { ascending: true })

        if (error) {
          console.error('3차 카테고리 로딩 오류:', error)
        } else {
          setLevel3Categories(data || [])
        }
      } catch (error) {
        console.error('3차 카테고리 로딩 실패:', error)
      }
    }

    fetchLevel3Categories()
  }, [selectedLevel2])

  // Update final category when level 3 is selected
  useEffect(() => {
    if (selectedLevel3) {
      setFormData({ ...formData, category: selectedLevel3 })
    } else if (selectedLevel2 && level3Categories.length === 0) {
      // If level 2 selected but no level 3 exists, use level 2
      setFormData({ ...formData, category: selectedLevel2 })
    }
  }, [selectedLevel3, selectedLevel2, level3Categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!thumbnailFile) {
      alert('썸네일 이미지를 선택해주세요.')
      return
    }

    if (!formData.category) {
      alert('카테고리를 선택해주세요.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // 1. Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        alert('로그인이 필요합니다.')
        return
      }

      console.log('Using seller_id from props:', sellerId)

      // 2. Upload thumbnail
      const fileExt = thumbnailFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `service-thumbnails/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('services')
        .upload(filePath, thumbnailFile)

      if (uploadError) {
        console.error('Thumbnail upload error:', uploadError)
        alert('썸네일 업로드에 실패했습니다.')
        return
      }

      // 3. Get thumbnail public URL
      const { data: { publicUrl } } = supabase.storage
        .from('services')
        .getPublicUrl(filePath)

      // 4. Create slug from title
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100)

      // 5. Insert service
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .insert({
          seller_id: sellerId,
          title: formData.title,
          slug: `${slug}-${Date.now()}`,
          description: formData.description,
          price: parseInt(formData.packages.basic.price) || 0,
          delivery_days: parseInt(formData.packages.basic.deliveryDays) || 7,
          revision_count: formData.packages.basic.revisionCount === 'unlimited' ? 999 : parseInt(formData.packages.basic.revisionCount) || 0,
          thumbnail_url: publicUrl,
          status: 'draft'
        })
        .select()
        .single()

      if (serviceError) {
        console.error('Service insert error:', serviceError)
        alert('서비스 등록에 실패했습니다: ' + serviceError.message)
        return
      }

      // 6. Insert service category
      const { error: categoryError } = await supabase
        .from('service_categories')
        .insert({
          service_id: service.id,
          category_id: formData.category,
          is_primary: true
        })

      if (categoryError) {
        console.error('Category insert error:', categoryError)
      }

      // 7. Insert service packages
      const packages = []
      for (const [type, pkg] of Object.entries(formData.packages)) {
        if (pkg.price && pkg.deliveryDays) {
          packages.push({
            service_id: service.id,
            package_type: type,
            name: type === 'basic' ? '베이직' : type === 'standard' ? '스탠다드' : '프리미엄',
            description: pkg.features.filter(f => f).join(', '),
            price: parseInt(pkg.price),
            delivery_days: parseInt(pkg.deliveryDays),
            revision_count: pkg.revisionCount === 'unlimited' ? 999 : parseInt(pkg.revisionCount),
            features: pkg.features.filter(f => f)
          })
        }
      }

      if (packages.length > 0) {
        const { error: packagesError } = await supabase
          .from('service_packages')
          .insert(packages)

        if (packagesError) {
          console.error('Packages insert error:', packagesError)
        }
      }

      alert('서비스가 성공적으로 등록되었습니다!')
      window.location.href = '/mypage/seller/services'

    } catch (error) {
      console.error('Service registration error:', error)
      alert('서비스 등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-8">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <Link
            href="/mypage/seller/services"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>서비스 관리로</span>
          </Link>
        </div>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">서비스 등록</h1>
          <p className="text-gray-600">새로운 서비스를 등록하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">기본 정보</h2>

            <div className="space-y-4">
              {/* 썸네일 이미지 - 최상단 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  썸네일 이미지 *
                </label>
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
                        className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        <i className="fas fa-times mr-1"></i>
                        삭제
                      </button>
                    </div>
                  ) : (
                    <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#0f3460] transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                        required
                      />
                      <i className="fas fa-cloud-upload-alt text-gray-400 text-4xl mb-3"></i>
                      <p className="text-gray-600 font-medium">클릭하여 이미지 선택</p>
                      <p className="text-sm text-gray-500 mt-2">권장 크기: 800x600px (최대 5MB)</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF 형식 지원</p>
                    </label>
                  )}
                </div>
              </div>

              {/* 서비스 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  서비스 제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="예: 전문 로고 디자인 작업"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <div className="space-y-3">
                  {/* 1차 카테고리 */}
                  <select
                    value={selectedLevel1}
                    onChange={(e) => setSelectedLevel1(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    required
                    disabled={loading}
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                      required
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
                      {level1Categories.find(c => c.id === selectedLevel1)?.name}
                      {selectedLevel2 && ` > ${level2Categories.find(c => c.id === selectedLevel2)?.name}`}
                      {selectedLevel3 && ` > ${level3Categories.find(c => c.id === selectedLevel3)?.name}`}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  서비스 설명 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  placeholder="서비스에 대해 자세히 설명해주세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* 패키지 설정 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">패키지 설정</h2>

            {/* 패키지 탭 */}
            <div className="flex gap-2 mb-6">
              {[
                { key: 'basic', label: '베이직' },
                { key: 'standard', label: '스탠다드' },
                { key: 'premium', label: '프리미엄' }
              ].map((pkg) => (
                <button
                  key={pkg.key}
                  type="button"
                  onClick={() => setActivePackage(pkg.key as PackageType)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    activePackage === pkg.key
                      ? 'bg-[#0f3460] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pkg.label}
                </button>
              ))}
            </div>

            {/* 패키지 내용 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가격 (원) *
                  </label>
                  <input
                    type="number"
                    value={formData.packages[activePackage].price}
                    onChange={(e) => setFormData({
                      ...formData,
                      packages: {
                        ...formData.packages,
                        [activePackage]: {
                          ...formData.packages[activePackage],
                          price: e.target.value
                        }
                      }
                    })}
                    placeholder="50000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    작업 기간 (일) *
                  </label>
                  <input
                    type="number"
                    value={formData.packages[activePackage].deliveryDays}
                    onChange={(e) => setFormData({
                      ...formData,
                      packages: {
                        ...formData.packages,
                        [activePackage]: {
                          ...formData.packages[activePackage],
                          deliveryDays: e.target.value
                        }
                      }
                    })}
                    placeholder="7"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수정 횟수 *
                </label>
                <select
                  value={formData.packages[activePackage].revisionCount}
                  onChange={(e) => setFormData({
                    ...formData,
                    packages: {
                      ...formData.packages,
                      [activePackage]: {
                        ...formData.packages[activePackage],
                        revisionCount: e.target.value
                      }
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  required
                >
                  <option value="0">수정 불가</option>
                  <option value="1">1회</option>
                  <option value="2">2회</option>
                  <option value="3">3회</option>
                  <option value="unlimited">무제한</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제공 내용 *
                </label>
                <div className="space-y-2">
                  {formData.packages[activePackage].features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...formData.packages[activePackage].features]
                          newFeatures[index] = e.target.value
                          setFormData({
                            ...formData,
                            packages: {
                              ...formData.packages,
                              [activePackage]: {
                                ...formData.packages[activePackage],
                                features: newFeatures
                              }
                            }
                          })
                        }}
                        placeholder="예: 로고 시안 3개"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                      />
                      {index === formData.packages[activePackage].features.length - 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              packages: {
                                ...formData.packages,
                                [activePackage]: {
                                  ...formData.packages[activePackage],
                                  features: [...formData.packages[activePackage].features, '']
                                }
                              }
                            })
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">추가 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-[#0f3460] border-gray-300 rounded focus:ring-[#0f3460]" />
                  <span className="text-sm text-gray-700">빠른 작업 가능 (24시간 이내 시작)</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-[#0f3460] border-gray-300 rounded focus:ring-[#0f3460]" />
                  <span className="text-sm text-gray-700">상업적 이용 가능</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-[#0f3460] border-gray-300 rounded focus:ring-[#0f3460]" />
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
              className="flex-1 px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  등록 중...
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-2"></i>
                  서비스 등록
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
