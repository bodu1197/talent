const fs = require('fs');
const glob = require('glob');

// 에러 메시지 매핑 (영어 -> 한국어)
const errorMappings = {
  'Unauthorized': '로그인이 필요합니다',
  'Not authorized': '권한이 없습니다',
  'Profile not found': '프로필을 찾을 수 없습니다',
  'Service not found': '서비스를 찾을 수 없습니다',
};

// API 테스트 파일 찾기
const apiTestFiles = glob.sync('src/__tests__/unit/api/**/*.test.ts', { nodir: true });

let fixedCount = 0;

apiTestFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 각 매핑에 대해 변경
  Object.entries(errorMappings).forEach(([eng, kor]) => {
    const pattern = new RegExp(`expect\(data\.error\)\.toBe\(['"\`]${eng}['"\`]\)`, 'g');
    if (pattern.test(content)) {
      content = content.replace(pattern, `expect(data.error).toBe('${kor}')`);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
    console.log(`✓ Fixed: ${filePath}`);
  }
});

console.log(`\n완료: ${fixedCount}개 파일 수정`);
