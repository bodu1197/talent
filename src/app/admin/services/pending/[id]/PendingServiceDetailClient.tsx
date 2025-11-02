'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  service: any
}

export default function PendingServiceDetailClient({ service }: Props) {
  const router = useRouter()

  async function handleApprove() {
    if (!confirm('이 서비스를 승인하시겠습니까?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('services')
        .update({ status: 'active' })
        .eq('id', service.id)

      if (error) throw error

      alert('서비스가 승인되었습니다.')
      router.push('/admin/services?status=pending')
    } catch (err: any) {
      console.error('승인 실패:', err)
      alert('승인에 실패했습니다: ' + err.message)
    }
  }

  async function handleReject() {
    const reason = prompt('반려 사유를 입력해주세요:')
    if (!reason) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('services')
        .update({
          status: 'suspended',
          // rejection_reason 필드가 있다면 추가
        })
        .eq('id', service.id)

      if (error) throw error

      alert('서비스가 반려되었습니다.')
      router.push('/admin/services?status=pending')
    } catch (err: any) {
      console.error('반려 실패:', err)
      alert('반려에 실패했습니다: ' + err.message)
    }
  }

  const getPackageLabel = (type: string) => {
    switch (type) {
      case 'basic': return '베이직'
      case 'standard': return '스탠다드'
      case 'premium': return '프리미엄'
      default: return type
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">신규 서비스 검토</h1>
            <p className="text-gray-600">서비스 내용을 검토하고 승인 또는 반려하세요</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            돌아가기
          </button>
        </div>

        {/* 서비스 정보 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">등록 정보</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-600">판매자</span>
              <p className="font-medium">{service.seller?.user?.name || service.seller?.business_name}</p>
              <p className="text-sm text-gray-500">{service.seller?.user?.email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">등록일</span>
              <p className="font-medium">{new Date(service.created_at).toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
        </div>

        {/* 서비스 상세 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">서비스 상세</h2>

          {/* 썸네일 */}
          {service.thumbnail_url && (
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-2">썸네일</span>
              <img
                src={service.thumbnail_url}
                alt="서비스 썸네일"
                className="w-full max-w-md h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* 제목 */}
          <div className="mb-4">
            <span className="text-sm text-gray-600 block mb-1">제목</span>
            <p className="text-lg font-medium">{service.title}</p>
          </div>

          {/* 설명 */}
          <div className="mb-4">
            <span className="text-sm text-gray-600 block mb-1">설명</span>
            <p className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded">{service.description}</p>
          </div>

          {/* 카테고리 */}
          <div className="mb-4">
            <span className="text-sm text-gray-600 block mb-1">카테고리</span>
            <div className="flex flex-wrap gap-2">
              {service.service_categories?.map((sc: any, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {sc.category?.name}
                </span>
              ))}
            </div>
          </div>

          {/* 패키지 */}
          <div>
            <span className="text-sm text-gray-600 block mb-2">패키지</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {service.service_packages?.map((pkg: any) => (
                <div key={pkg.id} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="font-bold text-lg mb-3">{pkg.name}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">가격:</span>
                      <span className="font-bold">{pkg.price?.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">배송:</span>
                      <span>{pkg.delivery_days}일</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">수정:</span>
                      <span>{pkg.revision_count === 999 ? '무제한' : `${pkg.revision_count}회`}</span>
                    </div>
                    {pkg.features && pkg.features.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-gray-600 block mb-2">포함사항:</span>
                        <ul className="list-disc list-inside space-y-1">
                          {pkg.features.map((f: string, i: number) => (
                            <li key={i} className="text-xs">{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleReject}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <i className="fas fa-times mr-2"></i>
            반려
          </button>
          <button
            onClick={handleApprove}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <i className="fas fa-check mr-2"></i>
            승인
          </button>
        </div>
      </div>
    </div>
  )
}
