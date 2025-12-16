const fs = require('fs');

const data = JSON.parse(fs.readFileSync('sonar_issues.json', 'utf8'));

const minor = data.issues.filter((i) => i.severity === 'MINOR' && i.status === 'OPEN');

console.log(`남은 MINOR 이슈: ${minor.length}개\n`);

// 규칙별로 그룹화
const byRule = {};
minor.forEach((issue) => {
  if (!byRule[issue.rule]) {
    byRule[issue.rule] = [];
  }
  byRule[issue.rule].push(issue);
});

// 규칙별로 출력 (상위 10개만)
Object.keys(byRule)
  .sort((a, b) => byRule[b].length - byRule[a].length)
  .slice(0, 10)
  .forEach((rule) => {
    console.log(`\n${rule} (${byRule[rule].length}개):`);
    console.log(`  메시지: ${byRule[rule][0].message}`);
    byRule[rule].slice(0, 3).forEach((issue) => {
      console.log(`  - ${issue.component.replace('bodu1197_talent:', '')}:${issue.line}`);
    });
    if (byRule[rule].length > 3) {
      console.log(`  ... ${byRule[rule].length - 3}개 더`);
    }
  });

console.log(`\n\n전체 규칙 수: ${Object.keys(byRule).length}개`);
