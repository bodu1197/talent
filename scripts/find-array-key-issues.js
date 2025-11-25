const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'array_keys_issues.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('='.repeat(80));
console.log('Array Index in Keys issues (typescript:S6479)');
console.log('='.repeat(80));
console.log();
console.log('Total issues:', data.total);
console.log();

if (data.total === 0) {
  console.log('✅ No Array index key issues found!');
} else {
  console.log('Top files:');
  const files = {};
  data.issues.forEach((i) => {
    const file = i.component.replace('talent:', '');
    files[file] = (files[file] || 0) + 1;
  });

  Object.entries(files)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([file, count], idx) => {
      console.log(`  ${(idx + 1).toString().padStart(2)}. ${file}: ${count}개`);
    });

  console.log();
  console.log('Sample issues:');
  data.issues.slice(0, 5).forEach((issue, idx) => {
    console.log(`  ${idx + 1}. ${issue.component.replace('talent:', '')}:${issue.line}`);
    console.log(`     Message: ${issue.message}`);
  });
}

console.log('='.repeat(80));
