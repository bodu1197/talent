import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BankTransferClient from './BankTransferClient';

export default async function BankTransferPage({
  params,
}: {
  readonly params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/auth/login');
  }

  // 주문 정보 조회 (전문가 정보 포함)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(
      `
      *,
      seller:seller_profiles!orders_seller_id_fkey(
        id,
        is_business,
        business_name,
        display_name
      )
    `
    )
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    redirect('/404');
  }

  // 본인 주문인지 확인
  if (order.buyer_id !== user.id) {
    redirect('/404');
  }

  // 이미 결제된 주문인지 확인
  if (order.status !== 'pending_payment') {
    redirect(`/mypage/buyer/orders/${orderId}`);
  }

  return <BankTransferClient order={order} />;
}
