import { requireSellerAuth } from '@/lib/seller/page-auth';
import { getSellerPortfolio } from '@/lib/supabase/queries/earnings';
import SellerPortfolioClient from './SellerPortfolioClient';

export default async function SellerPortfolioPage() {
  const { seller } = await requireSellerAuth();

  const portfolio = await getSellerPortfolio(seller.id);

  return <SellerPortfolioClient portfolio={portfolio} />;
}
