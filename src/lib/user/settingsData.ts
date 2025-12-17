import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getSettingsData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get profile from profiles table (unified source)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  return {
    profile,
    userEmail: user.email ?? '',
    isSeller: !!seller,
  };
}
