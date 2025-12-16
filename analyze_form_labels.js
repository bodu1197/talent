const fs = require('fs');

const data = JSON.parse(fs.readFileSync('sonar_issues.json', 'utf8'));

// typescript:S6853만 필터링
const formLabelIssues = data.issues.filter(
  (issue) => issue.rule === 'typescript:S6853' && issue.status === 'OPEN'
);

console.log(`\n총 Form Label 이슈: ${formLabelIssues.length}개\n`);

// 파일별로 그룹화
const byFile = {};
formLabelIssues.forEach((issue) => {
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
