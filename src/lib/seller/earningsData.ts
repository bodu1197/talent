import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getSellerWithAccountInfo() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get seller info (id and account details)
  const { data: seller } = await supabase
    .from('sellers')
    .select('id, bank_name, account_number, account_holder')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!seller) {
    redirect('/mypage/seller/register');
  }

  // Get profile data (name and profile_image)
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, profile_image')
    .eq('user_id', user.id)
    .maybeSingle();

  return { seller, profile, user };
}
