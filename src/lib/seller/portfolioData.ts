import { redirect, notFound } from 'next/navigation';
import { requireSellerAuth } from '@/lib/seller/page-auth';
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
  // 판매자 인증 확인
  const { supabase, seller } = await requireSellerAuth();

  // 포트폴리오 조회
  const { data: dbPortfolio } = await supabase
    .from('seller_portfolio')
    .select('*')
    .eq('id', portfolioId)
    .single();

  if (!dbPortfolio) {
    notFound();
  }

  // 본인 소유 확인
  if (dbPortfolio.seller_id !== seller.id) {
    redirect('/mypage/seller/portfolio');
  }

  // DB 타입을 클라이언트 타입으로 변환
  const images = (dbPortfolio.images as string[]) || [];
  const portfolio = {
    id: dbPortfolio.id,
    seller_id: dbPortfolio.seller_id,
    title: dbPortfolio.title,
    description: dbPortfolio.description,
    category_id: dbPortfolio.category_id,
    thumbnail_url: images[0] || null,
    image_urls: images.slice(1),
    project_url: null,
    youtube_url: dbPortfolio.video_url,
    service_id: null,
    tags: (dbPortfolio.tags as string[]) || [],
    view_count: 0,
    created_at: dbPortfolio.created_at || '',
    updated_at: dbPortfolio.updated_at || '',
  };

  return { portfolio, sellerId: seller.id };
}
