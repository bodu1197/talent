import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import VerifyIdentityClient from './VerifyIdentityClient';

interface Props {
  readonly searchParams: Promise<{ returnUrl?: string }>;
}

export default async function VerifyIdentityPage({ searchParams }: Props) {
  const { returnUrl } = await searchParams;
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 이미 본인인증 완료된 경우
  const { data: userData } = await supabase
    .from('users')
    .select('is_verified, name, phone')
    .eq('id', user.id)
    .single();

  if (userData?.is_verified) {
    // returnUrl이 있으면 그곳으로, 없으면 마이페이지로
    redirect(returnUrl || '/mypage');
  }

  const customerInfo = {
    name: userData?.name || user.user_metadata?.name || null,
    phone: userData?.phone || null,
    email: user.email || null,
  };

  return <VerifyIdentityClient customerInfo={customerInfo} returnUrl={returnUrl || '/mypage'} />;
}
