import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '구매자 이용 가이드 - 돌파구 | 수수료 0원으로 서비스 구매하기',
  description:
    '돌파구에서 재능 서비스를 구매하는 방법을 알아보세요. 수수료 0원, 안전한 결제 시스템으로 원하는 서비스를 이용하세요.',
  keywords: '돌파구 구매, 서비스 구매 방법, 재능 구매, 수수료 없는 구매, 안전 결제',
};

export default function BuyerGuidePage() {
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
          <h1 className="text-3xl font-semibold text-gray-900 mb-6">구매자 이용 가이드</h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">서비스 구매 방법</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>원하는 서비스를 검색하거나 카테고리에서 찾습니다</li>
                <li>서비스 상세 페이지에서 내용을 확인합니다</li>
                <li>옵션을 선택하고 구매하기 버튼을 클릭합니다</li>
                <li>결제를 완료합니다</li>
                <li>판매자와 메시지로 소통하며 작업을 진행합니다</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">주문 후 진행 절차</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>결제 완료 후 판매자가 작업을 시작합니다</li>
                <li>작업 진행 상황은 마이페이지 &gt; 주문 내역에서 확인할 수 있습니다</li>
                <li>작업 완료 시 검수 후 최종 확인합니다</li>
                <li>만족하시면 리뷰를 작성해주세요</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">자주 묻는 질문</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Q. 결제 후 취소가 가능한가요?
                  </h3>
                  <p className="text-gray-700">
                    작업 시작 전에는 전액 환불이 가능합니다. 작업 진행 중인 경우 판매자와 협의가
                    필요합니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Q. 판매자와 어떻게 소통하나요?
                  </h3>
                  <p className="text-gray-700">
                    마이페이지의 메시지 기능을 통해 판매자와 직접 소통할 수 있습니다.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
