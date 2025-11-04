import { createClient } from '@/lib/supabase/server'
import { createClient as createClientDirect } from '@supabase/supabase-js'

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
export async function getAllCategoriesTree(): Promise<CategoryItem[]> {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description, parent_id, level, service_count, is_ai, is_active')
    .eq('is_active', true)
    .order('name')

  if (error || !categories) {
    console.error('Failed to fetch categories:', error)
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
    .select('id, name, slug, icon, description, parent_id, level, service_count, is_ai, is_active')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !category) {
    return null
  }

  // 하위 카테고리 가져오기
  const { data: children } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description, parent_id, level, service_count, is_ai, is_active')
    .eq('parent_id', category.id)
    .eq('is_active', true)
    .order('name')

  return {
    ...category,
    children: children || []
  }
}

/**
 * 카테고리 경로 가져오기 (breadcrumb용)
 */
export async function getCategoryPath(categoryId: string): Promise<CategoryItem[]> {
  const supabase = await createClient()
  const path: CategoryItem[] = []
  let currentId: string | null | undefined = categoryId

  while (currentId) {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, icon, description, parent_id, level, service_count, is_ai, is_active')
      .eq('id', currentId)
      .single()

    if (!data) break

    const category: CategoryItem = data
    path.unshift(category)
    currentId = category.parent_id
  }

  return path
}

/**
 * Build-time only: Get all categories for static params generation
 * Uses direct Supabase client without cookies
 */
export async function getAllCategoriesForBuild(): Promise<CategoryItem[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables')
    return []
  }

  const supabase = createClientDirect(supabaseUrl, supabaseKey)

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description, parent_id, level, service_count, is_ai, is_active')
    .eq('is_active', true)
    .order('name')

  if (error || !categories) {
    console.error('Failed to fetch categories for build:', error)
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
