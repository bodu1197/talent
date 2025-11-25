import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    const { data: portfolio } = await supabase
      .from('seller_portfolio')
      .select('seller_id')
      .eq('id', itemId)
      .single();

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('id', portfolio.seller_id)
      .eq('user_id', user.id)
      .single();

    if (!seller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabase.from('seller_portfolio').delete().eq('id', itemId);

    if (error) {
      logger.error('포트폴리오 삭제 실패:', error);
      return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Portfolio item deleted successfully' }, { status: 200 });
  } catch (error) {
    logger.error('포트폴리오 삭제 오류:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
