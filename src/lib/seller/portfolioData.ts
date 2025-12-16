import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * 포트폴리오 폼에 필요한 공통 데이터 조회 (카테고리, 서비스)
 */
export async function getPortfolioFormData(
  supabase: SupabaseClient,
  sellerId: string
): Promise<{
  categories: Array<{ id: string; name: string; slug: string; parent_id: string | null }>;
  services: Array<{ id: string; title: string; status: string }>;
}> {
  // 카테고리 목록 가져오기
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id')
    .order('display_order', { ascending: true });

  // 전문가의 서비스 목록 가져오기
  const { data: services } = await supabase
    .from('services')
    .select('id, title, status')
    .eq('seller_id', sellerId)
    .in('status', ['active', 'pending'])
    .order('created_at', { ascending: false });

  return {
    categories: categories || [],
    services: services || [],
  };
}

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
