import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/api/auth';
import { verifyPortfolioOwnership } from '@/lib/api/ownership';
import { createClient } from '@/lib/supabase/server';
import { deleteMultipleImagesServer } from '@/lib/storage-utils-server';

// DELETE: 포트폴리오 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!user || !supabase) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const { id: portfolioId } = await params;

    // 포트폴리오 소유권 확인 및 이미지 URL 조회
    const { data: portfolio, error: fetchError } = await supabase
      .from('seller_portfolio')
      .select('id, seller_id, thumbnail_url, image_urls')
      .eq('id', portfolioId)
      .single();

    if (fetchError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // 판매자가 해당 유저 소유인지 확인
    const { data: seller } = await supabase
      .from('sellers')
      .select('user_id')
      .eq('id', portfolio.seller_id)
      .single();

    if (!seller || seller.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 포트폴리오 이미지들 삭제 (thumbnail + image_urls)
    const allImageUrls = [portfolio.thumbnail_url, ...(portfolio.image_urls || [])];
    await deleteMultipleImagesServer(allImageUrls, 'portfolios');

    // 포트폴리오 삭제
    const { error } = await supabase.from('seller_portfolio').delete().eq('id', portfolioId);

    if (error) {
      logger.error('Portfolio delete error:', error);
      return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Portfolio DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: 포트폴리오 수정
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!user || !supabase) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const { id: portfolioId } = await params;
    const body = await request.json();

    // 포트폴리오 소유권 확인
    const ownershipResult = await verifyPortfolioOwnership(supabase, portfolioId, user.id);
    if (!ownershipResult.success) {
      return ownershipResult.error!;
    }

    // 포트폴리오 업데이트
    const { data: updatedPortfolio, error } = await supabase
      .from('seller_portfolio')
      .update({
        title: body.title,
        description: body.description,
        category_id: body.category_id || null,
        thumbnail_url: body.thumbnail_url || null,
        image_urls: body.image_urls || [],
        project_url: body.project_url || null,
        youtube_url: body.youtube_url || null,
        service_id: null, // 기존 필드는 null로 설정
        tags: body.tags || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', portfolioId)
      .select()
      .single();

    if (error) {
      logger.error('Portfolio update error:', error);
      return NextResponse.json(
        { error: 'Failed to update portfolio', details: error.message },
        { status: 500 }
      );
    }

    // 서비스 연결 업데이트 (다중)
    // 1. 기존 연결 모두 삭제
    await supabase.from('portfolio_services').delete().eq('portfolio_id', portfolioId);

    // 2. 새로운 연결 추가
    if (body.service_ids && Array.isArray(body.service_ids) && body.service_ids.length > 0) {
      const portfolioServiceLinks = body.service_ids.map((service_id: string) => ({
        portfolio_id: portfolioId,
        service_id,
      }));

      const { error: linkError } = await supabase
        .from('portfolio_services')
        .insert(portfolioServiceLinks);

      if (linkError) {
        logger.error('Portfolio-service link error:', linkError);
        // 연결 실패해도 포트폴리오는 업데이트되었으므로 경고만 로그
      }
    }

    return NextResponse.json({ data: updatedPortfolio }, { status: 200 });
  } catch (error) {
    logger.error('Portfolio PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: 포트폴리오 상세 조회
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id: portfolioId } = await params;

    const { data: portfolio, error } = await supabase
      .from('seller_portfolio')
      .select('*')
      .eq('id', portfolioId)
      .single();

    if (error || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    return NextResponse.json({ data: portfolio }, { status: 200 });
  } catch (error) {
    logger.error('Portfolio GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
