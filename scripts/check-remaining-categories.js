const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkCategories() {
  console.log('현재 남아있는 1단계 카테고리 확인 중...\n')

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, display_order, is_active')
    .is('parent_id', null)
    .order('display_order')
    .order('name')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('='.repeat(80))
  console.log('남아있는 1단계 카테고리 목록:')
  console.log('='.repeat(80))
  console.log('')

  data.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.name} (${cat.slug}) - display_order: ${cat.display_order}, active: ${cat.is_active}`)
  })

  console.log('')
  console.log('='.repeat(80))
  console.log(`총 개수: ${data.length}개`)
  console.log('='.repeat(80))
  console.log('')
  console.log('예상 카테고리 (22개):')
  console.log('1. AI 서비스')
  console.log('2. IT/프로그래밍')
  console.log('3. 디자인')
  console.log('4. 영상/사진/음향')
  console.log('5. 마케팅')
  console.log('6. 번역/통역')
  console.log('7. 문서/글작성')
  console.log('8. 비즈니스 컨설팅')
  console.log('9. 데이터')
  console.log('10. 교육/레슨')
  console.log('11. 건강/운동')
  console.log('12. 뷰티/미용')
  console.log('13. 요리/음식')
  console.log('14. 반려동물')
  console.log('15. 청소/집안일')
  console.log('16. 이사/운반')
  console.log('17. 수리/설치')
  console.log('18. 심부름')
  console.log('19. 법률/세무')
  console.log('20. 행사/이벤트')
  console.log('21. 라이프 스타일 (삭제 예정)')
  console.log('22. 기타')
}

checkCategories()
