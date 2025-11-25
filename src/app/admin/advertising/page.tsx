'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaMoneyBillWave,
  FaBullhorn,
  FaClock,
  FaWonSign,
  FaEye,
  FaBan,
  FaCheckCircle,
  FaTimes,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface Subscription {
  id: string;
  seller_id: string;
  service_id: string;
  monthly_price: number;
  status: string;
  payment_method: string;
  next_billing_date: string;
  last_billed_at: string | null;
  started_at: string;
  total_impressions: number;
  total_clicks: number;
  total_paid: number;
  seller?: {
    id: string;
    user?: {
      email: string;
      name: string | null;
    };
  };
  service?: {
    title: string;
  };
}

interface Summary {
  totalSubscriptions: number;
  activeSubscriptions: number;
  pendingPayments: number;
  cancelledSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export default function AdminAdvertisingPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter, paymentFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter !== 'all') params.append('paymentMethod', paymentFilter);

      const response = await fetch(`/api/admin/advertising?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
        setSummary(data.summary);
      }
    } catch (error) {
      logger.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (subscriptionId: string, newStatus: string) => {
    if (!confirm(`정말 이 광고를 ${newStatus === 'active' ? '활성화' : '취소'}하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/advertising', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, status: newStatus }),
      });

      if (response.ok) {
        await fetchSubscriptions();
        toast.success('상태가 변경되었습니다.');
      } else {
        toast.error('상태 변경에 실패했습니다.');
      }
    } catch (error) {
      logger.error('Failed to update status:', error);
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending_payment: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      active: '활성',
      pending_payment: '결제 대기',
      cancelled: '취소',
      expired: '만료',
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      credit: '크레딧',
      card: '카드',
      bank_transfer: '무통장',
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0.00';
    return ((clicks / impressions) * 100).toFixed(2);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">광고 관리</h1>
          <p className="text-slate-600">판매자들의 광고 구독을 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/advertising/payments"
            className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <FaMoneyBillWave />
            무통장 입금 확인
            {summary && summary.pendingPayments > 0 && (
              <span className="bg-white text-red-600 rounded-full px-2 py-0.5 text-xs font-bold">
                {summary.pendingPayments}
              </span>
            )}
          </Link>
          <Link
            href="/admin/advertising/credits"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md font-medium hover:bg-slate-50 transition-colors"
          >
            크레딧 관리
          </Link>
          <Link
            href="/admin/advertising/statistics"
            className="px-4 py-2 bg-[#0f3460] text-white rounded-md font-medium hover:bg-[#0f3460]/90 transition-colors"
          >
            통계 보기
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">총 수익</p>
                <p className="text-3xl font-bold text-slate-900">
                  ₩{summary.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <FaWonSign className="text-[#0f3460] text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">활성 광고</p>
                <p className="text-3xl font-bold text-slate-900">{summary.activeSubscriptions}</p>
                <p className="text-sm text-slate-500 mt-1">
                  월 ₩{summary.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <FaBullhorn className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">결제 대기</p>
                <p className="text-3xl font-bold text-slate-900">{summary.pendingPayments}</p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label
              htmlFor="ad-status-filter"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              상태
            </label>
            <select
              id="ad-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="pending_payment">결제 대기</option>
              <option value="cancelled">취소</option>
              <option value="expired">만료</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="payment-method-filter"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              결제 방법
            </label>
            <select
              id="payment-method-filter"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              <option value="credit">크레딧</option>
              <option value="card">카드</option>
              <option value="bank_transfer">무통장</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-600">데이터를 불러오는 중...</div>
        </div>
      ) : (
        <>
          {subscriptions.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <FaBullhorn className="text-slate-400 text-5xl mb-4 inline-block" />
              <p className="text-slate-600">광고 구독이 없습니다.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                        판매자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                        서비스
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                        결제방법
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        노출수
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        클릭수
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        CTR
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        총 결제
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-700">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <div>
                            <p className="font-medium text-slate-900">
                              {sub.seller?.user?.name || 'Unknown'}
                            </p>
                            <p className="text-slate-500">{sub.seller?.user?.email}</p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                          {sub.service?.title || 'Unknown Service'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {getStatusBadge(sub.status)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                          {getPaymentMethodLabel(sub.payment_method)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-900">
                          {sub.total_impressions.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-900">
                          {sub.total_clicks.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-900">
                          {getCTR(sub.total_impressions, sub.total_clicks)}%
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900">
                          ₩{sub.total_paid.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedSubscription(sub)}
                              className="text-[#0f3460] hover:text-[#0f3460]/80"
                              title="상세 보기"
                            >
                              <FaEye />
                            </button>
                            {sub.status === 'active' && (
                              <button
                                onClick={() => handleStatusChange(sub.id, 'cancelled')}
                                className="text-red-600 hover:text-red-700"
                                title="취소"
                              >
                                <FaBan />
                              </button>
                            )}
                            {sub.status === 'cancelled' && (
                              <button
                                onClick={() => handleStatusChange(sub.id, 'active')}
                                className="text-green-600 hover:text-green-700"
                                title="활성화"
                              >
                                <FaCheckCircle />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black bg-opacity-50 cursor-default"
            onClick={() => setSelectedSubscription(null)}
            aria-label="모달 닫기"
          />
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-detail-title"
          >
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 id="subscription-detail-title" className="text-xl font-bold text-slate-900">
                  광고 상세 정보
                </h2>
                <button
                  onClick={() => setSelectedSubscription(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">판매자</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {selectedSubscription.seller?.user?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedSubscription.seller?.user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">서비스</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {selectedSubscription.service?.title || 'Unknown Service'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">상태</p>
                  <div className="mt-1">{getStatusBadge(selectedSubscription.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">결제 방법</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {getPaymentMethodLabel(selectedSubscription.payment_method)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">월 요금</p>
                  <p className="text-sm text-slate-900 mt-1">
                    ₩{selectedSubscription.monthly_price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">총 결제액</p>
                  <p className="text-sm text-slate-900 mt-1">
                    ₩{selectedSubscription.total_paid.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">총 노출</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {selectedSubscription.total_impressions.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">총 클릭</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {selectedSubscription.total_clicks.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">CTR</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {getCTR(
                      selectedSubscription.total_impressions,
                      selectedSubscription.total_clicks
                    )}
                    %
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">시작일</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {new Date(selectedSubscription.started_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">다음 결제일</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {new Date(selectedSubscription.next_billing_date).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedSubscription(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
