import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface CategoryVisit {
  category_name: string;
  category_slug: string;
  category_id: string;
}

interface CategoryLookup {
  slug: string;
  found: boolean;
  uuid?: string;
  error: unknown;
}

interface ServiceLink {
  category: string;
  uuid: string;
  linksCount: number;
  error: unknown;
}

interface ServiceDebug {
  category: string;
  serviceIds: number;
  servicesFound: number;
  error: unknown;
  services?: Array<{ id: string; title: string }>;
}

interface DebugInfo {
  step1_rpc: {
    count: number;
    error: unknown;
    categories?: Array<{
      name: string;
      slug: string;
      id: string;
    }>;
  };
  step2_category_lookup: CategoryLookup[];
  step3_service_links: ServiceLink[];
  step4_services: ServiceDebug[];
  final: {
    categoriesWithServices: number;
    categoriesFiltered: number;
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // 1. RPC로 방문한 카테고리 조회
    const { data: topCategories, error: rpcError } = await supabase.rpc(
      'get_recent_category_visits',
      {
        p_user_id: user.id,
        p_days: 30,
        p_limit: 10,
      }
    );

    const debugInfo: DebugInfo = {
      step1_rpc: {
        count: topCategories?.length || 0,
        error: rpcError,
        categories: (topCategories as CategoryVisit[] | null)?.map((c) => ({
          name: c.category_name,
          slug: c.category_slug,
          id: c.category_id,
        })),
      },
      step2_category_lookup: [],
      step3_service_links: [],
      step4_services: [],
      final: {
        categoriesWithServices: 0,
        categoriesFiltered: 0,
      },
    };

    if (!topCategories || topCategories.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No visited categories',
        debug: debugInfo,
      });
    }

    // 2. 각 카테고리별로 처리
    for (const category of topCategories.slice(0, 3)) {
      // 처음 3개만 테스트
      // 카테고리 UUID 조회
      const { data: categoryInfo, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category.category_slug)
        .single();

      debugInfo.step2_category_lookup.push({
        slug: category.category_slug,
        found: !!categoryInfo,
        uuid: categoryInfo?.id,
        error: catError,
      });

      if (!categoryInfo) continue;

      // service_categories 링크 조회
      const { data: links, error: linkError } = await supabase
        .from('service_categories')
        .select('service_id')
        .eq('category_id', categoryInfo.id);

      debugInfo.step3_service_links.push({
        category: category.category_name,
        uuid: categoryInfo.id,
        linksCount: links?.length || 0,
        error: linkError,
      });

      if (!links || links.length === 0) continue;

      const serviceIds = links.map((l) => l.service_id);

      // 서비스 조회
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, title, status')
        .in('id', serviceIds)
        .eq('status', 'active');

      debugInfo.step4_services.push({
        category: category.category_name,
        serviceIds: serviceIds.length,
        servicesFound: services?.length || 0,
        error: servicesError,
        services: services?.slice(0, 3).map((s) => ({ id: s.id, title: s.title })),
      });
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
