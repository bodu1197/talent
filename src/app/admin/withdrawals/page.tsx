"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { Inbox } from "lucide-react";
import toast from "react-hot-toast";

interface Withdrawal {
  id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  status: string;
  created_at: string;
  requested_at: string;
  completed_at?: string;
  seller: {
    id: string;
    display_name: string;
    user_id: string;
  } | null;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "completed" | "rejected"
  >("all");

  useEffect(() => {
    loadWithdrawals();
  }, []);

  async function loadWithdrawals() {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select(
          `
          id,
          amount,
          bank_name,
          account_number,
          account_holder,
          status,
          created_at,
          requested_at,
          completed_at,
          seller:seller_profiles!withdrawal_requests_seller_id_fkey(
            id,
            display_name,
            user_id
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match Withdrawal type (seller is returned as array by Supabase)
      const transformedData = (data || []).map((item) => ({
        ...item,
        seller: Array.isArray(item.seller) ? item.seller[0] : item.seller,
      })) as Withdrawal[];

      setWithdrawals(transformedData);
    } catch (error) {
      logger.error("Failed to load withdrawals:", error);
      toast.error("출금 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(withdrawalId: string) {
    if (!confirm("출금을 승인하시겠습니까?")) return;

    setActionLoading(withdrawalId);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("withdrawal_requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", withdrawalId);

      if (error) throw error;

      toast.success("출금이 승인되었습니다.");
      loadWithdrawals();
    } catch (error) {
      logger.error("Approval error:", error);
      toast.error("출금 승인에 실패했습니다.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(withdrawalId: string) {
    const reason = prompt("거절 사유를 입력하세요:");
    if (!reason) return;

    setActionLoading(withdrawalId);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("withdrawal_requests")
        .update({
          status: "rejected",
          rejected_reason: reason,
          completed_at: new Date().toISOString(),
        })
        .eq("id", withdrawalId);

      if (error) throw error;

      toast.error("출금이 거절되었습니다.");
      loadWithdrawals();
    } catch (error) {
      logger.error("Rejection error:", error);
      toast.error("출금 거절에 실패했습니다.");
    } finally {
      setActionLoading(null);
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "대기 중";
      case "completed":
        return "완료";
      case "rejected":
        return "거절";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filter === "all") return true;
    return w.status === filter;
  });

  const pendingCount = withdrawals.filter((w) => w.status === "pending").length;
  const totalPendingAmount = withdrawals
    .filter((w) => w.status === "pending")
    .reduce((sum, w) => sum + w.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">출금 관리</h1>
        <p className="text-gray-600 mt-1">판매자 출금 요청을 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">대기 중인 출금 요청</div>
          <div className="text-2xl font-semibold text-yellow-600">
            {pendingCount}건
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">대기 중인 출금 금액</div>
          <div className="text-2xl font-semibold text-brand-primary">
            {totalPendingAmount.toLocaleString()}원
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">전체 요청</div>
          <div className="text-2xl font-semibold text-gray-900">
            {withdrawals.length}건
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "all"
              ? "bg-brand-primary text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "pending"
              ? "bg-brand-primary text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          대기 중
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "completed"
              ? "bg-brand-primary text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          완료
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "rejected"
              ? "bg-brand-primary text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          거절
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">출금 요청 목록</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                  날짜
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                  판매자
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                  계좌 정보
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-900">
                  상태
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-900">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredWithdrawals.length > 0 ? (
                filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(
                        withdrawal.requested_at || withdrawal.created_at,
                      ).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {withdrawal.seller?.display_name || "알 수 없음"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right text-gray-900">
                      {withdrawal.amount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{withdrawal.bank_name}</div>
                      <div className="text-xs text-gray-500">
                        {withdrawal.account_number}
                      </div>
                      <div className="text-xs text-gray-500">
                        {withdrawal.account_holder}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(withdrawal.status)}`}
                      >
                        {getStatusLabel(withdrawal.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {withdrawal.status === "pending" && (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleApprove(withdrawal.id)}
                            disabled={actionLoading === withdrawal.id}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleReject(withdrawal.id)}
                            disabled={actionLoading === withdrawal.id}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:bg-gray-400"
                          >
                            거절
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Inbox className="w-10 h-10 mb-4 text-gray-300 mx-auto" />
                    <p>출금 요청이 없습니다</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
