'use client'

import { useState } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'

type PackageType = 'basic' | 'standard' | 'premium'

export default function NewServicePage() {
  const [activePackage, setActivePackage] = useState<PackageType>('basic')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API 호출하여 서비스 등록
    console.log('Service data:', formData)
  }

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 p-8">
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
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  required
                >
                  <option value="">카테고리 선택</option>
                  <option value="design">디자인</option>
                  <option value="video">영상/사진</option>
                  <option value="writing">글쓰기/번역</option>
                  <option value="marketing">마케팅</option>
                  <option value="programming">IT/프로그래밍</option>
                  <option value="business">비즈니스 컨설팅</option>
                </select>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  썸네일 이미지 *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#0f3460] transition-colors cursor-pointer">
                  <i className="fas fa-cloud-upload-alt text-gray-400 text-4xl mb-3"></i>
                  <p className="text-gray-600">클릭하여 이미지 선택</p>
                  <p className="text-sm text-gray-500 mt-2">권장 크기: 800x600px</p>
                </div>
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
              className="flex-1 px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium"
            >
              <i className="fas fa-check mr-2"></i>
              서비스 등록
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
