const fetch = require('node-fetch')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3MTYsImV4cCI6MjA3Njk1NDcxNn0.luCRwnwQVctX3ewuSjhkQJ6veanWqa2NgivpDI7_Gl4'

async function deleteCategories(filter) {
  const response = await fetch(`${supabaseUrl}/rest/v1/categories?${filter}`, {
    method: 'DELETE',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Delete failed: ${response.status} - ${error}`)
  }

  return response
}

async function insertCategories(categories) {
  const response = await fetch(`${supabaseUrl}/rest/v1/categories`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(categories)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Insert failed: ${response.status} - ${error}`)
  }

  return response
}

async function getCategories(filter) {
  const response = await fetch(`${supabaseUrl}/rest/v1/categories?${filter}&select=id`, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Get failed: ${response.status} - ${error}`)
  }

  return response.json()
}

async function updateLifeServiceCategories() {
  console.log('🚀 생활 서비스 카테고리 업데이트 시작...\n')

  try {
    // 1. 기존 3차 카테고리 ID 조회 및 삭제
    console.log('1️⃣ 기존 3차 카테고리 조회 및 삭제 중...')
    const level2Cats = await getCategories('parent_id=eq.life-service')

    if (level2Cats.length > 0) {
      const level2Ids = level2Cats.map(c => c.id).join(',')
      await deleteCategories(`parent_id=in.(${level2Ids})`)
      console.log('   ✅ 3차 카테고리 삭제 완료')
    }

    // 2. 기존 2차 카테고리 삭제
    console.log('2️⃣ 기존 2차 카테고리 삭제 중...')
    await deleteCategories('parent_id=eq.life-service')
    console.log('   ✅ 2차 카테고리 삭제 완료')

    // 3. 기존 1차 카테고리 삭제
    console.log('3️⃣ 기존 1차 카테고리 삭제 중...')
    await deleteCategories('id=eq.life-service')
    console.log('   ✅ 1차 카테고리 삭제 완료\n')

    // 4. 새로운 1차 카테고리 생성
    console.log('4️⃣ 새로운 1차 카테고리 생성 중...')
    await insertCategories([{
      id: 'life-service',
      name: '생활 서비스',
      slug: 'life-service',
      icon: 'home',
      service_count: 16,
      popularity_score: 88,
      description: '일상 생활 편의 서비스',
      parent_id: null,
      level: 1,
      is_ai: false
    }])
    console.log('   ✅ 1차 카테고리 생성 완료')

    // 5. 새로운 2차 카테고리 생성 (4개)
    console.log('5️⃣ 새로운 2차 카테고리 생성 중...')
    const level2Categories = [
      { id: 'professional-cleaning', name: '전문 청소', slug: 'professional-cleaning' },
      { id: 'home-helper', name: '가사/돌봄 도우미', slug: 'home-helper' },
      { id: 'home-repair', name: '집수리', slug: 'home-repair' },
      { id: 'moving-service', name: '이사', slug: 'moving-service' }
    ].map(cat => ({
      ...cat,
      parent_id: 'life-service',
      level: 2,
      is_ai: false
    }))

    await insertCategories(level2Categories)
    console.log('   ✅ 2차 카테고리 4개 생성 완료')

    // 6. 새로운 3차 카테고리 생성 (16개)
    console.log('6️⃣ 새로운 3차 카테고리 생성 중...')

    // 6-1. 전문 청소 하위 (3개)
    const professionalCleaningItems = [
      { id: 'deep-cleaning', name: '입주/이사 청소', slug: 'deep-cleaning', is_popular: true },
      { id: 'office-cleaning', name: '사무실/상가 청소', slug: 'office-cleaning', is_popular: false },
      { id: 'aircon-cleaning', name: '에어컨 세척', slug: 'aircon-cleaning', is_popular: true }
    ].map(cat => ({
      ...cat,
      parent_id: 'professional-cleaning',
      level: 3,
      is_ai: false
    }))

    await insertCategories(professionalCleaningItems)
    console.log('   ✅ 전문 청소 하위 3개 생성 완료')

    // 6-2. 가사/돌봄 도우미 하위 (4개)
    const homeHelperItems = [
      { id: 'housekeeping', name: '가사도우미 (청소/빨래/요리)', slug: 'housekeeping', is_popular: true },
      { id: 'babysitter', name: '아이 돌봄/베이비시터', slug: 'babysitter', is_popular: true },
      { id: 'senior-care', name: '어르신 간병/케어', slug: 'senior-care', is_popular: true },
      { id: 'pet-sitting', name: '반려동물 돌봄/산책', slug: 'pet-sitting', is_popular: true }
    ].map(cat => ({
      ...cat,
      parent_id: 'home-helper',
      level: 3,
      is_ai: false
    }))

    await insertCategories(homeHelperItems)
    console.log('   ✅ 가사/돌봄 도우미 하위 4개 생성 완료')

    // 6-3. 집수리 하위 (5개)
    const homeRepairItems = [
      { id: 'wallpaper-flooring', name: '도배/장판/타일', slug: 'wallpaper-flooring', is_popular: true },
      { id: 'plumbing', name: '수도/배관 수리', slug: 'plumbing', is_popular: false },
      { id: 'screen-repair', name: '방충망 교체/수리', slug: 'screen-repair', is_popular: false },
      { id: 'kitchen-bathroom', name: '싱크대/욕실 수리', slug: 'kitchen-bathroom', is_popular: false },
      { id: 'interior-remodeling', name: '인테리어/리모델링', slug: 'interior-remodeling', is_popular: false }
    ].map(cat => ({
      ...cat,
      parent_id: 'home-repair',
      level: 3,
      is_ai: false
    }))

    await insertCategories(homeRepairItems)
    console.log('   ✅ 집수리 하위 5개 생성 완료')

    // 6-4. 이사 하위 (4개)
    const movingServiceItems = [
      { id: 'moving-full', name: '포장이사', slug: 'moving-full', is_popular: true },
      { id: 'moving-half', name: '반포장이사', slug: 'moving-half', is_popular: true },
      { id: 'small-moving', name: '소형/원룸 이사', slug: 'small-moving', is_popular: false },
      { id: 'disposal-service', name: '폐기물/대형쓰레기 처리', slug: 'disposal-service', is_popular: false }
    ].map(cat => ({
      ...cat,
      parent_id: 'moving-service',
      level: 3,
      is_ai: false
    }))

    await insertCategories(movingServiceItems)
    console.log('   ✅ 이사 하위 4개 생성 완료\n')

    console.log('✨ 생활 서비스 카테고리 업데이트 완료!')
    console.log('📊 총 21개 레코드 생성:')
    console.log('   - 1차 카테고리: 1개')
    console.log('   - 2차 카테고리: 4개')
    console.log('   - 3차 카테고리: 16개')

  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    console.error(error)
    process.exit(1)
  }
}

updateLifeServiceCategories()
