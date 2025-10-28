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
      seller:users!seller_id(id, name, email, profile_image),
      service_categories(
        category:categories(id, name, slug)
      ),
      service_packages(*)
    `)
    .eq('id', serviceId)
    .single()

  if (error) throw error
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
