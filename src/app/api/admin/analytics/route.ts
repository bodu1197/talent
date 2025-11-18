import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdminAuth } from '@/lib/admin/auth'

interface AnalyticsQuery {
  period: 'hour' | 'day' | 'month' | 'year'
  startDate?: string
  endDate?: string
  path?: string
}

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const adminCheck = await checkAdminAuth()
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === 'Unauthorized' ? 401 : 403 }
      )
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const period = (searchParams.get('period') || 'day') as AnalyticsQuery['period']
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const path = searchParams.get('path')

    // Validate period
    if (!['hour', 'day', 'month', 'year'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be: hour, day, month, or year' },
        { status: 400 }
      )
    }

    let stats: Array<Record<string, number | string>> = []

    switch (period) {
      case 'hour': {
        // Get hourly stats
        let query = supabase
          .from('visitor_stats_hourly')
          .select('*')
          .order('hour', { ascending: false })
          .limit(168) // Last 7 days of hourly data

        if (startDate) {
          query = query.gte('hour', startDate)
        }
        if (endDate) {
          query = query.lte('hour', endDate)
        }
        if (path) {
          query = query.eq('path', path)
        }

        const { data, error } = await query

        if (error) throw error
        stats = data || []
        break
      }

      case 'day': {
        // Get daily stats
        let query = supabase
          .from('visitor_stats_daily')
          .select('*')
          .order('date', { ascending: false })
          .limit(90) // Last 90 days

        if (startDate) {
          query = query.gte('date', startDate)
        }
        if (endDate) {
          query = query.lte('date', endDate)
        }
        if (path) {
          query = query.eq('path', path)
        }

        const { data, error } = await query

        if (error) throw error
        stats = data || []
        break
      }

      case 'month': {
        // Get monthly stats
        let query = supabase
          .from('visitor_stats_monthly')
          .select('*')
          .order('year', { ascending: false })
          .order('month', { ascending: false })
          .limit(24) // Last 24 months

        if (path) {
          query = query.eq('path', path)
        }

        const { data, error } = await query

        if (error) throw error
        stats = data || []
        break
      }

      case 'year': {
        // Aggregate from monthly stats
        let query = supabase
          .from('visitor_stats_monthly')
          .select('*')
          .order('year', { ascending: false })

        if (path) {
          query = query.eq('path', path)
        }

        const { data, error } = await query

        if (error) throw error

        // Group by year
        const yearlyStats = new Map<number, {
          year: number
          total_views: number
          unique_visitors: number
          desktop_views: number
          mobile_views: number
          tablet_views: number
          bot_views: number
        }>()

        data?.forEach((row: {
          year: number
          total_views: number
          unique_visitors: number
          desktop_views: number
          mobile_views: number
          tablet_views: number
          bot_views: number
        }) => {
          const existing = yearlyStats.get(row.year) || {
            year: row.year,
            total_views: 0,
            unique_visitors: 0,
            desktop_views: 0,
            mobile_views: 0,
            tablet_views: 0,
            bot_views: 0
          }

          existing.total_views += row.total_views
          existing.unique_visitors += row.unique_visitors
          existing.desktop_views += row.desktop_views
          existing.mobile_views += row.mobile_views
          existing.tablet_views += row.tablet_views
          existing.bot_views += row.bot_views

          yearlyStats.set(row.year, existing)
        })

        stats = Array.from(yearlyStats.values())
        break
      }
    }

    // Get summary stats
    const totalViews = stats.reduce((sum: number, item: Record<string, number | string>) => sum + (Number(item.total_views) || 0), 0)
    const totalUniqueVisitors = stats.reduce((sum: number, item: Record<string, number | string>) => sum + (Number(item.unique_visitors) || 0), 0)

    return NextResponse.json({
      period,
      startDate,
      endDate,
      path,
      summary: {
        totalViews,
        totalUniqueVisitors,
        avgViewsPerDay: stats.length > 0 ? Math.round(totalViews / stats.length) : 0
      },
      data: stats
    })

  } catch (error) {
    console.error('Admin analytics error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

// Get top pages
export async function POST(request: NextRequest) {
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
    const { period = 'day', limit = 10 } = body

    let topPages: Array<{ path: string; views: number }> = []

    if (period === 'day') {
      const { data, error } = await supabase
        .from('visitor_stats_daily')
        .select('path, total_views')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('total_views', { ascending: false })
        .limit(limit)

      if (error) throw error

      topPages = data?.map((row: { path: string; total_views: number }) => ({
        path: row.path,
        views: row.total_views
      })) || []
    }

    return NextResponse.json({ topPages })

  } catch (error) {
    console.error('Top pages error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json(
      { error: 'Failed to fetch top pages' },
      { status: 500 }
    )
  }
}
