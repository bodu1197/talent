import { requireSellerAuth } from '@/lib/seller/page-auth';
import { getPortfolioFormData } from '@/lib/seller/portfolioData';
import PortfolioNewClient from './PortfolioNewClient';

export default async function PortfolioNewPage() {
  // 판매자 인증 확인
  const { supabase, seller } = await requireSellerAuth();

  // 폼 데이터 조회
  const { categories, services } = await getPortfolioFormData(supabase, seller.id);

  return <PortfolioNewClient sellerId={seller.id} categories={categories} services={services} />;
}
