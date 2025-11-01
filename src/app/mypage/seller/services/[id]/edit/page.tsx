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
      service_categories(category_id),
      service_packages(*)
    `)
    .eq('id', id)
    .eq('seller_id', seller.id)
    .single()

  if (error || !service) {
    notFound()
  }

  // 카테고리 조회
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('level', { ascending: true })
    .order('display_order', { ascending: true })

  return <EditServiceClient service={service} sellerId={seller.id} categories={categories || []} />
}
