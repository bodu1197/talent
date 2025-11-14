import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdminAuth } from '@/lib/admin/auth'

interface SubscriptionWithDetails {
  id: string
  seller_id: string
  service_id: string
  monthly_price: number
  status: string
  payment_method: string
  next_billing_date: string
  last_billed_at: string | null
  started_at: string
  cancelled_at: string | null
  expires_at: string | null
  total_impressions: number
  total_clicks: number
  total_paid: number
  created_at: string
  seller?: {
    email: string
    full_name: string | null
  }
  service?: {
    title: string
  }
}

// GET - 광고 구독 목록 조회
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

    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('paymentMethod')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? true : false

    // 광고 구독 목록 조회
    let query = supabase
      .from('advertising_subscriptions')
      .select(`
        *,
        seller:sellers!advertising_subscriptions_seller_id_fkey(
          id,
          user:users(email, full_name)
        ),
        service:services!advertising_subscriptions_service_id_fkey(title)
      `)

    // 필터 적용
    if (status) {
      query = query.eq('status', status)
    }
    if (paymentMethod) {
      query = query.eq('payment_method', paymentMethod)
    }

    // 정렬
    query = query.order(sortBy, { ascending: sortOrder })

    const { data: subscriptions, error: subsError } = await query

    if (subsError) throw subsError

    // 통계 계산
    const { data: stats } = await supabase
      .from('advertising_subscriptions')
      .select('status, payment_method, monthly_price, total_paid')

    const summary = {
      totalSubscriptions: stats?.length || 0,
      activeSubscriptions: stats?.filter(s => s.status === 'active').length || 0,
      pendingPayments: stats?.filter(s => s.status === 'pending_payment').length || 0,
      cancelledSubscriptions: stats?.filter(s => s.status === 'cancelled').length || 0,
      totalRevenue: stats?.reduce((sum, s) => sum + (s.total_paid || 0), 0) || 0,
      monthlyRevenue: stats?.filter(s => s.status === 'active').reduce((sum, s) => sum + s.monthly_price, 0) || 0,
    }

    return NextResponse.json({
      subscriptions,
      summary,
    })
  } catch (error) {
    console.error('Failed to fetch advertising subscriptions:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json(
      { error: 'Failed to fetch advertising subscriptions' },
      { status: 500 }
    )
  }
}

// PATCH - 광고 상태 업데이트
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
    const { subscriptionId, status, adminMemo } = body

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (status) {
      updateData.status = status

      if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString()
      } else if (status === 'active') {
        updateData.cancelled_at = null
      }
    }

    const { data: subscription, error } = await supabase
      .from('advertising_subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Failed to update subscription:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

// DELETE - 광고 구독 삭제
export async function DELETE(request: NextRequest) {
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
    const subscriptionId = searchParams.get('id')

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    // 취소 상태로 변경 (실제 삭제하지 않음)
    const { error } = await supabase
      .from('advertising_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to cancel subscription:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
