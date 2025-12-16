import { createClient } from '@/lib/supabase/server';
import PortfolioEditClient from './PortfolioEditClient';
import { getPortfolioWithAuth, getPortfolioFormData } from '@/lib/seller/portfolioData';

interface Props {
  readonly params: Promise<{ id: string }>;
}

export default async function PortfolioEditPage({ params }: Props) {
  const { id } = await params;
  const { portfolio, sellerId } = await getPortfolioWithAuth(id);

  const supabase = await createClient();

  // 폼 데이터 조회
  const { categories, services } = await getPortfolioFormData(supabase, sellerId);

  return (
    <PortfolioEditClient
      portfolio={portfolio}
      sellerId={sellerId}
      categories={categories}
      services={services}
    />
  );
}
