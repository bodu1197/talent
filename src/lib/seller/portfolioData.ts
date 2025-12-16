import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getPortfolioWithAuth(portfolioId: string) {
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

  // 포트폴리오 조회
  const { data: portfolio } = await supabase
    .from('seller_portfolio')
    .select('*')
    .eq('id', portfolioId)
    .single();

  if (!portfolio) {
    notFound();
  }

  // 본인 소유 확인
  if (portfolio.seller_id !== seller.id) {
    redirect('/mypage/seller/portfolio');
  }

  return { portfolio, sellerId: seller.id };
}
