"use client";

import { useState, useEffect } from "react";
import {
  FaPlus,
  FaCoins,
  FaArrowDown,
  FaWallet,
  FaUsers,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import toast from "react-hot-toast";

interface Credit {
  id: string;
  seller_id: string;
  amount: number;
  initial_amount: number;
  used_amount: number;
  promotion_type: string | null;
  expires_at: string | null;
  created_at: string;
  seller?: {
    email: string;
    full_name: string | null;
  };
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

interface Summary {
  totalIssued: number;
  totalUsed: number;
  totalRemaining: number;
  totalHolders: number;
}

export default function AdminCreditsPage() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [grantForm, setGrantForm] = useState({
    sellerId: "",
    amount: 600000,
    description: "관리자 수동 지급",
    promotionType: "",
  });

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/advertising/credits");
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits || []);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error(
        "Failed to fetch credits:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditDetails = async (sellerId: string) => {
    try {
      const response = await fetch(
        `/api/admin/advertising/credits?sellerId=${sellerId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error(
        "Failed to fetch credit details:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
    }
  };

  const handleViewDetails = async (credit: Credit) => {
    setSelectedCredit(credit);
    await fetchCreditDetails(credit.seller_id);
  };

  const handleGrantCredit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!grantForm.sellerId || !grantForm.amount) {
      toast.error("판매자 ID와 금액을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/admin/advertising/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grantForm),
      });

      if (response.ok) {
        toast.success("크레딧이 지급되었습니다.");
        setShowGrantDialog(false);
        setGrantForm({
          sellerId: "",
          amount: 600000,
          description: "관리자 수동 지급",
          promotionType: "",
        });
        await fetchCredits();
      } else {
        toast.error("크레딧 지급에 실패했습니다.");
      }
    } catch (error) {
      console.error(
        "Failed to grant credit:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      toast.error("크레딧 지급에 실패했습니다.");
    }
  };

  const getPromotionLabel = (type: string | null) => {
    if (!type) return "-";
    const labels = {
      launch_promo: "런칭 프로모션",
      referral: "추천 보상",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels = {
      earned: "적립",
      spent: "사용",
      refunded: "환불",
      expired: "만료",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTransactionTypeColor = (type: string) => {
    const colors = {
      earned: "text-green-600",
      spent: "text-red-600",
      refunded: "text-blue-600",
      expired: "text-gray-600",
    };
    return colors[type as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            크레딧 관리
          </h1>
          <p className="text-slate-600">판매자 광고 크레딧을 관리합니다</p>
        </div>
        <button
          onClick={() => setShowGrantDialog(true)}
          className="px-4 py-2 bg-[#0f3460] text-white rounded-md font-medium hover:bg-[#0f3460]/90 transition-colors flex items-center gap-2"
        >
          <FaPlus />
          크레딧 지급
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-6 md:grid-cols-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">
                  총 지급액
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  ₩{summary.totalIssued.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <FaCoins className="text-[#0f3460] text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">
                  총 사용액
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  ₩{summary.totalUsed.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <FaArrowDown className="text-red-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">
                  총 잔액
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  ₩{summary.totalRemaining.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <FaWallet className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">
                  보유자 수
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {summary.totalHolders}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3">
                <FaUsers className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credits Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-600">데이터를 불러오는 중...</div>
        </div>
      ) : (
        <>
          {credits.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <FaCoins className="text-slate-400 text-5xl mb-4 mx-auto" />
              <p className="text-slate-600">크레딧 내역이 없습니다.</p>
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
                    프로모션 타입
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                    초기 지급
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                    사용액
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                    잔액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    만료일
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-700">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {credits.map((credit) => (
                  <tr key={credit.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium text-slate-900">
                          {credit.seller?.full_name || "Unknown"}
                        </p>
                        <p className="text-slate-500">{credit.seller?.email}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                      {getPromotionLabel(credit.promotion_type)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-900">
                      ₩{credit.initial_amount.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-red-600">
                      ₩{credit.used_amount.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-green-600">
                      ₩{credit.amount.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                      {credit.expires_at
                        ? new Date(credit.expires_at).toLocaleDateString(
                            "ko-KR",
                          )
                        : "무기한"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                      <button
                        onClick={() => handleViewDetails(credit)}
                        className="text-[#0f3460] hover:text-[#0f3460]/80"
                        title="상세 보기"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grant Credit Dialog */}
      {showGrantDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <form onSubmit={handleGrantCredit}>
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  크레딧 지급
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  판매자에게 광고 크레딧을 지급합니다.
                </p>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="seller-id" className="block text-sm font-medium text-slate-700 mb-1">
                    판매자 ID *
                  </label>
                  <input
                    id="seller-id"
                    type="text"
                    value={grantForm.sellerId}
                    onChange={(e) =>
                      setGrantForm({ ...grantForm, sellerId: e.target.value })
                    }
                    placeholder="UUID"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                  />
                </div>

                <div>
                  <label htmlFor="credit-amount" className="block text-sm font-medium text-slate-700 mb-1">
                    금액 *
                  </label>
                  <input
                    id="credit-amount"
                    type="number"
                    value={grantForm.amount}
                    onChange={(e) =>
                      setGrantForm({
                        ...grantForm,
                        amount: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="10000"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                  />
                </div>

                <div>
                  <label htmlFor="promotion-type" className="block text-sm font-medium text-slate-700 mb-1">
                    프로모션 타입
                  </label>
                  <select
                    id="promotion-type"
                    value={grantForm.promotionType}
                    onChange={(e) =>
                      setGrantForm({
                        ...grantForm,
                        promotionType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                  >
                    <option value="">없음</option>
                    <option value="launch_promo">런칭 프로모션</option>
                    <option value="referral">추천 보상</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="credit-description" className="block text-sm font-medium text-slate-700 mb-1">
                    설명
                  </label>
                  <textarea
                    id="credit-description"
                    value={grantForm.description}
                    onChange={(e) =>
                      setGrantForm({
                        ...grantForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGrantDialog(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f3460] text-white rounded-md hover:bg-[#0f3460]/90 transition-colors"
                >
                  지급
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credit Details Modal */}
      {selectedCredit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    크레딧 상세 내역
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedCredit.seller?.full_name} (
                    {selectedCredit.seller?.email})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCredit(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    초기 지급액
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    ₩{selectedCredit.initial_amount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    사용액
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    ₩{selectedCredit.used_amount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    잔액
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    ₩{selectedCredit.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Transactions */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  거래 내역
                </h3>
                {transactions.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">
                    거래 내역이 없습니다.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                            날짜
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                            유형
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                            설명
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-700">
                            금액
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-700">
                            잔액
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {new Date(tx.created_at).toLocaleString("ko-KR")}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={getTransactionTypeColor(
                                  tx.transaction_type,
                                )}
                              >
                                {getTransactionTypeLabel(tx.transaction_type)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {tx.description}
                            </td>
                            <td
                              className={`px-4 py-3 text-sm text-right font-medium ${getTransactionTypeColor(tx.transaction_type)}`}
                            >
                              {tx.amount > 0 ? "+" : ""}₩
                              {tx.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-slate-900">
                              ₩{tx.balance_after.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedCredit(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
          )}
        </>
      )}
    </div>
  );
}
