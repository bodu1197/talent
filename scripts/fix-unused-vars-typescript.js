#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

const fs = require('fs');

console.log('🔧 @typescript-eslint/no-unused-vars 에러 자동 수정 중...\n');

const errorsData = JSON.parse(fs.readFileSync('scripts-unused-vars.json', 'utf8'));

let totalFixed = 0;

errorsData.forEach((fileData) => {
  const filePath = fileData.filePath;
  const fileName = filePath.split('\\').pop();

  console.log(`\n📝 ${fileName} (${fileData.errorCount}개 에러)`);

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;

  fileData.errors.forEach((error) => {
    const lineNum = error.line;
    const varName = error.variable;
    const message = error.message;

    console.log(`  Line ${lineNum}: '${varName}'`);

    // Case 1: import 문에서 사용되지 않는 변수
    if (
      message.includes('is assigned a value but never used') &&
      lines[lineNum - 1].includes('require(')
    ) {
      const line = lines[lineNum - 1];

      // const { varName } = require(...) 형태
      if (line.includes('{') && line.includes('}')) {
        // 여러 개 중 하나인지 확인
        const match = line.match(/{\s*([^}]+)\s*}/);
        if (match) {
          const imports = match[1].split(',').map((s) => s.trim());

          if (imports.length > 1) {
            // 여러 개 중 하나 -> 해당 변수만 제거
            const newImports = imports.filter((imp) => imp !== varName);
            const newLine = line.replace(match[0], `{ ${newImports.join(', ')} }`);
            lines[lineNum - 1] = newLine;
            modified = true;
            console.log(`    ✓ import에서 '${varName}' 제거`);
          } else {
            // 하나만 import하는데 사용 안함 -> 전체 라인 제거
            lines[lineNum - 1] = '';
            modified = true;
            console.log(`    ✓ import 라인 전체 제거`);
          }
        }
      }
      // const varName = require(...) 형태
      else if (line.match(new RegExp(`const\\s+${varName}\\s*=\\s*require`))) {
        lines[lineNum - 1] = '';
        modified = true;
        console.log(`    ✓ import 라인 전체 제거`);
      }
    }

    // Case 2: 함수 파라미터에서 사용되지 않는 변수
    else if (
      message.includes('is defined but never used') &&
      message.includes('Allowed unused args must match')
    ) {
      const line = lines[lineNum - 1];

      // 함수 파라미터인 경우 _ 접두사 추가
      if (line.includes('function') || line.includes('=>') || line.includes('async')) {
        // 파라미터 이름에 _ 접두사 추가
        const newLine = line.replace(new RegExp(`\\b${varName}\\b(?=[,\\)])`, 'g'), `_${varName}`);
        if (newLine !== line) {
          lines[lineNum - 1] = newLine;
          modified = true;
          console.log(`    ✓ 파라미터에 _ 접두사 추가`);
        }
      }
    }

    // Case 3: 할당받았지만 사용되지 않는 변수
    else if (message.includes('is assigned a value but never used')) {
      const line = lines[lineNum - 1];

      // const varName = ... 형태
      if (line.match(new RegExp(`const\\s+${varName}\\s*=`))) {
        // await 문이면 await만 실행
        if (line.includes('await')) {
          const awaitMatch = line.match(/const\s+\w+\s*=\s*(await\s+[^;]+);?/);
          if (awaitMatch) {
            const indent = line.match(/^(\s*)/)[1];
            lines[lineNum - 1] = `${indent}${awaitMatch[1]};`;
            modified = true;
            console.log(`    ✓ const 제거하고 await만 실행`);
          }
        }
        // 일반 할당이면 _ 접두사 추가
        else {
          const newLine = line.replace(
            new RegExp(`const\\s+${varName}\\s*=`),
            `const _${varName} =`
          );
          lines[lineNum - 1] = newLine;
          modified = true;
          console.log(`    ✓ 변수명에 _ 접두사 추가`);
        }
      }
    }

    // Case 4: 정의되었지만 사용되지 않는 변수 (일반)
    else if (message.includes('is defined but never used')) {
      const line = lines[lineNum - 1];

      // const varName = ... 형태
      if (line.match(new RegExp(`const\\s+${varName}\\s*=`))) {
        const newLine = line.replace(new RegExp(`const\\s+${varName}\\s*=`), `const _${varName} =`);
        lines[lineNum - 1] = newLine;
        modified = true;
        console.log(`    ✓ 변수명에 _ 접두사 추가`);
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

// 수정 후 다시 검사
console.log('🔍 수정 결과 확인 중...\n');
const { execSync } = require('child_process');

try {
  execSync('npx eslint scripts --ext .js --format json > scripts-all-errors-after.json 2>nul', {
    stdio: 'inherit',
  });

  const afterData = JSON.parse(fs.readFileSync('scripts-all-errors-after.json', 'utf8'));
  const afterUnusedVars = afterData.reduce((count, file) => {
    return (
      count +
      file.messages.filter(
        (m) => m.ruleId === '@typescript-eslint/no-unused-vars' && m.severity === 2
      ).length
    );
  }, 0);

  console.log(`\n남은 @typescript-eslint/no-unused-vars 에러: ${afterUnusedVars}개\n`);
} catch {
  console.log('검사 완료\n');
}
