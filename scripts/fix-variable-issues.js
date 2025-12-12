#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const fs = require('fs');
const path = require('path');

console.log('🔧 변수 이슈 수정 중...\n');

const fixes = [
  // 1. analyze-sonarqube.js - Remove unused 'endpoint' assignments
  {
    file: 'analyze-sonarqube.js',
    line: 90,
    find: '    const endpoint = rules[ruleId] || ruleId;',
    replace: '    // endpoint variable removed - not used',
    description: 'Remove unused endpoint variable (line 90)'
  },
  {
    file: 'analyze-sonarqube.js',
    line: 122,
    find: '        const endpoint = rules[match[1]] || match[1];',
    replace: '        // endpoint variable removed - not used',
    description: 'Remove unused endpoint variable (line 122)'
  },

  // 2. create-storage-buckets.js - Prefix unused query parameter
  {
    file: 'create-storage-buckets.js',
    line: 12,
    find: 'async function executeQuery(query) {',
    replace: 'async function executeQuery(_query) {',
    description: 'Prefix unused query parameter'
  },

  // 3. execute-migration-api.js - Remove unused psqlError
  {
    file: 'execute-migration-api.js',
    line: 107,
    find: '  } catch (psqlError) {',
    replace: '  } catch {',
    description: 'Remove unused psqlError parameter'
  },

  // 4. push-to-supabase-api.js - Remove unused path variable
  {
    file: 'push-to-supabase-api.js',
    line: 3,
    find: "const path = require('path');",
    replace: "// path module removed - not used",
    description: 'Remove unused path import'
  },

  // 5. seed-sellers-and-services.js - Prefix unused categorySlug
  {
    file: 'seed-sellers-and-services.js',
    line: 90,
    find: 'function generateServiceData(serviceName, categorySlug) {',
    replace: 'function generateServiceData(serviceName, _categorySlug) {',
    description: 'Prefix unused categorySlug parameter'
  },

  // 6. fix-all-eslint-errors.js - Remove dead store
  {
    file: 'fix-all-eslint-errors.js',
    line: 16,
    find: '  let modified = false;',
    replace: '  // modified variable removed - not actually used',
    description: 'Remove unused modified variable'
  },

  // 7. fix-ignored-exceptions.js - Remove dead store
  {
    file: 'fix-ignored-exceptions.js',
    line: 11,
    find: '  let modified = false;',
    replace: '  // modified variable removed - not actually used',
    description: 'Remove unused modified variable'
  },

  // 8. fix-sonarjs-unused-vars.js - Change let to const
  {
    file: 'fix-sonarjs-unused-vars.js',
    line: 49,
    find: '  let content = fs.readFileSync(filePath, \'utf8\');',
    replace: '  const content = fs.readFileSync(filePath, \'utf8\');',
    description: 'Change let to const for content'
  },

  // 9. fix-unused-vars-typescript.js - Change let to const
  {
    file: 'fix-unused-vars-typescript.js',
    line: 17,
    find: '  let content = fs.readFileSync(filePath, \'utf8\');',
    replace: '  const content = fs.readFileSync(filePath, \'utf8\');',
    description: 'Change let to const for content'
  }
];

let fixedCount = 0;
let failedCount = 0;

fixes.forEach((fix, idx) => {
  console.log(`${idx + 1}. ${fix.description}`);

  const filePath = path.join(__dirname, fix.file);

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes(fix.find)) {
      content = content.replace(fix.find, fix.replace);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`   ✅ Fixed\n`);
      fixedCount++;
    } else {
      console.log(`   ⚠️  Pattern not found\n`);
      failedCount++;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    failedCount++;
  }
});

console.log('='.repeat(60));
console.log(`✅ ${fixedCount}개 수정 완료`);
if (failedCount > 0) {
  console.log(`⚠️  ${failedCount}개 수정 실패 (수동 확인 필요)`);
}
console.log('='.repeat(60));
console.log('\n📝 수동 수정 필요한 파일:');
console.log('  - import-csv-safe.js:261 (commented code)');
console.log('  - push-to-supabase-api.js:47 (commented code)');
console.log('  - update-vercel-interactive.js:55 (duplicated branches)');
console.log('  - check-env-keys.js:22 (regex anchor precedence)\n');
