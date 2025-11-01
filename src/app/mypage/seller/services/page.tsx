import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SellerServicesClient from './SellerServicesClient'

type ServiceStatus = 'all' | 'active' | 'inactive' | 'pending'

export default async function SellerServicesPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/auth/login')
    }

    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (sellerError) {
      console.error('Seller 조회 오류:', sellerError)
      throw new Error(`Seller 조회 실패: ${sellerError.message}`)
    }

    if (!seller) {
      redirect('/mypage/seller/register')
    }

    const statusFilter = (searchParams.status as ServiceStatus) || 'all'

    // 서버 컴포넌트에서 직접 조회
    let servicesQuery = supabase
      .from('services')
      .select(`
        *,
        service_categories(
          category:categories(id, name)
        )
      `)
      .eq('seller_id', seller.id)
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      servicesQuery = servicesQuery.eq('status', statusFilter)
    }

    const { data: services, error: servicesError } = await servicesQuery

    if (servicesError) {
      console.error('서비스 목록 조회 오류:', servicesError)
      throw servicesError
    }

    // Count 조회
    const [
      { count: activeCount },
      { count: inactiveCount },
      { count: pendingCount }
    ] = await Promise.all([
      supabase.from('services').select('*', { count: 'exact', head: true }).eq('seller_id', seller.id).eq('status', 'active'),
      supabase.from('services').select('*', { count: 'exact', head: true }).eq('seller_id', seller.id).eq('status', 'inactive'),
      supabase.from('services').select('*', { count: 'exact', head: true }).eq('seller_id', seller.id).eq('status', 'pending')
    ])

    const statusCounts = {
      all: (activeCount || 0) + (inactiveCount || 0) + (pendingCount || 0),
      active: activeCount || 0,
      inactive: inactiveCount || 0,
      pending: pendingCount || 0
    }

    return <SellerServicesClient
      initialServices={services}
      statusFilter={statusFilter}
      statusCounts={statusCounts}
    />
  } catch (error: any) {
    console.error('SellerServicesPage 전체 오류:', error)
    console.error('오류 상세:', JSON.stringify(error, null, 2))

    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-4">오류가 발생했습니다</h2>
          <p className="text-red-700 mb-4">{error?.message || '서비스 목록을 불러올 수 없습니다'}</p>
          <details className="mt-4">
            <summary className="cursor-pointer text-red-600 font-medium">오류 상세 정보</summary>
            <pre className="mt-2 p-4 bg-red-100 rounded text-xs overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    )
  }
}
