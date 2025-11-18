import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SellerServicesClient from "./SellerServicesClient";
import { logger } from "@/lib/logger";

type ServiceStatus = "all" | "active" | "inactive" | "pending";

// 인증이 필요한 페이지이므로 동적 렌더링 강제
export const dynamic = "force-dynamic";

export default async function SellerServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/auth/login");
    }

    const { data: seller, error: sellerError } = await supabase
      .from("sellers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (sellerError) {
      logger.error("Seller 조회 오류:", sellerError);
      throw new Error(`Seller 조회 실패: ${sellerError.message}`);
    }

    if (!seller) {
      redirect("/mypage/seller/register");
    }

    const params = await searchParams;
    const statusFilter = (params.status as ServiceStatus) || "all";

    // 서버 컴포넌트에서 직접 조회
    let servicesQuery = supabase
      .from("services")
      .select(
        `
        *,
        service_categories(
          category:categories(id, name)
        )
      `,
      )
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      servicesQuery = servicesQuery.eq("status", statusFilter);
    }

    const { data: services, error: servicesError } = await servicesQuery;

    if (servicesError) {
      logger.error("서비스 목록 조회 오류:", servicesError);
      throw servicesError;
    }

    // 각 서비스의 pending/rejected revision 조회
    if (services && services.length > 0) {
      const serviceIds = services.map((s) => s.id);

      // pending revision 조회
      const { data: pendingRevisions } = await supabase
        .from("service_revisions")
        .select("service_id, id, status")
        .in("service_id", serviceIds)
        .eq("status", "pending");

      // rejected revision 조회 (최신 것만)
      const { data: rejectedRevisions } = await supabase
        .from("service_revisions")
        .select("service_id, id, status, admin_note, reviewed_at")
        .in("service_id", serviceIds)
        .eq("status", "rejected")
        .order("reviewed_at", { ascending: false });

      // 서비스에 revision 정보 추가
      services.forEach((service: Record<string, unknown>) => {
        const pendingRevision = pendingRevisions?.find(
          (r) => r.service_id === service.id,
        );
        service.hasPendingRevision = !!pendingRevision;

        // 해당 서비스의 최신 rejected revision
        const rejectedRevision = rejectedRevisions?.find(
          (r) => r.service_id === service.id,
        );
        if (rejectedRevision) {
          service.rejectedRevision = rejectedRevision;
        }
      });
    }

    // Count 조회
    const [
      { count: activeCount },
      { count: inactiveCount },
      { count: pendingCount },
    ] = await Promise.all([
      supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", seller.id)
        .eq("status", "active"),
      supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", seller.id)
        .eq("status", "inactive"),
      supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", seller.id)
        .eq("status", "pending"),
    ]);

    const statusCounts = {
      all: (activeCount || 0) + (inactiveCount || 0) + (pendingCount || 0),
      active: activeCount || 0,
      inactive: inactiveCount || 0,
      pending: pendingCount || 0,
    };

    return (
      <SellerServicesClient
        initialServices={services}
        statusFilter={statusFilter}
        statusCounts={statusCounts}
      />
    );
  } catch (error: unknown) {
    logger.error("SellerServicesPage 전체 오류:", error);
    logger.error("오류 상세:", JSON.stringify(error, null, 2));

    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-4">
            오류가 발생했습니다
          </h2>
          <p className="text-red-700 mb-4">
            {error instanceof Error
              ? error.message
              : "서비스 목록을 불러올 수 없습니다"}
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer text-red-600 font-medium">
              오류 상세 정보
            </summary>
            <pre className="mt-2 p-4 bg-red-100 rounded text-xs overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
