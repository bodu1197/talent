import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * 카테고리별 서비스 수 조회 API
 * GET /api/categories/service-counts?slugs=life-service,beauty-fashion,...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slugsParam = searchParams.get('slugs');

    if (!slugsParam) {
      return NextResponse.json({ error: 'slugs parameter is required' }, { status: 400 });
    }

    const slugs = slugsParam.split(',').map((s) => s.trim());

    const supabase = await createClient();

    // 1. 카테고리 ID 조회 (slug로)
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, slug')
      .in('slug', slugs);

    if (categoryError) {
      console.error('카테고리 조회 오류:', categoryError);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json({ counts: [] });
    }

    // 2. 각 카테고리별 활성 서비스 수 조회 (하위 카테고리 포함)
    const counts = await Promise.all(
      categories.map(async (category) => {
        // 해당 카테고리와 하위 카테고리 ID 조회
        const { data: subCategories } = await supabase
          .from('categories')
          .select('id')
          .or(`id.eq.${category.id},parent_id.eq.${category.id}`);

        const categoryIds = subCategories?.map((c) => c.id) || [category.id];

        // services 테이블에서 활성 서비스만 카운트 (service_categories와 조인)
        const { count, error: countError } = await supabase
          .from('services')
          .select('id, service_categories!inner(category_id)', { count: 'exact', head: true })
          .eq('status', 'active')
          .in('service_categories.category_id', categoryIds);

        if (countError) {
          console.error(`서비스 수 조회 오류 (${category.slug}):`, countError);
          return { slug: category.slug, count: 0 };
        }

        return { slug: category.slug, count: count || 0 };
      })
    );

    return NextResponse.json({ counts });
  } catch (error) {
    console.error('서비스 수 조회 실패:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
