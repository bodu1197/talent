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

interface CategoryVisit {
  category_id: string;
  category_name: string;
  category_slug: string;
  visited_at: string;
}

/**
 * Helper: Group category visits and calculate visit counts
 * Reduces cognitive complexity by extracting grouping logic
 */
function groupCategoryVisits(visits: CategoryVisit[], limit: number): RecentCategory[] {
  const categoryMap = new Map<string, RecentCategory>();

  for (const visit of visits) {
    const existing = categoryMap.get(visit.category_id);

    if (existing) {
      existing.visit_count += 1;
      updateLastVisited(existing, visit.visited_at);
    } else {
      categoryMap.set(visit.category_id, {
        category_id: visit.category_id,
        category_name: visit.category_name,
        category_slug: visit.category_slug,
        last_visited: visit.visited_at,
        visit_count: 1,
      });
    }
  }

  return sortAndLimitCategories(categoryMap, limit);
}

/**
 * Helper: Update last_visited if newer
 */
function updateLastVisited(category: RecentCategory, visitedAt: string): void {
  if (new Date(visitedAt) > new Date(category.last_visited)) {
    category.last_visited = visitedAt;
  }
}

/**
 * Helper: Sort categories by last_visited and limit results
 */
function sortAndLimitCategories(
  categoryMap: Map<string, RecentCategory>,
  limit: number
): RecentCategory[] {
  return Array.from(categoryMap.values())
    .sort((a, b) => new Date(b.last_visited).getTime() - new Date(a.last_visited).getTime())
    .slice(0, limit);
}

/**
 * Helper: Calculate date N days ago
 */
function getDateDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
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

  // RPC 함수 사용 (최적화된 쿼리)
  const { data: rawData, error: rawError } = await supabase.rpc('get_recent_category_visits', {
    p_user_id: user.id,
    p_days: 30,
    p_limit: limit,
  });

  // RPC 성공 시 바로 반환
  if (!rawError && rawData) {
    return rawData;
  }

  // RPC가 없으면 일반 쿼리로 폴백
  logger.warn('RPC function not available, falling back to manual query', { error: rawError });
  return fetchAndGroupCategoryVisits(supabase, user.id, limit);
}

/**
 * Helper: Fetch category visits and group them
 */
async function fetchAndGroupCategoryVisits(
  supabase: Awaited<ReturnType<typeof createServerClient>> | ReturnType<typeof createClient>,
  userId: string,
  limit: number
): Promise<RecentCategory[]> {
  const thirtyDaysAgo = getDateDaysAgo(30);

  const { data, error } = await supabase
    .from('category_visits')
    .select('category_id, category_name, category_slug, visited_at')
    .eq('user_id', userId)
    .gte('visited_at', thirtyDaysAgo.toISOString())
    .order('visited_at', { ascending: false });

  if (error) {
    logger.error('Failed to fetch recent categories:', error);
    return [];
  }

  if (!data || data.length === 0) return [];

  return groupCategoryVisits(data, limit);
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

  return fetchAndGroupCategoryVisits(supabase, user.id, limit);
}
