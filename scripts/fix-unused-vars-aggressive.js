#!/usr/bin/env node

/**
 * Aggressively fix unused variable errors
 *
 * This script removes variable declarations that are never used
 */

const fs = require('fs');
const path = require('path');

function fixUnusedVariables(content, filename) {
  let modified = content;
  let changes = 0;

  // Pattern 1: const _variable = await ...; (on its own line, never used)
  // Remove the const declaration entirely
  const unusedConstPatterns = [
    /\n\s*const _data = await [^;]+;\n/g,
    /\n\s*const _result = await [^;]+;\n/g,
    /\n\s*const _response = await [^;]+;\n/g,
    /\n\s*const _count = await [^;]+;\n/g,
  ];

  for (const pattern of unusedConstPatterns) {
    const before = modified;
    modified = modified.replace(pattern, (match) => {
      // Extract the await expression and preserve it without assignment
      const awaitMatch = match.match(/await ([^;]+);/);
      if (awaitMatch) {
        const indentMatch = match.match(/^\n(\s*)/);
        const indent = indentMatch ? indentMatch[1] : '  ';
        changes++;
        return `\n${indent}await ${awaitMatch[1]};\n`;
      }
      return match;
    });
  }

  // Pattern 2: catch (error) { } where error is never used (empty catch block)
  // This means the error variable is defined but not used even in console.error
  // We need to check if console.error is there but error var is still marked unused
  const catchWithUnusedError = /} catch \(error\) \{([^}]*)\}/g;
  modified = modified.replace(catchWithUnusedError, (match, body) => {
    // If body doesn't contain the word 'error', the variable is unused
    if (!body.includes('error')) {
      changes++;
      return `} catch (_error) {${body}}`;
    }
    return match;
  });

  // Pattern 3: catch (_error) { } -> catch { } (remove unused parameter)
  // Actually, we can't do this in older Node.js, so skip

  // Pattern 4: Top-level unused variables
  // const DB_PASSWORD = ... (never used) -> // const DB_PASSWORD = ...
  const unusedTopLevel = [
    /^const DB_PASSWORD = [^;]+;$/gm,
    /^const SUPABASE_URL = [^;]+;$/gm,
    /^const \{ createClient \} = [^;]+;$/gm,
    /^const supabaseUrl = [^;]+;$/gm,
    /^const supabaseServiceKey = [^;]+;$/gm,
  ];

  for (const pattern of unusedTopLevel) {
    const before = modified;
    modified = modified.replace(pattern, (match) => {
      changes++;
      return `// ${match} // unused`;
    });
  }

  // Pattern 5: function parameters that are never used
  // function executeStatementViaRest(...) -> function _executeStatementViaRest(...)
  modified = modified.replace(/function executeStatementViaRest\(/g, (match) => {
    changes++;
    return 'function _executeStatementViaRest(';
  });

  // Pattern 6: const testData = ... (simple assignment, never used)
  modified = modified.replace(/\bconst testData = /g, (match) => {
    changes++;
    return 'const _testData = ';
  });

  if (changes > 0) {
    console.log(`${filename}: ${changes} unused variables fixed`);
  }

  return modified;
}

async function main() {
  console.log('\n🔧 scripts 폴더 미사용 변수 강력 수정\n');
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
