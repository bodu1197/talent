import { createClient } from '@/lib/supabase/server'

export async function getBuyerOrders(userId: string, status?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select(`
      *,
      service:services(id, title, thumbnail_url),
      seller:users!seller_id(id, name, profile_image)
    `)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getSellerOrders(userId: string, status?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select(`
      *,
      service:services(id, title, thumbnail_url),
      buyer:users!buyer_id(id, name, profile_image)
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

export async function getOrderById(orderId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      service:services(id, title, thumbnail_url, seller_id),
      buyer:users!buyer_id(id, name, email, profile_image),
      seller:users!seller_id(id, name, email, profile_image)
    `)
    .eq('id', orderId)
    .single()

  if (error) throw error
  return data
}

export async function getBuyerOrdersCount(userId: string, status: string) {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', userId)
    .eq('status', status)

  if (error) throw error
  return count || 0
}

export async function getSellerOrdersCount(userId: string, status: string) {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .eq('status', status)

  if (error) throw error
  return count || 0
}
