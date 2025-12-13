#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 최종 에러 확인 중...\n');

// ESLint 실행 (에러가 있어도 계속 진행)
try {
  execSync('npx eslint scripts --ext .js --format json > scripts-final-errors.json', {
    stdio: 'pipe',
  });
} catch {
  // ESLint가 에러를 발견하면 exit code 1을 반환하지만, JSON은 정상적으로 생성됨
}

const data = JSON.parse(fs.readFileSync('scripts-final-errors.json', 'utf8'));

// @typescript-eslint/no-unused-vars 에러만 추출
const unusedVarsErrors = [];
data.forEach((file) => {
  const errors = file.messages.filter(
    (m) => m.ruleId === '@typescript-eslint/no-unused-vars' && m.severity === 2
  );

  if (errors.length > 0) {
    unusedVarsErrors.push({
      file: file.filePath.split('\\').pop(),
      count: errors.length,
      errors: errors.map((e) => ({
        line: e.line,
        var: e.message.match(/'([^']+)'/)?.[1],
      })),
    });
  }
});

const totalUnusedVars = unusedVarsErrors.reduce((sum, f) => sum + f.count, 0);
const totalErrors = data.reduce(
  (sum, f) => sum + f.messages.filter((m) => m.severity === 2).length,
  0
);

console.log(`\n📊 최종 결과:`);
console.log(`   @typescript-eslint/no-unused-vars: ${totalUnusedVars}개`);
console.log(`   전체 에러: ${totalErrors}개\n`);

if (unusedVarsErrors.length > 0) {
  console.log('남은 @typescript-eslint/no-unused-vars 에러:');
  unusedVarsErrors.forEach((file) => {
    console.log(`\n  ${file.file} (${file.count}개):`);
    file.errors.forEach((err) => {
      console.log(`    Line ${err.line}: '${err.var}'`);
    });
  });
} else {
  console.log('✅ @typescript-eslint/no-unused-vars 에러가 모두 해결되었습니다!');
}

console.log('\n');
