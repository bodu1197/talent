#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 구조 이슈 분석 중...\n');

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

const structureErrors = {
  'nested-template-literals': [],
  'nested-conditional': []
};

// Collect structure-related errors
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

    if (msg.ruleId === 'sonarjs/no-nested-template-literals') {
      structureErrors['nested-template-literals'].push(error);
    } else if (msg.ruleId === 'sonarjs/no-nested-conditional') {
      structureErrors['nested-conditional'].push(error);
    }
  });
});

// Display results
console.log('📋 구조 이슈 분석 결과:\n');

let totalErrors = 0;

Object.entries(structureErrors).forEach(([category, errors]) => {
  if (errors.length === 0) return;

  console.log(`\n📌 ${category} (${errors.length}개):`);
  console.log('─'.repeat(70));

  errors.forEach((error, idx) => {
    console.log(`${idx + 1}. ${error.file}:${error.line}:${error.column}`);
    console.log(`   ${error.message}`);
  });

  totalErrors += errors.length;
});

console.log('\n' + '='.repeat(70));
console.log(`📊 총 구조 이슈: ${totalErrors}개`);
console.log('='.repeat(70));

// Save detailed results
fs.writeFileSync(
  'structure-issues-analysis.json',
  JSON.stringify(structureErrors, null, 2)
);

console.log('\n✅ 상세 결과가 structure-issues-analysis.json에 저장되었습니다.\n');
