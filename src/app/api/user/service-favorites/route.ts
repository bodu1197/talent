import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// POST: 찜하기
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId } = body;

    if (!serviceId) {
      return NextResponse.json({ error: 'Missing serviceId' }, { status: 400 });
    }

    logger.debug('Adding service to favorites', { userId: user.id, serviceId });

    const { error } = await supabase.from('service_favorites').insert({
      user_id: user.id,
      service_id: serviceId,
    });

    if (error) {
      // 이미 찜한 경우
      if (error.code === '23505') {
        logger.debug('Service already favorited', { serviceId });
        return NextResponse.json({ message: 'Already favorited' }, { status: 200 });
      }

      logger.error('Failed to insert favorite', error);
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }

    // wishlist_count 업데이트
    const { data: service } = await supabase
      .from('services')
      .select('wishlist_count')
      .eq('id', serviceId)
      .single();

    if (service) {
      await supabase
        .from('services')
        .update({ wishlist_count: (service.wishlist_count || 0) + 1 })
        .eq('id', serviceId);
    }

    logger.info('Service added to favorites', { userId: user.id, serviceId });
    return NextResponse.json({ message: 'Added to favorites' }, { status: 201 });
  } catch (error) {
    logger.error('Favorite POST error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: 찜 취소
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
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json({ error: 'Missing serviceId' }, { status: 400 });
    }

    const { error } = await supabase
      .from('service_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('service_id', serviceId);

    if (error) {
      logger.error('Failed to delete favorite', error);
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
    }

    // wishlist_count 업데이트
    const { data: service } = await supabase
      .from('services')
      .select('wishlist_count')
      .eq('id', serviceId)
      .single();

    if (service && service.wishlist_count > 0) {
      await supabase
        .from('services')
        .update({ wishlist_count: service.wishlist_count - 1 })
        .eq('id', serviceId);
    }

    logger.info('Service removed from favorites', { userId: user.id, serviceId });
    return NextResponse.json({ message: 'Removed from favorites' }, { status: 200 });
  } catch (error) {
    logger.error('Favorite DELETE error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: 찜 목록 조회
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 한 번의 쿼리로 favorites와 services join
    const { data, error } = await supabase
      .from('service_favorites')
      .select(
        `
        service_id,
        created_at,
        service:services!inner(
          *,
          seller:seller_profiles(
            id,
            business_name,
            display_name,
            profile_image,
            is_verified
          )
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch favorites', error);
      return NextResponse.json(
        { error: 'Failed to fetch favorites', details: error.message },
        { status: 500 }
      );
    }

    logger.debug('Favorites fetched', { userId: user.id, count: data?.length || 0 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    logger.error('Favorites GET error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
