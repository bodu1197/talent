'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as PortOne from '@portone/browser-sdk/v2';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, CheckCircle, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

const CREDIT_PACKAGES = [
  { amount: 100000, bonus: 0, label: '10만원' },
  { amount: 300000, bonus: 10000, label: '30만원', popular: true },
  { amount: 500000, bonus: 30000, label: '50만원' },
  { amount: 1000000, bonus: 100000, label: '100만원' },
];

export default function AdvertisingChargePage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState(300000);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: { name?: string };
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handlePurchase = async () => {
    const pkg = CREDIT_PACKAGES.find((p) => p.amount === selectedPackage);
    if (!pkg) return;

    if (!user) {
      toast.error('로그인이 필요합니다');
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      // 결제 ID 생성 (crypto API 사용)
      const paymentId = `ad_credit_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

      // PortOne V2 결제창 호출
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        paymentId: paymentId,
        orderName: `광고 크레딧 ${pkg.label}`,
        totalAmount: pkg.amount,
        currency: 'CURRENCY_KRW',
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        payMethod: 'CARD',
        customer: {
          fullName: user.user_metadata?.name || '구매자',
          email: user.email || undefined,
        },
        customData: {
          type: 'advertising_credit',
          bonus: pkg.bonus,
        },
      });

      // 결제 결과 처리
      if (response?.code != null) {
        toast.error(`결제 실패: ${response.message}`);
        setLoading(false);
        return;
      }

      // 결제 검증
      const verifyResponse = await fetch('/api/payments/advertising/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: response?.paymentId,
          amount: pkg.amount,
          bonus: pkg.bonus,
        }),
      });

      const verifyData = await verifyResponse.json();
      if (verifyData.success) {
        toast.success(`${(pkg.amount + pkg.bonus).toLocaleString()}원 크레딧이 충전되었습니다!`);
        router.push('/mypage/seller/advertising');
      } else {
        toast.error('결제 검증 실패: ' + verifyData.error);
      }
    } catch (error) {
      logger.error('Purchase error:', error);
      toast.error('결제 처리 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 lg:mb-6">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-3 lg:mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm lg:text-base">뒤로 가기</span>
            </button>
            <h1 className="text-base lg:text-lg font-semibold text-gray-900">광고 크레딧 충전</h1>
            <p className="text-sm text-gray-600 mt-1">서비스를 홍보할 광고 크레딧을 구매하세요</p>
          </div>

          {/* 크레딧 패키지 선택 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {CREDIT_PACKAGES.map((pkg) => (
              <button
                key={pkg.amount}
                onClick={() => setSelectedPackage(pkg.amount)}
                type="button"
                aria-label={`${pkg.label} 크레딧 패키지 선택`}
                className={`relative bg-white border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPackage === pkg.amount
                    ? 'border-brand-primary shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                      인기
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-3xl font-semibold text-gray-900 mb-2">{pkg.label}</div>
                  {pkg.bonus > 0 && (
                    <div className="text-sm text-green-600 font-medium mb-2">
                      +{pkg.bonus.toLocaleString()}원 보너스
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    총 {(pkg.amount + pkg.bonus).toLocaleString()}원
                  </div>
                </div>
                {selectedPackage === pkg.amount && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="w-6 h-6 text-brand-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* 광고 상품 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-base md:text-lg mb-4">광고 서비스 안내</h3>
            <div className="space-y-3 text-xs md:text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-1" />
                <span>월 100,000원 정액제 광고 구독</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-1" />
                <span>카테고리 1페이지 완전 랜덤 노출</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-1" />
                <span>무제한 노출 및 클릭</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-1" />
                <span>모든 광고 100% 공평한 기회</span>
              </div>
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-base md:text-lg mb-4">결제 정보</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">선택한 패키지</span>
                <span className="font-medium">
                  {CREDIT_PACKAGES.find((p) => p.amount === selectedPackage)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">기본 금액</span>
                <span className="font-medium">{selectedPackage.toLocaleString()}원</span>
              </div>
              {CREDIT_PACKAGES.find((p) => p.amount === selectedPackage)?.bonus! > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>보너스 크레딧</span>
                  <span className="font-medium">
                    +
                    {CREDIT_PACKAGES.find(
                      (p) => p.amount === selectedPackage
                    )?.bonus.toLocaleString()}
                    원
                  </span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-semibold">충전될 크레딧</span>
                <span className="font-semibold text-brand-primary">
                  {(
                    selectedPackage +
                    (CREDIT_PACKAGES.find((p) => p.amount === selectedPackage)?.bonus || 0)
                  ).toLocaleString()}
                  원
                </span>
              </div>
            </div>
          </div>

          {/* 결제 버튼 */}
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-brand-primary text-white py-4 rounded-lg text-lg font-semibold hover:bg-[#1a4d8f] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                결제 처리 중...
              </>
            ) : (
              `${selectedPackage.toLocaleString()}원 결제하기`
            )}
          </button>

          {/* 주의사항 */}
          <div className="mt-6 text-xs text-gray-500 space-y-1">
            <p>- 구매한 크레딧은 환불이 불가능합니다</p>
            <p>- 프로모션 크레딧은 유효기간이 있을 수 있습니다</p>
            <p>- 광고 구독은 매월 자동으로 크레딧에서 차감됩니다</p>
          </div>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
