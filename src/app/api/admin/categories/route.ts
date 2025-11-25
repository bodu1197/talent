import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAdminAuth } from '@/lib/admin/auth';
import { logger } from '@/lib/logger';

// GET - 카테고리 목록 조회
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = supabase.from('categories').select('*').order('display_order', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: categories, error } = await query;

    if (error) throw error;

    return NextResponse.json({ categories });
  } catch (error) {
    logger.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST - 새 카테고리 생성
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = await createClient();
    const body = await request.json();

    const { name, slug, parent_id, display_order, is_active } = body;

    // 필수 필드 검증
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // slug 중복 검사
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        parent_id: parent_id || null,
        display_order: display_order ?? 0,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// PATCH - 카테고리 수정
export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = await createClient();
    const body = await request.json();

    const { id, name, slug, parent_id, display_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // slug 중복 검사 (본인 제외)
    if (slug) {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (parent_id !== undefined) updateData.parent_id = parent_id;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ category });
  } catch (error) {
    logger.error('Failed to update category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE - 카테고리 삭제
export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // 하위 카테고리 확인
    const { data: children } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', id)
      .limit(1);

    if (children && children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories' },
        { status: 400 }
      );
    }

    // 서비스 연결 확인
    const { data: services } = await supabase
      .from('service_categories')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (services && services.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated services' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
