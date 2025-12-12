const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'sonar_issues.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// React Hooks 이슈 필터링
const hooksIssues = data.issues.filter((i) => i.rule === 'typescript:S6853');

// 파일별로 그룹화
const files = {};
hooksIssues.forEach((i) => {
  const file = i.component.replace('talent:', '');
  files[file] = (files[file] || 0) + 1;
});

// 정렬
const sorted = Object.entries(files).sort((a, b) => b[1] - a[1]);

console.log('='.repeat(80));
console.log('React Hooks exhaustive-deps issues (typescript:S6853)');
console.log('='.repeat(80));
console.log();
console.log('Top 10 files with most React Hooks issues:');
sorted.slice(0, 10).forEach(([file, count], idx) => {
  console.log(`  ${(idx + 1).toString().padStart(2)}. ${file}: ${count}개`);
});

console.log();
console.log(`Total React Hooks issues: ${hooksIssues.length}개`);
console.log('='.repeat(80));
