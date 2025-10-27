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

export default function SellerOrderDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)

  // TODO: 실제로는 API에서 주문 데이터를 가져와야 합니다
  const order = {
    id,
    orderNumber: '12345',
    title: '로고 디자인 작업',
    thumbnailUrl: null,
    buyerName: '홍길동',
    buyerProfile: null,
    status: 'in_progress',
    statusLabel: '진행중',
    price: 50000,
    orderDate: '2025-01-27 14:30',
    paymentDate: '2025-01-27 14:35',
    expectedDeliveryDate: '2025-02-03',
    daysLeft: 7,
    requirements: '미니멀한 느낌의 로고를 원합니다. 파랑색 계열로 부탁드립니다. 회사명은 "테크노밸리"이고, IT 스타트업입니다.',
    buyerNote: '가능하면 3가지 시안을 부탁드립니다.',
    packageType: 'standard',
    revisionCount: 2,
    deliverables: [
      {
        id: '1',
        fileName: 'logo_draft_v1.ai',
        fileSize: 2048576,
        uploadedAt: '2025-01-28 15:30',
        version: 1
      }
    ]
  }

  const statusHistory = [
    { status: '주문 접수', date: '2025-01-27 14:30', actor: '시스템' },
    { status: '결제 완료', date: '2025-01-27 14:35', actor: '구매자' },
    { status: '작업 시작', date: '2025-01-27 15:00', actor: '판매자' }
  ]

  const messages = [
    { id: '1', sender: 'buyer', content: '안녕하세요. 로고 작업 잘 부탁드립니다!', date: '2025-01-27 16:00' },
    { id: '2', sender: 'seller', content: '네 감사합니다. 열심히 작업하겠습니다!', date: '2025-01-27 16:15' }
  ]

  return (
    <>
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-8">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <Link
            href="/mypage/seller/orders"
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
              {order.status === 'in_progress' && (
                <button
                  onClick={() => setShowDeliveryModal(true)}
                  className="px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium"
                >
                  <i className="fas fa-upload mr-2"></i>
                  납품하기
                </button>
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
                        <span className="text-gray-600">예상 완료일:</span>
                        <span className="ml-2 font-medium">{order.expectedDeliveryDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">남은 기간:</span>
                        <span className="ml-2 font-medium text-red-600">D-{order.daysLeft}일</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 요구사항 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">구매자 요구사항</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{order.requirements}</p>
              </div>
              {order.buyerNote && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-info-circle text-blue-600 mt-1"></i>
                    <div>
                      <div className="font-medium text-blue-900 mb-1">추가 메모</div>
                      <p className="text-blue-700">{order.buyerNote}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 납품 파일 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">납품 파일</h2>
              {order.deliverables.length > 0 ? (
                <div className="space-y-3">
                  {order.deliverables.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
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
                      <button className="px-4 py-2 text-[#0f3460] hover:bg-blue-50 rounded-lg transition-colors">
                        <i className="fas fa-download mr-2"></i>
                        다운로드
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  아직 납품한 파일이 없습니다
                </div>
              )}
            </div>

            {/* 상태 이력 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">상태 이력</h2>
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
                <span className="px-6 py-3 bg-yellow-100 text-yellow-700 rounded-lg font-bold text-lg">
                  {order.statusLabel}
                </span>
              </div>
            </div>

            {/* 구매자 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">구매자 정보</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#0f3460] rounded-full flex items-center justify-center text-white font-bold">
                  {order.buyerName[0]}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{order.buyerName}</div>
                  <div className="text-sm text-gray-600">구매자</div>
                </div>
              </div>
              <Link
                href={`/mypage/messages?order=${id}`}
                className="w-full px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium text-center block"
              >
                <i className="fas fa-comment mr-2"></i>
                메시지 보내기
              </Link>
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
                  <span className="font-bold text-gray-900">최종 금액</span>
                  <span className="font-bold text-[#0f3460] text-lg">{order.price.toLocaleString()}원</span>
                </div>
                <div className="pt-3 border-t border-gray-200 text-sm text-gray-600">
                  <div>주문일: {order.orderDate}</div>
                  <div>결제일: {order.paymentDate}</div>
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

        {/* 납품 모달 */}
        {showDeliveryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">납품하기</h2>
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    파일 업로드
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#0f3460] transition-colors cursor-pointer">
                    <i className="fas fa-cloud-upload-alt text-gray-400 text-4xl mb-3"></i>
                    <p className="text-gray-600">클릭하여 파일 선택 또는 드래그 앤 드롭</p>
                    <p className="text-sm text-gray-500 mt-2">최대 100MB</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전달 메시지
                  </label>
                  <textarea
                    rows={4}
                    placeholder="구매자에게 전달할 메시지를 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowDeliveryModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    취소
                  </button>
                  <button className="flex-1 px-6 py-3 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium">
                    납품 완료
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
