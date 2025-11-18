"use client";

import { useState, useEffect } from "react";
import {
  getAdminDashboardStats,
  getAdminRecentOrders,
  getAdminRecentUsers,
  type OrderWithRelations,
} from "@/lib/supabase/queries/admin";
import type { Tables } from "@/types/database";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import Link from "next/link";
import { logger } from "@/lib/logger";
import { FaUsers, FaWonSign, FaShoppingCart, FaFlag } from "react-icons/fa";

interface DashboardStats {
  totalUsers: number;
  todayRevenue: number;
  inProgressOrders: number;
  pendingReports: number;
  monthlyRevenue: number;
  monthlyOrderCount: number;
  totalOrders: number;
  totalServices: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderWithRelations[]>([]);
  const [recentUsers, setRecentUsers] = useState<Tables<"users">[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);

      const [statsData, ordersData, usersData] = await Promise.all([
        getAdminDashboardStats(),
        getAdminRecentOrders(5),
        getAdminRecentUsers(5),
      ]);

      setStats(statsData);
      setRecentOrders(ordersData);
      setRecentUsers(usersData);
    } catch (err: unknown) {
      logger.error("대시보드 데이터 로드 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "대시보드 데이터를 불러오는데 실패했습니다",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="대시보드를 불러오는 중..." />;
  }

  if (error) {
    return <ErrorState message={error} retry={loadDashboardData} />;
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "결제완료";
      case "in_progress":
        return "진행중";
      case "delivered":
        return "완료 대기";
      case "completed":
        return "완료";
      case "cancelled":
        return "취소/환불";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-red-100 text-red-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "delivered":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-1">
          플랫폼 전체 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/users"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-brand-primary transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 회원</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">오늘 매출</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.todayRevenue.toLocaleString()}원
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaWonSign className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <Link
          href="/admin/orders"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-brand-primary transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">진행중 주문</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.inProgressOrders}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaShoppingCart className="text-purple-600 text-xl" />
            </div>
          </div>
        </Link>

        <Link
          href="/admin/reports"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-brand-primary transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">대기중 신고</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.pendingReports}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FaFlag className="text-red-600 text-xl" />
            </div>
          </div>
        </Link>
      </div>

      {/* 이번달 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            이번달 매출
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.monthlyRevenue.toLocaleString()}원
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            이번달 주문
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.monthlyOrderCount.toLocaleString()}건
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">총 서비스</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.totalServices.toLocaleString()}개
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 주문 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">최근 주문</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-brand-primary hover:underline"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-brand-primary transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {order.service?.title || order.title}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status || "")}`}
                    >
                      {getStatusLabel(order.status || "")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {order.buyer?.name || "Unknown"} →{" "}
                      {order.seller?.name || "Unknown"}
                    </span>
                    <span className="font-medium">
                      {(order.total_amount ?? 0).toLocaleString()}원
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                최근 주문이 없습니다
              </p>
            )}
          </div>
        </div>

        {/* 최근 가입 회원 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">최근 가입 회원</h2>
            <Link
              href="/admin/users"
              className="text-sm text-brand-primary hover:underline"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-brand-primary transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("ko-KR")
                        : ""}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                최근 가입 회원이 없습니다
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
