// 카테고리 데이터를 SQL로 변환하는 스크립트
const fs = require('fs');
const path = require('path');

// categories-full.ts에서 FULL_CATEGORIES 배열을 추출
const categoriesFilePath = path.join(__dirname, '../src/data/categories-full.ts');
const outputFilePath = path.join(__dirname, '../supabase/migrations/20251026040000_insert_all_categories.sql');

// TypeScript 파일을 읽고 평가
const categoriesContent = fs.readFileSync(categoriesFilePath, 'utf-8');

// export 제거 후 require로 로드
const tempFilePath = path.join(__dirname, '../.temp-categories.js');

// TypeScript를 JavaScript로 변환 (간단한 변환)
let jsContent = categoriesContent
  .replace(/export\s+/g, '') // export 제거
  .replace(/interface\s+\w+\s*{[^}]*}/g, '') // interface 제거
  .replace(/:\s*CategoryItem\[\]/g, '') // 타입 어노테이션 제거
  .replace(/:\s*CategoryItem/g, '') // 타입 어노테이션 제거
  .replace(/:\s*string/g, '') // 타입 어노테이션 제거
  .replace(/:\s*boolean/g, '') // 타입 어노테이션 제거
  .replace(/:\s*number/g, '') // 타입 어노테이션 제거
  .replace(/\?:/g, ':'); // optional 타입 제거

jsContent += '\nmodule.exports = { FULL_CATEGORIES };';

// 임시 JS 파일 생성
fs.writeFileSync(tempFilePath, jsContent, 'utf-8');

// 모듈 로드
let categories;
try {
  const { FULL_CATEGORIES } = require(tempFilePath);
  categories = FULL_CATEGORIES;
  // 임시 파일 삭제
  fs.unlinkSync(tempFilePath);
} catch (e) {
  console.error('카테고리 데이터 로드 실패:', e.message);
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }
  process.exit(1);
}

// SQL 생성
let sql = `-- =====================================================
-- 전체 카테고리 데이터 삽입
-- 생성일: ${new Date().toISOString()}
-- =====================================================

-- 기존 카테고리 데이터 삭제 (초기화)
TRUNCATE TABLE public.categories CASCADE;

`;

// Level별로 정렬하여 삽입 (parent_id 참조를 위해)
const level1Categories = [];
const level2Categories = [];
const level3Categories = [];

// 재귀적으로 카테고리 수집
function collectCategories(cats, level = 1, parentSlug = null) {
  cats.forEach(cat => {
    const categoryData = {
      id: cat.id || cat.slug,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || null,
      description: cat.description || null,
      keywords: cat.keywords || [],
      parent_slug: parentSlug,
      service_count: cat.service_count || 0,
      is_ai_category: cat.is_ai || false,
      is_featured: cat.is_popular || false,
      level: level
    };

    if (level === 1) {
      level1Categories.push(categoryData);
    } else if (level === 2) {
      level2Categories.push(categoryData);
    } else if (level === 3) {
      level3Categories.push(categoryData);
    }

    if (cat.children && cat.children.length > 0) {
      collectCategories(cat.children, level + 1, cat.slug);
    }
  });
}

collectCategories(categories);

console.log(`Level 1: ${level1Categories.length}개`);
console.log(`Level 2: ${level2Categories.length}개`);
console.log(`Level 3: ${level3Categories.length}개`);

// SQL INSERT 문 생성
function generateInsert(categories, level) {
  if (categories.length === 0) return '';

  let sql = `\n-- Level ${level} 카테고리\n`;

  categories.forEach((cat, index) => {
    const name = cat.name.replace(/'/g, "''");
    const description = cat.description ? cat.description.replace(/'/g, "''") : null;
    const keywords = cat.keywords.length > 0 ? `ARRAY['${cat.keywords.join("','")}']` : 'ARRAY[]::TEXT[]';
    const parentId = cat.parent_slug ? `(SELECT id FROM public.categories WHERE slug = '${cat.parent_slug}')` : 'NULL';

    sql += `INSERT INTO public.categories (name, slug, parent_id, level, icon, description, keywords, service_count, is_ai_category, is_featured, is_active)\n`;
    sql += `VALUES ('${name}', '${cat.slug}', ${parentId}, ${level}, ${cat.icon ? `'${cat.icon}'` : 'NULL'}, ${description ? `'${description}'` : 'NULL'}, ${keywords}, ${cat.service_count}, ${cat.is_ai_category}, ${cat.is_featured}, true);\n`;

    if (index < categories.length - 1) sql += '\n';
  });

  return sql;
}

sql += generateInsert(level1Categories, 1);
sql += generateInsert(level2Categories, 2);
sql += generateInsert(level3Categories, 3);

sql += `\n-- =====================================================
-- 카테고리 삽입 완료
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ 전체 카테고리 데이터 삽입 완료!';
  RAISE NOTICE 'Level 1: ${level1Categories.length}개';
  RAISE NOTICE 'Level 2: ${level2Categories.length}개';
  RAISE NOTICE 'Level 3: ${level3Categories.length}개';
  RAISE NOTICE '총 ${level1Categories.length + level2Categories.length + level3Categories.length}개 카테고리';
END $$;

-- 스키마 버전 업데이트
INSERT INTO public.schema_migrations (version) VALUES ('006_insert_all_categories')
ON CONFLICT (version) DO NOTHING;
`;

// 파일 저장
fs.writeFileSync(outputFilePath, sql, 'utf-8');
console.log(`\n✅ SQL 파일 생성 완료: ${outputFilePath}`);
console.log(`총 ${level1Categories.length + level2Categories.length + level3Categories.length}개 카테고리`);
