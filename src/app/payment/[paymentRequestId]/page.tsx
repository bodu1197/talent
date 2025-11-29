import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PaymentClient from './PaymentClient';

interface PaymentPageProps {
  readonly params: Promise<{
    readonly paymentRequestId: string;
  }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { paymentRequestId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 결제 요청 정보 조회
  const { data: paymentRequest, error } = await supabase
    .from('payment_requests')
    .select(
      `
      id,
      room_id,
      seller_id,
      buyer_id,
      service_id,
      amount,
      title,
      description,
      delivery_days,
      revision_count,
      status,
      expires_at,
      created_at
    `
    )
    .eq('id', paymentRequestId)
    .single();

  if (error || !paymentRequest) {
    redirect('/chat');
  }

  // 구매자인지 확인
  if (paymentRequest.buyer_id !== user.id) {
    redirect('/chat');
  }

  // 본인인증 확인
  const { data: userData } = await supabase
    .from('users')
    .select('is_verified')
    .eq('id', user.id)
    .single();

  if (!userData?.is_verified) {
    // 본인인증 페이지로 리다이렉트 (returnUrl 포함)
    const returnUrl = `/payment/${paymentRequestId}`;
    redirect(`/verify-identity?returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  // 수락된 상태인지 확인
  if (paymentRequest.status !== 'accepted') {
    redirect(`/chat/${paymentRequest.room_id}`);
  }

  // 만료 확인
  if (new Date(paymentRequest.expires_at) < new Date()) {
    redirect(`/chat/${paymentRequest.room_id}`);
  }

  // 판매자 정보 조회 (seller_profiles 뷰 사용)
  const { data: seller } = await supabase
    .from('seller_profiles')
    .select('id, business_name, display_name, profile_image, user_id')
    .eq('id', paymentRequest.seller_id)
    .single();

  // 구매자 정보 조회 (profiles 테이블 사용)
  const { data: buyer } = await supabase
    .from('profiles')
    .select('user_id, name, email, phone')
    .eq('user_id', user.id)
    .single();

  return <PaymentClient paymentRequest={paymentRequest} seller={seller} buyer={buyer} />;
}
