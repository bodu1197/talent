import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';

interface RouteParams {
  params: Promise<{ id: string }>;
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

// 심부름 지원하기 (헬퍼)
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
    if (
      helperProfile.subscription_status !== 'active' &&
      helperProfile.subscription_status !== 'trial'
    ) {
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

    // 이미 지원했는지 확인
    const { data: existingApplication } = await supabase
      .from('errand_applications')
      .select('id')
      .eq('errand_id', id)
      .eq('helper_id', helperProfile.id)
      .single();

    if (existingApplication) {
      return NextResponse.json({ error: '이미 지원한 심부름입니다' }, { status: 400 });
    }

    const body = await request.json();

    // 지원 생성
    const { data: application, error } = await supabase
      .from('errand_applications')
      .insert({
        errand_id: id,
        helper_id: helperProfile.id,
        message: body.message?.trim() || null,
        proposed_price: body.proposed_price || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      logServerError(error, {
        context: 'errand_apply',
        errand_id: id,
        helper_id: helperProfile.id,
        error_details: error,
      });
      console.error('[Errand Apply Error]', { error, errand_id: id, helper_id: helperProfile.id });
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

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errand_apply_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
