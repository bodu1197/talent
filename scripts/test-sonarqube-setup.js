#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * SonarQube MCP 설정 테스트 스크립트
 *
 * 이 스크립트는 SonarQube MCP가 올바르게 설정되었는지 확인합니다.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 SonarQube MCP 설정 검증 시작...\n');

const checks = [];

// 1. sonar-project.properties 존재 확인
const sonarPropertiesPath = path.join(process.cwd(), 'sonar-project.properties');
if (fs.existsSync(sonarPropertiesPath)) {
  checks.push({ name: 'sonar-project.properties', status: '✅', message: '파일 존재' });
} else {
  checks.push({ name: 'sonar-project.properties', status: '❌', message: '파일 없음' });
}

// 2. docker-compose.yml 존재 확인
const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
if (fs.existsSync(dockerComposePath)) {
  checks.push({ name: 'docker-compose.yml', status: '✅', message: '파일 존재' });
} else {
  checks.push({ name: 'docker-compose.yml', status: '❌', message: '파일 없음' });
}

// 3. sonarqube-scanner 패키지 확인
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.devDependencies && packageJson.devDependencies['sonarqube-scanner']) {
  checks.push({ name: 'sonarqube-scanner npm package', status: '✅', message: '설치됨' });
} else {
  checks.push({ name: 'sonarqube-scanner npm package', status: '❌', message: '미설치' });
}

// 4. npm scripts 확인
const hasScripts =
  packageJson.scripts &&
  packageJson.scripts['sonar'] &&
  packageJson.scripts['sonar:local'] &&
  packageJson.scripts['sonar:cloud'];
if (hasScripts) {
  checks.push({ name: 'SonarQube npm scripts', status: '✅', message: '설정됨' });
} else {
  checks.push({ name: 'SonarQube npm scripts', status: '❌', message: '미설정' });
}

// 5. 환경 변수 확인
const hasEnvToken = process.env.SONARQUBE_TOKEN;
const hasEnvHost = process.env.SONARQUBE_HOST_URL;
if (hasEnvToken && hasEnvHost) {
  checks.push({
    name: '환경 변수 (SONARQUBE_TOKEN, SONARQUBE_HOST_URL)',
    status: '✅',
    message: '설정됨',
  });
} else {
  checks.push({
    name: '환경 변수 (SONARQUBE_TOKEN, SONARQUBE_HOST_URL)',
    status: '⚠️',
    message: '미설정 (.env.local에 추가 필요)',
  });
}

// 6. SONARQUBE_SETUP.md 가이드 확인
const setupGuidePath = path.join(process.cwd(), 'SONARQUBE_SETUP.md');
if (fs.existsSync(setupGuidePath)) {
  checks.push({ name: 'SONARQUBE_SETUP.md 가이드', status: '✅', message: '파일 존재' });
} else {
  checks.push({ name: 'SONARQUBE_SETUP.md 가이드', status: '❌', message: '파일 없음' });
}

// 결과 출력
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('                  검증 결과                           ');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

checks.forEach((check) => {
  console.log(`${check.status} ${check.name}`);
  console.log(`   → ${check.message}\n`);
});

const allPassed = checks.every((check) => check.status === '✅');
const hasWarnings = checks.some((check) => check.status === '⚠️');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (allPassed) {
  console.log('🎉 모든 설정이 완료되었습니다!');
  console.log('\n다음 단계:');
  console.log('1. .env.local에 SONARQUBE_TOKEN 추가');
  console.log('2. Docker로 로컬 SonarQube 실행: docker-compose up -d');
  console.log('3. 또는 SonarCloud 사용');
  console.log('4. 분석 실행: npm run sonar:local 또는 npm run sonar:cloud\n');
} else if (hasWarnings) {
  console.log('⚠️  기본 설정은 완료되었으나 환경 변수 설정이 필요합니다.');
  console.log('\n다음 단계:');
  console.log('1. SONARQUBE_SETUP.md 가이드를 참고하여 환경 변수 설정');
  console.log('2. .env.local에 SONARQUBE_TOKEN과 SONARQUBE_HOST_URL 추가\n');
} else {
  console.log('❌ 일부 설정이 누락되었습니다.');
  console.log('\n해결 방법:');
  console.log('1. SONARQUBE_SETUP.md 가이드를 참고하세요');
  console.log('2. 누락된 파일을 생성하세요\n');
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📖 상세 가이드: SONARQUBE_SETUP.md');
console.log('🐳 Docker 실행: docker-compose up -d');
console.log('🔍 분석 실행: npm run sonar:local\n');
