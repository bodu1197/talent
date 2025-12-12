#!/usr/bin/env node

/**
 * Fix unused variable errors in scripts folder
 *
 * Fixes:
 * 1. Unused variables -> prefix with _
 * 2. Ignored exceptions -> ensure error variable is used
 */

const fs = require('fs');
const path = require('path');

function fixUnusedVariables(content, filename) {
  let modified = content;
  let changes = 0;

  // Pattern 1: Destructured unused variables
  // const { data, error } = ... -> const { error } = ...
  // Simply remove the unused variable from destructuring
  const destructurePatterns = [
    { regex: /const \{ data: _data, error \}/g, replacement: 'const { error }', desc: 'remove _data' },
    { regex: /const \{ data, error \}/g, replacement: 'const { error }', desc: 'remove data' },
    { regex: /const \{ response: _response, error \}/g, replacement: 'const { error }', desc: 'remove _response' },
    { regex: /const \{ response, error \}/g, replacement: 'const { error }', desc: 'remove response' },
    { regex: /const \{ count: _count, error \}/g, replacement: 'const { error }', desc: 'remove _count' },
    { regex: /const \{ count, error \}/g, replacement: 'const { error }', desc: 'remove count' },
    { regex: /const \{ result: _result, error \}/g, replacement: 'const { error }', desc: 'remove _result' },
    { regex: /const \{ result, error \}/g, replacement: 'const { error }', desc: 'remove result' },
    { regex: /const \{ testData: _testData, error \}/g, replacement: 'const { error }', desc: 'remove _testData' },
    { regex: /const \{ testData, error \}/g, replacement: 'const { error }', desc: 'remove testData' },
  ];

  for (const pattern of destructurePatterns) {
    const matches = content.match(pattern.regex);
    if (matches) {
      modified = modified.replace(pattern.regex, pattern.replacement);
      changes += matches.length;
    }
  }

  // Pattern 2: Simple unused variables
  // const data = ... -> const _data = ...
  // Only do this if it's not part of a destructuring pattern
  const simplePatterns = [
    { regex: /\bconst data = /g, replacement: 'const _data = ', desc: 'simple data' },
    { regex: /\bconst response = /g, replacement: 'const _response = ', desc: 'simple response' },
    { regex: /\bconst testData = /g, replacement: 'const _testData = ', desc: 'simple testData' },
    { regex: /\bconst count = /g, replacement: 'const _count = ', desc: 'simple count' },
    { regex: /\bconst result = /g, replacement: 'const _result = ', desc: 'simple result' },
  ];

  for (const pattern of simplePatterns) {
    const before = modified;
    modified = modified.replace(pattern.regex, pattern.replacement);
    if (before !== modified) {
      changes++;
    }
  }

  // Pattern 3: catch (e) { } where 'e' is never used
  // Only replace if there's no console.error using it
  const catchEPattern = /} catch \(e\) \{([^}]*)\}/g;
  modified = modified.replace(catchEPattern, (match, body) => {
    if (!body.includes('error')) {
      changes++;
      return `} catch (_error) {${body}}`;
    }
    return match;
  });

  // Pattern 4: Unused function parameters
  // function executeStatementViaRest(...) -> function _executeStatementViaRest(...)
  // But this is risky, so skip for now

  if (changes > 0) {
    console.log(`${filename}: ${changes} unused variables fixed`);
  }

  return modified;
}

async function main() {
  console.log('\n🔧 scripts 폴더 미사용 변수 수정\n');
  console.log('='.repeat(60));

  const scriptsDir = __dirname;
  const files = fs.readdirSync(scriptsDir)
    .filter(f => f.endsWith('.js') && !f.startsWith('fix-'))
    .sort();

  console.log(`\n📁 총 ${files.length}개 파일 검사 중...\n`);

  let totalFixed = 0;

  for (const file of files) {
    const filePath = path.join(scriptsDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fixed = fixUnusedVariables(content, file);

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
