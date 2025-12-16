const fs = require('fs');

const data = JSON.parse(fs.readFileSync('sonar_issues.json', 'utf8'));

const major = data.issues.filter((i) => i.severity === 'MAJOR' && i.status === 'OPEN');

console.log(`남은 MAJOR 이슈: ${major.length}개\n`);

// 규칙별로 그룹화
const byRule = {};
major.forEach((issue) => {
  if (!byRule[issue.rule]) {
    byRule[issue.rule] = [];
  }
  byRule[issue.rule].push(issue);
});

// 규칙별로 출력
Object.keys(byRule)
  .sort()
  .forEach((rule) => {
    console.log(`\n${rule} (${byRule[rule].length}개):`);
    console.log(`  메시지: ${byRule[rule][0].message}`);
    byRule[rule].slice(0, 5).forEach((issue) => {
      console.log(`  - ${issue.component.replace('bodu1197_talent:', '')}:${issue.line}`);
    });
    if (byRule[rule].length > 5) {
      console.log(`  ... ${byRule[rule].length - 5}개 더`);
    }
  });
