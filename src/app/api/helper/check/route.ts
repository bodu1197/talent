import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { data: helper } = await supabase
      .from('helper_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({
      isRegistered: !!helper,
    });
  } catch (error) {
    console.error('Helper check error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
