import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BuyerRefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-1200">
        <div className="mb-8">
          <Link href="/" className="text-brand-primary hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-6">환불 정책</h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">환불 가능 기준</h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">✓ 전액 환불 가능한 경우</h3>
                  <ul className="list-disc list-inside space-y-1 text-green-800">
                    <li>작업 시작 전 취소 요청</li>
                    <li>전문가가 작업을 시작하지 않은 경우</li>
                    <li>서비스 설명과 실제 제공 내용이 다른 경우</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">⚠ 부분 환불 가능한 경우</h3>
                  <ul className="list-disc list-inside space-y-1 text-yellow-800">
                    <li>작업 진행 중 취소 요청 (진행률에 따라 협의)</li>
                    <li>전문가와 구매자 간 합의가 이루어진 경우</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">✗ 환불 불가능한 경우</h3>
                  <ul className="list-disc list-inside space-y-1 text-red-800">
                    <li>작업 완료 후 최종 확인을 마친 경우</li>
                    <li>구매자의 단순 변심 (작업 완료 후)</li>
                    <li>구매자의 귀책사유로 작업이 지연된 경우</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">환불 신청 방법</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>마이페이지 &gt; 주문 내역에서 해당 주문 선택</li>
                <li>환불 신청 버튼 클릭</li>
                <li>환불 사유 작성 및 증빙 자료 첨부</li>
                <li>관리자 검토 후 승인 (2-3 영업일 소요)</li>
                <li>승인 시 결제 수단으로 환불 처리</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">환불 처리 기간</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>신용카드: 승인 후 3-5 영업일</li>
                <li>계좌이체: 승인 후 1-2 영업일</li>
                <li>간편결제: 승인 후 2-3 영업일</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
