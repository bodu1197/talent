import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PendingServiceDetailClient from './PendingServiceDetailClient'

export default async function PendingServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 관리자 확인
  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!admin) {
    redirect('/')
  }

  try {
    // 서비스 정보 조회 (pending 또는 suspended 상태)
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .in('status', ['pending', 'suspended'])
      .single()

    if (serviceError || !service) {
      throw new Error('서비스를 찾을 수 없습니다.')
    }

    // 카테고리 조회
    const { data: serviceCategories } = await supabase
      .from('service_categories')
      .select('category:categories(id, name)')
      .eq('service_id', id)

    // 판매자 정보
    const { data: seller } = await supabase
      .from('sellers')
      .select('id, business_name, user_id')
      .eq('id', service.seller_id)
      .single()

    // seller user 정보
    let sellerWithUser: any = seller
    if (seller?.user_id) {
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', seller.user_id)
        .single()

      if (userData) {
        sellerWithUser = { ...seller, user: userData }
      }
    }

    const serviceDetail = {
      ...service,
      service_categories: serviceCategories,
      seller: sellerWithUser
    }

    return <PendingServiceDetailClient service={serviceDetail} />
  } catch (error: any) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-4">오류가 발생했습니다</h2>
          <p className="text-red-700">{error?.message || '서비스를 불러올 수 없습니다'}</p>
        </div>
      </div>
    )
  }
}
