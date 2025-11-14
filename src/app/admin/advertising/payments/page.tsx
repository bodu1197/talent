'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { confirmBankTransferPayment } from '@/lib/advertising';
import type { PendingBankTransfer } from '@/types/advertising';

export default function AdminAdvertisingPaymentsPage() {
  const [loading, setLoading] = useState(true);
  interface PaymentWithDetails {
    id: string;
    seller_id: string;
    subscription_id: string;
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
    seller: {
      name: string;
      email: string;
    } | null;
  }

  const [pendingPayments, setPendingPayments] = useState<PaymentWithDetails[]>([]);

  useEffect(() => {
    loadPendingPayments();
  }, []);

  async function loadPendingPayments() {
    try {
      const supabase = createClient();

      const { data: payments } = await supabase
        .from('advertising_payments')
        .select(`
          *,
          subscription:advertising_subscriptions(
            service:services(title)
          ),
          seller:users!advertising_payments_seller_id_fkey(name, email)
        `)
        .eq('payment_method', 'bank_transfer')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setPendingPayments(payments || []);
    } catch (error) {
      console.error('입금 대기 목록 로딩 실패:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(paymentId: string) {
    const memo = prompt('관리자 메모 (선택사항):');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 관리자 정보 조회
      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!admin) {
        alert('관리자 권한이 필요합니다');
        return;
      }

      await confirmBankTransferPayment(paymentId, admin.id, memo || undefined);
      alert('입금이 확인되었습니다');
      loadPendingPayments();
    } catch (error) {
      console.error('입금 확인 실패:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      alert('입금 확인에 실패했습니다');
    }
  }

  async function handleReject(paymentId: string) {
    const reason = prompt('거절 사유를 입력하세요:');
    if (!reason) return;

    try {
      const supabase = createClient();

      await supabase
        .from('advertising_payments')
        .update({
          status: 'cancelled',
          admin_memo: reason
        })
        .eq('id', paymentId);

      alert('결제가 거절되었습니다');
      loadPendingPayments();
    } catch (error) {
      console.error('거절 실패:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      alert('거절 처리에 실패했습니다');
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">무통장 입금 확인</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            🔔 확인 대기 중: {pendingPayments.length}건
          </h2>
          <button
            onClick={loadPendingPayments}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            새로고침
          </button>
        </div>

        {pendingPayments.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            확인 대기 중인 입금이 없습니다
          </p>
        ) : (
          <div className="space-y-4">
            {pendingPayments.map(payment => (
              <div key={payment.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      {payment.seller?.name} 판매자
                    </h3>
                    <p className="text-sm text-gray-600">
                      {payment.subscription?.service?.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {payment.amount.toLocaleString()}원
                    </div>
                    <div className="text-xs text-gray-500">
                      신청: {new Date(payment.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  {payment.depositor_name && (
                    <div>
                      <span className="text-gray-600">입금자명:</span>
                      <span className="ml-2 font-medium">{payment.depositor_name}</span>
                    </div>
                  )}
                  {payment.bank_name && (
                    <div>
                      <span className="text-gray-600">입금 은행:</span>
                      <span className="ml-2 font-medium">{payment.bank_name}</span>
                    </div>
                  )}
                  {payment.deposit_date && (
                    <div>
                      <span className="text-gray-600">입금일:</span>
                      <span className="ml-2 font-medium">
                        {payment.deposit_date} {payment.deposit_time}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">이메일:</span>
                    <span className="ml-2 font-medium">{payment.seller?.email}</span>
                  </div>
                </div>

                {payment.receipt_image && (
                  <div className="mb-4">
                    <button
                      onClick={() => window.open(`/storage/${payment.receipt_image}`, '_blank')}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      📎 입금증 보기
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirm(payment.id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700"
                  >
                    ✓ 입금 확인
                  </button>
                  <button
                    onClick={() => handleReject(payment.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700"
                  >
                    ✕ 거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 최근 처리된 결제 내역 */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">최근 처리 내역</h2>
        <RecentPayments />
      </div>
    </div>
  );
}

function RecentPayments() {
  interface RecentPaymentDetails {
    id: string;
    amount: number;
    status: string;
    confirmed_at: string | null;
    subscription: {
      service: {
        title: string;
      } | null;
    } | null;
    seller: {
      name: string;
    } | null;
    confirmed_by_admin: {
      user: {
        name: string;
      } | null;
    } | null;
  }

  const [payments, setPayments] = useState<RecentPaymentDetails[]>([]);

  useEffect(() => {
    loadRecentPayments();
  }, []);

  async function loadRecentPayments() {
    const supabase = createClient();

    const { data } = await supabase
      .from('advertising_payments')
      .select(`
        *,
        subscription:advertising_subscriptions(
          service:services(title)
        ),
        seller:users!advertising_payments_seller_id_fkey(name),
        confirmed_by_admin:admins!advertising_payments_confirmed_by_fkey(
          user:users!admins_user_id_fkey(name)
        )
      `)
      .in('status', ['completed', 'cancelled'])
      .order('confirmed_at', { ascending: false })
      .limit(10);

    setPayments(data || []);
  }

  return (
    <div className="space-y-2">
      {payments.length === 0 ? (
        <p className="text-center text-gray-500 py-4">처리 내역이 없습니다</p>
      ) : (
        <div className="divide-y">
          {payments.map(payment => (
            <div key={payment.id} className="py-3 flex justify-between items-center">
              <div>
                <div className="font-medium">
                  {payment.seller?.name} - {payment.subscription?.service?.title}
                </div>
                <div className="text-xs text-gray-500">
                  {payment.confirmed_at && new Date(payment.confirmed_at).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{payment.amount.toLocaleString()}원</div>
                <div className="text-xs">
                  <span
                    className={`px-2 py-1 rounded ${
                      payment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {payment.status === 'completed' ? '승인' : '거절'}
                  </span>
                  {payment.confirmed_by_admin && (
                    <span className="ml-2 text-gray-600">
                      by {payment.confirmed_by_admin.user?.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
