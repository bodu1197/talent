import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // 전체 데이터 조회 (user_id 필터 없이)
  const { data: allVisits, error: allError } = await supabase
    .from('category_visits')
    .select('*')
    .order('visited_at', { ascending: false })
    .limit(20);

  // 본인 데이터 조회
  const { data: myVisits, error: myError } = await supabase
    .from('category_visits')
    .select('*')
    .eq('user_id', user.id)
    .order('visited_at', { ascending: false })
    .limit(20);

  return NextResponse.json({
    userId: user.id,
    allVisits: {
      count: allVisits?.length || 0,
      data: allVisits,
      error: allError,
    },
    myVisits: {
      count: myVisits?.length || 0,
      data: myVisits,
      error: myError,
    },
  });
}
