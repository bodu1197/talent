const fs = require('fs');
const data = JSON.parse(fs.readFileSync('sonar_issues.json', 'utf-8'));

const major = data.issues.filter((i) => i.severity === 'MAJOR');
const byRule = {};

major.forEach((i) => {
  if (!byRule[i.rule]) byRule[i.rule] = [];
  byRule[i.rule].push({
    file: i.component.split(':')[1],
    line: i.line,
    message: i.message,
  });
});

Object.entries(byRule)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([rule, issues]) => {
    console.log(`\n[${rule}] ${issues.length}개`);
    issues.slice(0, 10).forEach((i) => console.log(`  ${i.file}:${i.line}`));
    if (issues.length > 10) console.log(`  ... ${issues.length - 10}개 더`);
  });

console.log(`\n총 MAJOR 이슈: ${major.length}개`);
