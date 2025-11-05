import { NextResponse } from 'next/server'
import { getPersonalizedServicesByInterest } from '@/lib/supabase/queries/personalized-services'

export async function GET() {
  try {
    const personalizedCategories = await getPersonalizedServicesByInterest()

    return NextResponse.json({
      success: true,
      categoriesCount: personalizedCategories.length,
      categories: personalizedCategories.map(cat => ({
        category_id: cat.category_id,
        category_name: cat.category_name,
        category_slug: cat.category_slug,
        visit_count: cat.visit_count,
        services_count: cat.services.length,
        services: cat.services.map(s => ({
          id: s.id,
          title: s.title,
          status: s.status
        }))
      }))
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
