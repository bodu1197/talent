import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 파일 이름 생성 (타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomString}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('portfolio')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      logger.error('Storage upload error:', {
        message: error.message,
        name: error.name,
        cause: error.cause
      })
      return NextResponse.json({
        error: 'Upload failed',
        details: error.message
      }, { status: 500 })
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from('portfolio')
      .getPublicUrl(filePath)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filePath
    }, { status: 200 })

  } catch (error) {
    logger.error('Upload API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
