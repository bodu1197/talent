'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

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

// Helper: Handle authentication errors
function handleAuthError(status: number): boolean {
  if (status === 401 || status === 403) {
    toast.error('로그인이 필요하거나 권한이 없습니다');
    globalThis.location.href = '/admin/login';
    return true;
  }
  return false;
}

// Helper: Get avatar letter from name
function getAvatar(name: string | null): string {
  return name ? name[0] : '?';
}

// Helper: Get status label
function getStatusLabel(status: string): string {
  const config: Record<string, string> = {
    pending: '입금 대기',
    confirmed: '입금 확인',
    completed: '처리 완료',
    cancelled: '취소/환불',
  };
  return config[status] || status;
}

export default function AdminAdvertisingPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending: { count: 0, total: 0 },
    confirmed: { count: 0, total: 0 },
    completed: { count: 0, total: 0 },
    cancelled: { count: 0, total: 0 },
    all: { count: 0, total: 0 },
  });

  const [activeTab, setActiveTab] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [amountFilter, setAmountFilter] = useState('all');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);
  const [memoText, setMemoText] = useState('');
  const [showFabMenu, setShowFabMenu] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // 기본 날짜 설정
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    loadPayments();
  }, [activeTab, statusFilter, startDate, endDate, amountFilter, currentPage]);

  // Helper: Determine filter status
  function getFilterStatus(): string {
    if (activeTab !== 'all') return activeTab;
    if (statusFilter !== 'all') return statusFilter;
    return '';
  }

  // Helper: Apply amount filter to params
  function applyAmountFilter(params: URLSearchParams): void {
    if (amountFilter === 'all') return;

    const amountRanges: Record<string, { min?: string; max?: string }> = {
      under1m: { max: '1000000' },
      '1m-5m': { min: '1000000', max: '5000000' },
      '5m-10m': { min: '5000000', max: '10000000' },
      over10m: { min: '10000000' },
    };

    const range = amountRanges[amountFilter];
    if (range?.min) params.append('minAmount', range.min);
    if (range?.max) params.append('maxAmount', range.max);
  }

  // Helper: Build query parameters
  function buildQueryParams(): URLSearchParams {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      pageSize: '20',
    });

    const filterStatus = getFilterStatus();
    if (filterStatus) params.append('status', filterStatus);
    if (searchTerm) params.append('search', searchTerm);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    applyAmountFilter(params);
    return params;
  }

  async function loadPayments() {
    try {
      setLoading(true);
      const params = buildQueryParams();
      const response = await fetch(`/api/admin/advertising/payments?${params}`);

      if (handleAuthError(response.status)) return;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to fetch');
      }

      const data = await response.json();
      setPayments(data.payments || []);
      setStats(data.stats || stats);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      logger.error('결제 목록 로딩 실패:', error);
      toast.error('결제 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  }

  function generateDepositNumber(payment: Payment): string {
    const date = new Date(payment.created_at);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const seq = payment.id.slice(0, 2).toUpperCase();
    return `#DP${year}${month}${day}${seq}`;
  }

  function handleSearch() {
    setCurrentPage(1);
    loadPayments();
  }

  function selectAll() {
    setSelectedIds(new Set(payments.map((p) => p.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  function selectOne(id: string) {
    const newSelected = new Set(selectedIds);
    newSelected.add(id);
    setSelectedIds(newSelected);
  }

  function deselectOne(id: string) {
    const newSelected = new Set(selectedIds);
    newSelected.delete(id);
    setSelectedIds(newSelected);
  }

  function handleExportData() {
    // CSV 헤더
    const headers = [
      '입금번호',
      '판매자명',
      '이메일',
      '서비스',
      '금액',
      '공급가액',
      '부가세',
      '입금자명',
      '은행',
      '입금일',
      '입금시간',
      '상태',
      '등록일',
      '관리자 메모',
    ];

    // CSV 데이터 생성
    const rows = payments.map((payment) => {
      const depositNumber = generateDepositNumber(payment);
      const sellerName = payment.seller?.user?.name || '-';
      const sellerEmail = payment.seller?.user?.email || '-';
      const serviceTitle = payment.subscription?.service?.title || '-';
      const amount = payment.amount.toLocaleString();
      const supplyAmount = payment.supply_amount.toLocaleString();
      const taxAmount = payment.tax_amount.toLocaleString();
      const depositorName = payment.depositor_name || '-';
      const bankName = payment.bank_name || '-';
      const depositDate = payment.deposit_date || '-';
      const depositTime = payment.deposit_time || '-';
      const status = getStatusLabel(payment.status);
      const createdAt = new Date(payment.created_at).toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
      });
      const adminMemo = payment.admin_memo || '-';

      return [
        depositNumber,
        sellerName,
        sellerEmail,
        serviceTitle,
        amount,
        supplyAmount,
        taxAmount,
        depositorName,
        bankName,
        depositDate,
        depositTime,
        status,
        createdAt,
        adminMemo,
      ];
    });

    // CSV 문자열 생성 (Excel 호환을 위해 BOM 추가)
    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join(
        '\n'
      );

    // 파일 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `무통장입금_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function handleBulkAction(action: 'confirm' | 'complete' | 'cancel') {
    if (selectedIds.size === 0) {
      toast.error('선택된 항목이 없습니다');
      return;
    }

    const statusMap = {
      confirm: 'confirmed',
      complete: 'completed',
      cancel: 'cancelled',
    };

    const confirmed = globalThis.confirm(`선택한 ${selectedIds.size}건을 처리하시겠습니까?`);
    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/advertising/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIds: Array.from(selectedIds),
          status: statusMap[action],
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast.success('처리되었습니다');
      setSelectedIds(new Set());
      loadPayments();
    } catch (error) {
      logger.error('일괄 처리 실패:', error);
      toast.error('처리에 실패했습니다');
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
          adminMemo: memoText || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast.success('상태가 업데이트되었습니다');
      setDetailPayment(null);
      setMemoText('');
      loadPayments();
    } catch (error) {
      logger.error('상태 업데이트 실패:', error);
      toast.error('업데이트에 실패했습니다');
    }
  }

  function getStatusBadge(status: string) {
    const config: Record<string, { label: string; bg: string; text: string }> = {
      pending: {
        label: '입금 대기',
        bg: 'bg-[#fff3cd]',
        text: 'text-[#856404]',
      },
      confirmed: {
        label: '입금 확인',
        bg: 'bg-[#d1ecf1]',
        text: 'text-[#0c5460]',
      },
      completed: {
        label: '처리 완료',
        bg: 'bg-[#d4edda]',
        text: 'text-[#155724]',
      },
      cancelled: {
        label: '취소/환불',
        bg: 'bg-[#f8d7da]',
        text: 'text-[#721c24]',
      },
    };

    const cfg = config[status] || {
      label: status,
      bg: 'bg-gray-100',
      text: 'text-gray-800',
    };
    return (
      <span
        className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
      >
        {cfg.label}
      </span>
    );
  }

  const pendingOver24h = payments.filter(
    (p) =>
      p.status === 'pending' && Date.now() - new Date(p.created_at).getTime() > 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5">
      <div className="max-w-[1400px] mx-auto bg-white rounded-[20px] shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-gray-900">💳 무통장 입금 관리</h1>
          <div className="flex gap-4">
            <button
              onClick={loadPayments}
              className="px-5 py-2.5 bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-all text-gray-900"
            >
              🔄 새로고침
            </button>
            <button
              onClick={handleExportData}
              className="px-5 py-2.5 bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-all text-gray-900"
            >
              📊 데이터 내보내기
            </button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 p-8 bg-gray-50">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">입금 대기</span>
              <div className="w-10 h-10 rounded-xl bg-[#fff3cd] text-[#856404] flex items-center justify-center text-xl">
                ⏳
              </div>
            </div>
            <div className="text-4xl font-semibold text-gray-900 mb-2">{stats.pending.count}</div>
            <div className="text-sm text-gray-600">
              총 {stats.pending.total.toLocaleString()}원
              <span className="inline-block ml-1 px-2 py-0.5 bg-[#d4edda] text-[#155724] rounded-xl text-xs font-semibold">
                +12%
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">입금 확인</span>
              <div className="w-10 h-10 rounded-xl bg-[#d1ecf1] text-[#0c5460] flex items-center justify-center text-xl">
                ✓
              </div>
            </div>
            <div className="text-4xl font-semibold text-gray-900 mb-2">{stats.confirmed.count}</div>
            <div className="text-sm text-gray-600">
              총 {stats.confirmed.total.toLocaleString()}원
              <span className="inline-block ml-1 px-2 py-0.5 bg-[#d4edda] text-[#155724] rounded-xl text-xs font-semibold">
                +8%
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">처리 완료</span>
              <div className="w-10 h-10 rounded-xl bg-[#d4edda] text-[#155724] flex items-center justify-center text-xl">
                ✅
              </div>
            </div>
            <div className="text-4xl font-semibold text-gray-900 mb-2">{stats.completed.count}</div>
            <div className="text-sm text-gray-600">
              총 {stats.completed.total.toLocaleString()}원
              <span className="inline-block ml-1 px-2 py-0.5 bg-[#d4edda] text-[#155724] rounded-xl text-xs font-semibold">
                +25%
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">취소/환불</span>
              <div className="w-10 h-10 rounded-xl bg-[#f8d7da] text-[#721c24] flex items-center justify-center text-xl">
                ❌
              </div>
            </div>
            <div className="text-4xl font-semibold text-gray-900 mb-2">{stats.cancelled.count}</div>
            <div className="text-sm text-gray-600">
              총 {stats.cancelled.total.toLocaleString()}원
              <span className="inline-block ml-1 px-2 py-0.5 bg-[#f8d7da] text-[#721c24] rounded-xl text-xs font-semibold">
                -5%
              </span>
            </div>
          </div>
        </div>

        {/* 알림 메시지 */}
        {pendingOver24h > 0 && (
          <div className="mx-8 my-5 px-5 py-4 bg-[#fff3cd] text-[#856404] border border-[#ffeeba] rounded-lg flex items-center gap-3">
            <span>⚠️</span>
            <span>
              {pendingOver24h}건의 입금이 24시간 이상 확인되지 않았습니다. 확인이 필요합니다.
            </span>
          </div>
        )}

        {/* 필터 섹션 */}
        <div className="px-8 py-5 bg-white border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px] relative">
              <input
                type="text"
                placeholder="고객명, 회사명, 입금자명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#667eea]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                상태:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#667eea]"
              >
                <option value="all">전체</option>
                <option value="pending">입금 대기</option>
                <option value="confirmed">입금 확인</option>
                <option value="completed">처리 완료</option>
                <option value="cancelled">취소/환불</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
                기간:
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#667eea]"
              />
              <span>~</span>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#667eea]"
                aria-label="종료일"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="amount-filter" className="text-sm font-medium text-gray-700">
                금액:
              </label>
              <select
                id="amount-filter"
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#667eea]"
              >
                <option value="all">전체</option>
                <option value="under1m">100만원 미만</option>
                <option value="1m-5m">100-500만원</option>
                <option value="5m-10m">500-1000만원</option>
                <option value="over10m">1000만원 이상</option>
              </select>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex px-8 bg-white border-b-2 border-gray-200">
          {[
            { key: 'all', label: '전체', count: stats.all.count },
            { key: 'pending', label: '입금 대기', count: stats.pending.count },
            {
              key: 'confirmed',
              label: '입금 확인',
              count: stats.confirmed.count,
            },
            {
              key: 'completed',
              label: '처리 완료',
              count: stats.completed.count,
            },
            {
              key: 'cancelled',
              label: '취소/환불',
              count: stats.cancelled.count,
            },
          ].map((tab, index, tabs) => (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTab(tab.key);
                } else if (e.key === 'ArrowLeft' && index > 0) {
                  e.preventDefault();
                  setActiveTab(tabs[index - 1].key);
                } else if (e.key === 'ArrowRight' && index < tabs.length - 1) {
                  e.preventDefault();
                  setActiveTab(tabs[index + 1].key);
                }
              }}
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-label={`${tab.label} (${tab.count}개)`}
              tabIndex={activeTab === tab.key ? 0 : -1}
              className={`px-8 py-4 cursor-pointer font-medium relative transition-colors ${
                activeTab === tab.key ? 'text-[#667eea]' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 px-2 py-0.5 rounded-xl text-xs font-semibold ${
                  activeTab === tab.key ? 'bg-[#667eea] text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#667eea]"></div>
              )}
            </div>
          ))}
        </div>

        {/* 액션 바 */}
        <div className="px-8 py-5 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedIds.size === payments.length && payments.length > 0}
              onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
              className="w-5 h-5 cursor-pointer"
              aria-label="전체 선택"
            />
            <span className="text-sm text-gray-600">{selectedIds.size}개 선택됨</span>
            <button
              onClick={() => handleBulkAction('confirm')}
              className="px-5 py-2.5 bg-[#28a745] text-white rounded-lg text-sm font-medium hover:bg-[#218838] transition-colors flex items-center gap-2"
            >
              ✅ 입금 확인
            </button>
            <button
              onClick={() => handleBulkAction('complete')}
              className="px-5 py-2.5 bg-[#667eea] text-white rounded-lg text-sm font-medium hover:bg-[#5a67d8] transition-colors flex items-center gap-2"
            >
              📋 처리 완료
            </button>
            <button
              onClick={() => handleBulkAction('cancel')}
              className="px-5 py-2.5 bg-[#dc3545] text-white rounded-lg text-sm font-medium hover:bg-[#c82333] transition-colors flex items-center gap-2"
            >
              ❌ 취소 처리
            </button>
          </div>
          <button className="px-5 py-2.5 bg-[#667eea] text-white rounded-lg text-sm font-medium hover:bg-[#5a67d8] transition-colors flex items-center gap-2">
            ➕ 수동 입력
          </button>
        </div>

        {/* 테이블 */}
        <div className="px-8 pb-8 bg-white overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-3 border-[#667eea] border-t-transparent rounded-full animate-spin mb-4"></div>
            </div>
          ) : (
            <>
              {payments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">결제 내역이 없습니다</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-4 text-left w-10">
                        <input type="checkbox" className="w-4 h-4" />
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                        입금번호
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                        고객 정보
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                        입금 정보
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                        광고비
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                        입금 예정일
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                        상태
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                        처리 담당자
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(payment.id)}
                            onChange={(e) =>
                              e.target.checked ? selectOne(payment.id) : deselectOne(payment.id)
                            }
                            className="w-4 h-4"
                            aria-label={`${generateDepositNumber(payment)} 선택`}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <strong className="text-sm">{generateDepositNumber(payment)}</strong>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
                              {getAvatar(payment.seller?.user?.name || null)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm text-gray-900">
                                {payment.seller?.user?.name || '알 수 없음'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {payment.subscription?.service?.title || '회사명'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <strong className="text-sm text-gray-900">
                              입금자: {payment.depositor_name || '-'}
                            </strong>
                            <br />
                            <small className="text-xs text-gray-500">
                              {payment.bank_name ? `${payment.bank_name} 끝번호 ****` : '-'}
                            </small>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-base text-gray-900">
                            ₩{payment.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {payment.deposit_date ||
                            new Date(payment.created_at).toISOString().split('T')[0]}
                        </td>
                        <td className="px-4 py-4">{getStatusBadge(payment.status)}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {payment.confirmed_by_admin?.user?.name || '-'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setDetailPayment(payment)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 hover:border-[#667eea] hover:text-[#667eea] transition-all group relative"
                              title="상세보기"
                            >
                              👁️
                            </button>
                            {payment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(payment.id, 'confirmed')}
                                  className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 hover:border-[#667eea] hover:text-[#667eea] transition-all"
                                  title="입금확인"
                                >
                                  ✅
                                </button>
                                <button
                                  className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 hover:border-[#667eea] hover:text-[#667eea] transition-all"
                                  title="알림발송"
                                >
                                  ✉️
                                </button>
                              </>
                            )}
                            {payment.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(payment.id, 'completed')}
                                  className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 hover:border-[#667eea] hover:text-[#667eea] transition-all"
                                  title="처리완료"
                                >
                                  📋
                                </button>
                                <button
                                  className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 hover:border-[#667eea] hover:text-[#667eea] transition-all"
                                  title="영수증"
                                >
                                  📄
                                </button>
                              </>
                            )}
                            {payment.status === 'completed' && (
                              <>
                                <button
                                  className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 hover:border-[#667eea] hover:text-[#667eea] transition-all"
                                  title="계산서"
                                >
                                  📑
                                </button>
                                <button
                                  className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 hover:border-[#667eea] hover:text-[#667eea] transition-all"
                                  title="이력보기"
                                >
                                  📊
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="px-8 py-8 flex justify-center items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 border border-gray-300 bg-white rounded-lg flex items-center justify-center text-sm text-gray-700 hover:bg-gray-50 hover:border-[#667eea] hover:text-[#667eea] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
            <button
              key={`page-${i + 1}`}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-9 h-9 border rounded-lg flex items-center justify-center text-sm transition-all ${
                currentPage === i + 1
                  ? 'bg-[#667eea] text-white border-[#667eea]'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-[#667eea] hover:text-[#667eea]'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 border border-gray-300 bg-white rounded-lg flex items-center justify-center text-sm text-gray-700 hover:bg-gray-50 hover:border-[#667eea] hover:text-[#667eea] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {detailPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                입금 상세 정보 {generateDepositNumber(detailPayment)}
              </h2>
              <button
                onClick={() => setDetailPayment(null)}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 고객 정보 */}
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-4">👤 고객 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-600 mb-1">고객명</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {detailPayment.seller?.user?.name || '알 수 없음'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-600 mb-1">회사명</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {detailPayment.subscription?.service?.title || '-'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-600 mb-1">연락처</span>
                    <span className="text-sm font-semibold text-gray-900">-</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-600 mb-1">이메일</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {detailPayment.seller?.user?.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* 입금 정보 */}
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-4">💰 입금 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-600 mb-1">입금액</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₩{detailPayment.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-600 mb-1">입금 예정일</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {detailPayment.deposit_date ||
                        new Date(detailPayment.created_at).toISOString().split('T')[0]}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-600 mb-1">입금자명</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {detailPayment.depositor_name || '-'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-600 mb-1">입금 은행</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {detailPayment.bank_name ? `${detailPayment.bank_name} (끝번호 ****)` : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-600 mb-1">상태</span>
                    <div>{getStatusBadge(detailPayment.status)}</div>
                  </div>
                </div>
              </div>

              {/* 광고 정보 */}
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-4">📢 광고 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-600 mb-1">광고 상품</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {detailPayment.subscription?.service?.title || '-'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-600 mb-1">광고 기간</span>
                    <span className="text-sm font-semibold text-gray-900">-</span>
                  </div>
                </div>
              </div>

              {/* 처리 이력 */}
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-4">📝 처리 이력</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2.5">
                  <div>
                    <strong className="text-sm">
                      {new Date(detailPayment.created_at).toLocaleString('ko-KR', {
                        timeZone: 'Asia/Seoul',
                      })}
                    </strong>
                    {' - 입금 요청 생성 (시스템)'}
                  </div>
                  {detailPayment.confirmed_at && (
                    <div>
                      <strong className="text-sm">
                        {new Date(detailPayment.confirmed_at).toLocaleString('ko-KR', {
                          timeZone: 'Asia/Seoul',
                        })}
                      </strong>
                      {' - 입금 확인 ('}
                      {detailPayment.confirmed_by_admin?.user?.name || '관리자'}
                      {')'}
                    </div>
                  )}
                </div>
              </div>

              {/* 메모 */}
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-4">📌 메모</h3>
                <textarea
                  value={memoText || detailPayment.admin_memo || ''}
                  onChange={(e) => setMemoText(e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#667eea]"
                  placeholder="메모를 입력하세요..."
                />
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-200 flex justify-end gap-2.5">
              <button
                onClick={() => setDetailPayment(null)}
                className="px-5 py-2.5 bg-[#6c757d] text-white rounded-lg text-sm font-medium hover:bg-[#5a6268] transition-colors"
              >
                닫기
              </button>
              {detailPayment.status === 'pending' && (
                <button
                  onClick={() => handleUpdateStatus(detailPayment.id, 'confirmed')}
                  className="px-5 py-2.5 bg-[#28a745] text-white rounded-lg text-sm font-medium hover:bg-[#218838] transition-colors"
                >
                  입금 확인
                </button>
              )}
              {detailPayment.status === 'confirmed' && (
                <button
                  onClick={() => handleUpdateStatus(detailPayment.id, 'completed')}
                  className="px-5 py-2.5 bg-[#667eea] text-white rounded-lg text-sm font-medium hover:bg-[#5a67d8] transition-colors"
                >
                  처리 완료
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 플로팅 액션 버튼 */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <button
          onClick={() => setShowFabMenu(!showFabMenu)}
          className="w-14 h-14 rounded-full bg-[#667eea] text-white flex items-center justify-center text-2xl shadow-lg hover:scale-110 hover:shadow-xl transition-all"
        >
          ➕
        </button>
        {showFabMenu && (
          <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-xl p-2.5 min-w-[200px]">
            <div className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              ✅ 빠른 입금 확인
            </div>
            <div className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              📋 일괄 처리
            </div>
            <div className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              ✉️ 대량 메일 발송
            </div>
            <div className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              📊 보고서 생성
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
