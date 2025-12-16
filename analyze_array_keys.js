const fs = require('fs');

const data = JSON.parse(fs.readFileSync('sonar_issues.json', 'utf8'));

// typescript:S6479만 필터링
const arrayKeyIssues = data.issues.filter(
  (issue) => issue.rule === 'typescript:S6479' && issue.status === 'OPEN'
);

console.log(`\n총 Array index in keys 이슈: ${arrayKeyIssues.length}개\n`);

// 파일별로 그룹화
const byFile = {};
arrayKeyIssues.forEach((issue) => {
  const file = issue.component.replace('bodu1197_talent:', '');
  if (!byFile[file]) {
    byFile[file] = [];
  }
  byFile[file].push({
    line: issue.line,
    message: issue.message,
  });
});

// 파일별로 출력
Object.keys(byFile)
  .sort()
  .forEach((file) => {
    console.log(`\n${file} (${byFile[file].length}개):`);
    byFile[file].forEach((issue) => {
      console.log(`  Line ${issue.line}: ${issue.message}`);
    });
  });
