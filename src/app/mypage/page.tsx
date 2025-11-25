import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function MypagePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // seller 여부 확인
  const { data: sellerData } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  // seller면 seller dashboard로, 아니면 buyer dashboard로
  if (sellerData) {
    redirect('/mypage/seller/dashboard');
  } else {
    redirect('/mypage/buyer/dashboard');
  }
}
