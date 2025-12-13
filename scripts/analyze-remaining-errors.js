#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('📊 남은 에러 분석 중...\n');

// ESLint 실행
try {
  execSync('npx eslint scripts --ext .js --format json > scripts-remaining-errors.json', {
    stdio: 'pipe',
  });
} catch {
  // ESLint가 에러를 발견하면 exit code 1을 반환하지만, JSON은 정상적으로 생성됨
}

const data = JSON.parse(fs.readFileSync('scripts-remaining-errors.json', 'utf8'));

// 에러를 rule별로 분류
const ruleStats = {};
const ruleExamples = {};

data.forEach((file) => {
  const errors = file.messages.filter((m) => m.severity === 2);

  errors.forEach((err) => {
    const ruleId = err.ruleId || 'unknown';

    if (!ruleStats[ruleId]) {
      ruleStats[ruleId] = 0;
      ruleExamples[ruleId] = [];
    }

    ruleStats[ruleId]++;

    // 처음 3개 예제만 저장
    if (ruleExamples[ruleId].length < 3) {
      ruleExamples[ruleId].push({
        file: file.filePath.split('\\').pop(),
        line: err.line,
        message: err.message,
      });
    }
  });
});

// 에러 수로 정렬
const sortedRules = Object.entries(ruleStats).sort((a, b) => b[1] - a[1]);

const totalErrors = sortedRules.reduce((sum, [_, count]) => sum + count, 0);

console.log(`총 ${totalErrors}개 에러\n`);
console.log('='.repeat(80));
console.log('Rule별 에러 수:\n');

// 카테고리별로 분류
const categories = {
  security: [],
  complexity: [],
  style: [],
  bestPractice: [],
  other: [],
};

sortedRules.forEach(([ruleId, count]) => {
  const entry = { ruleId, count };

  if (ruleId.includes('os-command') || ruleId.includes('hardcoded') || ruleId.includes('sql')) {
    categories.security.push(entry);
  } else if (
    ruleId.includes('complexity') ||
    ruleId.includes('nested') ||
    ruleId.includes('cognitive')
  ) {
    categories.complexity.push(entry);
  } else if (ruleId.includes('regex') || ruleId.includes('template')) {
    categories.style.push(entry);
  } else if (ruleId.includes('no-') || ruleId.includes('prefer-')) {
    categories.bestPractice.push(entry);
  } else {
    categories.other.push(entry);
  }
});

// 보안 이슈
if (categories.security.length > 0) {
  console.log('\n🔐 보안 이슈:');
  categories.security.forEach(({ ruleId, count }) => {
    console.log(`  ${ruleId.padEnd(50)} ${count}개`);
  });
}

// 복잡도 이슈
if (categories.complexity.length > 0) {
  console.log('\n📐 복잡도 이슈:');
  categories.complexity.forEach(({ ruleId, count }) => {
    console.log(`  ${ruleId.padEnd(50)} ${count}개`);
  });
}

// 스타일 이슈
if (categories.style.length > 0) {
  console.log('\n🎨 스타일 이슈:');
  categories.style.forEach(({ ruleId, count }) => {
    console.log(`  ${ruleId.padEnd(50)} ${count}개`);
  });
}

// Best Practice 이슈
if (categories.bestPractice.length > 0) {
  console.log('\n✨ Best Practice 이슈:');
  categories.bestPractice.forEach(({ ruleId, count }) => {
    console.log(`  ${ruleId.padEnd(50)} ${count}개`);
  });
}

// 기타
if (categories.other.length > 0) {
  console.log('\n📋 기타:');
  categories.other.forEach(({ ruleId, count }) => {
    console.log(`  ${ruleId.padEnd(50)} ${count}개`);
  });
}

console.log('\n' + '='.repeat(80));

// 상세 예제 출력
console.log('\n\n📝 주요 에러 예제:\n');

sortedRules.slice(0, 10).forEach(([ruleId, count]) => {
  console.log(`\n${ruleId} (${count}개):`);
  ruleExamples[ruleId].forEach((example) => {
    console.log(`  ${example.file}:${example.line}`);
    console.log(`    ${example.message}`);
  });
});

// JSON으로도 저장
fs.writeFileSync(
  'scripts-error-analysis.json',
  JSON.stringify(
    {
      totalErrors,
      categories,
      ruleStats,
      ruleExamples,
    },
    null,
    2
  )
);

console.log('\n\n✅ 분석 완료! scripts-error-analysis.json에 저장됨\n');
