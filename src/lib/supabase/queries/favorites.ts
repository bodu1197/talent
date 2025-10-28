import { createClient } from '@/lib/supabase/client'

export async function getFavorites(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      service:services(
        id,
        title,
        description,
        price,
        thumbnail_url,
        rating,
        review_count,
        seller:users!seller_id(id, name, profile_image)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getFavoritesCount(userId: string) {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count || 0
}

export async function checkIsFavorite(userId: string, serviceId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('service_id', serviceId)
    .maybeSingle()

  if (error) throw error
  return !!data
}
