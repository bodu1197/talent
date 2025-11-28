import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// 프로필 업데이트 API
export async function PATCH(request: NextRequest) {
  try {
    // 먼저 일반 클라이언트로 사용자 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, profile_image } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Service Role 클라이언트 생성 (RLS 우회)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey);

    // Update profiles table (unified source)
    const { data, error } = await serviceClient
      .from('profiles')
      .update({
        name,
        profile_image: profile_image || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      logger.error('Profile update error:', error);
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 500 }
      );
    }

    // auth.users 메타데이터도 동기화 (자동 생성된 닉네임 덮어쓰기)
    const { error: authError } = await serviceClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        name,
      },
    });

    if (authError) {
      logger.warn('Auth user metadata sync failed:', authError);
      // 프로필 업데이트는 성공했으므로 에러를 반환하지 않음
    }

    return NextResponse.json({ user: data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Profile update API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
