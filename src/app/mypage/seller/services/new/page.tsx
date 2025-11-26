import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NewServiceClientV2 from './NewServiceClientV2';

export default async function NewServicePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get seller info
  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!seller) {
    redirect('/mypage/seller/register');
  }

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, profile_image')
    .eq('user_id', user.id)
    .maybeSingle();

  return <NewServiceClientV2 sellerId={seller.id} profileData={profile} />;
}
