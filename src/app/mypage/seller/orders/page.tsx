import { requireSellerAuth } from '@/lib/seller/page-auth';
import SellerOrdersClient from './SellerOrdersClient';

// 페이지를 dynamic으로 설정 (캐싱 비활성화)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SellerOrdersPage() {
  const { seller } = await requireSellerAuth();

  return <SellerOrdersClient sellerId={seller.id} />;
}
