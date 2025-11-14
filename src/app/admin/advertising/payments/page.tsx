'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Payment {
  id: string;
  seller_id: string;
  subscription_id: string;
  amount: number;
  supply_amount: number;
  tax_amount: number;
  payment_method: string;
  status: string;
  depositor_name: string | null;
  bank_name: string | null;
  deposit_date: string | null;
  deposit_time: string | null;
  confirmed_at: string | null;
  confirmed_by: string | null;
  admin_memo: string | null;
  created_at: string;
  subscription: {
    id: string;
    service: {
      title: string;
    } | null;
  } | null;
  seller: {
    id: string;
    user: {
      email: string;
      name: string | null;
    } | null;
  } | null;
  confirmed_by_admin: {
    id: string;
    user: {
      name: string | null;
    } | null;
  } | null;
}

interface Stats {
  pending: { count: number; total: number };
  confirmed: { count: number; total: number };
  completed: { count: number; total: number };
  cancelled: { count: number; total: number };
  all: { count: number; total: number };
}

export default function AdminAdvertisingPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending: { count: 0, total: 0 },
    confirmed: { count: 0, total: 0 },
    completed: { count: 0, total: 0 },
    cancelled: { count: 0, total: 0 },
    all: { count: 0, total: 0 }
  });

  // 필터 상태
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // 선택 및 일괄 처리
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);
  const [memoText, setMemoText] = useState('');

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadPayments();
  }, [statusFilter, startDate, endDate, minAmount, maxAmount, currentPage]);

  async function loadPayments() {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString()
      });

      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (minAmount) params.append('minAmount', minAmount);
      if (maxAmount) params.append('maxAmount', maxAmount);

      const response = await fetch(`/api/admin/advertising/payments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setPayments(data.payments || []);
      setStats(data.stats || stats);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('결제 목록 로딩 실패:', error);
      alert('결제 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    setCurrentPage(1);
    loadPayments();
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(new Set(payments.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  }

  function handleSelectOne(id: string, checked: boolean) {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  }

  async function handleBulkAction(action: 'confirm' | 'complete' | 'cancel') {
    if (selectedIds.size === 0) {
      alert('선택된 항목이 없습니다');
      return;
    }

    const statusMap = {
      confirm: 'confirmed',
      complete: 'completed',
      cancel: 'cancelled'
    };

    const confirmed = confirm(`선택한 ${selectedIds.size}건을 ${action === 'confirm' ? '확인' : action === 'complete' ? '완료' : '취소'} 처리하시겠습니까?`);
    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/advertising/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIds: Array.from(selectedIds),
          status: statusMap[action]
        })
      });

      if (!response.ok) throw new Error('Failed to update');

      alert('처리되었습니다');
      setSelectedIds(new Set());
      loadPayments();
    } catch (error) {
      console.error('일괄 처리 실패:', error);
      alert('처리에 실패했습니다');
    }
  }

  async function handleUpdateStatus(paymentId: string, newStatus: string) {
    try {
      const response = await fetch('/api/admin/advertising/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIds: [paymentId],
          status: newStatus,
          adminMemo: memoText || undefined
        })
      });

      if (!response.ok) throw new Error('Failed to update');

      alert('상태가 업데이트되었습니다');
      setDetailPayment(null);
      setMemoText('');
      loadPayments();
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
      alert('업데이트에 실패했습니다');
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: '입금 대기', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: '확인 완료', className: 'bg-blue-100 text-blue-800' },
      completed: { label: '처리 완료', className: 'bg-green-100 text-green-800' },
      cancelled: { label: '취소', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">무통장 입금 관리</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600 mb-1">입금 대기</div>
          <div className="text-3xl font-bold text-gray-900">{stats.pending.count}</div>
          <div className="text-sm text-gray-500 mt-2">{stats.pending.total.toLocaleString()}원</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-1">확인 완료</div>
          <div className="text-3xl font-bold text-gray-900">{stats.confirmed.count}</div>
          <div className="text-sm text-gray-500 mt-2">{stats.confirmed.total.toLocaleString()}원</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-1">처리 완료</div>
          <div className="text-3xl font-bold text-gray-900">{stats.completed.count}</div>
          <div className="text-sm text-gray-500 mt-2">{stats.completed.total.toLocaleString()}원</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="text-sm text-gray-600 mb-1">취소</div>
          <div className="text-3xl font-bold text-gray-900">{stats.cancelled.count}</div>
          <div className="text-sm text-gray-500 mt-2">{stats.cancelled.total.toLocaleString()}원</div>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <input
              type="text"
              placeholder="고객명, 회사, 입금자명"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">전체</option>
              <option value="pending">입금 대기</option>
              <option value="confirmed">확인 완료</option>
              <option value="completed">처리 완료</option>
              <option value="cancelled">취소</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">최소 금액</label>
            <input
              type="number"
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">최대 금액</label>
            <input
              type="number"
              placeholder="무제한"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#0a2540] font-medium"
            >
              검색
            </button>
          </div>
        </div>
      </div>

      {/* 일괄 작업 버튼 */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">
            {selectedIds.size}개 항목 선택됨
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('confirm')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              일괄 확인
            </button>
            <button
              onClick={() => handleBulkAction('complete')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              일괄 완료
            </button>
            <button
              onClick={() => handleBulkAction('cancel')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              일괄 취소
            </button>
          </div>
        </div>
      )}

      {/* 결제 목록 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">결제 내역이 없습니다</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === payments.length && payments.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">고객정보</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">서비스</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">입금정보</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">금액</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">신청일시</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(payment.id)}
                          onChange={(e) => handleSelectOne(payment.id, e.target.checked)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.seller?.user?.name || '알 수 없음'}
                        </div>
                        <div className="text-xs text-gray-500">{payment.seller?.user?.email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {payment.subscription?.service?.title || '서비스 정보 없음'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {payment.depositor_name || '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.bank_name || '-'}
                        </div>
                        {payment.deposit_date && (
                          <div className="text-xs text-gray-500">
                            {payment.deposit_date} {payment.deposit_time}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {payment.amount.toLocaleString()}원
                        </div>
                        <div className="text-xs text-gray-500">
                          공급가: {payment.supply_amount?.toLocaleString() || 0}원
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(payment.created_at).toLocaleDateString('ko-KR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(payment.created_at).toLocaleTimeString('ko-KR')}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(payment.status)}
                        {payment.confirmed_by_admin && (
                          <div className="text-xs text-gray-500 mt-1">
                            by {payment.confirmed_by_admin.user?.name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => setDetailPayment(payment)}
                          className="text-[#0f3460] hover:text-[#0a2540] text-sm font-medium"
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                전체 {stats[statusFilter as keyof Stats]?.count || 0}건
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  이전
                </button>
                <span className="px-3 py-1 text-sm">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  다음
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 상세 정보 모달 */}
      {detailPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">결제 상세 정보</h2>
              <button
                onClick={() => setDetailPayment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 고객 정보 */}
              <div>
                <h3 className="text-lg font-bold mb-3">고객 정보</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이름:</span>
                    <span className="font-medium">{detailPayment.seller?.user?.name || '알 수 없음'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">이메일:</span>
                    <span className="font-medium">{detailPayment.seller?.user?.email}</span>
                  </div>
                </div>
              </div>

              {/* 결제 정보 */}
              <div>
                <h3 className="text-lg font-bold mb-3">결제 정보</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">서비스:</span>
                    <span className="font-medium">{detailPayment.subscription?.service?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">금액:</span>
                    <span className="font-bold text-lg">{detailPayment.amount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">공급가:</span>
                    <span className="font-medium">{detailPayment.supply_amount?.toLocaleString() || 0}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">부가세:</span>
                    <span className="font-medium">{detailPayment.tax_amount?.toLocaleString() || 0}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">입금자명:</span>
                    <span className="font-medium">{detailPayment.depositor_name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">은행:</span>
                    <span className="font-medium">{detailPayment.bank_name || '-'}</span>
                  </div>
                  {detailPayment.deposit_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">입금일시:</span>
                      <span className="font-medium">
                        {detailPayment.deposit_date} {detailPayment.deposit_time}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 처리 정보 */}
              <div>
                <h3 className="text-lg font-bold mb-3">처리 정보</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">상태:</span>
                    {getStatusBadge(detailPayment.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">신청일시:</span>
                    <span className="font-medium">
                      {new Date(detailPayment.created_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  {detailPayment.confirmed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">확인일시:</span>
                      <span className="font-medium">
                        {new Date(detailPayment.confirmed_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                  )}
                  {detailPayment.confirmed_by_admin && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">처리자:</span>
                      <span className="font-medium">{detailPayment.confirmed_by_admin.user?.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 관리자 메모 */}
              <div>
                <h3 className="text-lg font-bold mb-3">관리자 메모</h3>
                <textarea
                  value={memoText || detailPayment.admin_memo || ''}
                  onChange={(e) => setMemoText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="메모를 입력하세요..."
                />
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                {detailPayment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(detailPayment.id, 'confirmed')}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
                    >
                      입금 확인
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(detailPayment.id, 'cancelled')}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700"
                    >
                      취소
                    </button>
                  </>
                )}
                {detailPayment.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(detailPayment.id, 'completed')}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
                  >
                    처리 완료
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
