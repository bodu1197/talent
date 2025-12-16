const fs = require('fs');
const data = JSON.parse(fs.readFileSync('sonar_issues.json', 'utf-8'));

// 룰별로 그룹화
const ruleGroups = {};
data.issues.forEach((issue) => {
  const rule = issue.rule;
  if (!ruleGroups[rule]) {
    ruleGroups[rule] = {
      count: 0,
      severity: issue.severity,
      type: issue.type,
      message: issue.message,
      files: new Set(),
    };
  }
  ruleGroups[rule].count++;
  ruleGroups[rule].files.add(issue.component.split(':')[1]);
});

// 카운트로 정렬
const sorted = Object.entries(ruleGroups).sort((a, b) => b[1].count - a[1].count);

console.log('=== 룰별 이슈 분석 (상위 30개) ===\n');
sorted.slice(0, 30).forEach(([rule, data]) => {
  console.log(`[${data.severity}] ${rule}`);
  console.log(`  개수: ${data.count}`);
  console.log(`  유형: ${data.type}`);
  console.log(`  메시지: ${data.message}`);
  console.log(`  영향 파일: ${data.files.size}개`);
  console.log('');
});

console.log(`\n총 이슈: ${data.issues.length}개`);
console.log(`총 룰: ${sorted.length}개`);
