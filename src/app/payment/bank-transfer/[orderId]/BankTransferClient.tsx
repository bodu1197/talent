'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { FaArrowLeft, FaUniversity, FaExclamationTriangle } from 'react-icons/fa';
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
}

interface Props {
  order: Order;
}

export default function BankTransferClient({ order }: Props) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleConfirmTransfer = async () => {
    // 주문 상태를 pending_bank_transfer로 변경
    const response = await fetch('/api/payments/bank-transfer/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: order.id }),
    });

    if (response.ok) {
      toast.error('입금 대기 상태로 변경되었습니다.\n입금 확인 후 주문이 시작됩니다.');
      router.push(`/mypage/buyer/orders/${order.id}`);
    } else {
      toast.error('오류가 발생했습니다.');
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
            <FaArrowLeft />
            <span>뒤로가기</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">무통장 입금 안내</h1>
        </div>

        {/* 입금 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <FaUniversity className="text-2xl text-brand-primary" />
            <h2 className="text-lg font-bold text-gray-900">입금 계좌 정보</h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-600 block mb-1">은행명</span>
                <span className="text-xl font-bold text-gray-900">{bankInfo.bankName}</span>
              </div>

              <div>
                <span className="text-sm text-gray-600 block mb-1">계좌번호</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900 font-mono">
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
                <span className="text-xl font-bold text-gray-900">{bankInfo.accountHolder}</span>
              </div>

              <div className="pt-4 border-t border-blue-300">
                <span className="text-sm text-gray-600 block mb-1">입금 금액</span>
                <span className="text-2xl font-bold text-brand-primary">
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
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-600" />
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

        {/* 버튼 */}
        <button
          onClick={handleConfirmTransfer}
          className="w-full py-4 bg-brand-primary text-white rounded-lg font-bold text-lg hover:bg-[#1a4d8f] transition-colors"
        >
          입금 완료 확인 요청
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">입금 완료 후 위 버튼을 눌러주세요</p>
      </div>
    </div>
  );
}
