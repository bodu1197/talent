import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { logger } from '@/lib/logger';

// POST: 포트폴리오 등록
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult.error;

    const { supabase, user } = authResult;
    if (!supabase || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const {
      seller_id,
      title,
      description,
      category_id,
      thumbnail_url,
      image_urls,
      project_url,
      youtube_url,
      service_ids,
      tags,
    } = body;

    if (!seller_id || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // seller 소유권 확인
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('id', seller_id)
      .eq('user_id', user.id)
      .single();

    if (!seller) {
      return NextResponse.json({ error: 'Unauthorized seller' }, { status: 403 });
    }

    // 포트폴리오 생성
    const { data, error } = await supabase
      .from('seller_portfolio')
      .insert({
        seller_id,
        title,
        description,
        category_id: category_id || null,
        thumbnail_url: thumbnail_url || null,
        image_urls: image_urls || [],
        project_url: project_url || null,
        youtube_url: youtube_url || null,
        service_id: null, // 기존 필드는 null로 설정
        tags: tags || [],
      })
      .select()
      .single();

    if (error) {
      logger.error('Portfolio creation error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        {
          error: 'Failed to create portfolio',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // 서비스 연결 (다중)
    if (service_ids && Array.isArray(service_ids) && service_ids.length > 0) {
      const portfolioServiceLinks = service_ids.map((service_id) => ({
        portfolio_id: data.id,
        service_id,
      }));

      const { error: linkError } = await supabase
        .from('portfolio_services')
        .insert(portfolioServiceLinks);

      if (linkError) {
        logger.error('Portfolio-service link error:', linkError);
        // 연결 실패해도 포트폴리오는 생성되었으므로 경고만 로그
      }
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    logger.error('Portfolio POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
