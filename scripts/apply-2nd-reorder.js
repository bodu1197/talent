const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function apply2ndReorder() {
  console.log('='.repeat(60))
  console.log('2차 카테고리 재정렬 실행 중...')
  console.log('='.repeat(60))
  console.log('')

  const updates = [
    // IT/프로그래밍
    { slug: 'ai-it', order: 1 },
    { slug: 'web-creation', order: 2 },
    { slug: 'mobile', order: 3 },
    { slug: 'program', order: 4 },
    { slug: 'data', order: 5 },
    { slug: 'web-builder', order: 6 },
    { slug: 'job-position', order: 7 },
    { slug: 'web-maintenance', order: 8 },
    { slug: 'security-quality', order: 9 },
    { slug: 'trend-tech', order: 10 },
    { slug: 'it-etc', order: 11 },

    // 디자인
    { slug: 'logo-branding', order: 1 },
    { slug: 'marketing-design', order: 2 },
    { slug: 'web-mobile-design', order: 3 },
    { slug: 'character-illustration', order: 4 },
    { slug: 'graphic-design', order: 5 },
    { slug: 'package-cover', order: 6 },
    { slug: '3d-design', order: 7 },
    { slug: 'industrial-product-design', order: 8 },
    { slug: 'calligraphy-font', order: 9 },
    { slug: 'fashion-textile', order: 10 },
    { slug: 'space-architecture', order: 11 },
    { slug: 'game-web3', order: 12 },
    { slug: 'design-etc', order: 13 },

    // 마케팅
    { slug: 'performance-ads', order: 1 },
    { slug: 'seo-optimization', order: 2 },
    { slug: 'map-marketing', order: 3 },
    { slug: 'channel-activation', order: 4 },
    { slug: 'ai-marketing', order: 5 },
    { slug: 'viral-sponsorship', order: 6 },
    { slug: 'analysis-strategy', order: 7 },
    { slug: 'industry-purpose', order: 8 },
    { slug: 'global-marketing', order: 9 },
    { slug: 'marketing-etc', order: 10 },

    // 문서/글쓰기
    { slug: 'business-copy', order: 1 },
    { slug: 'content-writing', order: 2 },
    { slug: 'ai-writing', order: 3 },
    { slug: 'proofreading-revision', order: 4 },
    { slug: 'academic-documents', order: 5 },
    { slug: 'creative-writing', order: 6 },
    { slug: 'thesis-research', order: 7 },
    { slug: 'typing-editing', order: 8 },
    { slug: 'writing-etc', order: 9 },

    // 번역/통역
    { slug: 'document-translation', order: 1 },
    { slug: 'media-translation', order: 2 },
    { slug: 'interpretation', order: 3 },
    { slug: 'professional-translation', order: 4 },

    // 영상/사진
    { slug: 'video', order: 1 },
    { slug: 'photography', order: 2 },
    { slug: 'computer-graphics', order: 3 },
    { slug: 'animation', order: 4 },
    { slug: 'ai-content', order: 5 },
    { slug: 'audio', order: 6 },
    { slug: 'entertainer', order: 7 },
    { slug: 'video-photo-etc', order: 8 },

    // 음악/오디오
    { slug: 'music-production', order: 1 },
    { slug: 'audio-production', order: 2 },
    { slug: 'voice-narration', order: 3 },

    // 비즈니스
    { slug: 'consulting', order: 1 },
    { slug: 'business-plan', order: 2 },
    { slug: 'industry-startup', order: 3 },
    { slug: 'startup-consulting', order: 4 },
    { slug: 'corporate-consulting', order: 5 },
    { slug: 'finance-accounting', order: 6 },
    { slug: 'legal-services', order: 7 },
    { slug: 'business-support', order: 8 },
    { slug: 'business-materials', order: 9 },
    { slug: 'business-etc', order: 10 },

    // 세무/법무/노무
    { slug: 'tax-accounting', order: 1 },
    { slug: 'legal-service', order: 2 },
    { slug: 'labor-service', order: 3 },
    { slug: 'intellectual-property', order: 4 },
    { slug: 'tax-legal-labor-etc', order: 5 },

    // 심부름
    { slug: 'delivery-service', order: 1 },

    // 뷰티/패션
    { slug: 'beauty-services', order: 1 },
    { slug: 'fashion-styling', order: 2 },

    // 상담/코칭
    { slug: 'psychological-counseling', order: 1 },

    // 운세/타로
    { slug: 'fortune-telling', order: 1 },
    { slug: 'tarot-reading', order: 2 },

    // 이벤트
    { slug: 'event-planning', order: 1 },
    { slug: 'event-services', order: 2 },

    // 전자책/템플릿
    { slug: 'ebook', order: 1 },
    { slug: 'templates', order: 2 },

    // 주문제작
    { slug: 'print-promotional', order: 1 },
    { slug: 'custom-goods', order: 2 },
    { slug: 'printing-materials', order: 3 },
    { slug: 'custom-order-etc', order: 4 },

    // 직무역량
    { slug: 'office-skills', order: 1 },
    { slug: 'business-skills', order: 2 },

    // 취미/핸드메이드
    { slug: 'handmade-craft', order: 1 },
    { slug: 'gaming', order: 2 },
    { slug: 'gift-items', order: 3 },

    // 취업/입시
    { slug: 'job-preparation', order: 1 },
    { slug: 'admission-prep', order: 2 },
  ]

  let successCount = 0
  let errorCount = 0

  for (const item of updates) {
    const { error } = await supabase
      .from('categories')
      .update({ display_order: item.order })
      .eq('slug', item.slug)
      .eq('level', 2)

    if (error) {
      console.error(`❌ Error updating ${item.slug}:`, error.message)
      errorCount++
    } else {
      successCount++
      if (successCount % 10 === 0) {
        console.log(`✅ ${successCount}개 업데이트 완료...`)
      }
    }
  }

  console.log('')
  console.log('='.repeat(60))
  console.log('✅ 완료!')
  console.log(`📊 성공: ${successCount}개`)
  if (errorCount > 0) {
    console.log(`❌ 실패: ${errorCount}개`)
  }
  console.log('='.repeat(60))

  // 확인
  console.log('')
  console.log('기타 카테고리 위치 확인:')
  console.log('-'.repeat(60))

  const { data: etcCategories } = await supabase
    .from('categories')
    .select('name, slug, display_order, parent_id')
    .eq('level', 2)
    .like('slug', '%etc%')
    .order('display_order')

  for (const cat of etcCategories) {
    const { data: parent } = await supabase
      .from('categories')
      .select('name')
      .eq('id', cat.parent_id)
      .single()

    console.log(`[순서: ${cat.display_order}] ${parent.name} > ${cat.name}`)
  }
}

apply2ndReorder()
