import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdvertisingPaymentClient from './AdvertisingPaymentClient';

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function AdvertisingPaymentPage({ params }: Props) {
  const { orderId } = await params;
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 광고 결제 정보 조회
  const { data: payment, error } = await supabase
    .from('advertising_payments')
    .select(
      `
      *,
      services:service_id (
        id,
        title,
        thumbnail_url
      )
    `
    )
    .eq('id', orderId)
    .single();

  if (error || !payment) {
    notFound();
  }

  // 판매자 본인 확인
  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!seller || seller.id !== payment.seller_id) {
    redirect('/mypage/seller/advertising');
  }

  // 이미 결제 완료된 경우
  if (payment.status === 'completed') {
    redirect('/mypage/seller/advertising');
  }

  // 구매자(판매자) 정보
  const { data: userData } = await supabase
    .from('users')
    .select('name, phone')
    .eq('id', user.id)
    .single();

  const buyer = {
    name: userData?.name || user.user_metadata?.name || null,
    email: user.email || null,
    phone: userData?.phone || null,
  };

  return <AdvertisingPaymentClient payment={payment} buyer={buyer} />;
}
