'use client'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/mypage/Sidebar'

export default function SellerGradeClient() {
  const currentGrade = {
    level: '골드',
    color: 'from-yellow-400 to-yellow-600',
    icon: 'fa-trophy',
    benefits: [
      '서비스 수수료 12% (기본 15%)',
      '우선 노출 혜택',
      '전담 매니저 배정',
      '마케팅 지원'
    ],
    nextGrade: '플래티넘',
    requirements: {
      sales: { current: 850, required: 1000, label: '월 매출' },
      rating: { current: 4.8, required: 4.9, label: '평점' },
      completion: { current: 95, required: 98, label: '완료율(%)' }
    }
  }

  const grades = [
    { name: '브론즈', color: 'bg-orange-800', sales: '0~300만원' },
    { name: '실버', color: 'bg-gray-400', sales: '300~500만원' },
    { name: '골드', color: 'bg-yellow-400', sales: '500~1000만원' },
    { name: '플래티넘', color: 'bg-blue-400', sales: '1000만원 이상' }
  ]

  return (
    <>

      <Header />

      <div className="flex min-h-screen bg-gray-50 pt-16">

        <Sidebar mode="seller" />

        <main className="flex-1 overflow-y-auto w-full">

          <div className="container-1200 px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">전문가 등급</h1>
          <p className="text-gray-600">내 등급과 혜택을 확인하세요</p>
        </div>

        {/* 현재 등급 */}
        <div className={`bg-gradient-to-r ${currentGrade.color} rounded-lg p-8 mb-8 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-2">현재 등급</div>
              <div className="text-4xl font-bold flex items-center gap-3">
                <i className={`fas ${currentGrade.icon}`}></i>
                {currentGrade.level}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90 mb-2">다음 등급까지</div>
              <div className="text-2xl font-bold">{currentGrade.nextGrade}</div>
            </div>
          </div>
        </div>

        {/* 등급 혜택 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">등급 혜택</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentGrade.benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-700">
                <i className="fas fa-check-circle text-green-500"></i>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 승급 조건 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {currentGrade.nextGrade} 등급 승급 조건
          </h2>
          <div className="space-y-4">
            {Object.entries(currentGrade.requirements).map(([key, req]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{req.label}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {req.current} / {req.required}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#0f3460] h-2 rounded-full"
                    style={{ width: `${(req.current / req.required) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 등급 체계 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">등급 체계</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {grades.map((grade, i) => (
              <div key={i} className={`p-4 rounded-lg ${
                grade.name === currentGrade.level ? 'ring-2 ring-[#0f3460]' : ''
              }`}>
                <div className={`w-12 h-12 ${grade.color} rounded-full flex items-center justify-center text-white mb-3`}>
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="font-bold text-gray-900 mb-1">{grade.name}</div>
                <div className="text-sm text-gray-600">{grade.sales}</div>
              </div>
            ))}
          </div>
        </div>
          </div>

        </main>

      </div>

      </>
  )
}
