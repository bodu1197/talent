"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import {
  TrendingUp,
  Users,
  Briefcase,
  Edit,
  ShoppingCart,
  Banknote,
  Wallet,
  Megaphone,
  FileText,
  Star,
  Flag,
  Gavel,
  Folder,
  PieChart,
  History,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";

const menuItems = [
  { name: "대시보드", path: "/admin/dashboard", icon: TrendingUp },
  { name: "사용자 관리", path: "/admin/users", icon: Users },
  {
    name: "서비스 관리",
    path: "/admin/services",
    icon: Briefcase,
    badge: "pendingServices",
  },
  {
    name: "수정 요청 관리",
    path: "/admin/service-revisions",
    icon: Edit,
    badge: "pendingRevisions",
  },
  { name: "주문 관리", path: "/admin/orders", icon: ShoppingCart },
  { name: "정산 관리", path: "/admin/settlements", icon: Banknote },
  {
    name: "출금 관리",
    path: "/admin/withdrawals",
    icon: Wallet,
    badge: "pendingWithdrawals",
  },
  {
    name: "광고 관리",
    path: "/admin/advertising",
    icon: Megaphone,
    badge: "pendingPayments",
  },
  { name: "세금계산서", path: "/admin/tax-invoices", icon: FileText },
  { name: "리뷰 관리", path: "/admin/reviews", icon: Star },
  { name: "신고 관리", path: "/admin/reports", icon: Flag },
  { name: "분쟁 관리", path: "/admin/disputes", icon: Gavel },
  { name: "카테고리 관리", path: "/admin/categories", icon: Folder },
  { name: "통계 분석", path: "/admin/statistics", icon: PieChart },
  { name: "활동 로그", path: "/admin/logs", icon: History },
  { name: "시스템 설정", path: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState({
    pendingServices: 0,
    pendingRevisions: 0,
    pendingWithdrawals: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    loadPendingCounts();

    // Refresh counts every 30 seconds
    const interval = setInterval(loadPendingCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadPendingCounts() {
    try {
      const supabase = createClient();

      // Count pending services
      const { count: servicesCount } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Count pending revisions
      const { count: revisionsCount } = await supabase
        .from("service_revisions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Count pending withdrawals
      const { count: withdrawalsCount } = await supabase
        .from("withdrawal_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Count pending advertising payments (bank_transfer)
      const { count: paymentsCount } = await supabase
        .from("advertising_payments")
        .select("*", { count: "exact", head: true })
        .eq("payment_method", "bank_transfer")
        .eq("status", "pending");

      setBadgeCounts({
        pendingServices: servicesCount || 0,
        pendingRevisions: revisionsCount || 0,
        pendingWithdrawals: withdrawalsCount || 0,
        pendingPayments: paymentsCount || 0,
      });
    } catch (error) {
      logger.error("Failed to load pending counts:", error);
    }
  }

  return (
    <aside
      className={`flex-shrink-0 h-full bg-brand-primary text-white transition-all duration-300 flex flex-col ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="font-bold text-lg">Admin</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-white/10 rounded transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 min-h-0">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.path || pathname.startsWith(item.path + "/");
          const badgeCount = item.badge
            ? badgeCounts[item.badge as keyof typeof badgeCounts]
            : 0;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors ${
                isActive ? "bg-white/20 border-r-4 border-white" : ""
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={collapsed ? "text-lg" : "w-5"} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {badgeCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </>
              )}
              {collapsed && badgeCount > 0 && (
                <span className="absolute right-1 top-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-white/10 p-4">
        {!collapsed && (
          <Link
            href="/"
            className="flex items-center gap-2 p-2 hover:bg-white/10 rounded transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">사이트로 이동</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
