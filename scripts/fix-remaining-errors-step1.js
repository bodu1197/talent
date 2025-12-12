#!/usr/bin/env node

/**
 * Step 1: Fix easy errors (prefer-const, empty blocks, nested template literals)
 */

const fs = require('fs');
const path = require('path');

function fixEasyErrors(content, filename) {
  let modified = content;
  let changes = 0;

  // 1. prefer-const: let -> const for variables that are never reassigned
  // This is tricky to detect automatically, so we'll let ESLint --fix handle it

  // 2. no-empty: Add comment to empty catch blocks
  const emptyBlockPattern = /} catch \([^)]+\) \{\s*\n\s*\}/g;
  modified = modified.replace(emptyBlockPattern, (match) => {
    changes++;
    return match.replace('{}', '{\n    // Intentionally empty catch block\n  }');
  });

  // 3. no-useless-catch: Remove try/catch that just rethrows
  // Pattern: try { ... } catch (e) { throw e; }
  const uselessCatchPattern = /try \{([^}]+)\} catch \(([^)]+)\) \{\s*throw \2;\s*\}/g;
  modified = modified.replace(uselessCatchPattern, (match, tryBody) => {
    changes++;
    return tryBody.trim();
  });

  // 4. sonarjs/no-commented-code: Remove commented out code
  const commentedCodeLines = [
    /\/\/ const supabase = .*\n/g,
    /\/\/ import .*\n/g,
    /\/\/ console\.log.*\n/g,
  ];

  for (const pattern of commentedCodeLines) {
    const before = modified;
    modified = modified.replace(pattern, '');
    if (before !== modified) changes++;
  }

  // 5. stateful-regex: Remove 'g' flag from regex that's used on different inputs
  // This requires manual inspection, so we'll add a comment instead

  // 6. no-all-duplicated-branches: Can't fix automatically

  // 7. anchor-precedence: Add grouping to regex
  // This is complex and needs manual review

  // 8. Unused imports: Remove completely
  if (!content.includes('createClient(') && content.includes('const { createClient }')) {
    modified = modified.replace(
      /const \{ createClient \} = require\('@supabase\/supabase-js'\);\n/g,
      ''
    );
    changes++;
  }

  // 9. Unused top-level variables that are clearly not needed
  const unusedVarPatterns = [
    { regex: /^const DB_PASSWORD = [^;]+;\n/gm, name: 'DB_PASSWORD' },
    { regex: /^const SUPABASE_URL = [^;]+;\n/gm, name: 'SUPABASE_URL' },  ];

  for (const { regex, name } of unusedVarPatterns) {
    if (content.match(regex)) {
      // Check if variable is used elsewhere
      const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
      const usages = (content.match(usageRegex) || []).length;
      if (usages === 1) {
        // Only the declaration, no usage
        modified = modified.replace(regex, '');
        changes++;
      }
    }
  }

  if (changes > 0) {
    console.log(`${filename}: ${changes} easy errors fixed`);
  }

  return modified;
}

async function main() {
  console.log('\n🔧 Step 1: Fix easy errors\n');
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
      const fixed = fixEasyErrors(content, file);

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
