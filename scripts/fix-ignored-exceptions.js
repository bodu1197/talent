#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * Fix ignored exception errors by ensuring error variable is actually used
 */

const fs = require('fs');
const path = require('path');

function fixIgnoredExceptions(content, filename) {
  let changes = 0;

  // Pattern: catch (error) { console.log(...) } where error is not used
  // Replace console.log with console.error and include the error
  const catchPattern = /} catch \(error\) \{([^}]+)\}/g;

  let modified = content.replace(catchPattern, (match, body) => {
    // Check if error is already used in the body
    if (body.includes('error')) {
      return match; // Already uses error, no change needed
    }

    // Check if there's a console.log without error
    if (body.includes('console.log')) {
      changes++;
      // Add error usage to the console statement
      const updatedBody = body.replace(/console\.log\(([^)]+)\);/, (logMatch, message) => {
        // Check if message already mentions error
        if (message.includes('error')) {
          return logMatch;
        }
        // Add error to the message
        return `console.log(${message}, error);`;
      });
      return `} catch (error) {${updatedBody}}`;
    }

    // Check if body is just a comment or empty - add console.error
    if (body.trim() === '' || body.trim().startsWith('//')) {
      changes++;
      const indent = body.match(/^\s*/)?.[0] || '\n  ';
      return `} catch (error) {${indent}console.error('에러 발생:', error);${body}}`;
    }

    return match;
  });

  // Pattern: catch (_error) { ... } where _error is never used  // Remove the underscore and actually use it
  const catchUnderscorePattern = /} catch \(_error\) \{([^}]+)\}/g;

  modified = modified.replace(catchUnderscorePattern, (match, body) => {
    if (body.includes('error')) {
      return match; // Already uses error
    }

    changes++;
    const indent = body.match(/^\s*/)?.[0] || '\n  ';
    return `} catch (error) {${indent}console.error('에러 발생:', error);${body}}`;
  });

  if (changes > 0) {
    console.log(`${filename}: ${changes} ignored exceptions fixed`);
  }

  return modified;
}

async function main() {
  console.log('\n🔧 scripts 폴더 무시된 예외 수정\n');
  console.log('='.repeat(60));

  const scriptsDir = __dirname;
  const files = fs
    .readdirSync(scriptsDir)
    .filter((f) => f.endsWith('.js') && !f.startsWith('fix-') && !f.startsWith('analyze-'))
    .sort();

  console.log(`\n📁 총 ${files.length}개 파일 검사 중...\n`);

  let totalFixed = 0;

  for (const file of files) {
    const filePath = path.join(scriptsDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fixed = fixIgnoredExceptions(content, file);

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
