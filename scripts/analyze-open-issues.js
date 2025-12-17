const fs = require('fs');

const data = JSON.parse(fs.readFileSync('sonarcloud-latest-result.json', 'utf8'));
const issues = data.issues.items;

// STATUS가 OPEN인 이슈만 필터
const openIssues = issues.filter(i => i.status === 'OPEN' || i.status === 'CONFIRMED');

console.log(`총 OPEN 이슈: ${openIssues.length}개\n`);

// 룰별 그룹화
const byRule = {};
openIssues.forEach(issue => {
  if (!byRule[issue.rule]) {
    byRule[issue.rule] = [];
  }
  byRule[issue.rule].push({
    file: issue.component.replace('bodu1197_talent:', ''),
    line: issue.textRange ? issue.textRange.startLine : null,
    message: issue.message,
    type: issue.type
  });
});

// 모든 룰 출력
console.log('=== OPEN Issues by Rule ===\n');
Object.entries(byRule)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([rule, ruleIssues]) => {
    console.log(`${rule}: ${ruleIssues.length}개 (${ruleIssues[0].type})`);
    ruleIssues.forEach((issue, idx) => {
      console.log(`  ${idx + 1}. ${issue.file}:${issue.line || '?'}`);
      if (idx === 0) console.log(`     ${issue.message}`);
    });
    console.log();
  });
