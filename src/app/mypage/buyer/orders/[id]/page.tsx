'use client'

import { useState } from 'react'
import { use } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import Link from 'next/link'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function BuyerOrderDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showRevisionModal, setShowRevisionModal] = useState(false)

  // TODO: 실제로는 API에서 주문 데이터를 가져와야 합니다
  const order = {
    id,
    orderNumber: '12345',
    title: '로고 디자인 작업',
    thumbnailUrl: null,
    sellerName: '디자인스튜디오',
    sellerProfile: null,
    status: 'delivered',
    statusLabel: '도착 확인 대기',
    price: 50000,
    orderDate: '2025-01-27 14:30',
    paymentDate: '2025-01-27 14:35',
    expectedDeliveryDate: '2025-02-03',
    deliveryDate: '2025-02-01 18:20',
    daysLeft: 0,
    requirements: '미니멀한 느낌의 로고를 원합니다. 파랑색 계열로 부탁드립니다. 회사명은 "테크노밸리"이고, IT 스타트업입니다.',
    myNote: '가능하면 3가지 시안을 부탁드립니다.',
    packageType: 'standard',
    revisionCount: 2,
    remainingRevisions: 1,
    deliverables: [
      {
        id: '1',
        fileName: 'logo_final_v1.ai',
        fileSize: 2048576,
        uploadedAt: '2025-02-01 18:20',
        version: 1,
        downloadUrl: '#'
      },
      {
        id: '2',
        fileName: 'logo_final_v1.png',
        fileSize: 512000,
        uploadedAt: '2025-02-01 18:20',
        version: 1,
        downloadUrl: '#'
      }
    ],
    sellerMessage: '요청하신 미니멀한 느낌의 로고 디자인을 완성했습니다. AI 파일과 PNG 파일을 함께 보내드립니다. 확인 부탁드립니다!'
  }

  const statusHistory = [
    { status: '주문 접수', date: '2025-01-27 14:30', actor: '시스템' },
    { status: '결제 완료', date: '2025-01-27 14:35', actor: '구매자' },
    { status: '작업 시작', date: '2025-01-27 15:00', actor: '판매자' },
    { status: '작업 완료', date: '2025-02-01 18:20', actor: '판매자' }
  ]

  const handleConfirm = () => {
    // TODO: API 호출하여 구매 확정
    console.log('Purchase confirmed')
    setShowConfirmModal(false)
  }

  const handleRevisionRequest = () => {
    // TODO: API 호출하여 수정 요청
    console.log('Revision requested')
    setShowRevisionModal(false)
  }

  return (
    <>
      <Sidebar mode="buyer" />
      <main className="flex-1 p-8">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <Link
            href="/mypage/buyer/orders"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>주문 목록으로</span>
          </Link>
        </div>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">주문 상세</h1>
              <p className="text-gray-600">주문 번호: #{order.orderNumber}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/mypage/messages?order=${id}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <i className="fas fa-comment mr-2"></i>
                메시지
              </Link>
              {order.status === 'delivered' && (
                <>
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    수정 요청
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <i className="fas fa-check mr-2"></i>
                    구매 확정
                  </button>
                </>
              )}
              {order.status === 'completed' && (
                <Link
                  href={`/mypage/buyer/reviews?order=${id}`}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <i className="fas fa-star mr-2"></i>
                  리뷰 작성
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 주요 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 주문 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">주문 정보</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {order.thumbnailUrl ? (
                      <img src={order.thumbnailUrl} alt={order.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <i className="fas fa-image text-gray-400 text-3xl"></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{order.title}</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">패키지:</span>
                        <span className="ml-2 font-medium">{order.packageType}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">수정 횟수:</span>
                        <span className="ml-2 font-medium">{order.revisionCount}회</span>
                      </div>
                      <div>
                        <span className="text-gray-600">남은 수정:</span>
                        <span className="ml-2 font-medium text-blue-600">{order.remainingRevisions}회</span>
                      </div>
                      <div>
                        <span className="text-gray-600">예상 완료일:</span>
                        <span className="ml-2 font-medium">{order.expectedDeliveryDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 내 요구사항 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">내 요구사항</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{order.requirements}</p>
              </div>
              {order.myNote && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-info-circle text-blue-600 mt-1"></i>
                    <div>
                      <div className="font-medium text-blue-900 mb-1">추가 메모</div>
                      <p className="text-blue-700">{order.myNote}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 납품 파일 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                납품 파일
                {order.deliverables.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({order.deliverables.length}개)
                  </span>
                )}
              </h2>

              {order.sellerMessage && (
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-user-circle text-green-600 mt-1"></i>
                    <div>
                      <div className="font-medium text-green-900 mb-1">판매자 메시지</div>
                      <p className="text-green-700">{order.sellerMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {order.deliverables.length > 0 ? (
                <div className="space-y-3">
                  {order.deliverables.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <i className="fas fa-file-alt text-blue-500 text-2xl"></i>
                        <div>
                          <div className="font-medium text-gray-900">{file.fileName}</div>
                          <div className="text-sm text-gray-600">
                            {(file.fileSize / 1024 / 1024).toFixed(2)}MB • 버전 {file.version} • {file.uploadedAt}
                          </div>
                        </div>
                      </div>
                      <a
                        href={file.downloadUrl}
                        download
                        className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors"
                      >
                        <i className="fas fa-download mr-2"></i>
                        다운로드
                      </a>
                    </div>
                  ))}

                  {order.status === 'delivered' && (
                    <button className="w-full px-4 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium">
                      <i className="fas fa-download mr-2"></i>
                      전체 다운로드
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  아직 납품한 파일이 없습니다
                </div>
              )}
            </div>

            {/* 상태 이력 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">진행 상태</h2>
              <div className="space-y-3">
                {statusHistory.map((history, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0"
                  >
                    <div className="w-8 h-8 bg-[#0f3460] rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-check text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{history.status}</div>
                      <div className="text-sm text-gray-600">{history.date} • {history.actor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 사이드바 */}
          <div className="space-y-6">
            {/* 현재 상태 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">현재 상태</h3>
              <div className="flex items-center justify-center py-4">
                <span className={`px-6 py-3 rounded-lg font-bold text-lg ${
                  order.status === 'delivered'
                    ? 'bg-red-100 text-red-700'
                    : order.status === 'in_progress'
                    ? 'bg-yellow-100 text-yellow-700'
                    : order.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {order.statusLabel}
                </span>
              </div>
              {order.status === 'delivered' && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800 text-center">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    구매 확정을 해주세요
                  </p>
                </div>
              )}
            </div>

            {/* 판매자 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">판매자 정보</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#0f3460] rounded-full flex items-center justify-center text-white font-bold">
                  {order.sellerName[0]}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{order.sellerName}</div>
                  <div className="text-sm text-gray-600">판매자</div>
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  href={`/mypage/messages?order=${id}`}
                  className="w-full px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium text-center block"
                >
                  <i className="fas fa-comment mr-2"></i>
                  메시지 보내기
                </Link>
                <Link
                  href={`/seller/${order.sellerName}`}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center block"
                >
                  <i className="fas fa-user mr-2"></i>
                  프로필 보기
                </Link>
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">결제 정보</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">주문 금액</span>
                  <span className="font-medium">{order.price.toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="font-bold text-gray-900">결제 금액</span>
                  <span className="font-bold text-[#0f3460] text-lg">{order.price.toLocaleString()}원</span>
                </div>
                <div className="pt-3 border-t border-gray-200 text-sm text-gray-600">
                  <div>주문일: {order.orderDate}</div>
                  <div>결제일: {order.paymentDate}</div>
                  {order.deliveryDate && (
                    <div>납품일: {order.deliveryDate}</div>
                  )}
                </div>
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">빠른 액션</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                  <i className="fas fa-ban mr-2"></i>
                  취소 요청
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <i className="fas fa-headset mr-2"></i>
                  고객센터 문의
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 구매 확정 모달 */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">구매 확정</h2>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">구매 확정 전 확인사항</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>납품된 파일을 모두 확인하셨나요?</li>
                        <li>요구사항이 충족되었나요?</li>
                        <li>수정이 필요한 부분은 없나요?</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">
                  구매 확정 시 판매자에게 대금이 정산되며, 이후에는 수정 요청이 불가능합니다.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  확정하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수정 요청 모달 */}
        {showRevisionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">수정 요청</h2>
                <button
                  onClick={() => setShowRevisionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-900 mb-2">
                    <i className="fas fa-info-circle"></i>
                    <span className="font-medium">남은 수정 횟수: {order.remainingRevisions}회</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    수정 요청 시 판매자에게 알림이 전송됩니다.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수정 요청 사항 *
                  </label>
                  <textarea
                    rows={6}
                    placeholder="수정이 필요한 부분을 구체적으로 작성해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    참고 파일 첨부 (선택)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0f3460] transition-colors cursor-pointer">
                    <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-2"></i>
                    <p className="text-gray-600 text-sm">클릭하여 파일 선택</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowRevisionModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleRevisionRequest}
                    className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    수정 요청하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
