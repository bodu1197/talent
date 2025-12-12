#!/usr/bin/env node

/**
 * Step 5: Fix misnamed unused variables (const _result but using result)
 */

const fs = require('fs');
const path = require('path');

function fixMisnamedVars(content, filename) {
  let modified = content;
  let changes = 0;

  // Pattern: const _result = ... but code uses 'result' later
  // Change const _result to const result
  if (content.includes('const _result =') && content.includes('result.')) {
    modified = modified.replace(/const _result =/g, 'const result =');
    changes++;
  }

  // Pattern: const _data = ... but code uses 'data' later
  if (content.includes('const _data =') && content.includes('data.')) {
    modified = modified.replace(/const _data =/g, 'const data =');
    changes++;
  }

  // Pattern: const _response = ... but code uses 'response' later
  if (content.includes('const _response =') && content.includes('response.')) {
    modified = modified.replace(/const _response =/g, 'const response =');
    changes++;
  }

  if (changes > 0) {
    console.log(`${filename}: ${changes} misnamed variables fixed`);
  }

  return modified;
}

async function main() {
  console.log('\n🔧 Step 5: Fix misnamed unused variables\n');
  console.log('='.repeat(60));

  const scriptsDir = __dirname;
  const files = fs.readdirSync(scriptsDir)
    .filter(f => f.endsWith('.js') && !f.startsWith('fix-') && !f.startsWith('analyze-') && !f.startsWith('show-'))
    .sort();

  console.log(`\n📁 총 ${files.length}개 파일 검사 중...\n`);

  let totalFixed = 0;

  for (const file of files) {
    const filePath = path.join(scriptsDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fixed = fixMisnamedVars(content, file);

      if (content !== fixed) {
        fs.writeFileSync(filePath, fixed, 'utf8');
        totalFixed++;
      }
    } catch (error) {
      console.error(`❌ ${file}: 처리 실패 -`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ 완료! ${totalFixed}개 파일 수정됨\n`);
}

main().catch(console.error);
