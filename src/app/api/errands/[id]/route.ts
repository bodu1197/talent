import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/rollbar/server';
import type { ErrandStatus } from '@/types/errand';
import { SupabaseClient } from '@supabase/supabase-js';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface Errand {
  id: string;
  requester_id: string;
  helper_id: string | null;
  status: ErrandStatus;
  base_price: number;
  distance_price: number;
  tip: number;
  title: string;
  description: string | null;
}

// 상태 전이 규칙
const VALID_STATUS_TRANSITIONS: Record<ErrandStatus, ErrandStatus[]> = {
  OPEN: ['MATCHED', 'CANCELLED'],
  MATCHED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

// 상태 변경 권한 검사
function validateStatusChangePermission(
  newStatus: ErrandStatus,
  currentStatus: ErrandStatus,
  isRequester: boolean,
  isHelper: boolean
): string | null {
  if (newStatus === 'CANCELLED' && !isRequester && currentStatus !== 'OPEN') {
    return '취소 권한이 없습니다';
  }

  if (newStatus === 'IN_PROGRESS' && !isHelper) {
    return '헬퍼만 진행 시작할 수 있습니다';
  }

  if (newStatus === 'COMPLETED' && !isHelper) {
    return '헬퍼만 완료 처리할 수 있습니다';
  }

  return null;
}

// 상태 전이 유효성 검사
function isValidStatusTransition(currentStatus: ErrandStatus, newStatus: ErrandStatus): boolean {
  return VALID_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

// 상태 변경에 따른 타임스탬프 설정
function getStatusTimestamps(status: ErrandStatus, cancelReason?: string): Record<string, unknown> {
  const timestamps: Record<string, unknown> = {};

  switch (status) {
    case 'IN_PROGRESS':
      timestamps.started_at = new Date().toISOString();
      break;
    case 'COMPLETED':
      timestamps.completed_at = new Date().toISOString();
      break;
    case 'CANCELLED':
      timestamps.cancelled_at = new Date().toISOString();
      timestamps.cancel_reason = cancelReason || null;
      break;
  }

  return timestamps;
}

// 업데이트 데이터 구성
function buildUpdateData(
  body: Record<string, unknown>,
  currentErrand: Errand,
  isRequester: boolean
): Record<string, unknown> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  // 상태 변경
  if (body.status) {
    updateData.status = body.status;
    Object.assign(
      updateData,
      getStatusTimestamps(body.status as ErrandStatus, body.cancel_reason as string)
    );
  }

  // OPEN 상태에서만 내용 수정 가능
  if (currentErrand.status === 'OPEN' && isRequester) {
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.tip !== undefined) {
      updateData.tip = body.tip;
      updateData.total_price =
        currentErrand.base_price + currentErrand.distance_price + (body.tip as number);
    }
  }

  return updateData;
}

// 사용자 권한 확인
function checkUserPermission(
  errand: Errand,
  userId: string
): { isRequester: boolean; isHelper: boolean } {
  return {
    isRequester: errand.requester_id === userId,
    isHelper: errand.helper_id === userId,
  };
}

// 심부름 조회 헬퍼
async function fetchErrand(
  supabase: SupabaseClient,
  id: string
): Promise<{ errand: Errand | null; error: NextResponse | null }> {
  const { data: errand, error } = await supabase.from('errands').select('*').eq('id', id).single();

  if (error || !errand) {
    return {
      errand: null,
      error: NextResponse.json({ error: '심부름을 찾을 수 없습니다' }, { status: 404 }),
    };
  }

  return { errand: errand as Errand, error: null };
}

