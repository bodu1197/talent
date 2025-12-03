import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// GET: 현재 판매자의 위치 정보 조회
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

    // seller 조회
    const { data: seller, error } = await supabase
      .from('sellers')
      .select(
        'id, location_address, location_latitude, location_longitude, location_region, location_updated_at'
      )
      .eq('user_id', user.id)
      .single();

    if (error || !seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        seller_id: seller.id,
        address: seller.location_address,
        latitude: seller.location_latitude,
        longitude: seller.location_longitude,
        region: seller.location_region,
        updated_at: seller.location_updated_at,
      },
    });
  } catch (error) {
    logger.error('Seller location GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: 판매자 위치 정보 저장/업데이트
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
    const { address, latitude, longitude, region } = body;

    // 필수 필드 검증
    if (!address || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields: address, latitude, longitude',
        },
        { status: 400 }
      );
    }

    // 위도/경도 유효성 검사
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: 'Coordinates out of range' }, { status: 400 });
    }

    // seller 소유권 확인 및 업데이트
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (sellerError || !seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // 위치 정보 업데이트
    const { data, error } = await supabase
      .from('sellers')
      .update({
        location_address: address,
        location_latitude: lat,
        location_longitude: lng,
        location_region: region || null,
        location_updated_at: new Date().toISOString(),
      })
      .eq('id', seller.id)
      .select(
        'id, location_address, location_latitude, location_longitude, location_region, location_updated_at'
      )
      .single();

    if (error) {
      logger.error('Seller location update error:', error);
      return NextResponse.json(
        {
          error: 'Failed to update location',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Location updated successfully',
      data: {
        seller_id: data.id,
        address: data.location_address,
        latitude: data.location_latitude,
        longitude: data.location_longitude,
        region: data.location_region,
        updated_at: data.location_updated_at,
      },
    });
  } catch (error) {
    logger.error('Seller location POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: 판매자 위치 정보 삭제
export async function DELETE(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (sellerError || !seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // 위치 정보 삭제 (null로 설정)
    const { error } = await supabase
      .from('sellers')
      .update({
        location_address: null,
        location_latitude: null,
        location_longitude: null,
        location_region: null,
        location_updated_at: null,
      })
      .eq('id', seller.id);

    if (error) {
      logger.error('Seller location delete error:', error);
      return NextResponse.json(
        {
          error: 'Failed to delete location',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Location deleted successfully' });
  } catch (error) {
    logger.error('Seller location DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
