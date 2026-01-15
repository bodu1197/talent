'use client';

import { useState } from 'react';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { Banknote, X, Clock, Receipt, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface Settlement {
  id: string;
  order_id: string;
  order_number: string;
  title: string;
  order_amount: number;
  pg_fee: number;
  platform_fee: number;
  net_amount: number;
  status: string;
  created_at: string;
  confirmed_at: string | null;
  paid_at: string | null;
  auto_confirm_at: string | null;
}

interface SellerEarningsClientProps {
  readonly earnings: {
    readonly available_balance: number;
    readonly pending_balance: number;
    readonly total_withdrawn: number;
    readonly total_earned: number;
    readonly pending_withdrawal?: {
      readonly id: string;
      readonly amount: number;
      readonly status: string;
      readonly created_at: string;
    } | null;
  };
  readonly settlements: Settlement[];
  readonly sellerData: {
    readonly id: string;
    readonly bank_name: string;
    readonly account_number: string;
    readonly account_holder: string;
  };
  readonly profileData?: {
    readonly name: string;
    readonly profile_image?: string | null;
  } | null;
}

export default function SellerEarningsClient({
  earnings,
  settlements,
  sellerData,
  profileData,
}: SellerEarningsClientProps) {
  const [loading, setLoading] = useState(false);
  const hasPendingWithdrawal = !!earnings.pending_withdrawal;

  const handleWithdrawRequest = async () => {
    if (loading) return;

    if (hasPendingWithdrawal) {
      toast.error('이미 출금 신청이 진행 중입니다.');
      return;
    }

    const amount = earnings.available_balance;

    if (amount <= 0) {
      toast.error('출금 가능 금액이 없습니다.');
      return;
    }

    if (amount < 10000) {
      toast.error('최소 출금 금액은 10,000원입니다.');
      return;
    }

    if (
      !confirm(
        `${amount.toLocaleString()}원을 출금 신청하시겠습니까?\n\n입금 계좌: ${sellerData.bank_name} ${sellerData.account_number}\n예금주: ${sellerData.account_holder}`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      const { data: existingPending } = await supabase
        .from('withdrawal_requests')
        .select('id')
        .eq('seller_id', sellerData.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingPending) {
        toast.error('이미 출금 신청이 진행 중입니다.');
        globalThis.location.reload();
        return;
      }

      const { error } = await supabase.from('withdrawal_requests').insert({
        seller_id: sellerData.id,
        amount: amount,
        bank_name: sellerData.bank_name,
        account_number: sellerData.account_number,
        account_holder: sellerData.account_holder,
        status: 'pending',
        requested_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('Withdrawal insert error:', error);
        throw error;
      }

      toast.success('출금 신청이 완료되었습니다.\n영업일 기준 1-3일 내 처리됩니다.');
      globalThis.location.reload();
    } catch (error: unknown) {
      logger.error('Withdrawal request error:', error);
      toast.error(
        '출금 신청에 실패했습니다.\n' + (error instanceof Error ? error.message : '알 수 없는 오류')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWithdrawal = async () => {
    if (!earnings.pending_withdrawal) return;

    if (!confirm('출금 신청을 취소하시겠습니까?')) {
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('withdrawal_requests')
        .delete()
        .eq('id', earnings.pending_withdrawal.id);

      if (error) {
        throw error;
      }

      toast.success('출금 신청이 취소되었습니다.');
      globalThis.location.reload();
    } catch (error: unknown) {
      logger.error('Withdrawal cancel error:', error);
      toast.error(
        '출금 신청 취소에 실패했습니다.\n' +
          (error instanceof Error ? error.message : '알 수 없는 오류')
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '정산 대기';
      case 'confirmed':
        return '출금 가능';
      case 'processing':
        return '출금 처리중';
      case 'paid':
        return '출금 완료';
      case 'cancelled':
        return '취소됨';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'processing':
        return 'bg-purple-100 text-purple-700';
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getDaysUntilAutoConfirm = (autoConfirmAt: string | null) => {
    if (!autoConfirmAt) return null;
    const now = new Date();
    const autoDate = new Date(autoConfirmAt);
    const diffTime = autoDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  return (
    <MypageLayoutWrapper mode="seller" profileData={profileData}>
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        <div className="mb-4 lg:mb-6">
          <h1 className="text-base lg:text-lg font-semibold text-gray-900">수익 관리</h1>
          <p className="text-gray-600 mt-1 text-sm">판매 수익을 관리하세요</p>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">플랫폼 에스크로 안내</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-700">
              <li>결제 완료 시 돌파구가 대금을 보관합니다</li>
              <li>구매자 확정 또는 납품 후 3일 경과 시 정산 가능합니다</li>
              <li>PG 수수료(약 3.3%)가 차감된 금액이 정산됩니다</li>
              <li>돌파구는 플랫폼 수수료를 받지 않습니다</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <div className="text-xs text-gray-600 mb-1">출금 가능 금액</div>
            <div className="text-base lg:text-lg font-semibold text-blue-600">
              {earnings?.available_balance?.toLocaleString() || '0'}원
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <div className="text-xs text-gray-600 mb-1">정산 대기중</div>
            <div className="text-base lg:text-lg font-semibold text-yellow-600">
              {earnings?.pending_balance?.toLocaleString() || '0'}원
            </div>
            <div className="text-xs text-gray-500 mt-1">구매확정 대기</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <div className="text-xs text-gray-600 mb-1">출금 완료</div>
            <div className="text-base lg:text-lg font-semibold text-gray-900">
              {earnings?.total_withdrawn?.toLocaleString() || '0'}원
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <div className="text-xs text-gray-600 mb-1">총 수익</div>
            <div className="text-base lg:text-lg font-semibold text-green-600">
              {earnings?.total_earned?.toLocaleString() || '0'}원
            </div>
          </div>
        </div>

        <div className="mb-4 lg:mb-6 flex flex-wrap gap-2 lg:gap-4">
          {hasPendingWithdrawal ? (
            <>
              <button
                onClick={handleCancelWithdrawal}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <X className="inline mr-1 w-4 h-4" />
                {loading ? '처리 중...' : '취소'}
              </button>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <Clock className="text-yellow-600 w-4 h-4" />
                <p className="text-xs text-yellow-800">
                  대기 중 ({earnings.pending_withdrawal?.amount?.toLocaleString()}원)
                </p>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleWithdrawRequest}
                disabled={earnings.available_balance <= 0 || loading}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Banknote className="inline mr-1 w-4 h-4" />
                {loading ? '처리 중...' : '출금 신청'}
              </button>
              {earnings.available_balance <= 0 && (
                <p className="text-xs text-gray-500 self-center">출금 가능 금액이 없습니다</p>
              )}
            </>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
          <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">
            정산 내역
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-sm font-medium text-gray-900 whitespace-nowrap">
                    날짜
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-gray-900 whitespace-nowrap">
                    서비스
                  </th>
                  <th className="px-3 py-3 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                    주문금액
                  </th>
                  <th className="px-3 py-3 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                    PG수수료
                  </th>
                  <th className="px-3 py-3 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                    정산금액
                  </th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-900 whitespace-nowrap">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {settlements.length > 0 ? (
                  settlements.map((s) => {
                    const daysLeft = getDaysUntilAutoConfirm(s.auto_confirm_at);
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {formatDate(s.created_at)}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          <div className="truncate max-w-[150px]" title={s.title}>
                            {s.title}
                          </div>
                          <div className="text-xs text-gray-500">#{s.order_number}</div>
                        </td>
                        <td className="px-3 py-4 text-sm text-right text-gray-900 whitespace-nowrap">
                          {s.order_amount.toLocaleString()}원
                        </td>
                        <td className="px-3 py-4 text-sm text-right text-red-500 whitespace-nowrap">
                          -{s.pg_fee.toLocaleString()}원
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-right text-green-600 whitespace-nowrap">
                          {s.net_amount.toLocaleString()}원
                        </td>
                        <td className="px-3 py-4 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(s.status)}`}
                          >
                            {getStatusLabel(s.status)}
                          </span>
                          {s.status === 'pending' && daysLeft !== null && (
                            <div className="text-xs text-gray-500 mt-1">
                              {daysLeft > 0 ? `${daysLeft}일 후 자동확정` : '자동확정 예정'}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-12 text-center text-gray-500">
                      <Receipt className="w-10 h-10 mb-4 text-gray-300 mx-auto" />
                      <p>정산 내역이 없습니다</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
