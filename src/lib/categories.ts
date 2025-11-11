import { createClient } from '@/lib/supabase/server'
import { createClient as createClientDirect } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { unstable_cache } from 'next/cache'

export interface CategoryItem {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
  parent_id?: string
  level: number
  service_count?: number
  is_ai?: boolean
  is_active?: boolean
  children?: CategoryItem[]
}

/**
 * 데이터베이스에서 모든 카테고리를 가져와서 트리 구조로 변환
 */
async function buildCategoryTree(): Promise<CategoryItem[]> {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description, parent_id, level, service_count, is_ai, is_active, display_order')
    .eq('is_active', true)
    .order('display_order')

  if (error || !categories) {
    logger.error('Failed to fetch categories:', error)
    return []
  }

  // 트리 구조로 변환
  const categoryMap = new Map<string, CategoryItem>()
  const rootCategories: CategoryItem[] = []

  // 1. 모든 카테고리를 맵에 저장
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] })
  })

  // 2. 부모-자식 관계 설정
  categories.forEach(cat => {
    const category = categoryMap.get(cat.id)!

    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      // 부모가 있으면 부모의 children에 추가
      const parent = categoryMap.get(cat.parent_id)!
      if (!parent.children) parent.children = []
      parent.children.push(category)
    } else if (!cat.parent_id) {
      // 부모가 없으면 루트 카테고리
      rootCategories.push(category)
    }
  })

  return rootCategories
}

/**
 * 캐싱된 카테고리 트리 (5분 캐시)
 */
export const getCachedCategoriesTree = unstable_cache(
  async () => buildCategoryTree(),
  ['categories-tree'],
  { revalidate: 300 }
)

/**
 * 호환성을 위한 별칭
 */
export async function getAllCategoriesTree(): Promise<CategoryItem[]> {
  return getCachedCategoriesTree()
}

/**
 * 1단계 카테고리만 가져오기 (메인 페이지용)
 */
export async function getTopLevelCategories(): Promise<CategoryItem[]> {
  const allCategories = await getAllCategoriesTree()
  return allCategories
}

/**
 * 특정 slug의 카테고리와 그 하위 카테고리 가져오기
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryItem | null> {
  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description, parent_id, level, service_count, is_ai, is_active, display_order')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !category) {
    return null
  }

  // 하위 카테고리 가져오기
  const { data: children } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description, parent_id, level, service_count, is_ai, is_active, display_order')
    .eq('parent_id', category.id)
    .eq('is_active', true)
    .order('display_order')

  return {
    ...category,
    children: children || []
  }
}

/**
 * 카테고리 경로 가져오기 (breadcrumb용) - 최적화: 재귀 CTE로 한 번에 조회
 */
export async function getCategoryPath(categoryId: string): Promise<CategoryItem[]> {
  const supabase = await createClient()

  // PostgreSQL 재귀 CTE로 모든 부모 카테고리를 한 번에 조회
  const { data, error } = await supabase.rpc('get_category_path', {
    p_category_id: categoryId
  })

  if (error) {
    logger.error('Failed to fetch category path:', error)

    // Fallback: RPC 함수 없으면 기존 방식 사용
    const path: CategoryItem[] = []
    let currentId: string | null | undefined = categoryId

    while (currentId) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name, slug, icon, description, parent_id, level, service_count, is_ai, is_active')
        .eq('id', currentId)
        .single()

      if (!catData) break

      const category: CategoryItem = catData
      path.unshift(category)
      currentId = category.parent_id
    }

    return path
  }

  return (data || []) as CategoryItem[]
}

/**
 * Build-time only: Get all categories for static params generation
 * Uses direct Supabase client without cookies
 */
export async function getAllCategoriesForBuild(): Promise<CategoryItem[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    logger.error('Missing Supabase environment variables')
    return []
  }

  const supabase = createClientDirect(supabaseUrl, supabaseKey)

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description, parent_id, level, service_count, is_ai, is_active, display_order')
    .eq('is_active', true)
    .order('display_order')

  if (error || !categories) {
    logger.error('Failed to fetch categories for build:', error)
    return []
  }

  // Build tree structure
  const categoryMap = new Map<string, CategoryItem>()
  const rootCategories: CategoryItem[] = []

  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] })
  })

  categories.forEach(cat => {
    const category = categoryMap.get(cat.id)!

    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      const parent = categoryMap.get(cat.parent_id)!
      if (!parent.children) parent.children = []
      parent.children.push(category)
    } else if (!cat.parent_id) {
      rootCategories.push(category)
    }
  })

  return rootCategories
}
