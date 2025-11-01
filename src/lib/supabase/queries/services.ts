import { createClient } from '@/lib/supabase/client'

export async function getSellerServices(userId: string, status?: string) {
  const supabase = createClient()

  let query = supabase
    .from('services')
    .select(`
      *,
      service_categories(
        category:categories(id, name)
      )
    `)
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getServiceById(serviceId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      seller:sellers(
        id,
        business_name,
        user_id
      ),
      service_categories(
        category:categories(id, name, slug)
      ),
      service_packages(*)
    `)
    .eq('id', serviceId)
    .single()

  if (error) throw error

  // seller의 user 정보를 별도로 조회
  if (data?.seller?.user_id) {
    const { data: userData } = await supabase
      .from('users')
      .select('id, name, email, profile_image')
      .eq('id', data.seller.user_id)
      .single()

    if (userData) {
      data.seller.user = userData
    }
  }

  return data
}

export async function getSellerServicesCount(userId: string, status: string) {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .eq('status', status)

  if (error) throw error
  return count || 0
}
