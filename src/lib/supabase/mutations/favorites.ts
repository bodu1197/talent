import { createClient } from '@/lib/supabase/client'

export async function addFavorite(userId: string, serviceId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      service_id: serviceId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeFavorite(userId: string, serviceId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('service_id', serviceId)

  if (error) throw error
}
