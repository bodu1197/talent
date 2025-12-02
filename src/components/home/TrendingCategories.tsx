import { createServiceRoleClient } from '@/lib/supabase/server';
import TrendingCategoriesClient from './TrendingCategoriesClient';

// 오프라인 카테고리 slug 목록 (제외할 카테고리)
const OFFLINE_CATEGORY_SLUGS = ['errands', 'life-service', 'event', 'beauty-fashion'];
const DISPLAY_LIMIT = 8;

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

// 서버에서 트렌딩 카테고리 데이터 조회
async function fetchTrendingCategories() {
  try {
    const supabase = createServiceRoleClient();

    // 1. 1차 카테고리 가져오기
    const { data: primaryCategories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug, icon')
      .is('parent_id', null)
      .eq('is_active', true)
      .order('display_order');

    if (catError || !primaryCategories) {
      return [];
    }

    // 2. 모든 카테고리 가져오기 (부모 ID 매핑용)
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, slug, parent_id')
      .eq('is_active', true);

    // 3. 카테고리 매핑 생성
    const { slugToRootId, idToParentId } = buildCategoryMappings(allCategories || []);

    // 4. 최근 24시간 조회수 가져오기
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const { data: pageViews } = await supabase
      .from('page_views')
      .select('path')
      .like('path', '/categories/%')
      .gte('created_at', oneDayAgo.toISOString());

    // 5. 클릭수 초기화 및 집계
    const categoryClicks: Record<string, number> = {};
    for (const cat of primaryCategories) {
      categoryClicks[cat.id] = 0;
    }

    for (const view of pageViews || []) {
      const pathParts = view.path.split('/');
      const categorySlug = pathParts[2];
      if (!categorySlug) continue;

      const rootCategoryId = findRootCategoryId(categorySlug, slugToRootId, idToParentId);
      if (rootCategoryId && categoryClicks[rootCategoryId] !== undefined) {
        categoryClicks[rootCategoryId]++;
      }
    }

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

    // 오프라인 카테고리 제외 및 상위 N개 반환
    return resultWithRatio
      .filter((cat) => !OFFLINE_CATEGORY_SLUGS.includes(cat.slug))
      .slice(0, DISPLAY_LIMIT);
  } catch {
    return [];
  }
}

// 서버 컴포넌트 - 데이터를 SSR 시점에 로드
export default async function TrendingCategories() {
  const categories = await fetchTrendingCategories();

  // 데이터가 없으면 빈 섹션 (CLS 방지를 위해 높이 유지)
  if (categories.length === 0) {
    return (
      <section className="py-6 lg:py-10 bg-gradient-to-b from-orange-50/50 to-white">
        <div className="container-1200 min-h-[200px]"></div>
      </section>
    );
  }

  return <TrendingCategoriesClient categories={categories} />;
}
