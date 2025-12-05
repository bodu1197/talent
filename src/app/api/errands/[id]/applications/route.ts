import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';
import { SupabaseClient } from '@supabase/supabase-js';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 요청자에게 매칭 완료 알림 전송 헬퍼 함수
async function sendMatchedNotification(
  supabase: SupabaseClient,
  serviceClient: ReturnType<typeof createServiceRoleClient>,
  errandId: string,
  errandTitle: string,
  requesterId: string,
  helperProfileId: string
): Promise<void> {
  // 요청자의 user_id 조회 (profiles.id -> profiles.user_id)
  const { data: requesterProfile, error: requesterError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', requesterId)
    .single();

  if (requesterError) {
    logServerError(requesterError, { context: 'match_notification_requester_lookup', requesterId });
    return;
  }

  // 라이더 이름 조회
  const { data: helperInfo } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', helperProfileId)
    .single();

  if (!requesterProfile?.user_id) {
    return;
  }

  const { error: notifyError } = await serviceClient.from('notifications').insert({
    user_id: requesterProfile.user_id,
    type: 'errand_matched',
    title: '라이더가 배정되었습니다',
    message: `"${errandTitle}" 심부름에 ${helperInfo?.name || '라이더'}님이 배정되었습니다.`,
    link: `/errands/${errandId}`,
    is_read: false,
  });

  if (notifyError) {
    logServerError(notifyError, { context: 'match_notification_insert', errandId });
  }
}

// 구독 상태 확인 헬퍼 함수
function isValidSubscription(status: string | null): boolean {
  return status === 'active' || status === 'trial';
}

// 심부름 지원 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 현재 사용자의 profile.id 조회
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // 심부름 요청자인지 확인 (requester_id는 profiles.id)
    const { data: errand } = await supabase
      .from('errands')
      .select('requester_id')
      .eq('id', id)
      .single();

    if (!errand || !userProfile || errand.requester_id !== userProfile.id) {
      return NextResponse.json({ error: '조회 권한이 없습니다' }, { status: 403 });
    }

    const { data: applications, error } = await supabase
      .from('errand_applications')
      .select(
        `
        *,
        helper:helper_profiles(
          id,
          grade,
          average_rating,
          total_completed,
          total_reviews,
          bio,
          user:profiles(id, name, profile_image)
        )
      `
      )
      .eq('errand_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      logServerError(error, { context: 'errand_applications_list', errand_id: id });
      return NextResponse.json({ error: '지원 목록을 불러올 수 없습니다' }, { status: 500 });
    }

    return NextResponse.json({ applications });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errand_applications_list_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 지원 기록 생성 헬퍼 함수
async function createApplicationRecord(
  serviceClient: ReturnType<typeof createServiceRoleClient>,
  errandId: string,
  helperId: string,
  message: string | null,
  proposedPrice: number | null
) {
  return serviceClient
    .from('errand_applications')
    .insert({
      errand_id: errandId,
      helper_id: helperId,
      message: message,
      proposed_price: proposedPrice,
      status: 'accepted',
    })
    .select()
    .single();
}

// 심부름 매칭 상태 업데이트 헬퍼 함수
async function updateErrandToMatched(
  serviceClient: ReturnType<typeof createServiceRoleClient>,
  errandId: string,
  helperId: string
) {
  return serviceClient
    .from('errands')
    .update({
      status: 'MATCHED',
      helper_id: helperId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', errandId);
}

// 심부름 지원하기 (헬퍼)
// eslint-disable-next-line sonarjs/cognitive-complexity -- 지원 프로세스 검증 로직으로 인한 예외 처리
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 헬퍼 프로필 확인
    const { data: helperProfile } = await supabase
      .from('helper_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!helperProfile) {
      return NextResponse.json({ error: '심부름꾼 등록이 필요합니다' }, { status: 400 });
    }

    // 구독 상태 확인
    if (!isValidSubscription(helperProfile.subscription_status)) {
      return NextResponse.json(
        { error: '구독이 만료되었습니다. 구독을 갱신해주세요.' },
        { status: 400 }
      );
    }

    // 현재 사용자의 profile.id 조회
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // 심부름 상태 확인
    const { data: errand } = await supabase.from('errands').select('*').eq('id', id).single();

    if (!errand) {
      return NextResponse.json({ error: '심부름을 찾을 수 없습니다' }, { status: 404 });
    }

    if (errand.status !== 'OPEN') {
      return NextResponse.json({ error: '이미 마감된 심부름입니다' }, { status: 400 });
    }

    // requester_id는 profiles.id이므로 userProfile.id와 비교
    if (userProfile && errand.requester_id === userProfile.id) {
      return NextResponse.json(
        { error: '본인이 등록한 심부름에는 지원할 수 없습니다' },
        { status: 400 }
      );
    }

    // 이미 지원했는지 확인 (helper_id는 profiles.id)
    const { data: existingApplication } = await supabase
      .from('errand_applications')
      .select('id')
      .eq('errand_id', id)
      .eq('helper_id', userProfile!.id)
      .single();

    if (existingApplication) {
      return NextResponse.json({ error: '이미 지원한 심부름입니다' }, { status: 400 });
    }

    const body = await request.json();

    // Service Role로 RLS 우회 (권한 체크는 위에서 완료됨)
    const serviceClient = createServiceRoleClient();

    // 1. 지원 기록 생성 (바로 accepted 상태로)
    const { data: application, error } = await createApplicationRecord(
      serviceClient,
      id,
      userProfile!.id,
      body.message?.trim() || null,
      body.proposed_price || null
    );

    if (error) {
      logServerError(error, {
        context: 'errand_apply',
        errand_id: id,
        helper_id: helperProfile.id,
        error_details: error,
      });
      return NextResponse.json(
        {
          error: '지원에 실패했습니다',
          debug:
            process.env.NODE_ENV === 'development'
              ? { code: error.code, message: error.message, hint: error.hint }
              : undefined,
        },
        { status: 500 }
      );
    }

    // 2. 심부름 상태를 MATCHED로 변경하고 helper_id 설정
    const { error: updateError } = await updateErrandToMatched(serviceClient, id, userProfile!.id);

    if (updateError) {
      logServerError(updateError, {
        context: 'errand_match',
        errand_id: id,
        helper_id: userProfile!.id,
      });
      // 지원 기록 롤백
      await serviceClient.from('errand_applications').delete().eq('id', application.id);
      return NextResponse.json({ error: '매칭에 실패했습니다' }, { status: 500 });
    }

    // 3. 요청자에게 매칭 완료 알림 전송
    try {
      await sendMatchedNotification(
        supabase,
        serviceClient,
        id,
        errand.title,
        errand.requester_id,
        userProfile!.id
      );
    } catch (notifError) {
      // 알림 실패해도 매칭 자체는 성공으로 처리
      logServerError(notifError instanceof Error ? notifError : new Error(String(notifError)), {
        context: 'errand_notification_error',
        errand_id: id,
      });
    }

    return NextResponse.json(
      {
        application,
        matched: true,
        message: '심부름이 배정되었습니다!',
      },
      { status: 201 }
    );
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errand_apply_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
