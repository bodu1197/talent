// Script to analyze SonarQube issues from sonar_issues.json
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'sonar_issues.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('='.repeat(80));
console.log('SonarQube 재스캔 결과 분석');
console.log('='.repeat(80));
console.log();

// 1. 심각도별 이슈 수
console.log('[ 심각도별 이슈 수 ]');
const severities = {};
data.issues.forEach((issue) => {
  severities[issue.severity] = (severities[issue.severity] || 0) + 1;
});
Object.entries(severities)
  .sort((a, b) => {
    const order = { BLOCKER: 0, CRITICAL: 1, MAJOR: 2, MINOR: 3, INFO: 4 };
    return order[a[0]] - order[b[0]];
  })
  .forEach(([severity, count]) => {
    console.log(`  ${severity}: ${count}개`);
  });
console.log(`  총 이슈: ${data.issues.length}개`);
console.log();

// 2. 룰별 이슈 수 (Top 20)
console.log('[ Top 20 규칙 (룰별 이슈 수) ]');
const rules = {};
data.issues.forEach((issue) => {
  rules[issue.rule] = (rules[issue.rule] || 0) + 1;
});
const sortedRules = Object.entries(rules).sort((a, b) => b[1] - a[1]);
sortedRules.slice(0, 20).forEach(([rule, count], index) => {
  console.log(`  ${(index + 1).toString().padStart(2)}. ${rule}: ${count}개`);
});
console.log();

// 3. 파일별 이슈 수 (Top 20)
console.log('[ Top 20 파일 (이슈가 가장 많은 파일) ]');
const files = {};
data.issues.forEach((issue) => {
  const file = issue.component.replace('talent:', '');
  files[file] = (files[file] || 0) + 1;
});
const sortedFiles = Object.entries(files).sort((a, b) => b[1] - a[1]);
sortedFiles.slice(0, 20).forEach(([file, count], index) => {
  console.log(`  ${(index + 1).toString().padStart(2)}. ${file}: ${count}개`);
});
console.log();

// 4. 타입별 이슈 수
console.log('[ 타입별 이슈 수 ]');
const types = {};
data.issues.forEach((issue) => {
  types[issue.type] = (types[issue.type] || 0) + 1;
});
Object.entries(types)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count}개`);
  });
console.log();

// 5. BLOCKER 및 CRITICAL 이슈 상세
console.log('[ BLOCKER 및 CRITICAL 이슈 상세 ]');
const criticalIssues = data.issues.filter(
  (issue) => issue.severity === 'BLOCKER' || issue.severity === 'CRITICAL'
);
criticalIssues.forEach((issue) => {
  const file = issue.component.replace('talent:', '');
  console.log(`  [${issue.severity}] ${issue.rule}`);
  console.log(`    파일: ${file}:${issue.line || '?'}`);
  console.log(`    메시지: ${issue.message}`);
  console.log();
});

console.log('='.repeat(80));
