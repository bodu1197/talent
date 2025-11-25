import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DirectPaymentClient from './DirectPaymentClient';

interface DirectPaymentPageProps {
  readonly params: Promise<{
    readonly orderId: string;
  }>;
}

export default async function DirectPaymentPage({ params }: DirectPaymentPageProps) {
  const { orderId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 주문 정보 조회
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    notFound();
  }

  // 구매자 확인
  if (order.buyer_id !== user.id) {
    redirect('/');
  }

  // 이미 결제된 주문인지 확인
  if (order.status !== 'pending_payment') {
    redirect(`/mypage/buyer/orders/${order.id}`);
  }

  // 판매자 정보 조회 (seller_profiles 뷰 사용)
  const { data: seller } = await supabase
    .from('seller_profiles')
    .select('id, business_name, display_name, profile_image, user_id')
    .eq('id', order.seller_id)
    .single();

  // 구매자 정보 조회 (profiles 테이블 사용)
  const { data: buyer } = await supabase
    .from('profiles')
    .select('user_id, name, email, phone')
    .eq('user_id', user.id)
    .single();

  return <DirectPaymentClient order={order} seller={seller} buyer={buyer} />;
}
