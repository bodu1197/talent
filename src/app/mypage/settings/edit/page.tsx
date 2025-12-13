import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SettingsEditClient from './SettingsEditClient';

export default async function SettingsEditPage() {
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

  return <SettingsEditClient profile={profile} userEmail={user.email || ''} isSeller={!!seller} />;
}
