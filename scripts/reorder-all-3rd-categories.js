const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * 중요도 기반 3차 카테고리 정렬 함수
 *
 * 정렬 규칙:
 * 1. "기타" 항목은 항상 맨 마지막
 * 2. AI 관련 키워드 최우선
 * 3. 주요 기술/서비스 키워드 우선
 * 4. 나머지는 실용성/수요 기반 정렬
 */
function calculatePriority(name, slug) {
  // "기타"는 맨 마지막 (999)
  if (name.includes('기타') || slug.includes('etc') || slug.includes('other')) {
    return 999
  }

  // AI 관련은 최우선 (1-10)
  if (name.startsWith('AI ') || name.includes(' AI') || slug.includes('ai-') || slug.startsWith('ai')) {
    return 1
  }

  // 웹 관련 (11-20)
  if (name.includes('웹사이트') || name.includes('홈페이지') || name.includes('웹') ||
      slug.includes('web') || slug.includes('homepage')) {
    return 11
  }

  // 모바일/앱 관련 (21-30)
  if (name.includes('모바일') || name.includes('앱') || name.includes('App') ||
      slug.includes('mobile') || slug.includes('app')) {
    return 21
  }

  // 광고/마케팅 관련 (31-40)
  if (name.includes('광고') || name.includes('마케팅') || name.includes('SEO') ||
      slug.includes('ad') || slug.includes('marketing') || slug.includes('seo')) {
    return 31
  }

  // SNS/소셜미디어 관련 (41-50)
  if (name.includes('인스타') || name.includes('유튜브') || name.includes('SNS') ||
      slug.includes('instagram') || slug.includes('youtube') || slug.includes('sns')) {
    return 41
  }

  // 영상/동영상 관련 (51-60)
  if (name.includes('영상') || name.includes('동영상') || name.includes('비디오') ||
      slug.includes('video')) {
    return 51
  }

  // 디자인 관련 (61-70)
  if (name.includes('디자인') || name.includes('로고') || name.includes('브랜딩') ||
      slug.includes('design') || slug.includes('logo') || slug.includes('branding')) {
    return 61
  }

  // 사진 관련 (71-80)
  if (name.includes('사진') || name.includes('촬영') ||
      slug.includes('photo') || slug.includes('shooting')) {
    return 71
  }

  // 번역 - 주요 언어 우선 (81-90)
  if (name.includes('영어') || slug.includes('english')) return 81
  if (name.includes('중국어') || slug.includes('chinese')) return 82
  if (name.includes('일본어') || slug.includes('japanese')) return 83

  // 전자상거래/쇼핑몰 관련 (91-100)
  if (name.includes('쇼핑몰') || name.includes('커머스') || name.includes('스마트스토어') ||
      slug.includes('shopping') || slug.includes('commerce') || slug.includes('store')) {
    return 91
  }

  // 데이터/분석 관련 (101-110)
  if (name.includes('데이터') || name.includes('분석') ||
      slug.includes('data') || slug.includes('analysis')) {
    return 101
  }

  // 콘텐츠 제작 (111-120)
  if (name.includes('콘텐츠') || name.includes('제작') ||
      slug.includes('content') || slug.includes('production')) {
    return 111
  }

  // 나머지는 중간 우선순위 (500)
  return 500
}

