const fs = require('fs');
const glob = require('glob');

// 모든 테스트 파일 찾기
const testFiles = glob.sync('src/__tests__/unit/**/*.test.ts', { nodir: true });

let fixedCount = 0;
let errorCount = 0;

testFiles.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. checkAdminAuth를 사용하지만 import하지 않은 경우
    if (content.includes('checkAdminAuth') && !content.includes('import { checkAdminAuth }')) {
      // checkAdminAuth mock 찾기
      const mockPattern = /vi\.mock\(['"]@\/lib\/admin\/auth['"]/;
      if (mockPattern.test(content)) {
        // import 추가 (vi.mock 다음에)
        content = content.replace(
          /(vi\.mock\(['"]@\/lib\/admin\/auth['"],\s*\(\)\s*=>\s*\({[^}]+}\)\);)/,
          "$1\n\nimport { checkAdminAuth } from '@/lib/admin/auth';"
        );
        modified = true;
      }
    }

    // 2. mockCheckAdminAuth를 사용하지만 import/정의하지 않은 경우
    if (
      content.includes('mockCheckAdminAuth') &&
      !content.includes('import { mockCheckAdminAuth }')
    ) {
      // createMockSupabase import 찾아서 그 다음 줄에 추가
      if (content.includes('import { createMockSupabase }')) {
        content = content.replace(
          /(import { createMockSupabase } from '@\/__tests__\/mocks\/supabase';)/,
          "$1\nimport { mockCheckAdminAuth } from '@/__tests__/mocks/auth';"
        );

        // vi.mock 설정도 수정
        content = content.replace(
          /vi\.mock\(['"]@\/lib\/admin\/auth['"],\s*\(\)\s*=>\s*\({\s*checkAdminAuth:\s*vi\.fn\(\),\s*}\)\);/,
          "vi.mock('@/lib/admin/auth', () => ({\n  checkAdminAuth: mockCheckAdminAuth,\n}));"
        );

        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedCount++;
      console.log(`✓ Fixed: ${filePath}`);
    }
  } catch (error) {
    errorCount++;
    console.error(`✗ Error in ${filePath}:`, error.message);
  }
});

console.log(`\n완료: ${fixedCount}개 파일 수정, ${errorCount}개 에러`);
