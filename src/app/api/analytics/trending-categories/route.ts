import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { CATEGORIES } from '@/lib/constants';
import { logger } from '@/lib/logger';

// 1차 카테고리 목록 추출
const PRIMARY_CATEGORIES = CATEGORIES.filter((cat) => !cat.parent_id).map((cat) => ({
  id: cat.id,
  name: cat.name,
  slug: cat.slug,
  icon: cat.icon || '📂',
  children: cat.children?.map((child) => child.slug) || [],
}));

// 캐시 시간 (초)
export const revalidate = 60; // 1분마다 갱신

export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    // 최근 7일간의 카테고리 페이지 조회수 가져오기
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: pageViews, error } = await supabase
      .from('page_views')
      .select('path')
      .like('path', '/categories/%')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) {
      logger.error('Failed to fetch trending categories:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // 1차 카테고리별 클릭수 집계
    const categoryClicks: Record<string, number> = {};

    // 초기화
    for (const cat of PRIMARY_CATEGORIES) {
      categoryClicks[cat.id] = 0;
    }

    // 경로에서 카테고리 slug 추출하고 집계
    for (const view of pageViews || []) {
      const pathParts = view.path.split('/');
      const categorySlug = pathParts[2]; // /categories/{slug}

      if (!categorySlug) continue;

      // 해당 slug가 어떤 1차 카테고리에 속하는지 확인
      for (const primaryCat of PRIMARY_CATEGORIES) {
        // 1차 카테고리 직접 매칭
        if (primaryCat.slug === categorySlug) {
          categoryClicks[primaryCat.id]++;
          break;
        }
        // 2차/3차 카테고리가 1차 카테고리에 속하는지 확인
        if (primaryCat.children.includes(categorySlug)) {
          categoryClicks[primaryCat.id]++;
          break;
        }
      }
    }

    // 결과 정리 (클릭수 포함)
    const result = PRIMARY_CATEGORIES.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
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
