import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NotificationsClient from './NotificationsClient';
import { logger } from '@/lib/logger';

export const metadata = {
  title: '알림 | 돌파구',
  description: '전체 알림 확인',
};

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  order_id: string | null;
  sender_id: string | null;
  metadata: Record<string, unknown> | null;
}

export default async function NotificationsPage() {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 초기 알림 데이터 로드 (최신 50개)
  const { data: initialNotifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    logger.error('Failed to load notifications:', error);
  }

  // 읽지 않은 알림 수 조회
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  // 프로필 정보 가져오기
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, profile_image')
    .eq('user_id', user.id)
    .maybeSingle();

  // 판매자 여부 확인
  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <NotificationsClient
      initialNotifications={(initialNotifications || []) as Notification[]}
      unreadCount={unreadCount || 0}
      profileData={profile}
      isSeller={!!seller}
    />
  );
}
