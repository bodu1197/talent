import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// 동적 라우트로 설정 (request.url 사용)
export const dynamic = 'force-dynamic';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface CategoryMapping {
  id: string;
  slug: string;
  parent_id: string | null;
}

// 카테고리 매핑 생성 함수
function buildCategoryMappings(allCategories: CategoryMapping[]) {
  const slugToRootId = new Map<string, string>();
  const idToParentId = new Map<string, string | null>();

  for (const cat of allCategories) {
    idToParentId.set(cat.id, cat.parent_id);
    slugToRootId.set(cat.slug, cat.id);
  }

  return { slugToRootId, idToParentId };
}

// 루트 카테고리 ID 찾기 함수
function findRootCategoryId(
  slug: string,
  slugToRootId: Map<string, string>,
  idToParentId: Map<string, string | null>
): string | null {
  let currentId = slugToRootId.get(slug);
  if (!currentId) return null;

  while (true) {
    const parentId = idToParentId.get(currentId);
    if (!parentId) {
      return currentId;
    }
    currentId = parentId;
  }
}

// 클릭수 집계 함수
function aggregateClicks(
  pageViews: { path: string }[],
  slugToRootId: Map<string, string>,
  idToParentId: Map<string, string | null>,
  categoryClicks: Record<string, number>
) {
  for (const view of pageViews) {
    const pathParts = view.path.split('/');
    const categorySlug = pathParts[2];

    if (!categorySlug) continue;

    const rootCategoryId = findRootCategoryId(categorySlug, slugToRootId, idToParentId);
    if (rootCategoryId && categoryClicks[rootCategoryId] !== undefined) {
      categoryClicks[rootCategoryId]++;
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit')
      ? Number.parseInt(searchParams.get('limit')!, 10)
      : undefined;
    const offset = searchParams.get('offset')
      ? Number.parseInt(searchParams.get('offset')!, 10)
      : 0;

    const supabase = createServiceRoleClient();

    // 1. 1차 카테고리 가져오기
    const { data: primaryCategories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug, icon')
      .is('parent_id', null)
      .eq('is_active', true)
      .order('display_order');

    if (catError || !primaryCategories) {
      logger.error('Failed to fetch categories:', catError);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    // 2. 모든 카테고리 가져오기 (부모 ID 매핑용)
    const { data: allCategories, error: allCatError } = await supabase
      .from('categories')
      .select('id, slug, parent_id')
      .eq('is_active', true);

    if (allCatError) {
      logger.error('Failed to fetch all categories:', allCatError);
    }

    // 3. 카테고리 매핑 생성
    const { slugToRootId, idToParentId } = buildCategoryMappings(allCategories || []);

    // 4. 최근 24시간 조회수 가져오기
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const { data: pageViews, error: viewError } = await supabase
      .from('page_views')
      .select('path')
      .like('path', '/categories/%')
      .gte('created_at', oneDayAgo.toISOString());

    if (viewError) {
      logger.error('Failed to fetch page views:', viewError);
    }

    // 5. 클릭수 초기화 및 집계
    const categoryClicks: Record<string, number> = {};
    for (const cat of primaryCategories) {
      categoryClicks[cat.id] = 0;
    }

    aggregateClicks(pageViews || [], slugToRootId, idToParentId, categoryClicks);

    // 6. 결과 정리
    const result = primaryCategories.map((cat: Category) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || '📂',
      clicks: categoryClicks[cat.id] || 0,
    }));

    // 클릭수 기준 정렬
    result.sort((a, b) => b.clicks - a.clicks);

    // 최대 클릭수 계산
    const maxClicks = Math.max(...result.map((r) => r.clicks), 1);

    // 비율 추가
    const resultWithRatio = result.map((item) => ({
      ...item,
      ratio: Math.round((item.clicks / maxClicks) * 100),
    }));

    // limit과 offset 적용
    const totalCount = resultWithRatio.length;
    const slicedResult = limit
      ? resultWithRatio.slice(offset, offset + limit)
      : resultWithRatio.slice(offset);

    return NextResponse.json({
      categories: slicedResult,
      totalCount,
      hasMore: limit ? offset + limit < totalCount : false,
      totalClicks: pageViews?.length || 0,
      period: '24h',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Trending categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
