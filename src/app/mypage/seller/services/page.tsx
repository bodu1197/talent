import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerServices, getSellerServicesCount } from '@/lib/supabase/queries/services'
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

    const [services, activeCount, inactiveCount, pendingCount] = await Promise.all([
      getSellerServices(seller.id, statusFilter === 'all' ? undefined : statusFilter).catch(err => {
        console.error('서비스 목록 조회 오류:', err)
        console.error('오류 상세:', JSON.stringify(err, null, 2))
        throw err
      }),
      getSellerServicesCount(seller.id, 'active').catch(err => {
        console.error('Active count 오류:', err)
        return 0
      }),
      getSellerServicesCount(seller.id, 'inactive').catch(err => {
        console.error('Inactive count 오류:', err)
        return 0
      }),
      getSellerServicesCount(seller.id, 'pending').catch(err => {
        console.error('Pending count 오류:', err)
        return 0
      })
    ])

    const statusCounts = {
      all: activeCount + inactiveCount + pendingCount,
      active: activeCount,
      inactive: inactiveCount,
      pending: pendingCount
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