// 심부름 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: errand, error } = await supabase
      .from('errands')
      .select(
        `
        *,
        requester:profiles!errands_requester_id_fkey(id, name, profile_image),
        helper:profiles!errands_helper_id_fkey(id, name, profile_image)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '심부름을 찾을 수 없습니다' }, { status: 404 });
      }
      logServerError(error, { context: 'errand_detail', errand_id: id });
      return NextResponse.json({ error: '심부름 정보를 불러올 수 없습니다' }, { status: 500 });
    }

    // 지원자 목록 조회 (OPEN 상태일 때만)
    let applications = null;
    let hasApplied = false;

    if (errand.status === 'OPEN') {
      const { data: apps } = await supabase
        .from('errand_applications')
        .select(
          `
          *,
          helper:helper_profiles(
            id,
            grade,
            average_rating,
            total_completed,
            user:profiles(id, name, profile_image)
          )
        `
        )
        .eq('errand_id', id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      applications = apps;

      // 현재 사용자가 이미 지원했는지 확인
      if (user) {
        const { data: helperProfile } = await supabase
          .from('helper_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (helperProfile) {
          const { data: myApplication } = await supabase
            .from('errand_applications')
            .select('id')
            .eq('errand_id', id)
            .eq('helper_id', helperProfile.id)
            .single();

          hasApplied = !!myApplication;
        }
      }
    }

    return NextResponse.json({ errand, applications, hasApplied });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errand_detail_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 심부름 수정
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 사용자 프로필 조회 (profiles.id 필요)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: '프로필을 찾을 수 없습니다' }, { status: 404 });
    }

    const body = await request.json();

    // 현재 심부름 조회
    const { errand: currentErrand, error: fetchError } = await fetchErrand(supabase, id);
    if (fetchError) return fetchError;
    if (!currentErrand) {
      return NextResponse.json({ error: '심부름을 찾을 수 없습니다' }, { status: 404 });
    }

    // 권한 확인 (profiles.id로 비교)
    const { isRequester, isHelper } = checkUserPermission(currentErrand, userProfile.id);
    if (!isRequester && !isHelper) {
      return NextResponse.json({ error: '수정 권한이 없습니다' }, { status: 403 });
    }

    // 상태 변경 처리
    if (body.status) {
      const newStatus = body.status as ErrandStatus;
      const currentStatus = currentErrand.status as ErrandStatus;

      // 상태 전이 유효성 검사
      if (!isValidStatusTransition(currentStatus, newStatus)) {
        return NextResponse.json(
          { error: `${currentStatus}에서 ${newStatus}로 변경할 수 없습니다` },
          { status: 400 }
        );
      }

      // 상태별 권한 검사
      const permissionError = validateStatusChangePermission(
        newStatus,
        currentStatus,
        isRequester,
        isHelper
      );
      if (permissionError) {
        return NextResponse.json({ error: permissionError }, { status: 403 });
      }
    }

    // 업데이트 데이터 구성
    const updateData = buildUpdateData(body, currentErrand, isRequester);

    const { data: errand, error: updateError } = await supabase
      .from('errands')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logServerError(updateError, { context: 'errand_update', errand_id: id });
      return NextResponse.json({ error: '심부름 수정에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({ errand });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errand_update_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 심부름 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 사용자 프로필 조회 (profiles.id 필요)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: '프로필을 찾을 수 없습니다' }, { status: 404 });
    }

    // 현재 심부름 조회
    const { errand: currentErrand, error: fetchError } = await fetchErrand(supabase, id);
    if (fetchError) return fetchError;
    if (!currentErrand) {
      return NextResponse.json({ error: '심부름을 찾을 수 없습니다' }, { status: 404 });
    }

    // 권한 확인 (요청자만 삭제 가능) - profiles.id로 비교
    if (currentErrand.requester_id !== userProfile.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 403 });
    }

    // OPEN 또는 CANCELLED 상태에서만 삭제 가능
    if (!['OPEN', 'CANCELLED'].includes(currentErrand.status)) {
      return NextResponse.json(
        { error: '진행중인 심부름은 삭제할 수 없습니다. 취소를 먼저 진행해주세요.' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase.from('errands').delete().eq('id', id);

    if (deleteError) {
      logServerError(deleteError, { context: 'errand_delete', errand_id: id });
      return NextResponse.json({ error: '심부름 삭제에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'errand_delete_error',
    });
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
