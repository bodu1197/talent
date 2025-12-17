import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';
import { SupabaseClient } from '@supabase/supabase-js';

interface RouteParams {
  params: Promise<{ id: string; appId: string }>;
}

// 공통: 인증된 사용자 확인
async function getAuthenticatedUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 }),
    };
  }

  return { user, error: null };
}

// 지원 수락 처리
async function handleAcceptApplication(
  supabase: SupabaseClient,
  errandId: string,
  appId: string,
  helperUserId: string
): Promise<NextResponse> {
  // 1. 지원 상태를 accepted로 변경
  const { error: appError } = await supabase
    .from('errand_applications')
    .update({
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', appId);

  if (appError) {
    throw appError;
  }

  // 2. 다른 지원들은 rejected로 변경
  await supabase
    .from('errand_applications')
    .update({
      status: 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('errand_id', errandId)
    .neq('id', appId)
    .eq('status', 'pending');

  // 3. 심부름 상태를 MATCHED로 변경하고 헬퍼 배정
  const { error: errandError } = await supabase
    .from('errands')
    .update({
      status: 'MATCHED',
      helper_id: helperUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', errandId);

  if (errandError) {
    throw errandError;
  }

  return NextResponse.json({
    success: true,
    message: '헬퍼가 선정되었습니다',
  });
}

// 지원 거절 처리
async function handleRejectApplication(
  supabase: SupabaseClient,
  appId: string
): Promise<NextResponse> {
  const { error } = await supabase
    .from('errand_applications')
    .update({
      status: 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', appId);

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
    message: '지원이 거절되었습니다',
  });
}

// 지원 수락/거절 (요청자)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, appId } = await params;
    const supabase = await createClient();

    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError) return authError;

    // 현재 사용자의 profile.id 조회
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // 심부름 조회 및 권한 확인
    const { data: errand } = await supabase.from('errands').select('*').eq('id', id).single();

    if (!errand) {
      return NextResponse.json({ error: '심부름을 찾을 수 없습니다' }, { status: 404 });
    }

    // requester_id는 profiles.id이므로 userProfile.id와 비교
    if (!userProfile || errand.requester_id !== userProfile.id) {
      return NextResponse.json({ error: '수락 권한이 없습니다' }, { status: 403 });
    }

    if (errand.status !== 'OPEN') {
      return NextResponse.json({ error: '이미 진행중인 심부름입니다' }, { status: 400 });
    }

    // 지원 조회 (helper_profiles.user_id를 가져옴)
    const { data: application } = await supabase
      .from('errand_applications')
      .select('*, helper:helper_profiles(user_id)')
      .eq('id', appId)
      .eq('errand_id', id)
      .single();

    if (!application) {
      return NextResponse.json({ error: '지원을 찾을 수 없습니다' }, { status: 404 });
    }

    if (application.status !== 'pending') {
      return NextResponse.json({ error: '이미 처리된 지원입니다' }, { status: 400 });
    }

    const body = await request.json();
    const action = body.action as 'accept' | 'reject';

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: '유효하지 않은 액션입니다' }, { status: 400 });
    }

    if (action === 'accept') {
      // helper_profiles.user_id로 profiles.id 조회
      const helperUserId = application.helper?.user_id;
      if (!helperUserId) {
        return NextResponse.json({ error: '헬퍼 정보를 찾을 수 없습니다' }, { status: 400 });
      }

      const { data: helperProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', helperUserId)
        .single();

      if (!helperProfile) {
        return NextResponse.json({ error: '헬퍼 프로필을 찾을 수 없습니다' }, { status: 400 });
      }

      return handleAcceptApplication(supabase, id, appId, helperProfile.id);
    }

    return handleRejectApplication(supabase, appId);
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errand_application_action_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 지원 철회 (헬퍼)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, appId } = await params;
    const supabase = await createClient();

    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError) return authError;

    // 헬퍼 프로필 확인
    const { data: helperProfile } = await supabase
      .from('helper_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!helperProfile) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    // 지원 조회 및 권한 확인
    const { data: application } = await supabase
      .from('errand_applications')
      .select('*')
      .eq('id', appId)
      .eq('errand_id', id)
      .eq('helper_id', helperProfile.id)
      .single();

    if (!application) {
      return NextResponse.json({ error: '지원을 찾을 수 없습니다' }, { status: 404 });
    }

    if (application.status !== 'pending') {
      return NextResponse.json({ error: '이미 처리된 지원은 철회할 수 없습니다' }, { status: 400 });
    }

    const { error } = await supabase
      .from('errand_applications')
      .update({
        status: 'withdrawn',
        updated_at: new Date().toISOString(),
      })
      .eq('id', appId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '지원이 철회되었습니다',
    });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errand_application_withdraw_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
