'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  ArrowDownToLine,
  Calendar,
  Info,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface EarningsSummary {
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingEarnings: number;
}

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal';
  amount: number;
  status: string;
  description: string;
  created_at: string;
  errand_title?: string;
}

export default function HelperEarningsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<EarningsSummary>({
    availableBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    pendingEarnings: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadEarningsData();
    }
  }, [user]);

  async function loadEarningsData() {
    try {
      setLoading(true);
      const response = await fetch('/api/helper/earnings');
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary || {
          availableBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          pendingEarnings: 0,
        });
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('수익 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  const getTransactionIcon = (type: string, status: string) => {
    if (type === 'withdrawal') {
      if (status === 'completed') return { icon: CheckCircle, color: 'text-green-500' };
      if (status === 'pending') return { icon: Clock, color: 'text-yellow-500' };
      return { icon: AlertCircle, color: 'text-red-500' };
    }
    return { icon: TrendingUp, color: 'text-blue-500' };
  };

  return (
    <ErrandMypageLayout mode="helper">
      <div className="p-4 lg:p-0">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">수익 관리</h1>
          <p className="text-gray-600 mt-1">수익 현황과 출금 내역을 확인하세요</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto" />
            <p className="mt-4 text-gray-500">불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* 출금 가능 잔액 */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  <span className="text-blue-100">출금 가능 잔액</span>
                </div>
                <button className="text-blue-100 hover:text-white">
                  <Info className="w-5 h-5" />
                </button>
              </div>
              <p className="text-3xl font-bold mb-4">
                {summary.availableBalance.toLocaleString()}원
              </p>
              <button
                onClick={() => setWithdrawModalOpen(true)}
                className="w-full py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowDownToLine className="w-5 h-5" />
                출금 신청
              </button>
            </div>

            {/* 수익 요약 */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">누적 수익</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {summary.totalEarned.toLocaleString()}원
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs">출금 완료</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {summary.totalWithdrawn.toLocaleString()}원
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">정산 대기</span>
                </div>
                <p className="text-lg font-bold text-yellow-600">
                  {summary.pendingEarnings.toLocaleString()}원
                </p>
              </div>
            </div>

            {/* 거래 내역 */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">거래 내역</h2>
                <button className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  최근 30일
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center">
                  <Wallet className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">아직 거래 내역이 없습니다</p>
                  <p className="text-sm text-gray-400 mt-1">
                    심부름을 완료하면 수익이 발생합니다
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {transactions.map((tx) => {
                    const { icon: Icon, color } = getTransactionIcon(tx.type, tx.status);
                    return (
                      <div key={tx.id} className="flex items-center gap-4 p-4">
                        <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{tx.description}</p>
                          {tx.errand_title && (
                            <p className="text-sm text-gray-500 truncate">{tx.errand_title}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            {new Date(tx.created_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${tx.type === 'earning' ? 'text-blue-600' : 'text-gray-900'}`}>
                            {tx.type === 'earning' ? '+' : '-'}{tx.amount.toLocaleString()}원
                          </p>
                          {tx.status === 'pending' && (
                            <span className="text-xs text-yellow-600">처리중</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 출금 안내 */}
            <div className="mt-6 bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">출금 안내</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>최소 출금 금액: 10,000원</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>출금 수수료: 무료 (월 2회까지)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>출금 처리: 영업일 기준 1~2일 소요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>정산은 심부름 완료 후 24시간 뒤에 가능합니다</span>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* 출금 모달 (간단 구현) */}
        {withdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setWithdrawModalOpen(false)} />
            <div className="relative bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">출금 신청</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  출금 금액
                </label>
                <input
                  type="number"
                  placeholder="금액을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  출금 가능: {summary.availableBalance.toLocaleString()}원
                </p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  입금 계좌
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>등록된 계좌 없음</option>
                </select>
                <Link href="/errands/mypage/helper/settings" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                  + 계좌 등록하기
                </Link>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setWithdrawModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    alert('출금 기능은 준비 중입니다.');
                    setWithdrawModalOpen(false);
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  출금 신청
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrandMypageLayout>
  );
}
