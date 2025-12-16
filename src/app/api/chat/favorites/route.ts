import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireLogin } from '@/lib/api/auth';

// 즐겨찾기 토글
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireLogin();
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!user || !supabase) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const body = await request.json();
    const { room_id } = body;

    if (!room_id) {
      return NextResponse.json({ error: 'room_id is required' }, { status: 400 });
    }

    // 기존 즐겨찾기 확인
    const { data: existingFavorite } = await supabase
      .from('chat_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('room_id', room_id)
      .maybeSingle();

    if (existingFavorite) {
      // 즐겨찾기 제거
      const { error } = await supabase
        .from('chat_favorites')
        .delete()
        .eq('id', existingFavorite.id);

      if (error) {
        logger.error('Favorite removal error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ is_favorite: false });
    } else {
      // 즐겨찾기 추가
      const { error } = await supabase.from('chat_favorites').insert({ user_id: user.id, room_id });

      if (error) {
        logger.error('Favorite addition error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ is_favorite: true });
    }
  } catch (error) {
    logger.error('Favorite toggle API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
