#!/usr/bin/env node

const fs = require('fs');

console.log('📊 @typescript-eslint/no-unused-vars 에러 분석 중...\n');

const data = JSON.parse(fs.readFileSync('scripts-all-errors.json', 'utf8'));

// @typescript-eslint/no-unused-vars 에러만 필터링
const unusedVarsErrors = [];

data.forEach(file => {
  const errors = file.messages.filter(m =>
    m.ruleId === '@typescript-eslint/no-unused-vars' && m.severity === 2
  );

  if (errors.length > 0) {
    unusedVarsErrors.push({
      filePath: file.filePath,
      errorCount: errors.length,
      errors: errors.map(e => ({
        line: e.line,
        column: e.column,
        message: e.message,
        variable: e.message.match(/'([^']+)'/)?.[1]
      }))
    });
  }
});

// 파일별로 정리
const totalErrors = unusedVarsErrors.reduce((sum, f) => sum + f.errorCount, 0);
console.log(`총 ${totalErrors}개 에러 발견\n`);

console.log('파일별 에러 수:');
unusedVarsErrors.forEach(file => {
  const fileName = file.filePath.split('\\').pop();
  console.log(`  ${fileName}: ${file.errorCount}개`);
});

// JSON 파일로 저장
fs.writeFileSync('scripts-unused-vars.json', JSON.stringify(unusedVarsErrors, null, 2));

console.log('\n✅ scripts-unused-vars.json 파일에 저장됨\n');

// 변수 타입별 분류
const varTypes = {
  result: 0,
  data: 0,
  response: 0,
  error: 0,
  _prefixed: 0,
  others: []
};

unusedVarsErrors.forEach(file => {
  file.errors.forEach(err => {
    const varName = err.variable;
    if (!varName) return;

    if (varName === 'result' || varName === '_result') {
      varTypes.result++;
    } else if (varName === 'data' || varName === '_data') {
      varTypes.data++;
    } else if (varName === 'response' || varName === '_response') {
      varTypes.response++;
    } else if (varName === 'error' || varName === '_error') {
      varTypes.error++;
    } else if (varName.startsWith('_')) {
      varTypes._prefixed++;
    } else {
      varTypes.others.push(varName);
    }
  });
});

console.log('\n변수 타입별 분류:');
console.log(`  result/_result: ${varTypes.result}개`);
console.log(`  data/_data: ${varTypes.data}개`);
console.log(`  response/_response: ${varTypes.response}개`);
console.log(`  error/_error: ${varTypes.error}개`);
console.log(`  기타 _접두사: ${varTypes._prefixed}개`);
console.log(`  기타: ${varTypes.others.length}개`);

if (varTypes.others.length > 0 && varTypes.others.length <= 20) {
  console.log(`\n기타 변수들: ${varTypes.others.join(', ')}`);
}

// 샘플 출력
console.log('\n\n상세 샘플 (처음 5개 파일):');
unusedVarsErrors.slice(0, 5).forEach(file => {
  const fileName = file.filePath.split('\\').pop();
  console.log(`\n${fileName}:`);
  file.errors.slice(0, 5).forEach(err => {
    console.log(`  Line ${err.line}: '${err.variable}' - ${err.message}`);
  });
});
