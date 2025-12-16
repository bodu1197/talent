import { requireSellerAuth } from '@/lib/seller/page-auth';
import PortfolioNewClient from './PortfolioNewClient';

export default async function PortfolioNewPage() {
  // 판매자 인증 확인
  const { supabase } = await requireSellerAuth();

  // 카테고리 목록 가져오기
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id')
    .order('display_order', { ascending: true });

  // 전문가의 서비스 목록 가져오기
  const { data: services } = await supabase
    .from('services')
    .select('id, title, status')
    .eq('seller_id', seller.id)
    .in('status', ['active', 'pending'])
    .order('created_at', { ascending: false });

  return (
    <PortfolioNewClient
      sellerId={seller.id}
      categories={categories || []}
      services={services || []}
    />
  );
}
