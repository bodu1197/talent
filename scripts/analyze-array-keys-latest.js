const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'array_keys_issues_latest.json');
const _data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('='.repeat(80));
console.log('Array Index in Keys - Latest Scan Analysis');
console.log('='.repeat(80));
console.log();
console.log('Total issues:', data.total);
console.log('Issues in response:', data.issues.length);
console.log();

if (data.issues.length > 0) {
  console.log('Files breakdown:');
  const files = {};
  data.issues.forEach((i) => {
    const file = i.component.replace('talent:', '');
    files[file] = (files[file] || 0) + 1;
  });

  Object.entries(files)
    .sort((a, b) => b[1] - a[1])
    .forEach(([file, count]) => {
      console.log(`  ${file}: ${count}개`);
    });

  console.log();
  console.log('First 10 issues:');
  data.issues.slice(0, 10).forEach((issue, idx) => {
    console.log(`  ${idx + 1}. ${issue.component.replace('talent:', '')}:${issue.line}`);
  });
} else {
  console.log('No issues in the response array!');
}

console.log('='.repeat(80));