async function reorderAll3rdCategories() {
  console.log('='.repeat(60))
  console.log('모든 3차 카테고리 중요도 기반 재정렬')
  console.log('='.repeat(60))
  console.log('')

  // 1. 모든 카테고리 가져오기
  const { data: allCategories, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, level, display_order')
    .order('level')
    .order('parent_id')
    .order('display_order')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  // 2. 카테고리 맵 생성
  const categoryMap = {}
  allCategories.forEach(cat => {
    categoryMap[cat.id] = cat
  })

  // 3. 3차 카테고리만 필터링
  const thirdLevel = allCategories.filter(cat => cat.level === 3)

  console.log(`📊 총 3차 카테고리: ${thirdLevel.length}개`)
  console.log('')

  // 4. 2차 카테고리별로 그룹화 및 우선순위 계산
  const grouped = {}
  thirdLevel.forEach(cat => {
    const parent = categoryMap[cat.parent_id]
    const key = parent ? parent.id : 'unknown'

    if (!grouped[key]) {
      grouped[key] = {
        parent2Name: parent?.name || '알 수 없음',
        parent2Slug: parent?.slug || 'unknown',
        children: []
      }
    }

    grouped[key].children.push({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      currentOrder: cat.display_order,
      priority: calculatePriority(cat.name, cat.slug)
    })
  })

  // 5. 각 그룹 내에서 우선순위 정렬
  let sqlStatements = []
  let totalUpdates = 0

  Object.keys(grouped).forEach(parentId => {
    const group = grouped[parentId]

    // 우선순위, 그 다음 이름순으로 정렬
    group.children.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      return a.name.localeCompare(b.name, 'ko')
    })

    // SQL 생성
    sqlStatements.push(`\n-- ${group.parent2Name} (${group.parent2Slug})`)
    group.children.forEach((cat, index) => {
      const newOrder = index + 1
      if (newOrder !== cat.currentOrder) {
        sqlStatements.push(
          `UPDATE categories SET display_order = ${newOrder} WHERE id = '${cat.id}'; -- ${cat.name}`
        )
        totalUpdates++
      }
    })
  })

  // 6. SQL 파일 생성
  let sqlContent = `-- ========================================
-- 모든 3차 카테고리 중요도 기반 재정렬
-- 총 ${thirdLevel.length}개 카테고리 중 ${totalUpdates}개 업데이트
--
-- 정렬 규칙:
-- 1. "기타" 항목은 맨 마지막 (999)
-- 2. AI 관련 최우선 (1-10)
-- 3. 웹 관련 (11-20)
-- 4. 모바일/앱 관련 (21-30)
-- 5. 광고/마케팅 관련 (31-40)
-- 6. SNS 관련 (41-50)
-- 7. 영상 관련 (51-60)
-- 8. 디자인 관련 (61-70)
-- 9. 사진 관련 (71-80)
-- 10. 번역 주요언어 (81-90)
-- 11. 쇼핑몰/커머스 (91-100)
-- 12. 데이터/분석 (101-110)
-- 13. 콘텐츠 제작 (111-120)
-- 14. 나머지 (500)
-- ========================================

`

  sqlContent += sqlStatements.join('\n')

  sqlContent += `

-- ========================================
-- 확인 쿼리
-- ========================================

-- 각 2차 카테고리별 처음 5개 확인
WITH ranked AS (
  SELECT
    c2.name as cat2,
    c3.name as cat3,
    c3.display_order,
    ROW_NUMBER() OVER (PARTITION BY c2.id ORDER BY c3.display_order) as rn
  FROM categories c2
  JOIN categories c3 ON c3.parent_id = c2.id
  WHERE c3.level = 3
)
SELECT
  cat2 as "2차_카테고리",
  cat3 as "3차_카테고리",
  display_order as "순서"
FROM ranked
WHERE rn <= 5
ORDER BY cat2, display_order;

-- "기타" 항목이 마지막에 있는지 확인
SELECT
  c2.name as "2차_카테고리",
  c3.name as "3차_카테고리",
  c3.display_order as "순서",
  (
    SELECT MAX(display_order)
    FROM categories
    WHERE parent_id = c3.parent_id AND level = 3
  ) as "최대순서"
FROM categories c2
JOIN categories c3 ON c3.parent_id = c2.id
WHERE c3.level = 3
  AND (c3.name LIKE '%기타%' OR c3.slug LIKE '%etc%' OR c3.slug LIKE '%other%')
ORDER BY c2.name;

-- 총 개수 확인
SELECT
  '업데이트된 3차 카테고리' as "결과",
  COUNT(*) as "개수"
FROM categories
WHERE level = 3;
`

  fs.writeFileSync('scripts/reorder-all-3rd-categories.sql', sqlContent, 'utf-8')

  console.log('✅ 완료!')
  console.log('📄 SQL 파일 생성: scripts/reorder-all-3rd-categories.sql')
  console.log(`📊 총 ${thirdLevel.length}개 카테고리`)
  console.log(`🔄 업데이트 필요: ${totalUpdates}개`)
  console.log('')

  // 7. 상세 리포트 생성
  let reportContent = `# 3차 카테고리 재정렬 상세 리포트

총 3차 카테고리: ${thirdLevel.length}개
업데이트 필요: ${totalUpdates}개

---

`

  Object.keys(grouped).sort().forEach(parentId => {
    const group = grouped[parentId]
    reportContent += `## ${group.parent2Name} (${group.parent2Slug})\n\n`
    reportContent += `**3차 카테고리: ${group.children.length}개**\n\n`
    reportContent += `| 순서 | 이름 | 우선순위 | 변경 |\n`
    reportContent += `|------|------|----------|------|\n`

    group.children.forEach((cat, index) => {
      const newOrder = index + 1
      const changed = newOrder !== cat.currentOrder ? '✅' : ''
      const priorityLabel = cat.priority === 999 ? '기타(999)' :
                           cat.priority === 1 ? 'AI(1)' :
                           cat.priority === 11 ? '웹(11)' :
                           cat.priority === 21 ? '모바일(21)' :
                           cat.priority === 31 ? '광고(31)' :
                           cat.priority === 41 ? 'SNS(41)' :
                           cat.priority === 51 ? '영상(51)' :
                           cat.priority === 61 ? '디자인(61)' :
                           cat.priority === 71 ? '사진(71)' :
                           cat.priority >= 81 && cat.priority <= 90 ? '번역' :
                           cat.priority === 91 ? '쇼핑몰(91)' :
                           cat.priority === 101 ? '데이터(101)' :
                           cat.priority === 111 ? '콘텐츠(111)' :
                           `중간(${cat.priority})`

      reportContent += `| ${newOrder} | ${cat.name} | ${priorityLabel} | ${changed} |\n`
    })

    reportContent += '\n---\n\n'
  })

  fs.writeFileSync('docs/3rd-categories-reorder-report.md', reportContent, 'utf-8')
  console.log('📄 리포트 파일 생성: docs/3rd-categories-reorder-report.md')
  console.log('')
  console.log('='.repeat(60))
}

reorderAll3rdCategories()
