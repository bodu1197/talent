#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  const output = execSync('npx eslint scripts/*.js --format json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
  const json = JSON.parse(output);

  const errors = {};
  const errorFiles = {};

  json.forEach(file => {
    file.messages.filter(m => m.severity === 2).forEach(msg => {
      errors[msg.ruleId] = (errors[msg.ruleId] || 0) + 1;
      if (!errorFiles[msg.ruleId]) errorFiles[msg.ruleId] = [];
      errorFiles[msg.ruleId].push({
        file: file.filePath.split('\\').pop(),
        line: msg.line,
        message: msg.message
      });
    });
  });

  console.log('\n📊 ESLint 에러 통계\n');
  console.log('='.repeat(60));

  const sorted = Object.entries(errors).sort((a, b) => b[1] - a[1]);

  sorted.forEach(([rule, count]) => {
    console.log(`${count.toString().padStart(4)}: ${rule}`);
  });

  console.log('\n='.repeat(60));
  console.log(`\n총 ${sorted.reduce((sum, [,count]) => sum + count, 0)}개 에러\n`);

  // Show top 5 error types with examples
  console.log('\n📋 상위 5개 에러 유형 예시:\n');
  sorted.slice(0, 5).forEach(([rule, count]) => {
    console.log(`\n${rule} (${count}개):`);
    errorFiles[rule].slice(0, 3).forEach(({ file, line, message }) => {
      console.log(`  - ${file}:${line}: ${message}`);
    });
  });

} catch (error) {
  console.error('분석 실패:', error.message);
  process.exit(1);
}
