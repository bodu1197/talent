#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

console.log('📊 변수 관련 에러 분석 중...\n');

// Run ESLint and save to file first
try {
  execSync(
    'npx eslint scripts --format json > eslint-output.json',
    { encoding: 'utf8', shell: true, stdio: 'ignore' }
  );
} catch {
  // ESLint exits with error code when there are errors, but we still get the output
}

const data = JSON.parse(fs.readFileSync('eslint-output.json', 'utf8'));

// Categories for variable issues
const variableErrors = {
  'unused-vars-typescript': [],
  'unused-vars-sonarjs': [],
  'dead-store': [],
  'prefer-const': [],
  'commented-code': [],
  'ignored-exceptions': [],
  'all-duplicated-branches': [],
  'anchor-precedence': [],
  'other': []
};

// Collect variable-related errors
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

    if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
      variableErrors['unused-vars-typescript'].push(error);
    } else if (msg.ruleId === 'sonarjs/no-unused-vars') {
      variableErrors['unused-vars-sonarjs'].push(error);
    } else if (msg.ruleId === 'sonarjs/no-dead-store') {
      variableErrors['dead-store'].push(error);
    } else if (msg.ruleId === 'prefer-const') {
      variableErrors['prefer-const'].push(error);
    } else if (msg.ruleId === 'sonarjs/no-commented-code') {
      variableErrors['commented-code'].push(error);
    } else if (msg.ruleId === 'sonarjs/no-ignored-exceptions') {
      variableErrors['ignored-exceptions'].push(error);
    } else if (msg.ruleId === 'sonarjs/no-all-duplicated-branches') {
      variableErrors['all-duplicated-branches'].push(error);
    } else if (msg.ruleId === 'sonarjs/anchor-precedence') {
      variableErrors['anchor-precedence'].push(error);
    }
  });
});

// Display results
console.log('🔍 변수 관련 에러 분석 결과:\n');

let totalErrors = 0;

Object.entries(variableErrors).forEach(([category, errors]) => {
  if (errors.length === 0) return;

  console.log(`\n📌 ${category} (${errors.length}개):`);
  console.log('─'.repeat(60));

  errors.forEach((error, idx) => {
    console.log(`${idx + 1}. ${error.file}:${error.line}`);
    console.log(`   ${error.message}`);
  });

  totalErrors += errors.length;
});

console.log('\n' + '='.repeat(60));
console.log(`📊 총 변수 관련 에러: ${totalErrors}개`);
console.log('='.repeat(60));

// Save detailed results
fs.writeFileSync(
  'variable-issues-analysis.json',
  JSON.stringify(variableErrors, null, 2)
);

console.log('\n✅ 상세 결과가 variable-issues-analysis.json에 저장되었습니다.\n');
