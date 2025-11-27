'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import { Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface PaymentDetail {
  id: string;
  subscription_id: string;
  seller_id: string;
  amount: number;
  payment_method: string;
  status: string;
  depositor_name: string | null;
  bank_name: string | null;
  deposit_date: string | null;
  deposit_time: string | null;
  receipt_image: string | null;
  created_at: string;
  subscription: {
    service: {
      title: string;
    } | null;
  } | null;
}

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentDetail | null>(null);

  useEffect(() => {
    loadPaymentDetail();
  }, [paymentId]);

  async function loadPaymentDetail() {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('advertising_payments')
        .select(
          `
          *,
          subscription:advertising_subscriptions(
            service:services(title)
          )
        `
        )
        .eq('id', paymentId)
        .single();

      if (data) {
        setPayment(data);
      }
    } catch (error) {
      logger.error('결제 정보 로딩 실패:', error);
      toast.error('결제 정보를 불러올 수 없습니다');
      router.push('/mypage/seller/advertising');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <MypageLayoutWrapper mode="seller">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </MypageLayoutWrapper>
    );
  }

  if (!payment) {
    return (
      <MypageLayoutWrapper mode="seller">
        <div className="container mx-auto p-6 max-w-2xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">결제 정보를 찾을 수 없습니다</p>
          </div>
        </div>
      </MypageLayoutWrapper>
    );
  }

  const deadline = new Date(payment.created_at);
  deadline.setDate(deadline.getDate() + 3);

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">무통장 입금 안내</h1>

        {/* 상태 표시 */}
        <div className="mb-6">
          {payment.status === 'pending' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-800 font-medium">⏳ 입금 대기 중</p>
              <p className="text-yellow-700 text-sm mt-1">
                아래 계좌로 입금해주세요. 관리자가 입금을 확인한 후 광고가 시작됩니다.
              </p>
            </div>
          )}
          {payment.status === 'completed' && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-green-800 font-medium">✅ 입금 확인 완료</p>
              <p className="text-green-700 text-sm mt-1">광고가 활성화되었습니다</p>
            </div>
          )}
        </div>

        {/* 입금 정보 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">입금 계좌 정보</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-600">서비스</span>
              <span className="font-bold text-gray-900">
                {payment.subscription?.service?.title}
              </span>
            </div>

            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-600">입금 금액</span>
              <span className="text-3xl font-bold text-brand-primary">
                {payment.amount.toLocaleString()}원
              </span>
            </div>

            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-600">은행</span>
              <span className="font-bold text-gray-900">{process.env.NEXT_PUBLIC_BANK_NAME}</span>
            </div>

            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-600">계좌번호</span>
              <span className="font-mono font-bold text-gray-900">
                {process.env.NEXT_PUBLIC_BANK_ACCOUNT}
              </span>
            </div>

            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-600">예금주</span>
              <span className="font-bold text-gray-900">{process.env.NEXT_PUBLIC_BANK_HOLDER}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">입금 기한</span>
              <span className="font-bold text-red-600">
                {deadline.toLocaleDateString('ko-KR')} {deadline.toLocaleTimeString('ko-KR')}
              </span>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <Info className="w-4 h-4 inline mr-2" />
              입금 후 관리자가 확인하면 광고가 자동으로 시작됩니다. 입금 확인까지 1-2일 정도 소요될
              수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
