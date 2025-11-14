import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdminAuth } from '@/lib/admin/auth'

// GET - 무통장 입금 목록 조회 (필터, 검색, 통계 포함)
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth()
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      )
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // 필터 파라미터
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    // 기본 쿼리 - seller 테이블을 통해 올바르게 조인
    let query = supabase
      .from('advertising_payments')
      .select(`
        *,
        subscription:advertising_subscriptions(
          id,
          service:services(title)
        ),
        seller:sellers!advertising_payments_seller_id_fkey(
          id,
          user:users(email, name)
        ),
        confirmed_by_admin:admins!advertising_payments_confirmed_by_fkey(
          id,
          user:users!admins_user_id_fkey(name)
        )
      `, { count: 'exact' })
      .eq('payment_method', 'bank_transfer')

    // 필터 적용
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    if (minAmount) {
      query = query.gte('amount', parseInt(minAmount))
    }

    if (maxAmount) {
      query = query.lte('amount', parseInt(maxAmount))
    }

    // 정렬 및 페이지네이션
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    query = query
      .order('created_at', { ascending: false })
      .range(from, to)

    const { data: payments, error: paymentsError, count } = await query

    if (paymentsError) throw paymentsError

    // 검색어 필터링 (클라이언트 사이드에서 처리)
    let filteredPayments = payments || []
    if (search) {
      const searchLower = search.toLowerCase()
      filteredPayments = filteredPayments.filter(p => {
        const sellerName = p.seller?.user?.name?.toLowerCase() || ''
        const sellerEmail = p.seller?.user?.email?.toLowerCase() || ''
        const depositorName = p.depositor_name?.toLowerCase() || ''
        const serviceTitle = p.subscription?.service?.title?.toLowerCase() || ''

        return sellerName.includes(searchLower) ||
               sellerEmail.includes(searchLower) ||
               depositorName.includes(searchLower) ||
               serviceTitle.includes(searchLower)
      })
    }

    // 통계 계산
    const { data: allPayments } = await supabase
      .from('advertising_payments')
      .select('status, amount')
      .eq('payment_method', 'bank_transfer')

    const stats = {
      pending: {
        count: allPayments?.filter(p => p.status === 'pending').length || 0,
        total: allPayments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0
      },
      confirmed: {
        count: allPayments?.filter(p => p.status === 'confirmed').length || 0,
        total: allPayments?.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + p.amount, 0) || 0
      },
      completed: {
        count: allPayments?.filter(p => p.status === 'completed').length || 0,
        total: allPayments?.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) || 0
      },
      cancelled: {
        count: allPayments?.filter(p => p.status === 'cancelled').length || 0,
        total: allPayments?.filter(p => p.status === 'cancelled').reduce((sum, p) => sum + p.amount, 0) || 0
      },
      all: {
        count: allPayments?.length || 0,
        total: allPayments?.reduce((sum, p) => sum + p.amount, 0) || 0
      }
    }

    return NextResponse.json({
      payments: filteredPayments,
      stats,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    console.error('Failed to fetch payments:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// PATCH - 무통장 입금 상태 업데이트 (단일 또는 일괄)
export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAuth()
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      )
    }

    const supabase = await createClient()
    const body = await request.json()
    const { paymentIds, status, adminMemo } = body

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return NextResponse.json(
        { error: 'Payment IDs are required' },
        { status: 400 }
      )
    }

    // 관리자 정보 조회
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 403 }
      )
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (status) {
      updateData.status = status

      if (status === 'confirmed' || status === 'completed') {
        updateData.confirmed_at = new Date().toISOString()
        updateData.confirmed_by = admin.id
      }
    }

    if (adminMemo !== undefined) {
      updateData.admin_memo = adminMemo
    }

    const { data: updatedPayments, error } = await supabase
      .from('advertising_payments')
      .update(updateData)
      .in('id', paymentIds)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      updatedCount: updatedPayments?.length || 0
    })
  } catch (error) {
    console.error('Failed to update payments:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json(
      { error: 'Failed to update payments' },
      { status: 500 }
    )
  }
}
