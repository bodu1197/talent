#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * scripts 폴더의 모든 ESLint 에러 일괄 수정
 *
 * 수정 내용:
 * 1. catch (e) -> catch (error) + console.error 추가
 * 2. catch (err) -> catch (error) + console.error 추가
 * 3. catch (_) -> catch (_error) + console.error 추가
 */

const fs = require('fs');
const path = require('path');

function fixCatchBlocks(content, filename) {
  let changes = 0;

  // 패턴 1: } catch (e) { ... }
  // 패턴 2: } catch (err) { ... }
  // 이미 console.error가 있는지 확인

  const catchPattern = /} catch \(([e_]|err)\) \{([^}]*?)(\n\s*resolve|\n\s*reject|\n\s*})/g;

  const modified = content.replace(catchPattern, (match, varName, body, ending) => {
    // 이미 console.error가 있으면 변수명만 변경
    if (body.includes('console.error')) {
      changes++;
      return match.replace(new RegExp(`\\(${varName}\\)`), '(error)');
    }

    // console.error 없으면 추가
    // 들여쓰기 감지
    const beforeCatch = content.substring(0, content.indexOf(match));
    const lastNewline = beforeCatch.lastIndexOf('\n');
    const indent = beforeCatch.substring(lastNewline + 1).match(/^\s*/)?.[0] || '    ';

    changes++;
    return `} catch (error) {\n${indent}  console.error('에러 발생:', error);${body}${ending}`;
  });

  console.log(`${filename}: ${changes} catch blocks ${changes > 0 ? '수정됨' : '확인됨'}`);
  return modified;
}

async function main() {
  console.log('\n🔧 scripts 폴더 ESLint 에러 일괄 수정\n');
  console.log('='.repeat(60));

  const scriptsDir = __dirname;
  const files = fs
    .readdirSync(scriptsDir)
    .filter((f) => f.endsWith('.js') && f !== 'fix-all-eslint-errors.js')
    .sort();

  console.log(`\n📁 총 ${files.length}개 파일 검사 중...\n`);

  let totalFixed = 0;

  for (const file of files) {
    const filePath = path.join(scriptsDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fixed = fixCatchBlocks(content, file);

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
