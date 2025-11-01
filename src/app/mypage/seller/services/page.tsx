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

  const statusFilter = (searchParams.status as ServiceStatus) || 'all'

  const [services, activeCount, inactiveCount, pendingCount] = await Promise.all([
    getSellerServices(seller.id, statusFilter === 'all' ? undefined : statusFilter),
    getSellerServicesCount(seller.id, 'active'),
    getSellerServicesCount(seller.id, 'inactive'),
    getSellerServicesCount(seller.id, 'pending')
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
}
