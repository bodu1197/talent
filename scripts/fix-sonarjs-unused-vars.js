#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 sonarjs/no-unused-vars 에러 수정 중...\n');

// ESLint 실행
try {
  execSync('npx eslint scripts --ext .js --format json > scripts-sonar-unused.json', {
    stdio: 'pipe',
  });
} catch {
  // ESLint가 에러를 발견하면 exit code 1을 반환하지만, JSON은 정상적으로 생성됨
}

const data = JSON.parse(fs.readFileSync('scripts-sonar-unused.json', 'utf8'));

// sonarjs/no-unused-vars 에러만 추출
const unusedVarsErrors = [];

data.forEach((file) => {
  const errors = file.messages.filter(
    (m) => m.ruleId === 'sonarjs/no-unused-vars' && m.severity === 2
  );

  if (errors.length > 0) {
    unusedVarsErrors.push({
      filePath: file.filePath,
      errors: errors.map((e) => ({
        line: e.line,
        message: e.message,
        variable: e.message.match(/'([^']+)'/)?.[1],
      })),
    });
  }
});

console.log(`총 ${unusedVarsErrors.reduce((sum, f) => sum + f.errors.length, 0)}개 에러 발견\n`);

let totalFixed = 0;

unusedVarsErrors.forEach((fileData) => {
  const filePath = fileData.filePath;
  const fileName = filePath.split('\\').pop();

  console.log(`\n📝 ${fileName} (${fileData.errors.length}개 에러)`);

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;

  fileData.errors.forEach((error) => {
    const lineNum = error.line;
    const varName = error.variable;

    console.log(`  Line ${lineNum}: '${varName}'`);

    const line = lines[lineNum - 1];

    // const _varName = ... 형태이면 완전히 제거
    if (line && line.match(new RegExp(`const\\s+${varName}\\s*=`))) {
      // destructuring인지 확인
      if (line.includes('{') && line.includes('}')) {
        // const { _varName, other } = ... 형태
        const match = line.match(/{\s*([^}]+)\s*}/);
        if (match) {
          const vars = match[1].split(',').map((v) => v.trim());
          const filteredVars = vars.filter((v) => v !== varName);

          if (filteredVars.length === 0) {
            // 모든 변수가 사용되지 않으면 전체 라인 제거
            lines[lineNum - 1] = '';
            modified = true;
            console.log(`    ✓ 전체 라인 제거`);
          } else {
            // 해당 변수만 제거
            const newLine = line.replace(match[0], `{ ${filteredVars.join(', ')} }`);
            lines[lineNum - 1] = newLine;
            modified = true;
            console.log(`    ✓ destructuring에서 '${varName}' 제거`);
          }
        }
      } else {
        // 일반 const 선언이면 전체 라인 제거
        lines[lineNum - 1] = '';
        modified = true;
        console.log(`    ✓ 라인 제거`);
      }
    }
  });

  if (modified) {
    // 연속된 빈 줄 제거
    const newContent = lines.join('\n').replace(/\n\n\n+/g, '\n\n');
    fs.writeFileSync(filePath, newContent);
    totalFixed++;
    console.log(`  ✅ 파일 수정 완료`);
  } else {
    console.log(`  ℹ️  수정 사항 없음`);
  }
});

console.log(`\n\n✅ 총 ${totalFixed}개 파일 수정 완료!\n`);
