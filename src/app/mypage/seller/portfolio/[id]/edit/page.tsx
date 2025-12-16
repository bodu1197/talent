import { createClient } from '@/lib/supabase/server';
import PortfolioEditClient from './PortfolioEditClient';
import { getPortfolioWithAuth } from '@/lib/seller/portfolioData';

interface Props {
  readonly params: Promise<{ id: string }>;
}

export default async function PortfolioEditPage({ params }: Props) {
  const { id } = await params;
  const { portfolio, sellerId } = await getPortfolioWithAuth(id);

  const supabase = await createClient();

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

  return (
    <PortfolioEditClient
      portfolio={portfolio}
      sellerId={sellerId}
      categories={categories || []}
      services={services || []}
    />
  );
}
