'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import toast from 'react-hot-toast';

interface WithdrawClientProps {
  readonly sellerData: {
    readonly id: string;
    readonly bank_name: string | null;
    readonly account_number: string | null;
    readonly account_holder: string | null;
  };
  readonly profileData?: {
    readonly name: string;
    readonly profile_image?: string | null;
  } | null;
  readonly availableBalance: number;
  readonly pendingWithdrawal: {
    readonly id: string;
    readonly amount: number;
    readonly created_at: string;
  } | null;
}

export default function WithdrawClient({
  sellerData,
  profileData,
  availableBalance,
  pendingWithdrawal,
}: WithdrawClientProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const withdrawAmount = Number.parseInt(amount);

    // Validation
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError('출금 금액을 입력해주세요.');
      return;
    }

    if (withdrawAmount > availableBalance) {
      setError('출금 가능 금액을 초과했습니다.');
      return;
    }

    if (withdrawAmount < 10000) {
      setError('최소 출금 금액은 10,000원입니다.');
      return;
    }

    if (!sellerData.bank_name || !sellerData.account_number) {
      setError('계좌 정보를 먼저 등록해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: withdrawError } = await supabase.from('withdrawal_requests').insert({
        seller_id: sellerData.id,
        amount: withdrawAmount,
        bank_name: sellerData.bank_name,
        account_number: sellerData.account_number,
        account_holder: sellerData.account_holder,
        status: 'pending',
      });

      if (withdrawError) throw withdrawError;

      toast.success('출금 신청이 완료되었습니다.');
      router.push('/mypage/seller/earnings');
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '출금 신청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MypageLayoutWrapper mode="seller" profileData={profileData}>
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-base md:text-lg font-semibold mb-6">출금 신청</h1>

          {/* Pending withdrawal notice */}
          {pendingWithdrawal && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm md:text-base text-yellow-800 font-medium">
                대기 중인 출금 신청이 있습니다.
              </p>
              <p className="text-xs md:text-sm text-yellow-700 mt-1">
                금액: {pendingWithdrawal.amount.toLocaleString()}원
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-base md:text-lg font-semibold mb-4">출금 가능 금액</h2>
            <p className="text-3xl font-semibold text-primary-600">
              {availableBalance.toLocaleString()}원
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-base md:text-lg font-semibold mb-4">계좌 정보</h2>
            {sellerData.bank_name && sellerData.account_number ? (
              <div className="space-y-2">
                <p className="text-sm md:text-base text-gray-600">은행: {sellerData.bank_name}</p>
                <p className="text-sm md:text-base text-gray-600">
                  계좌번호: {sellerData.account_number}
                </p>
                <p className="text-sm md:text-base text-gray-600">
                  예금주: {sellerData.account_holder}
                </p>
              </div>
            ) : (
              <div className="text-sm md:text-base text-red-600">
                계좌 정보가 등록되지 않았습니다. 프로필 설정에서 등록해주세요.
              </div>
            )}
          </div>

          <form onSubmit={handleWithdraw} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-base md:text-lg font-semibold mb-4">출금 신청</h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs md:text-sm mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="withdraw-amount"
                className="block text-sm md:text-base font-medium text-gray-700 mb-2"
              >
                출금 금액
              </label>
              <input
                id="withdraw-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
                placeholder="10,000"
                min="10000"
                max={availableBalance}
                disabled={isLoading || !!pendingWithdrawal}
              />
              <p className="text-xs text-gray-500 mt-1">최소 출금 금액: 10,000원</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 btn-secondary py-3"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading || !!pendingWithdrawal || !sellerData.bank_name}
                className="flex-1 btn-ai py-3 disabled:opacity-50"
              >
                {isLoading ? '신청 중...' : '출금 신청'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
