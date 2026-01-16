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

// 파일 업로드 헬퍼 함수
async function uploadHelperDocument(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
  documentType: 'id_card' | 'selfie' | 'criminal_record'
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`;

    // ArrayBuffer로 변환하여 업로드
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('helper-documents')
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      logServerError(uploadError, {
        context: 'helper_document_upload',
        userId,
        documentType,
      });
      return null;
    }

    // 서명된 URL 생성 (관리자 검토용, 1년 유효)
    const { data: signedUrlData } = await supabase.storage
      .from('helper-documents')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365);

    return signedUrlData?.signedUrl || null;
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error(String(error)), {
      context: 'helper_document_upload_error',
      userId,
      documentType,
    });
    return null;
  }
}

// 검증 상태 확인 헬퍼
function checkExistingHelperStatus(
  existingHelper: { id: string; verification_status: string } | null
): NextResponse | null {
  if (!existingHelper) return null;

  if (existingHelper.verification_status === 'verified') {
    return NextResponse.json({ error: '이미 승인된 심부름꾼입니다' }, { status: 400 });
  }
  if (existingHelper.verification_status === 'submitted') {
    return NextResponse.json(
      { error: '서류 검토 중입니다. 승인을 기다려주세요.' },
      { status: 400 }
    );
  }
  return null;
}

// FormData 검증 헬퍼
function validateHelperFormData(formData: FormData): {
  valid: boolean;
  error?: NextResponse;
  data?: {
    bankName: string;
    bankAccount: string;
    accountHolder: string;
    bio: string | null;
    idCardFile: File;
    selfieFile: File;
    criminalRecordFile: File;
  };
} {
  const bankName = formData.get('bank_name') as string;
  const bankAccount = formData.get('bank_account') as string;
  const accountHolder = formData.get('account_holder') as string;
  const bio = formData.get('bio') as string | null;

  if (!bankName || !bankAccount || !accountHolder) {
    return {
      valid: false,
      error: NextResponse.json({ error: '계좌 정보를 모두 입력해주세요' }, { status: 400 }),
    };
  }

  const idCardFile = formData.get('id_card') as File | null;
  const selfieFile = formData.get('selfie') as File | null;
  const criminalRecordFile = formData.get('criminal_record') as File | null;

  if (!idCardFile || !selfieFile || !criminalRecordFile) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: '신분증, 본인 사진, 범죄경력회보서를 모두 첨부해주세요' },
        { status: 400 }
      ),
    };
  }

  const maxSize = 10 * 1024 * 1024;
  if (idCardFile.size > maxSize || selfieFile.size > maxSize || criminalRecordFile.size > maxSize) {
    return {
      valid: false,
      error: NextResponse.json({ error: '파일 크기는 각 10MB 이하만 가능합니다' }, { status: 400 }),
    };
  }

  return {
    valid: true,
    data: { bankName, bankAccount, accountHolder, bio, idCardFile, selfieFile, criminalRecordFile },
  };
}

// 헬퍼 등록 신청 (FormData 처리 + 파일 업로드)
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
      .select('id, verification_status')
      .eq('user_id', user.id)
      .single();

    const statusError = checkExistingHelperStatus(existingHelper);
    if (statusError) return statusError;

    // FormData 파싱 및 검증
    const formData = await request.formData();
    const validation = validateHelperFormData(formData);
    if (!validation.valid || !validation.data) {
      return validation.error!;
    }

    const {
      bankName,
      bankAccount,
      accountHolder,
      bio,
      idCardFile,
      selfieFile,
      criminalRecordFile,
    } = validation.data;

    // 파일 업로드
    const [idCardUrl, selfieUrl, criminalRecordUrl] = await Promise.all([
      uploadHelperDocument(supabase, user.id, idCardFile, 'id_card'),
      uploadHelperDocument(supabase, user.id, selfieFile, 'selfie'),
      uploadHelperDocument(supabase, user.id, criminalRecordFile, 'criminal_record'),
    ]);

    if (!idCardUrl || !selfieUrl || !criminalRecordUrl) {
      return NextResponse.json(
        { error: '파일 업로드에 실패했습니다. 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // 헬퍼 프로필 데이터 구성
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 30);

    const helperData = {
      user_id: user.id,
      bank_name: bankName,
      bank_account: bankAccount,
      account_holder: accountHolder,
      bio: bio || null,
      id_card_url: idCardUrl,
      selfie_url: selfieUrl,
      criminal_record_url: criminalRecordUrl,
      documents_submitted_at: new Date().toISOString(),
      verification_status: 'submitted',
      subscription_status: 'trial',
      subscription_expires_at: trialExpiresAt.toISOString(),
      is_active: false,
      updated_at: new Date().toISOString(),
    };

    // 기존 프로필 업데이트 또는 새로 생성
    const operation = existingHelper
      ? supabase
          .from('helper_profiles')
          .update(helperData)
          .eq('id', existingHelper.id)
          .select()
          .single()
      : supabase.from('helper_profiles').insert(helperData).select().single();

    const { data: helperProfile, error } = await operation;

    if (error) {
      logServerError(error, {
        context: existingHelper ? 'helper_update' : 'helper_register',
        user_id: user.id,
      });
      return NextResponse.json(
        {
          error: existingHelper
            ? '헬퍼 정보 업데이트에 실패했습니다'
            : '심부름꾼 등록에 실패했습니다',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        helperProfile,
        message: '심부름꾼 등록 신청이 완료되었습니다. 서류 검토 후 승인 알림을 보내드립니다.',
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
