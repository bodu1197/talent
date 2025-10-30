import * as fs from 'fs';
import * as path from 'path';

// CSV 파일 읽기
const csvPath = path.join(__dirname, '..', 'categories_rows.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// categories-full.ts 파일 읽기
const categoriesFullPath = path.join(__dirname, '..', 'src', 'data', 'categories-full.ts');
const categoriesFullContent = fs.readFileSync(categoriesFullPath, 'utf-8');

// CSV에서 slug 추출
const csvLines = csvContent.split('\n');
const csvSlugs = new Set<string>();
const csvData: Array<{ id: string; name: string; slug: string; parent_id: string }> = [];

// 헤더 스킵하고 데이터 파싱
for (let i = 1; i < csvLines.length; i++) {
  const line = csvLines[i].trim();
  if (!line) continue;

  const parts = line.split(',');
  if (parts.length >= 4) {
    const id = parts[0];
    const name = parts[1];
    const slug = parts[2];
    const parent_id = parts[3];

    if (slug) {
      csvSlugs.add(slug);
      csvData.push({ id, name, slug, parent_id });
    }
  }
}

// categories-full.ts에서 slug 추출 (정규식 사용)
const slugMatches = categoriesFullContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g);
const definedSlugs = new Set<string>();

for (const match of slugMatches) {
  definedSlugs.add(match[1]);
}

console.log('=== 카테고리 분석 결과 ===\n');
console.log(`CSV 파일의 총 카테고리 수: ${csvSlugs.size}`);
console.log(`categories-full.ts에 정의된 카테고리 수: ${definedSlugs.size}\n`);

// CSV에는 있지만 정의되지 않은 카테고리
const undefinedCategories = Array.from(csvSlugs).filter(slug => !definedSlugs.has(slug));
console.log(`\n=== CSV에는 있지만 categories-full.ts에 없는 카테고리 (${undefinedCategories.length}개) ===`);
undefinedCategories.forEach(slug => {
  const item = csvData.find(c => c.slug === slug);
  if (item) {
    console.log(`- ${slug} (${item.name}) [ID: ${item.id}]`);
  }
});

// 정의되었지만 CSV에 없는 카테고리
const missingInCsv = Array.from(definedSlugs).filter(slug => !csvSlugs.has(slug));
console.log(`\n=== categories-full.ts에는 있지만 CSV에 없는 카테고리 (${missingInCsv.length}개) ===`);
missingInCsv.forEach(slug => {
  console.log(`- ${slug}`);
});

// 부모 카테고리 검증
console.log(`\n=== 부모 카테고리 검증 ===`);
const invalidParents = csvData.filter(item => {
  if (!item.parent_id || item.parent_id === '') return false;
  // parent_id가 csvSlugs나 csvData의 어떤 id에도 없는 경우
  const parentExists = csvData.some(c => c.slug === item.parent_id || c.id === item.parent_id);
  return !parentExists;
});

console.log(`부모를 찾을 수 없는 카테고리: ${invalidParents.length}개`);
invalidParents.slice(0, 20).forEach(item => {
  console.log(`- ${item.slug} (${item.name}) -> 부모: ${item.parent_id}`);
});
if (invalidParents.length > 20) {
  console.log(`... 그 외 ${invalidParents.length - 20}개 더 있음`);
}
