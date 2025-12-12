#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 보안 이슈 분석 중...\n');

// Run ESLint and save to file
try {
  execSync(
    'npx eslint scripts --format json > eslint-output.json',
    { encoding: 'utf8', shell: true, stdio: 'ignore' }
  );
} catch {
  // ESLint exits with error code when there are errors
}

const data = JSON.parse(fs.readFileSync('eslint-output.json', 'utf8'));

const securityErrors = {
  'os-command': [],
  'no-os-command-from-path': [],
  'no-hardcoded-passwords': [],
  'sql-queries': []
};

// Collect security-related errors
data.forEach(file => {
  file.messages.forEach(msg => {
    if (msg.severity !== 2) return; // Only errors

    const error = {
      file: file.filePath.split('scripts\\')[1] || file.filePath.split('scripts/')[1],
      line: msg.line,
      column: msg.column,
      message: msg.message,
      ruleId: msg.ruleId
    };

    if (msg.ruleId === 'sonarjs/os-command') {
      securityErrors['os-command'].push(error);
    } else if (msg.ruleId === 'sonarjs/no-os-command-from-path') {
      securityErrors['no-os-command-from-path'].push(error);
    } else if (msg.ruleId === 'sonarjs/no-hardcoded-passwords') {
      securityErrors['no-hardcoded-passwords'].push(error);
    } else if (msg.ruleId === 'sonarjs/sql-queries') {
      securityErrors['sql-queries'].push(error);
    }
  });
});

// Display results
console.log('📋 보안 이슈 분석 결과:\n');
console.log('⚠️  참고: 이 파일들은 개발/배포 스크립트로 프로덕션 코드가 아닙니다.\n');

let totalErrors = 0;

Object.entries(securityErrors).forEach(([category, errors]) => {
  if (errors.length === 0) return;

  console.log(`\n📌 ${category} (${errors.length}개):`);
  console.log('─'.repeat(70));

  // Group by file
  const byFile = {};
  errors.forEach(error => {
    if (!byFile[error.file]) {
      byFile[error.file] = [];
    }
    byFile[error.file].push(error);
  });

  Object.entries(byFile).forEach(([file, fileErrors]) => {
    console.log(`\n  📄 ${file} (${fileErrors.length}개):`);
    fileErrors.forEach(error => {
      console.log(`     Line ${error.line}: ${error.message}`);
    });
  });

  totalErrors += errors.length;
});

console.log('\n' + '='.repeat(70));
console.log(`📊 총 보안 이슈: ${totalErrors}개`);
console.log('='.repeat(70));

// Save detailed results
fs.writeFileSync(
  'security-issues-analysis.json',
  JSON.stringify(securityErrors, null, 2)
);

console.log('\n✅ 상세 결과가 security-issues-analysis.json에 저장되었습니다.\n');
