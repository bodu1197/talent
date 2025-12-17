const fs = require('fs');

const data = JSON.parse(fs.readFileSync('sonarcloud-latest-result.json', 'utf8'));
const issues = data.issues.items;

console.log(`총 이슈: ${issues.length}개\n`);

// 상태별 그룹화
const byStatus = {};
issues.forEach(issue => {
  byStatus[issue.status] = (byStatus[issue.status] || 0) + 1;
});

console.log('=== 상태별 이슈 ===');
Object.entries(byStatus).forEach(([status, count]) => {
  console.log(`${status}: ${count}개`);
});
console.log();

// CLOSED가 아닌 이슈들
const activeIssues = issues.filter(i => i.status !== 'CLOSED' && i.status !== 'FIXED');
console.log(`Active 이슈 (CLOSED/FIXED 제외): ${activeIssues.length}개\n`);

// 룰별 그룹화 (Active만)
const byRule = {};
activeIssues.forEach(issue => {
  if (!byRule[issue.rule]) {
    byRule[issue.rule] = [];
  }
  byRule[issue.rule].push({
    file: issue.component.replace('bodu1197_talent:', ''),
    line: issue.textRange ? issue.textRange.startLine : null,
    message: issue.message,
    status: issue.status
  });
});

// 상위 15개 룰
console.log('=== Active Issues by Rule (Top 15) ===\n');
Object.entries(byRule)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 15)
  .forEach(([rule, ruleIssues]) => {
    console.log(`${rule}: ${ruleIssues.length}개`);
    ruleIssues.slice(0, 2).forEach((issue, idx) => {
      console.log(`  ${idx + 1}. ${issue.file}:${issue.line || '?'} [${issue.status}]`);
    });
    if (ruleIssues.length > 2) {
      console.log(`  ... 외 ${ruleIssues.length - 2}개`);
    }
    console.log();
  });
