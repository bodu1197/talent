#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Parsing error 확인 중...\n');

try {
  execSync('npx eslint scripts --ext .js --format json > scripts-check.json', {
    stdio: 'pipe',
  });
} catch {
  // ESLint가 에러를 발견하면 exit code 1을 반환하지만, JSON은 정상적으로 생성됨
}

const data = JSON.parse(fs.readFileSync('scripts-check.json', 'utf8'));

const parsingErrors = [];

data.forEach((file) => {
  const errors = file.messages.filter((m) => m.message && m.message.includes('Parsing error'));

  if (errors.length > 0) {
    parsingErrors.push({
      file: file.filePath.split('\\').pop(),
      errors: errors.map((e) => ({
        line: e.line,
        message: e.message,
      })),
    });
  }
});

if (parsingErrors.length === 0) {
  console.log('✅ Parsing error가 모두 해결되었습니다!\n');
} else {
  console.log(`❌ 남은 Parsing error: ${parsingErrors.length}개\n`);
  parsingErrors.forEach((item) => {
    console.log(`${item.file}:`);
    item.errors.forEach((err) => {
      console.log(`  Line ${err.line}: ${err.message}`);
    });
    console.log('');
  });
}
