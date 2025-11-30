'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Landmark, AlertTriangle, Receipt, User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  title: string;
  description: string | null;
  delivery_days: number;
  status: string;
  merchant_uid: string;
  seller?: {
    id: string;
    is_business: boolean;
    business_name?: string;
    display_name?: string;
  } | null;
}

// 현금영수증 신청 유형
type CashReceiptType = 'none' | 'personal' | 'business';

interface Props {
  readonly order: Order;
}

export default function BankTransferClient({ order }: Props) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 현금영수증 관련 상태
  const [cashReceiptType, setCashReceiptType] = useState<CashReceiptType>('none');
  const [cashReceiptValue, setCashReceiptValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 판매자가 사업자인지 확인 (사업자만 현금영수증 발행 가능)
  const canIssueCashReceipt = order.seller?.is_business === true;

  const bankInfo = {
    bankName: process.env.NEXT_PUBLIC_BANK_NAME || '국민은행',
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT || '123-456-789012',
    accountHolder: process.env.NEXT_PUBLIC_BANK_HOLDER || '돌파구',
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber);
    setIsCopied(true);

    // Clear existing timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
  };

  // 현금영수증 유효성 검사
  const validateCashReceipt = (): boolean => {
    if (cashReceiptType === 'none') return true;

    if (!cashReceiptValue.trim()) {
      toast.error(
        cashReceiptType === 'personal'
          ? '휴대폰 번호를 입력해주세요.'
          : '사업자등록번호를 입력해주세요.'
      );
      return false;
    }

    // 휴대폰 번호 검증 (숫자만, 10-11자리)
    if (cashReceiptType === 'personal') {
      const phoneOnly = cashReceiptValue.replace(/\D/g, '');
      if (phoneOnly.length < 10 || phoneOnly.length > 11) {
        toast.error('올바른 휴대폰 번호를 입력해주세요.');
        return false;
      }
    }

    // 사업자등록번호 검증 (숫자만, 10자리)
    if (cashReceiptType === 'business') {
      const bizNumOnly = cashReceiptValue.replace(/\D/g, '');
      if (bizNumOnly.length !== 10) {
        toast.error('올바른 사업자등록번호를 입력해주세요. (10자리)');
        return false;
      }
    }

    return true;
  };

  const handleConfirmTransfer = async () => {
    // 현금영수증 유효성 검사
    if (!validateCashReceipt()) return;

    setIsSubmitting(true);

    try {
      // 주문 상태를 pending_bank_transfer로 변경
      const response = await fetch('/api/payments/bank-transfer/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          cash_receipt:
            canIssueCashReceipt && cashReceiptType !== 'none'
              ? {
                  type: cashReceiptType,
                  value: cashReceiptValue.replace(/\D/g, ''), // 숫자만 전송
                }
              : null,
        }),
      });

      if (response.ok) {
        toast.success('입금 대기 상태로 변경되었습니다.\n입금 확인 후 주문이 시작됩니다.');
        router.push(`/mypage/buyer/orders/${order.id}`);
      } else {
        toast.error('오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>뒤로가기</span>
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">무통장 입금 안내</h1>
        </div>

        {/* 입금 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="w-7 h-7 text-brand-primary" />
            <h2 className="text-lg font-semibold text-gray-900">입금 계좌 정보</h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-600 block mb-1">은행명</span>
                <span className="text-xl font-semibold text-gray-900">{bankInfo.bankName}</span>
              </div>

              <div>
                <span className="text-sm text-gray-600 block mb-1">계좌번호</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold text-gray-900 font-mono">
                    {bankInfo.accountNumber}
                  </span>
                  <button
                    onClick={handleCopyAccount}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    {isCopied ? '복사됨!' : '복사'}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-600 block mb-1">예금주</span>
                <span className="text-xl font-semibold text-gray-900">
                  {bankInfo.accountHolder}
                </span>
              </div>

              <div className="pt-4 border-t border-blue-300">
                <span className="text-sm text-gray-600 block mb-1">입금 금액</span>
                <span className="text-2xl font-semibold text-brand-primary">
                  {order.amount.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 주문 정보 */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">주문명</span>
                <span className="text-gray-900 font-medium">{order.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">주문번호</span>
                <span className="text-gray-900 font-mono text-xs">{order.merchant_uid}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 안내 사항 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            입금 전 확인사항
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span>•</span>
              <span>입금자명과 주문자명이 다를 경우 입금 확인이 지연될 수 있습니다</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>입금 금액이 정확히 일치해야 합니다</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>입금 확인 후 작업이 시작됩니다 (보통 1시간 이내)</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>입금하지 않은 주문은 24시간 후 자동 취소됩니다</span>
            </li>
          </ul>
        </div>

        {/* 현금영수증 신청 - 사업자 판매자인 경우만 표시 */}
        {canIssueCashReceipt && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-6 h-6 text-brand-primary" />
              <h2 className="text-lg font-semibold text-gray-900">현금영수증 신청</h2>
            </div>

            <div className="space-y-4">
              {/* 신청 유형 선택 */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="cashReceiptType"
                    value="none"
                    checked={cashReceiptType === 'none'}
                    onChange={() => {
                      setCashReceiptType('none');
                      setCashReceiptValue('');
                    }}
                    className="w-4 h-4 text-brand-primary"
                  />
                  <span className="text-gray-700">신청 안함</span>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="cashReceiptType"
                    value="personal"
                    checked={cashReceiptType === 'personal'}
                    onChange={() => setCashReceiptType('personal')}
                    className="w-4 h-4 text-brand-primary"
                  />
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="text-gray-700 font-medium">소득공제용 (개인)</span>
                    <p className="text-xs text-gray-500">
                      연말정산 소득공제를 위해 휴대폰 번호 입력
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="cashReceiptType"
                    value="business"
                    checked={cashReceiptType === 'business'}
                    onChange={() => setCashReceiptType('business')}
                    className="w-4 h-4 text-brand-primary"
                  />
                  <Building2 className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="text-gray-700 font-medium">지출증빙용 (사업자)</span>
                    <p className="text-xs text-gray-500">
                      사업 경비 처리를 위해 사업자등록번호 입력
                    </p>
                  </div>
                </label>
              </div>

              {/* 입력 필드 */}
              {cashReceiptType !== 'none' && (
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {cashReceiptType === 'personal' ? '휴대폰 번호' : '사업자등록번호'}
                  </label>
                  <input
                    type="text"
                    value={cashReceiptValue}
                    onChange={(e) => setCashReceiptValue(e.target.value)}
                    placeholder={cashReceiptType === 'personal' ? '01012345678' : '1234567890'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    maxLength={cashReceiptType === 'personal' ? 13 : 12}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {cashReceiptType === 'personal'
                      ? '하이픈(-) 없이 숫자만 입력해주세요'
                      : '하이픈(-) 없이 10자리 숫자만 입력해주세요'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <button
          onClick={handleConfirmTransfer}
          disabled={isSubmitting}
          className="w-full py-4 bg-brand-primary text-white rounded-lg font-semibold text-lg hover:bg-[#1a4d8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '처리 중...' : '입금 완료 확인 요청'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">입금 완료 후 위 버튼을 눌러주세요</p>
      </div>
    </div>
  );
}
