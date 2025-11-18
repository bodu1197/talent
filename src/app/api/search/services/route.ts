import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

// 동적 라우트 (쿼리 파라미터 사용)
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ services: [] });
    }

    const supabase = await createClient();
    const searchTerm = `%${query.trim()}%`;

    // 서비스 검색: title, search_keywords에서 검색
    const { data: services, error } = await supabase
      .from("services")
      .select(
        `
        *,
        seller:sellers!inner(
          id,
          business_name,
          display_name,
          is_verified
        ),
        service_categories(
          category:categories(id, name, slug)
        )
      `,
      )
      .eq("status", "active")
      .or(`title.ilike.${searchTerm},search_keywords.ilike.${searchTerm}`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      logger.error("Search error:", error);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    // 데이터 매핑
    if (services && services.length > 0) {
      services.forEach((service) => {
        service.price_min = service.price || 0;
        service.price_max = service.price || undefined;
        service.order_count = service.orders_count || 0;
      });
    }

    const response = NextResponse.json({ services: services || [] });
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=60",
    );
    return response;
  } catch (error) {
    logger.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
