"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { logger } from "@/lib/logger";

const AdminSidebar = dynamic(() => import("@/components/admin/Sidebar"), {
  ssr: false,
});
const AdminHeader = dynamic(() => import("@/components/admin/Header"), {
  ssr: false,
});
const MobileBottomNav = dynamic(
  () => import("@/components/layout/MobileBottomNav"),
  { ssr: false },
);

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, [user, loading]);

  async function checkAdminAccess() {
    if (loading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("admins")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .single();

      if (error || !data) {
        logger.error("관리자 권한 확인 실패:", error);
        router.push("/");
        return;
      }

      setIsAdmin(true);
    } catch (err) {
      logger.error("관리자 확인 중 오류:", err);
      router.push("/");
    } finally {
      setChecking(false);
    }
  }

  if (loading || checking) {
    return <LoadingSpinner message="권한을 확인하는 중..." />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-50 flex pb-16 lg:pb-0">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </>
  );
}
