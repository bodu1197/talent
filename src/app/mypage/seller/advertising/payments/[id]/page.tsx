'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { uploadPaymentReceipt } from '@/lib/advertising';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';

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
  const [uploading, setUploading] = useState(false);

  // 입금증 업로드 폼 데이터
  const [depositorName, setDepositorName] = useState('');
  const [bankName, setBankName] = useState('');
  const [depositDate, setDepositDate] = useState('');
  const [depositTime, setDepositTime] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    loadPaymentDetail();
  }, [paymentId]);

  async function loadPaymentDetail() {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('advertising_payments')
        .select(`
          *,
          subscription:advertising_subscriptions(
            service:services(title)
          )
        `)
        .eq('id', paymentId)
        .single();

      if (data) {
        setPayment(data);
        // 기존 입금 정보가 있으면 채우기
        if (data.depositor_name) setDepositorName(data.depositor_name);
        if (data.bank_name) setBankName(data.bank_name);
        if (data.deposit_date) setDepositDate(data.deposit_date);
        if (data.deposit_time) setDepositTime(data.deposit_time);
      }
    } catch (error) {
      console.error('결제 정보 로딩 실패:', error);
      alert('결제 정보를 불러올 수 없습니다');
      router.push('/mypage/seller/advertising');
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadReceipt(e: React.FormEvent) {
    e.preventDefault();

    if (!receiptFile) {
      alert('입금증 이미지를 선택해주세요');
      return;
    }

    if (!depositorName || !bankName || !depositDate || !depositTime) {
      alert('모든 입금 정보를 입력해주세요');
      return;
    }

    try {
      setUploading(true);

      await uploadPaymentReceipt(paymentId, receiptFile, {
        depositorName,
        bankName,
        depositDate,
        depositTime
      });

      alert('입금증이 업로드되었습니다.\n관리자 확인 후 광고가 시작됩니다.');
      loadPaymentDetail();
    } catch (error) {
      console.error('입금증 업로드 실패:', error);
      alert('입금증 업로드에 실패했습니다');
    } finally {
      setUploading(false);
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
          {payment.status === 'pending' && !payment.receipt_image && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-800 font-medium">⏳ 입금 대기 중</p>
              <p className="text-yellow-700 text-sm mt-1">아래 계좌로 입금 후 입금증을 업로드해주세요</p>
            </div>
          )}
          {payment.status === 'pending' && payment.receipt_image && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-blue-800 font-medium">📋 관리자 확인 대기 중</p>
              <p className="text-blue-700 text-sm mt-1">입금증이 업로드되었습니다. 관리자 확인까지 1-2일 소요됩니다.</p>
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
              <span className="font-bold text-gray-900">{payment.subscription?.service?.title}</span>
            </div>

            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-600">입금 금액</span>
              <span className="text-3xl font-bold text-brand-primary">{payment.amount.toLocaleString()}원</span>
            </div>

            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-600">은행</span>
              <span className="font-bold text-gray-900">{process.env.NEXT_PUBLIC_BANK_NAME}</span>
            </div>

            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-600">계좌번호</span>
              <span className="font-mono font-bold text-gray-900">{process.env.NEXT_PUBLIC_BANK_ACCOUNT}</span>
            </div>

            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-600">예금주</span>
              <span className="font-bold text-gray-900">{process.env.NEXT_PUBLIC_BANK_HOLDER}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">입금 기한</span>
              <span className="font-bold text-red-600">{deadline.toLocaleDateString('ko-KR')} {deadline.toLocaleTimeString('ko-KR')}</span>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <i className="fas fa-info-circle mr-2"></i>
              입금자명은 본인 이름으로 입금해주세요. 다른 이름으로 입금 시 확인이 지연될 수 있습니다.
            </p>
          </div>
        </div>

        {/* 입금증 업로드 폼 */}
        {payment.status === 'pending' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">입금증 업로드</h2>

            <form onSubmit={handleUploadReceipt} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    입금자명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={depositorName}
                    onChange={(e) => setDepositorName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="홍길동"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    입금 은행 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="국민은행"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    입금 날짜 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={depositDate}
                    onChange={(e) => setDepositDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    입금 시간 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={depositTime}
                    onChange={(e) => setDepositTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  입금증 이미지 <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  required={!payment.receipt_image}
                />
                {payment.receipt_image && (
                  <p className="text-sm text-gray-500 mt-1">
                    이미 업로드된 입금증이 있습니다. 새로 업로드하면 기존 파일이 교체됩니다.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    업로드 중...
                  </span>
                ) : (
                  <>
                    <i className="fas fa-upload mr-2"></i>
                    입금증 업로드
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </MypageLayoutWrapper>
  );
}
