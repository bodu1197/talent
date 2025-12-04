import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';

// 내 헬퍼 프로필 조회
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // helper_profiles와 profiles 모두 user_id가 auth.users.id를 참조
    // helper_profiles 조회
    const { data: helperProfile, error } = await supabase
      .from('helper_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 헬퍼 프로필 없음
        return NextResponse.json({ helperProfile: null });
      }
      throw error;
    }

    // profiles 테이블에서 사용자 정보 별도 조회 (올바른 컬럼명 사용)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, name, profile_image')
      .eq('user_id', user.id)
      .single();

    // 통계 정보 조회
    const [settlementsResult, withdrawalsResult] = await Promise.all([
      supabase
        .from('errand_settlements')
        .select('total_amount')
        .eq('helper_id', helperProfile.id)
        .eq('status', 'available'),
      supabase
        .from('helper_withdrawals')
        .select('amount')
        .eq('helper_id', helperProfile.id)
        .eq('status', 'completed'),
    ]);

    const availableBalance =
      settlementsResult.data?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
    const totalWithdrawn =
      withdrawalsResult.data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;

    // helperProfile에 user 정보 추가
    const helperProfileWithUser = {
      ...helperProfile,
      user: userProfile
        ? {
            id: userProfile.id,
            name: userProfile.name,
            profile_image: userProfile.profile_image,
          }
        : null,
    };

    return NextResponse.json({
      helperProfile: helperProfileWithUser,
      stats: {
        availableBalance,
        totalWithdrawn,
        totalEarned: availableBalance + totalWithdrawn,
      },
    });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'helper_profile_get_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 헬퍼 등록 신청
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 이미 헬퍼인지 확인
    const { data: existingHelper } = await supabase
      .from('helper_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingHelper) {
      return NextResponse.json({ error: '이미 심부름꾼으로 등록되어 있습니다' }, { status: 400 });
    }

    const body = await request.json();

    // 필수 필드 검증
    if (!body.bank_name || !body.bank_account || !body.account_holder) {
      return NextResponse.json({ error: '계좌 정보를 모두 입력해주세요' }, { status: 400 });
    }

    // 헬퍼 프로필 생성 (trial 상태로 시작 - 첫 달 무료)
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 30); // 30일 무료 체험

    const { data: helperProfile, error } = await supabase
      .from('helper_profiles')
      .insert({
        user_id: user.id,
        bank_name: body.bank_name,
        bank_account: body.bank_account,
        account_holder: body.account_holder,
        bio: body.bio || null,
        preferred_categories: body.preferred_categories || null,
        preferred_areas: body.preferred_areas || null,
        subscription_status: 'trial',
        subscription_expires_at: trialExpiresAt.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      logServerError(error, { context: 'helper_register', user_id: user.id });
      return NextResponse.json({ error: '심부름꾼 등록에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json(
      {
        helperProfile,
        message: '심부름꾼 등록이 완료되었습니다. 30일 무료 체험이 시작됩니다!',
      },
      { status: 201 }
    );
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'helper_register_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 헬퍼 프로필 수정
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { data: existingHelper } = await supabase
      .from('helper_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!existingHelper) {
      return NextResponse.json({ error: '헬퍼 프로필이 없습니다' }, { status: 404 });
    }

    const body = await request.json();

    // 업데이트 가능한 필드만
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.bank_name !== undefined) updateData.bank_name = body.bank_name;
    if (body.bank_account !== undefined) updateData.bank_account = body.bank_account;
    if (body.account_holder !== undefined) updateData.account_holder = body.account_holder;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.preferred_categories !== undefined)
      updateData.preferred_categories = body.preferred_categories;
    if (body.preferred_areas !== undefined) updateData.preferred_areas = body.preferred_areas;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data: helperProfile, error } = await supabase
      .from('helper_profiles')
      .update(updateData)
      .eq('id', existingHelper.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ helperProfile });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'helper_update_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
