import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST: 찜하기
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { serviceId } = body

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Missing serviceId' },
        { status: 400 }
      )
    }

    console.log(`[Favorites POST] User ${user.id} adding service ${serviceId}`)

    const { error } = await supabase
      .from('service_favorites')
      .insert({
        user_id: user.id,
        service_id: serviceId
      })

    if (error) {
      // 이미 찜한 경우
      if (error.code === '23505') {
        console.log(`[Favorites POST] Service ${serviceId} already favorited`)
        return NextResponse.json(
          { message: 'Already favorited' },
          { status: 200 }
        )
      }

      console.error('Favorite insert error:', error)
      return NextResponse.json(
        { error: 'Failed to add favorite' },
        { status: 500 }
      )
    }

    console.log(`[Favorites POST] Successfully added service ${serviceId} to favorites`)
    return NextResponse.json(
      { message: 'Added to favorites' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Favorite POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: 찜 취소
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Missing serviceId' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('service_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('service_id', serviceId)

    if (error) {
      console.error('Favorite delete error:', error)
      return NextResponse.json(
        { error: 'Failed to remove favorite' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Removed from favorites' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Favorite DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: 찜 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('service_favorites')
      .select(`
        service_id,
        created_at,
        service:services(
          id,
          title,
          description,
          thumbnail_url,
          price,
          delivery_days,
          revision_count,
          rating,
          order_count,
          view_count,
          is_featured,
          status,
          created_at,
          seller:sellers(
            id,
            business_name,
            is_verified
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Favorites fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch favorites' },
        { status: 500 }
      )
    }

    console.log(`[Favorites API] User ${user.id} has ${data?.length || 0} favorites`)
    console.log('[Favorites API] Data:', JSON.stringify(data, null, 2))

    return NextResponse.json({ data }, { status: 200 })

  } catch (error) {
    console.error('Favorites GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
