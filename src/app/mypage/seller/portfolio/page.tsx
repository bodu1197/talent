import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSellerPortfolio } from '@/lib/supabase/queries/earnings';
import SellerPortfolioClient from './SellerPortfolioClient';

export default async function SellerPortfolioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!seller) {
    redirect('/mypage/seller/register');
  }

  const portfolio = await getSellerPortfolio(seller.id);

  return <SellerPortfolioClient portfolio={portfolio} />;
}
