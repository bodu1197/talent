'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { CATEGORIES, AI_TOOLS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

export default function NewServicePage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const supabase = createClient()

  // 서비스 기본 정보
  const [serviceData, setServiceData] = useState({
    category_id: '',
    title: '',
    description: '',
    thumbnail: null as File | null,
    price_min: 0,
    price_max: 0,
    delivery_days: 3,
    revision_count: 1,
    is_express_available: false,
    express_price: 0,
    express_days: 1
  })

  // AI 서비스 정보
  const [aiServiceData, setAiServiceData] = useState({
    is_ai_service: false,
    ai_tool: '',
    version: '',
    features: [] as string[],
    sample_prompts: [] as string[]
  })

  // 패키지 정보
  const [packages, setPackages] = useState({
    basic: {
      name: 'BASIC',
      price: 0,
      description: '',
      delivery_days: 3,
      revision_count: 1,
      features: [] as string[]
    },
    standard: {
      name: 'STANDARD',
      price: 0,
      description: '',
      delivery_days: 5,
      revision_count: 3,
      features: [] as string[]
    },
    premium: {
      name: 'PREMIUM',
      price: 0,
      description: '',
      delivery_days: 7,
      revision_count: -1, // 무제한
      features: [] as string[]
    }
  })

  // 카테고리 선택 시 AI 서비스 여부 자동 설정
  const handleCategoryChange = (categoryId: string) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId)
    setServiceData({ ...serviceData, category_id: categoryId })
    if (category) {
      setAiServiceData({ ...aiServiceData, is_ai_service: category.is_ai })
    }
  }

  // AI 툴 목록 가져오기
  const getAIToolsForCategory = () => {
    const categoryId = serviceData.category_id
    if (categoryId.includes('image')) return AI_TOOLS.IMAGE
    if (categoryId.includes('video')) return AI_TOOLS.VIDEO
    if (categoryId.includes('writing')) return AI_TOOLS.WRITING
    if (categoryId.includes('programming')) return AI_TOOLS.CODING
    if (categoryId.includes('audio') || categoryId.includes('music')) return [...AI_TOOLS.AUDIO, ...AI_TOOLS.MUSIC]
    return []
  }

  // 서비스 등록 처리
  const handleSubmit = async () => {
    if (!user || !profile) {
      alert('로그인이 필요합니다')
      router.push('/auth/login')
      return
    }

    if (profile.user_type === 'buyer') {
      alert('판매자 등록이 필요합니다')
      router.push('/seller/register')
      return
    }

    setLoading(true)

    try {
      // 1. 서비스 등록
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .insert({
          seller_id: user.id,
          category_id: serviceData.category_id,
          title: serviceData.title,
          description: serviceData.description,
          price_min: packages.basic.price,
          price_max: packages.premium.price,
          delivery_days: serviceData.delivery_days,
          revision_count: serviceData.revision_count,
          is_express_available: serviceData.is_express_available,
          express_price: serviceData.express_price,
          express_days: serviceData.express_days,
          status: 'pending', // 관리자 승인 대기
          metadata: {
            packages
          }
        } as any)
        .select()
        .single()

      if (serviceError) throw serviceError

      // 2. AI 서비스 정보 등록 (AI 서비스인 경우)
      if (aiServiceData.is_ai_service && service) {
        const { error: aiError } = await supabase
          .from('ai_services')
          .insert({
            service_id: (service as any).id,
            ai_tool: aiServiceData.ai_tool,
            version: aiServiceData.version,
            features: aiServiceData.features,
            sample_prompts: aiServiceData.sample_prompts
          } as any)

        if (aiError) throw aiError
      }

      // 3. 썸네일 업로드 (있는 경우)
      if (serviceData.thumbnail && service) {
        const fileExt = serviceData.thumbnail.name.split('.').pop()
        const fileName = `${(service as any).id}/thumbnail.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('service-thumbnails')
          .upload(fileName, serviceData.thumbnail)

        if (uploadError) throw uploadError

        // 썸네일 URL 업데이트
        const { data: { publicUrl } } = supabase.storage
          .from('service-thumbnails')
          .getPublicUrl(fileName)

        const updateResult = await (supabase as any)
          .from('services')
          .update({ thumbnail_url: publicUrl })
          .eq('id', (service as any).id)
      }

      alert('서비스가 성공적으로 등록되었습니다. 관리자 승인 후 공개됩니다.')
      router.push('/seller/services')
    } catch (error) {
      console.error('Error creating service:', error)
      alert('서비스 등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 로그인 체크
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
          <button
            onClick={() => router.push('/auth/login')}
            className="btn-primary px-6 py-3"
          >
            로그인하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 진행 상태 표시 */}
      <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex items-center ${s < 4 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      step > s ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm">기본 정보</span>
            <span className="text-sm">가격 설정</span>
            <span className="text-sm">상세 설정</span>
            <span className="text-sm">검토 및 등록</span>
          </div>
        </div>

        {/* Step 1: 기본 정보 */}
        {step === 1 && (
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">서비스 기본 정보</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  카테고리 *
                </label>
                <select
                  value={serviceData.category_id}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">카테고리를 선택하세요</option>
                  {CATEGORIES.map(cat => (
                    <optgroup key={cat.id} label={cat.name}>
                      <option value={cat.id}>{cat.name}</option>
                      {cat.children?.map(child => (
                        <option key={child.id} value={child.id}>
                          ㄴ {child.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  서비스 제목 *
                </label>
                <input
                  type="text"
                  value={serviceData.title}
                  onChange={(e) =>
                    setServiceData({ ...serviceData, title: e.target.value })
                  }
                  className="input"
                  placeholder="예: Midjourney로 브랜드 로고 디자인 - 24시간 완성"
                  maxLength={100}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {serviceData.title.length}/100
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  서비스 설명 *
                </label>
                <textarea
                  value={serviceData.description}
                  onChange={(e) =>
                    setServiceData({ ...serviceData, description: e.target.value })
                  }
                  className="textarea h-32"
                  placeholder="서비스에 대한 상세한 설명을 작성해주세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  썸네일 이미지
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setServiceData({
                      ...serviceData,
                      thumbnail: e.target.files?.[0] || null
                    })
                  }
                  className="input"
                />
              </div>

              {aiServiceData.is_ai_service && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">AI 서비스 정보</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        사용 AI 툴 *
                      </label>
                      <select
                        value={aiServiceData.ai_tool}
                        onChange={(e) =>
                          setAiServiceData({ ...aiServiceData, ai_tool: e.target.value })
                        }
                        className="input"
                        required
                      >
                        <option value="">AI 툴을 선택하세요</option>
                        {getAIToolsForCategory().map(tool => (
                          <option key={tool} value={tool}>{tool}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        버전 (선택)
                      </label>
                      <input
                        type="text"
                        value={aiServiceData.version}
                        onChange={(e) =>
                          setAiServiceData({ ...aiServiceData, version: e.target.value })
                        }
                        className="input"
                        placeholder="예: v5.2, GPT-4"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(2)}
                className="btn-ai px-6 py-3"
                disabled={!serviceData.category_id || !serviceData.title || !serviceData.description}
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 가격 설정 */}
        {step === 2 && (
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">패키지 및 가격 설정</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(packages).map(([key, pkg]) => (
                <div key={key} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">{pkg.name}</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm">가격 (원)</label>
                      <input
                        type="number"
                        value={pkg.price}
                        onChange={(e) =>
                          setPackages({
                            ...packages,
                            [key]: { ...pkg, price: parseInt(e.target.value) }
                          })
                        }
                        className="input"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="text-sm">설명</label>
                      <textarea
                        value={pkg.description}
                        onChange={(e) =>
                          setPackages({
                            ...packages,
                            [key]: { ...pkg, description: e.target.value }
                          })
                        }
                        className="textarea h-20"
                      />
                    </div>

                    <div>
                      <label className="text-sm">작업 기간 (일)</label>
                      <input
                        type="number"
                        value={pkg.delivery_days}
                        onChange={(e) =>
                          setPackages({
                            ...packages,
                            [key]: { ...pkg, delivery_days: parseInt(e.target.value) }
                          })
                        }
                        className="input"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="text-sm">수정 횟수</label>
                      <input
                        type="number"
                        value={pkg.revision_count}
                        onChange={(e) =>
                          setPackages({
                            ...packages,
                            [key]: { ...pkg, revision_count: parseInt(e.target.value) }
                          })
                        }
                        className="input"
                        min="-1"
                      />
                      <p className="text-xs text-gray-500">-1은 무제한</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary px-6 py-3"
              >
                이전 단계
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-ai px-6 py-3"
                disabled={!packages.basic.price}
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 상세 설정 */}
        {step === 3 && (
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">추가 옵션</h2>

            <div className="space-y-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={serviceData.is_express_available}
                    onChange={(e) =>
                      setServiceData({
                        ...serviceData,
                        is_express_available: e.target.checked
                      })
                    }
                    className="mr-2"
                  />
                  <span className="font-medium">익스프레스 서비스 제공</span>
                </label>
              </div>

              {serviceData.is_express_available && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="text-sm">익스프레스 추가 요금</label>
                    <input
                      type="number"
                      value={serviceData.express_price}
                      onChange={(e) =>
                        setServiceData({
                          ...serviceData,
                          express_price: parseInt(e.target.value)
                        })
                      }
                      className="input"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm">익스프레스 작업 기간</label>
                    <input
                      type="number"
                      value={serviceData.express_days}
                      onChange={(e) =>
                        setServiceData({
                          ...serviceData,
                          express_days: parseInt(e.target.value)
                        })
                      }
                      className="input"
                      min="1"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  기본 작업 기간 (일)
                </label>
                <input
                  type="number"
                  value={serviceData.delivery_days}
                  onChange={(e) =>
                    setServiceData({
                      ...serviceData,
                      delivery_days: parseInt(e.target.value)
                    })
                  }
                  className="input"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  기본 수정 횟수
                </label>
                <input
                  type="number"
                  value={serviceData.revision_count}
                  onChange={(e) =>
                    setServiceData({
                      ...serviceData,
                      revision_count: parseInt(e.target.value)
                    })
                  }
                  className="input"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary px-6 py-3"
              >
                이전 단계
              </button>
              <button
                onClick={() => setStep(4)}
                className="btn-ai px-6 py-3"
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 검토 및 등록 */}
        {step === 4 && (
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">서비스 등록 확인</h2>

            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">기본 정보</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex">
                    <dt className="w-32 text-gray-600">카테고리:</dt>
                    <dd>{CATEGORIES.find(c => c.id === serviceData.category_id)?.name}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-32 text-gray-600">제목:</dt>
                    <dd>{serviceData.title}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-32 text-gray-600">설명:</dt>
                    <dd className="line-clamp-3">{serviceData.description}</dd>
                  </div>
                  {aiServiceData.is_ai_service && (
                    <div className="flex">
                      <dt className="w-32 text-gray-600">AI 툴:</dt>
                      <dd>{aiServiceData.ai_tool}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">패키지 가격</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">BASIC</p>
                    <p className="text-2xl font-bold">{packages.basic.price.toLocaleString()}원</p>
                  </div>
                  <div>
                    <p className="font-medium">STANDARD</p>
                    <p className="text-2xl font-bold">{packages.standard.price.toLocaleString()}원</p>
                  </div>
                  <div>
                    <p className="font-medium">PREMIUM</p>
                    <p className="text-2xl font-bold">{packages.premium.price.toLocaleString()}원</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>안내:</strong> 서비스 등록 후 관리자 검토를 거쳐 승인됩니다.
                  승인까지 보통 1-2일이 소요됩니다.
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(3)}
                className="btn-secondary px-6 py-3"
              >
                이전 단계
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-ai px-6 py-3"
              >
                {loading ? '등록 중...' : '서비스 등록'}
              </button>
            </div>
          </div>
        )}
    </div>
  )
}