import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// 캐시 시간 (초)
export const revalidate = 60; // 1분마다 갱신

export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    // 1. 데이터베이스에서 1차 카테고리 가져오기 (parent_id가 null인 것)
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

    // 2. 모든 카테고리 가져오기 (2차, 3차 포함) - 부모 ID 매핑용
    const { data: allCategories, error: allCatError } = await supabase
      .from('categories')
      .select('id, slug, parent_id')
      .eq('is_active', true);

    if (allCatError) {
      logger.error('Failed to fetch all categories:', allCatError);
    }

    // 3. 카테고리 slug -> 1차 카테고리 ID 매핑 생성
    const slugToRootId = new Map<string, string>();
    const idToParentId = new Map<string, string | null>();

    // 모든 카테고리의 부모 관계 저장
    for (const cat of allCategories || []) {
      idToParentId.set(cat.id, cat.parent_id);
      slugToRootId.set(cat.slug, cat.id);
    }

    // 각 slug가 어느 1차 카테고리에 속하는지 찾기
    function findRootCategoryId(slug: string): string | null {
      let currentId = slugToRootId.get(slug);
      if (!currentId) return null;

      // 부모를 따라가면서 루트(1차) 카테고리 찾기
      while (true) {
        const parentId = idToParentId.get(currentId);
        if (!parentId) {
          // 부모가 없으면 이게 1차 카테고리
          return currentId;
        }
        currentId = parentId;
      }
    }

    // 4. 최근 7일간의 카테고리 페이지 조회수 가져오기
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: pageViews, error: viewError } = await supabase
      .from('page_views')
      .select('path')
      .like('path', '/categories/%')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (viewError) {
      logger.error('Failed to fetch page views:', viewError);
    }

    // 5. 1차 카테고리별 클릭수 집계
    const categoryClicks: Record<string, number> = {};

    // 초기화
    for (const cat of primaryCategories) {
      categoryClicks[cat.id] = 0;
    }

    // 경로에서 카테고리 slug 추출하고 집계
    for (const view of pageViews || []) {
      const pathParts = view.path.split('/');
      const categorySlug = pathParts[2]; // /categories/{slug}

      if (!categorySlug) continue;

      // 해당 slug가 어떤 1차 카테고리에 속하는지 확인
      const rootCategoryId = findRootCategoryId(categorySlug);
      if (rootCategoryId && categoryClicks[rootCategoryId] !== undefined) {
        categoryClicks[rootCategoryId]++;
      }
    }

    // 6. 결과 정리 (클릭수 포함)
    const result = primaryCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || '📂',
      clicks: categoryClicks[cat.id] || 0,
    }));

    // 클릭수 기준 내림차순 정렬
    result.sort((a, b) => b.clicks - a.clicks);

    // 최대 클릭수 계산 (그래프 비율 계산용)
    const maxClicks = Math.max(...result.map((r) => r.clicks), 1);

    // 비율 추가
    const resultWithRatio = result.map((item) => ({
      ...item,
      ratio: Math.round((item.clicks / maxClicks) * 100),
    }));

    return NextResponse.json({
      categories: resultWithRatio,
      totalClicks: pageViews?.length || 0,
      period: '7d',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Trending categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
