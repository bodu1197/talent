'use client'

import { useRouter } from 'next/navigation'
import { approveServiceRevision, rejectServiceRevision } from '@/lib/supabase/queries/admin'

interface Props {
  revision: any
}

export default function RevisionDetailClient({ revision }: Props) {
  const router = useRouter()

  async function handleApprove() {
    if (!confirm('이 수정 요청을 승인하시겠습니까?')) return

    try {
      await approveServiceRevision(revision.id)
      alert('수정 요청이 승인되었습니다.')
      router.push('/admin/services?status=revisions')
    } catch (err: any) {
      console.error('수정 승인 실패:', err)
      alert('수정 승인에 실패했습니다: ' + err.message)
    }
  }

  async function handleReject() {
    const reason = prompt('반려 사유를 입력해주세요:')
    if (!reason) return

    try {
      await rejectServiceRevision(revision.id, reason)
      alert('수정 요청이 반려되었습니다.')
      router.push('/admin/services?status=revisions')
    } catch (err: any) {
      console.error('수정 반려 실패:', err)
      alert('수정 반려에 실패했습니다: ' + err.message)
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">서비스 수정 요청 상세</h1>
            <p className="text-gray-600">수정 내용을 검토하고 승인 또는 반려하세요</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            돌아가기
          </button>
        </div>

        {/* 수정 요청 정보 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">수정 요청 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">판매자</span>
              <p className="font-medium">{revision.seller?.user?.name || revision.seller?.business_name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">요청일</span>
              <p className="font-medium">{new Date(revision.created_at).toLocaleDateString('ko-KR')}</p>
            </div>
            <div className="col-span-2">
              <span className="text-sm text-gray-600">수정 사유</span>
              <p className="font-medium">{revision.revision_note || '-'}</p>
            </div>
          </div>
        </div>

        {/* 비교 테이블 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* 원본 서비스 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">원본</span>
              현재 서비스
            </h2>

            {/* 썸네일 */}
            {revision.service?.thumbnail_url && (
              <div className="mb-4">
                <span className="text-sm text-gray-600 block mb-2">썸네일</span>
                <img
                  src={revision.service.thumbnail_url}
                  alt="원본 썸네일"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* 제목 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-1">제목</span>
              <p className="font-medium">{revision.service?.title}</p>
            </div>

            {/* 설명 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-1">설명</span>
              <p className="text-sm whitespace-pre-wrap">{revision.service?.description}</p>
            </div>

            {/* 카테고리 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-1">카테고리</span>
              <div className="flex flex-wrap gap-2">
                {revision.service?.service_categories?.map((sc: any, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                    {sc.category?.name}
                  </span>
                ))}
              </div>
            </div>

            {/* 패키지 */}
            <div>
              <span className="text-sm text-gray-600 block mb-2">패키지</span>
              <div className="space-y-3">
                {revision.service?.service_packages?.map((pkg: any) => (
                  <div key={pkg.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="font-medium mb-2">{pkg.name}</div>
                    <div className="text-sm space-y-1">
                      <div><span className="text-gray-600">가격:</span> {pkg.price?.toLocaleString()}원</div>
                      <div><span className="text-gray-600">배송:</span> {pkg.delivery_days}일</div>
                      <div><span className="text-gray-600">수정:</span> {pkg.revision_count === 999 ? '무제한' : `${pkg.revision_count}회`}</div>
                      {pkg.features && pkg.features.length > 0 && (
                        <div>
                          <span className="text-gray-600">포함사항:</span>
                          <ul className="list-disc list-inside mt-1">
                            {pkg.features.map((f: string, i: number) => (
                              <li key={i}>{f}</li>
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

          {/* 수정된 서비스 */}
          <div className="bg-white rounded-lg border-2 border-orange-200 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm">수정</span>
              수정 요청 내용
            </h2>

            {/* 썸네일 */}
            {revision.thumbnail_url && (
              <div className="mb-4">
                <span className="text-sm text-gray-600 block mb-2">썸네일</span>
                <img
                  src={revision.thumbnail_url}
                  alt="수정 썸네일"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* 제목 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-1">제목</span>
              <p className="font-medium text-orange-700">{revision.title}</p>
            </div>

            {/* 설명 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-1">설명</span>
              <p className="text-sm whitespace-pre-wrap text-orange-700">{revision.description}</p>
            </div>

            {/* 카테고리 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-1">카테고리</span>
              <div className="flex flex-wrap gap-2">
                {revision.revision_categories?.map((rc: any, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-sm font-medium">
                    {rc.category?.name}
                  </span>
                ))}
              </div>
            </div>

            {/* 패키지 */}
            <div>
              <span className="text-sm text-gray-600 block mb-2">패키지</span>
              <div className="space-y-3">
                {revision.revision_packages?.map((pkg: any) => (
                  <div key={pkg.id} className="border-2 border-orange-200 rounded-lg p-3 bg-orange-50">
                    <div className="font-medium mb-2 text-orange-700">{pkg.name || getPackageLabel(pkg.package_type)}</div>
                    <div className="text-sm space-y-1 text-orange-700">
                      <div><span className="text-gray-600">가격:</span> {pkg.price?.toLocaleString()}원</div>
                      <div><span className="text-gray-600">배송:</span> {pkg.delivery_days}일</div>
                      <div><span className="text-gray-600">수정:</span> {pkg.revision_count === 999 ? '무제한' : `${pkg.revision_count}회`}</div>
                      {pkg.features && (
                        <div>
                          <span className="text-gray-600">포함사항:</span>
                          <ul className="list-disc list-inside mt-1">
                            {(Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features || '[]')).map((f: string, i: number) => (
                              <li key={i}>{f}</li>
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
