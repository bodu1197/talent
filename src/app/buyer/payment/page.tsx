import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Building,
  Smartphone,
  Wallet,
  ArrowRight,
} from "lucide-react";

export default function BuyerPaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-1200">
        <div className="mb-8">
          <Link
            href="/"
            className="text-brand-primary hover:underline flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-6">결제 안내</h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                이용 가능한 결제 수단
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-6 h-6 text-brand-primary" />
                    <h3 className="font-semibold text-gray-900">신용카드</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    국내 모든 신용카드 사용 가능
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="w-6 h-6 text-brand-primary" />
                    <h3 className="font-semibold text-gray-900">계좌이체</h3>
                  </div>
                  <p className="text-sm text-gray-600">실시간 계좌이체 지원</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="w-6 h-6 text-brand-primary" />
                    <h3 className="font-semibold text-gray-900">간편결제</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    카카오페이, 네이버페이, 토스 등
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Wallet className="w-6 h-6 text-brand-primary" />
                    <h3 className="font-semibold text-gray-900">캐시</h3>
                  </div>
                  <p className="text-sm text-gray-600">충전된 캐시로 결제</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                결제 프로세스
              </h2>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1 bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">1️⃣</div>
                  <p className="font-semibold text-gray-900 mb-1">서비스 선택</p>
                  <p className="text-sm text-gray-600">옵션 및 수량 선택</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 hidden md:block" />
                <div className="flex-1 bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">2️⃣</div>
                  <p className="font-semibold text-gray-900 mb-1">결제 수단 선택</p>
                  <p className="text-sm text-gray-600">원하는 방법 선택</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 hidden md:block" />
                <div className="flex-1 bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">3️⃣</div>
                  <p className="font-semibold text-gray-900 mb-1">결제 진행</p>
                  <p className="text-sm text-gray-600">안전한 결제 창</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 hidden md:block" />
                <div className="flex-1 bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">4️⃣</div>
                  <p className="font-semibold text-gray-900 mb-1">결제 완료</p>
                  <p className="text-sm text-gray-600">작업 시작</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                안전한 결제
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-2 text-blue-900">
                  <li>모든 결제는 PG사를 통해 안전하게 처리됩니다</li>
                  <li>SSL 보안 인증서로 결제 정보를 암호화합니다</li>
                  <li>카드 정보는 저장되지 않습니다</li>
                  <li>결제 완료 시 즉시 알림을 받습니다</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                캐시 충전
              </h2>
              <p className="text-gray-700 mb-4">
                캐시를 미리 충전하여 빠르고 편리하게 결제할 수 있습니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>충전 금액: 10,000원 ~ 1,000,000원</li>
                <li>충전 보너스: 100,000원 이상 충전 시 추가 적립</li>
                <li>유효기간: 충전일로부터 5년</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
