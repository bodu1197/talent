import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SellerServicesClient from './SellerServicesClient';
import { logger } from '@/lib/logger';
import type { SupabaseClient } from '@supabase/supabase-js';

type ServiceStatus = 'all' | 'active' | 'inactive' | 'pending';

interface RevisionData {
  service_id: string;
  id: string;
  status: string;
  admin_note?: string;
  reviewed_at?: string;
}

// Helper: 서비스에 revision 및 주문 정보 추가
function enrichServicesWithMetadata(
  services: Record<string, unknown>[],
  pendingRevisions: RevisionData[] | null,
  rejectedRevisions: RevisionData[] | null,
  activeOrders: { service_id: string }[] | null
): void {
  for (const service of services) {
    const pendingRevision = pendingRevisions?.find((r) => r.service_id === service.id);
    service.hasPendingRevision = !!pendingRevision;

    const rejectedRevision = rejectedRevisions?.find((r) => r.service_id === service.id);
    if (rejectedRevision) {
      service.rejectedRevision = rejectedRevision;
    }

    const orderCount = activeOrders?.filter((o) => o.service_id === service.id).length || 0;
    service.activeOrderCount = orderCount;
  }
}

// Helper: 서비스 메타데이터 조회
async function fetchServiceMetadata(supabase: SupabaseClient, serviceIds: string[]) {
  const [{ data: pendingRevisions }, { data: rejectedRevisions }, { data: activeOrders }] =
    await Promise.all([
      supabase
        .from('service_revisions')
        .select('service_id, id, status')
        .in('service_id', serviceIds)
        .eq('status', 'pending'),
      supabase
        .from('service_revisions')
        .select('service_id, id, status, admin_note, reviewed_at')
        .in('service_id', serviceIds)
        .eq('status', 'rejected')
        .order('reviewed_at', { ascending: false }),
      supabase
        .from('orders')
        .select('service_id')
        .in('service_id', serviceIds)
        .in('status', ['pending_payment', 'paid', 'in_progress', 'delivered']),
    ]);
  return { pendingRevisions, rejectedRevisions, activeOrders };
}

// 인증이 필요한 페이지이므로 동적 렌더링 강제
export const dynamic = 'force-dynamic';

export default async function SellerServicesPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ status?: string }>;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/auth/login');
    }

    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (sellerError) {
      logger.error('Seller 조회 오류:', sellerError);
      throw new Error(`Seller 조회 실패: ${sellerError.message}`);
    }

    if (!seller) {
      redirect('/mypage/seller/register');
    }

    const params = await searchParams;
    const statusFilter = (params.status as ServiceStatus) || 'all';

    // 서버 컴포넌트에서 직접 조회
    let servicesQuery = supabase
      .from('services')
      .select(
        `
        *,
        service_categories(
          category:categories(id, name)
        )
      `
      )
      .eq('seller_id', seller.id)
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      servicesQuery = servicesQuery.eq('status', statusFilter);
    }

    const { data: services, error: servicesError } = await servicesQuery;

    if (servicesError) {
      logger.error('서비스 목록 조회 오류:', servicesError);
      throw servicesError;
    }

    // 각 서비스의 pending/rejected revision 및 진행중인 주문 조회
    if (services && services.length > 0) {
      const serviceIds = services.map((s) => s.id);
      const { pendingRevisions, rejectedRevisions, activeOrders } = await fetchServiceMetadata(
        supabase,
        serviceIds
      );
      enrichServicesWithMetadata(
        services as Record<string, unknown>[],
        pendingRevisions,
        rejectedRevisions,
        activeOrders
      );
    }

    // Count 조회
    const [{ count: activeCount }, { count: inactiveCount }, { count: pendingCount }] =
      await Promise.all([
        supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', seller.id)
          .eq('status', 'active'),
        supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', seller.id)
          .eq('status', 'inactive'),
        supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', seller.id)
          .eq('status', 'pending'),
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
    logger.error('SellerServicesPage 전체 오류:', error);
    logger.error('오류 상세:', JSON.stringify(error, null, 2));

    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">오류가 발생했습니다</h2>
          <p className="text-red-700 mb-4">
            {error instanceof Error ? error.message : '서비스 목록을 불러올 수 없습니다'}
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer text-red-600 font-medium">오류 상세 정보</summary>
            <pre className="mt-2 p-4 bg-red-100 rounded text-xs overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
