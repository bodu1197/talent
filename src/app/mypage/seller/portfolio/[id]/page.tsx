import PortfolioDetailClient from './PortfolioDetailClient';
import { getPortfolioWithAuth } from '@/lib/seller/portfolioData';

interface Props {
  readonly params: Promise<{ readonly id: string }>;
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { id } = await params;
  const { portfolio, sellerId } = await getPortfolioWithAuth(id);

  return <PortfolioDetailClient portfolio={portfolio} sellerId={sellerId} />;
}
