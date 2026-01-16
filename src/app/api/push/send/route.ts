import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logServerError } from '@/lib/rollbar/server';
import { sendSwing2AppPush, isSwing2AppConfigured } from '@/lib/swing2app/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface PushPayload {
  notification_id?: string;
  user_id: string;
  title: string;
  body: string;
  link_url?: string;
  image_url?: string;
}

// POST /api/push/send - 푸시 알림 즉시 발송 (내부 API / Cron)
export async function POST(request: NextRequest) {
  try {
    // API 키 검증 (내부 호출만 허용)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 401 });
    }

    if (!isSwing2AppConfigured()) {
      return NextResponse.json({ error: 'Swing2App API가 설정되지 않았습니다' }, { status: 500 });
    }

    const body: PushPayload = await request.json();

    if (!body.user_id || !body.title || !body.body) {
      return NextResponse.json({ error: 'user_id, title, body는 필수입니다' }, { status: 400 });
    }

    // Swing2App API로 푸시 발송
    const result = await sendSwing2AppPush({
      userIds: [body.user_id],
      title: body.title,
      content: body.body,
      linkUrl: body.link_url,
      imageUrl: body.image_url,
    });

    // 발송 로그 저장
    if (body.notification_id) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      await supabase.from('push_notification_logs').insert({
        notification_id: body.notification_id,
        user_id: body.user_id,
        device_token_id: null,
        title: body.title,
        body: body.body,
        data: { link: body.link_url },
        status: result.success ? 'sent' : 'failed',
        sent_at: new Date().toISOString(),
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '푸시 발송 실패', sent: 0 },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '푸시 알림이 발송되었습니다',
      sent: result.userCount || 1,
    });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'push_send_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
