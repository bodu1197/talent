#!/usr/bin/env node

/**
 * .env.local 파일에 SonarQube 설정 추가 스크립트
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

console.log('🔧 .env.local 파일에 SonarQube 설정 추가 중...\n');

// .env.local 파일 읽기
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env.local 파일을 찾았습니다.');
} catch (error) {
  console.log('⚠️  .env.local 파일이 없습니다. 새로 생성합니다.');
}

// SonarQube 설정이 이미 있는지 확인
if (envContent.includes('SONARQUBE_')) {
  console.log('⚠️  SonarQube 설정이 이미 존재합니다.');
  console.log('\n현재 설정:');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.includes('SONARQUBE_')) {
      console.log(`   ${line}`);
    }
  });
  console.log('\n설정을 변경하려면 .env.local 파일을 직접 수정하세요.\n');
  process.exit(0);
}

// SonarQube 설정 추가
const sonarQubeConfig = `

# ========================================
# SonarQube MCP 설정
# ========================================
#
# 옵션 1: SonarCloud 사용 (추천 - 무료)
# 아래 주석을 제거하고 실제 값으로 변경:
# SONARQUBE_HOST_URL=https://sonarcloud.io
# SONARQUBE_TOKEN=여기에-SonarCloud-토큰-입력
# SONARQUBE_ORG=여기에-조직명-입력
# SONARQUBE_PROJECT_KEY=ai-talent-hub
#
# 옵션 2: 로컬 SonarQube 사용 (Docker 필요)
# 아래 주석을 제거하고 토큰 입력:
# SONARQUBE_HOST_URL=http://localhost:9000
# SONARQUBE_TOKEN=여기에-로컬-토큰-입력
# SONARQUBE_PROJECT_KEY=ai-talent-hub
#
# 토큰 생성 방법은 SONARQUBE_SETUP.md 파일 참고
# ========================================
`;

// 파일에 추가
const newContent = envContent + sonarQubeConfig;
fs.writeFileSync(envPath, newContent, 'utf8');

console.log('\n✅ SonarQube 설정이 .env.local에 추가되었습니다!\n');
console.log('📋 다음 단계:');
console.log('1. .env.local 파일을 열기');
console.log('2. SONARQUBE_ 섹션에서 사용할 옵션의 주석(#) 제거');
console.log('3. 토큰 생성 후 입력');
console.log('4. 저장\n');
console.log('📖 상세 가이드: SONARQUBE_SETUP.md');
console.log('🧪 설정 확인: npm run sonar:test\n');
