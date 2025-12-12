#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * Fix ALL unused variable errors comprehensively
 */

const fs = require('fs');
const path = require('path');

function fixAllUnusedVars(content, filename) {
  let modified = content;
  let changes = 0;

  // Pattern 1: Remove completely unused imports
  // const { createClient } = require(...); where createClient is never used
  const unusedImports = [
    /const \{ createClient \} = require\('@supabase\/supabase-js'\);\n/g,
  ];

  for (const pattern of unusedImports) {
    if (content.match(pattern) && !content.includes('createClient(')) {
      modified = modified.replace(pattern, '// Unused import removed\n');
      changes++;
    }
  }

  // Pattern 2: Remove unused top-level const declarations
  const unusedConsts = [
    { regex: /^const DB_PASSWORD = [^;]+;\n/gm, check: 'DB_PASSWORD' },
    { regex: /^const SUPABASE_URL = [^;]+;\n/gm, check: 'SUPABASE_URL' },
    { regex: /^const supabaseUrl = [^;]+;\n/gm, check: 'supabaseUrl' },
    { regex: /^const supabaseServiceKey = [^;]+;\n/gm, check: 'supabaseServiceKey' },
  ];

  for (const { regex, check } of unusedConsts) {
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      // Count usage (excluding the declaration itself)
      const usageCount = (content.match(new RegExp(check, 'g')) || []).length;
      if (usageCount <= 1) {
        // Only the declaration, no actual usage
        modified = modified.replace(regex, '');
        changes++;
      }
    }
  }

  // Pattern 3: Await expressions that assign to unused variables
  // const _result = await ... -> await ...
  const awaitPatterns = [
    /const _result = (await [^;]+;)/g,
    /const _data = (await [^;]+;)/g,
    /const _response = (await [^;]+;)/g,
    /const _count = (await [^;]+;)/g,
  ];

  for (const pattern of awaitPatterns) {
    modified = modified.replace(pattern, '$1');
    if (modified !== content) changes++;
  }

  // Pattern 4: Unused function parameters
  // function executeStatementViaRest(...) -> Prefix with _
  modified = modified.replace(/function executeStatementViaRest\(/g, 'function _executeStatementViaRest(');
  if (modified !== content) changes++;

  // Pattern 5: Simple unused variables in assignments
  // const result = something(); where result is never used
  // Match pattern: const varName = ...;
  const lines = modified.split('\n');
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(\s*)const ([a-zA-Z_]\w*) = (.+);$/);

    if (match) {
      const [, indent, varName, value] = match;

      // Check if variable is used later in the file
      const restOfFile = lines.slice(i + 1).join('\n');
      const usageRegex = new RegExp(`\\b${varName}\\b`, 'g');
      const usages = (restOfFile.match(usageRegex) || []).length;

      if (usages === 0 && !varName.startsWith('_')) {
        // Variable is never used, remove it or comment it out
        if (value.includes('await') || value.includes('=')) {
          // Keep the side effect but remove assignment
          const cleanValue = value.replace(/^await\s+/, '');
          if (cleanValue.includes('(')) {
            newLines.push(`${indent}await ${cleanValue};`);
            changes++;
            continue;
          }
        }
        // Otherwise just remove the line
        newLines.push(`${indent}// Removed unused: const ${varName} = ${value};`);
        changes++;
        continue;
      }
    }

    newLines.push(line);
  }

  if (changes > 0) {
    modified = newLines.join('\n');
  }

  if (changes > 0) {
    console.log(`${filename}: ${changes} unused variables fixed`);
  }

  return modified;
}

async function main() {
  console.log('\n🔧 scripts 폴더 모든 미사용 변수 완전 제거\n');
  console.log('='.repeat(60));

  const scriptsDir = __dirname;
  const files = fs.readdirSync(scriptsDir)
    .filter(f => f.endsWith('.js') && !f.startsWith('fix-') && !f.startsWith('analyze-'))
    .sort();

  console.log(`\n📁 총 ${files.length}개 파일 검사 중...\n`);

  let totalFixed = 0;

  for (const file of files) {
    const filePath = path.join(scriptsDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fixed = fixAllUnusedVars(content, file);

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
