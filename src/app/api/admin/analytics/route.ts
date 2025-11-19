import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdminAuth } from '@/lib/admin/auth'

interface AnalyticsQuery {
  period: 'hour' | 'day' | 'month' | 'year'
  startDate?: string
  endDate?: string
  path?: string
}

interface StatsQueryConfig {
  table: string
  orderColumn: string
  limit: number
  dateColumn?: string
}

interface YearlyStatsRow {
  year: number
  total_views: number
  unique_visitors: number
  desktop_views: number
  mobile_views: number
  tablet_views: number
  bot_views: number
}

// Helper: Get query configuration for each period
function getQueryConfig(period: AnalyticsQuery['period']): StatsQueryConfig {
  const configs: Record<AnalyticsQuery['period'], StatsQueryConfig> = {
    hour: { table: 'visitor_stats_hourly', orderColumn: 'hour', limit: 168, dateColumn: 'hour' },
    day: { table: 'visitor_stats_daily', orderColumn: 'date', limit: 90, dateColumn: 'date' },
    month: { table: 'visitor_stats_monthly', orderColumn: 'year', limit: 24 },
    year: { table: 'visitor_stats_monthly', orderColumn: 'year', limit: 9999 }
  }
  return configs[period]
}

// Helper: Apply date filters to query
function applyDateFilters(
  query: any,
  startDate: string | null,
  endDate: string | null,
  dateColumn: string
) {
  let filteredQuery = query
  if (startDate) {
    filteredQuery = filteredQuery.gte(dateColumn, startDate)
  }
  if (endDate) {
    filteredQuery = filteredQuery.lte(dateColumn, endDate)
  }
  return filteredQuery
}

// Helper: Apply path filter to query
function applyPathFilter(query: any, path: string | null) {
  return path ? query.eq('path', path) : query
}

// Helper: Aggregate monthly data into yearly stats
function aggregateYearlyStats(data: YearlyStatsRow[] | null): YearlyStatsRow[] {
  if (!data) return []

  const yearlyStats = new Map<number, YearlyStatsRow>()

  data.forEach((row) => {
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

  return Array.from(yearlyStats.values())
}

// Helper: Calculate summary statistics
function calculateSummary(stats: Array<Record<string, number | string>>) {
  const totalViews = stats.reduce((sum, item) => sum + (Number(item.total_views) || 0), 0)
  const totalUniqueVisitors = stats.reduce((sum, item) => sum + (Number(item.unique_visitors) || 0), 0)

  return {
    totalViews,
    totalUniqueVisitors,
    avgViewsPerDay: stats.length > 0 ? Math.round(totalViews / stats.length) : 0
  }
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
    const config = getQueryConfig(period)

    // Build base query
    let query = supabase
      .from(config.table)
      .select('*')
      .order(config.orderColumn, { ascending: false })
      .limit(config.limit)

    // Add month ordering for monthly stats
    if (period === 'month') {
      query = query.order('month', { ascending: false })
    }

    // Apply filters based on period
    if (config.dateColumn) {
      query = applyDateFilters(query, startDate, endDate, config.dateColumn)
    }
    query = applyPathFilter(query, path)

    // Execute query
    const { data, error } = await query
    if (error) throw error

    // Handle year aggregation or use data directly
    stats = period === 'year' ? aggregateYearlyStats(data as YearlyStatsRow[]) : (data || [])

    // Calculate summary
    const summary = calculateSummary(stats)

    return NextResponse.json({
      period,
      startDate,
      endDate,
      path,
      summary,
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
