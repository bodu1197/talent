import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// GET: 카테고리 서비스 타입 조회
// 특정 카테고리 또는 전체 카테고리의 service_type 반환
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const serviceType = searchParams.get('service_type'); // 필터용: 'online', 'offline', 'both'

    // 기본 쿼리 - 1차 카테고리만 (parent_id IS NULL)
    let query = supabase
      .from('categories')
      .select('id, slug, name, service_type, icon')
      .is('parent_id', null)
      .order('name');

    // 필터 적용
    if (slug) {
      query = query.eq('slug', slug);
    }

    if (id) {
      query = query.eq('id', id);
    }

    if (serviceType) {
      if (!['online', 'offline', 'both'].includes(serviceType)) {
        return NextResponse.json(
          {
            error: 'Invalid service_type. Must be one of: online, offline, both',
          },
          { status: 400 }
        );
      }
      query = query.eq('service_type', serviceType);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Categories service-type query error:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch categories',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // 단일 조회 (slug 또는 id로 조회 시)
    if ((slug || id) && data?.length === 1) {
      return NextResponse.json({ data: data[0] });
    }

    // 목록 조회
    return NextResponse.json({
      data: data || [],
      meta: {
        total: data?.length || 0,
        service_type_filter: serviceType,
      },
    });
  } catch (error) {
    logger.error('Categories service-type GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
