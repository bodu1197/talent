import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditServiceClient from './EditServiceClient'

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!seller) {
    redirect('/mypage/seller/register')
  }

  // 서비스 정보 조회
  const { data: service, error } = await supabase
    .from('services')
    .select(`
      *,
      service_categories(category_id)
    `)
    .eq('id', id)
    .eq('seller_id', seller.id)
    .single()

  if (error || !service) {
    notFound()
  }

  // 서비스의 카테고리 계층 정보 조회
  let categoryHierarchy = null
  if (service.service_categories && service.service_categories.length > 0) {
    const categoryId = service.service_categories[0].category_id

    // 현재 카테고리 정보 조회
    const { data: currentCategory } = await supabase
      .from('categories')
      .select('id, name, level, parent_id')
      .eq('id', categoryId)
      .single()

    if (currentCategory) {
      categoryHierarchy = {
        level3: currentCategory.level === 3 ? currentCategory.id : null,
        level2: null,
        level1: null
      }

      // level 2 찾기
      if (currentCategory.level === 3 && currentCategory.parent_id) {
        const { data: level2Cat } = await supabase
          .from('categories')
          .select('id, parent_id')
          .eq('id', currentCategory.parent_id)
          .single()

        if (level2Cat) {
          categoryHierarchy.level2 = level2Cat.id

          // level 1 찾기
          if (level2Cat.parent_id) {
            categoryHierarchy.level1 = level2Cat.parent_id
          }
        }
      } else if (currentCategory.level === 2 && currentCategory.parent_id) {
        categoryHierarchy.level2 = currentCategory.id
        categoryHierarchy.level1 = currentCategory.parent_id
      } else if (currentCategory.level === 1) {
        categoryHierarchy.level1 = currentCategory.id
      }
    }
  }

  // 카테고리 조회
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('level', { ascending: true })
    .order('display_order', { ascending: true })

  return <EditServiceClient
    service={service}
    sellerId={seller.id}
    categories={categories || []}
    categoryHierarchy={categoryHierarchy}
  />
}
