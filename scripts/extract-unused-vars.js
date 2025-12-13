#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('📊 @typescript-eslint/no-unused-vars 에러 추출 중...\n');

try {
  const output = execSync('npx eslint scripts --ext .js --format json', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const data = JSON.parse(output);

  // @typescript-eslint/no-unused-vars 에러만 필터링
  const unusedVarsErrors = [];

  data.forEach((file) => {
    const errors = file.messages.filter(
      (m) => m.ruleId === '@typescript-eslint/no-unused-vars' && m.severity === 2
    );

    if (errors.length > 0) {
      unusedVarsErrors.push({
        filePath: file.filePath,
        errorCount: errors.length,
        errors: errors.map((e) => ({
          line: e.line,
          column: e.column,
          message: e.message,
          variable: e.message.match(/'([^']+)'/)?.[1],
        })),
      });
    }
  });

  // 파일별로 정리
  console.log(`총 ${unusedVarsErrors.reduce((sum, f) => sum + f.errorCount, 0)}개 에러 발견\n`);
  console.log('파일별 에러 수:');

  unusedVarsErrors.forEach((file) => {
    const fileName = file.filePath.split('\\').pop();
    console.log(`  ${fileName}: ${file.errorCount}개`);
  });

  // JSON 파일로 저장
  fs.writeFileSync('scripts-unused-vars.json', JSON.stringify(unusedVarsErrors, null, 2));

  console.log('\n✅ scripts-unused-vars.json 파일에 저장됨\n');

  // 샘플 출력
  console.log('샘플 에러들:');
  unusedVarsErrors.slice(0, 5).forEach((file) => {
    const fileName = file.filePath.split('\\').pop();
    console.log(`\n${fileName}:`);
    file.errors.slice(0, 3).forEach((err) => {
      console.log(`  Line ${err.line}: ${err.message}`);
    });
  });
} catch (error) {
  console.error('에러 발생:', error.message);
  process.exit(1);
}
