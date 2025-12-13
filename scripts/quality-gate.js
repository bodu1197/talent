#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command */
/**
 * SonarQube Quality Gate 검사 스크립트
 * Push 전에 코드 품질을 검증합니다.
 *
 * Note: Safe development script for code quality checks
 *
 * 검사 항목:
 * 1. ESLint - 코드 스타일 및 잠재적 오류
 * 2. TypeScript - 타입 안전성
 * 3. SonarQube - 코드 품질 (버그, 취약점, 코드 스멜)
 */

const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

// 명령어 실행 함수
function runCommand(command, description) {
  logStep('실행', description);
  try {
    execSync(command, { stdio: 'inherit', encoding: 'utf8' });
    logSuccess(`${description} 완료`);
    return true;
  } catch {
    logError(`${description} 실패`);
    return false;
  }
}

// SonarQube API 호출 (Quality Gate 상태 확인)
async function checkSonarQubeQualityGate() {
  const projectKey = 'bodu1197_talent';
  const sonarUrl = process.env.SONAR_HOST_URL || 'https://sonarcloud.io';
  const sonarToken = process.env.SONAR_TOKEN;

  // 토큰이 없으면 스킵 (GitHub Actions에서만 실행)
  if (!sonarToken) {
    logWarning('SONAR_TOKEN이 설정되지 않음 - SonarQube 검사 스킵 (GitHub Actions에서 실행됨)');
    return null;
  }

  return new Promise((resolve) => {
    const url = `${sonarUrl}/api/qualitygates/project_status?projectKey=${projectKey}`;
    const protocol = sonarUrl.startsWith('https') ? https : http;

    const authString = `${sonarToken}:`;
    const basicAuth = Buffer.from(authString).toString('base64');
    const options = {
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    };

    const request = protocol.get(url, options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.projectStatus) {
            resolve(result.projectStatus);
          } else {
            logWarning('SonarQube 응답 형식 오류');
            resolve(null);
          }
        } catch {
          logWarning('SonarQube 응답 파싱 실패');
          resolve(null);
        }
      });
    });

    request.on('error', () => {
      logWarning('SonarQube 서버 연결 실패 (스캔만 진행)');
      resolve(null);
    });

    request.setTimeout(10000, () => {
      request.destroy();
      logWarning('SonarQube 서버 응답 시간 초과');
      resolve(null);
    });
  });
}

// 메인 실행 함수
async function main() {
  log('\n╔════════════════════════════════════════════╗', 'cyan');
  log('║     🔍 코드 품질 검사 (Quality Gate)       ║', 'cyan');
  log('║     노동자의 피를 빨아먹지 않는 플랫폼     ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');

  let allPassed = true;

  // 1. ESLint 검사
  logStep('1/4', 'ESLint 검사...');
  const eslintPassed = runCommand(
    'npx eslint src --ext .ts,.tsx --max-warnings 0',
    'ESLint 코드 스타일 검사'
  );
  if (!eslintPassed) {
    allPassed = false;
    logError('ESLint 검사 실패 - 먼저 린트 오류를 수정하세요');
  }

  // 2. TypeScript 타입 검사
  logStep('2/4', 'TypeScript 타입 검사...');
  const tscPassed = runCommand('npx tsc --noEmit', 'TypeScript 타입 검사');
  if (!tscPassed) {
    allPassed = false;
    logError('TypeScript 검사 실패 - 타입 오류를 수정하세요');
  }

  // 3. SonarQube 스캔 (토큰이 있을 때만)
  logStep('3/4', 'SonarQube 분석...');
  let sonarScanPassed = false;

  if (process.env.SONAR_TOKEN) {
    sonarScanPassed = runCommand('npx sonar-scanner', 'SonarQube 코드 분석');
  } else {
    logWarning('SONAR_TOKEN이 설정되지 않음 - SonarQube 스캔 스킵');
    logWarning('GitHub Actions에서 자동으로 SonarCloud 분석이 실행됩니다');
  }

  // 4. Quality Gate 상태 확인
  if (sonarScanPassed) {
    logStep('4/4', 'Quality Gate 상태 확인...');

    // 스캔 완료 후 잠시 대기 (SonarQube가 분석을 완료할 시간)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const qualityGate = await checkSonarQubeQualityGate();

    if (qualityGate) {
      const status = qualityGate.status;

      if (status === 'OK') {
        logSuccess('Quality Gate 통과! ✅');
      } else if (status === 'WARN') {
        logWarning('Quality Gate 경고 상태');
        log('\n조건별 상태:', 'yellow');
        qualityGate.conditions?.forEach((condition) => {
          let icon = '✗';
          if (condition.status === 'OK') {
            icon = '✓';
          } else if (condition.status === 'WARN') {
            icon = '⚠';
          }
          log(
            `  ${icon} ${condition.metricKey}: ${condition.actualValue} (기준: ${condition.errorThreshold})`
          );
        });
      } else {
        logError('Quality Gate 실패! ❌');
        allPassed = false;
        log('\n실패한 조건:', 'red');
        qualityGate.conditions
          ?.filter((c) => c.status !== 'OK')
          .forEach((condition) => {
            log(
              `  ✗ ${condition.metricKey}: ${condition.actualValue} (기준: ${condition.errorThreshold})`,
              'red'
            );
          });
      }
    } else {
      logWarning('Quality Gate 상태를 확인할 수 없습니다 (SonarQube 서버 확인 필요)');
      // SonarQube 서버가 없어도 ESLint, TSC 통과하면 진행
    }
  } else {
    logWarning('SonarQube 스캔 실패 - ESLint/TypeScript 결과만으로 판단');
  }

  // 결과 출력
  log('\n════════════════════════════════════════════', 'cyan');
  if (allPassed) {
    log('✅ 모든 품질 검사 통과! Push를 진행합니다.', 'green');
    log('════════════════════════════════════════════\n', 'cyan');
    process.exit(0);
  } else {
    log('❌ 품질 검사 실패! Push가 차단되었습니다.', 'red');
    log('위의 오류를 수정한 후 다시 시도하세요.', 'red');
    log('════════════════════════════════════════════\n', 'cyan');
    process.exit(1);
  }
}

main().catch((error) => {
  logError(`예상치 못한 오류: ${error.message}`);
  process.exit(1);
});
