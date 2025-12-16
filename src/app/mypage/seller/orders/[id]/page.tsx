import { requireSellerAuth } from '@/lib/seller/page-auth';
import SellerOrderDetailClient from './SellerOrderDetailClient';

// 페이지를 dynamic으로 설정 (캐싱 비활성화)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

export default async function SellerOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  await requireSellerAuth();

  return <SellerOrderDetailClient orderId={id} />;
}
