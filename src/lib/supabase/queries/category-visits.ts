import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export interface RecentCategory {
  category_id: string;
  category_name: string;
  category_slug: string;
  last_visited: string;
  visit_count: number;
}

/**
 * 최근 30일 내 방문한 카테고리 조회 (최대 10개) - 서버용
 * 로그인 사용자만 가능
 */
export async function getRecentVisitedCategoriesServer(
  limit: number = 10
): Promise<RecentCategory[]> {
  const supabase = await createServerClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 30일 전 날짜
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // RPC 함수 사용 (최적화된 쿼리)
  const { data: rawData, error: rawError } = await supabase.rpc('get_recent_category_visits', {
    p_user_id: user.id,
    p_days: 30,
    p_limit: limit,
  });

  // RPC가 없으면 일반 쿼리로 폴백
  if (rawError || !rawData) {
    logger.warn('RPC function not available, falling back to manual query', { error: rawError });
    const { data, error } = await supabase
      .from('category_visits')
      .select('category_id, category_name, category_slug, visited_at')
      .eq('user_id', user.id)
      .gte('visited_at', thirtyDaysAgo.toISOString())
      .order('visited_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch recent categories:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // 카테고리별로 그룹화하고 방문 횟수 계산
    const categoryMap = new Map<string, RecentCategory>();

    for (const visit of data) {
      const existing = categoryMap.get(visit.category_id);

      if (existing) {
        // 이미 있으면 방문 횟수 증가, 최신 방문 시간 업데이트
        existing.visit_count += 1;
        if (new Date(visit.visited_at) > new Date(existing.last_visited)) {
          existing.last_visited = visit.visited_at;
        }
      } else {
        // 처음이면 추가
        categoryMap.set(visit.category_id, {
          category_id: visit.category_id,
          category_name: visit.category_name,
          category_slug: visit.category_slug,
          last_visited: visit.visited_at,
          visit_count: 1,
        });
      }
    }

    // Map을 배열로 변환하고 최신 방문 순으로 정렬
    const categories = Array.from(categoryMap.values())
      .sort((a, b) => new Date(b.last_visited).getTime() - new Date(a.last_visited).getTime())
      .slice(0, limit);

    return categories;
  }

  return rawData;
}

/**
 * 최근 30일 내 방문한 카테고리 조회 (최대 10개) - 클라이언트용
 * 로그인 사용자만 가능
 */
export async function getRecentVisitedCategories(limit: number = 10): Promise<RecentCategory[]> {
  const supabase = createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 30일 전 날짜
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 최근 방문 기록 조회
  const { data, error } = await supabase
    .from('category_visits')
    .select('category_id, category_name, category_slug, visited_at')
    .eq('user_id', user.id)
    .gte('visited_at', thirtyDaysAgo.toISOString())
    .order('visited_at', { ascending: false });

  if (error) {
    logger.error('Failed to fetch recent categories:', error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // 카테고리별로 그룹화하고 방문 횟수 계산
  const categoryMap = new Map<string, RecentCategory>();

  for (const visit of data) {
    const existing = categoryMap.get(visit.category_id);

    if (existing) {
      // 이미 있으면 방문 횟수 증가, 최신 방문 시간 업데이트
      existing.visit_count += 1;
      if (new Date(visit.visited_at) > new Date(existing.last_visited)) {
        existing.last_visited = visit.visited_at;
      }
    } else {
      // 처음이면 추가
      categoryMap.set(visit.category_id, {
        category_id: visit.category_id,
        category_name: visit.category_name,
        category_slug: visit.category_slug,
        last_visited: visit.visited_at,
        visit_count: 1,
      });
    }
  }

  // Map을 배열로 변환하고 최신 방문 순으로 정렬
  const categories = Array.from(categoryMap.values())
    .sort((a, b) => new Date(b.last_visited).getTime() - new Date(a.last_visited).getTime())
    .slice(0, limit);

  return categories;
}
