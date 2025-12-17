#!/usr/bin/env node

/**
 * SonarCloud 최신 분석 결과 조회 스크립트
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SONARCLOUD_URL = 'https://sonarcloud.io';
const SONARCLOUD_TOKEN = '200602fde79002742ee84deb524e8d53850bfedd';
const PROJECT_KEY = 'bodu1197_talent';
const ORGANIZATION = 'bodu1197';

// API 호출 함수
function apiCall(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, SONARCLOUD_URL);
    const auth = Buffer.from(`${SONARCLOUD_TOKEN}:`).toString('base64');

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    };

    https
      .get(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            console.error('JSON 파싱 에러:', error);
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

// 메인 함수
async function main() {
  console.log('🚀 SonarCloud 최신 분석 결과 조회 중...\n');

  try {
    // 1. Quality Gate 상태 조회
    console.log('1️⃣ Quality Gate 상태 조회 중...');
    const qualityGate = await apiCall(
      `/api/qualitygates/project_status?projectKey=${PROJECT_KEY}`
    );
    console.log(`   ✅ Quality Gate: ${qualityGate.projectStatus.status}\n`);

    // 2. 프로젝트 메트릭 조회
    console.log('2️⃣ 프로젝트 메트릭 조회 중...');
    const metrics = await apiCall(
      `/api/measures/component?component=${PROJECT_KEY}&metricKeys=bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,security_hotspots,ncloc,complexity,cognitive_complexity,sqale_index,reliability_rating,security_rating,sqale_rating,new_bugs,new_vulnerabilities,new_code_smells,new_coverage,new_duplicated_lines_density,new_reliability_rating,new_security_rating,new_maintainability_rating`
    );
    console.log(`   ✅ 메트릭 ${metrics.component.measures.length}개 조회 완료\n`);

    // 3. 이슈 조회 (MAJOR 이상)
    console.log('3️⃣ 주요 이슈 조회 중...');
    const issues = await apiCall(
      `/api/issues/search?componentKeys=${PROJECT_KEY}&severities=BLOCKER,CRITICAL,MAJOR&ps=500`
    );
    console.log(`   ✅ 이슈 ${issues.total}개 조회 완료\n`);

    // 4. 보안 핫스팟 조회
    console.log('4️⃣ 보안 핫스팟 조회 중...');
    const hotspots = await apiCall(
      `/api/hotspots/search?projectKey=${PROJECT_KEY}&ps=500`
    );
    console.log(`   ✅ 핫스팟 ${hotspots.paging.total}개 조회 완료\n`);

    // 결과 정리
    const result = {
      timestamp: new Date().toISOString(),
      projectKey: PROJECT_KEY,
      organization: ORGANIZATION,
      qualityGate: qualityGate.projectStatus,
      metrics: {},
      issues: {
        total: issues.total,
        byType: {},
        bySeverity: {},
        byTag: {},
        items: issues.issues,
      },
      hotspots: {
        total: hotspots.paging.total,
        items: hotspots.hotspots || [],
      },
    };

    // 메트릭 정리
    metrics.component.measures.forEach((measure) => {
      result.metrics[measure.metric] = measure.value || measure.periods?.[0]?.value || '0';
    });

    // 이슈 분석
    issues.issues.forEach((issue) => {
      // 타입별
      result.issues.byType[issue.type] = (result.issues.byType[issue.type] || 0) + 1;

      // 심각도별
      result.issues.bySeverity[issue.severity] =
        (result.issues.bySeverity[issue.severity] || 0) + 1;

      // 태그별
      issue.tags?.forEach((tag) => {
        result.issues.byTag[tag] = (result.issues.byTag[tag] || 0) + 1;
      });
    });

    // JSON 파일 저장
    const jsonPath = path.join(process.cwd(), 'sonarcloud-latest-result.json');
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');

    console.log('='.repeat(60));
    console.log('\n📊 최신 분석 결과\n');
    console.log(`Quality Gate: ${result.qualityGate.status}`);
    console.log(`\n주요 메트릭:`);
    console.log(`  - 코드 라인 수: ${parseInt(result.metrics.ncloc || 0).toLocaleString()}`);
    console.log(`  - 버그: ${result.metrics.bugs || 0}`);
    console.log(`  - 취약점: ${result.metrics.vulnerabilities || 0}`);
    console.log(`  - 코드 스멜: ${result.metrics.code_smells || 0}`);
    console.log(`  - 보안 핫스팟: ${result.metrics.security_hotspots || 0}`);
    console.log(`  - 커버리지: ${result.metrics.coverage || 0}%`);
    console.log(`  - 중복 코드: ${result.metrics.duplicated_lines_density || 0}%`);
    console.log(`  - 기술 부채: ${Math.round((result.metrics.sqale_index || 0) / 60)}시간`);

    console.log(`\n신규 코드 메트릭 (New Code):`);
    console.log(`  - 신규 버그: ${result.metrics.new_bugs || 0}`);
    console.log(`  - 신규 취약점: ${result.metrics.new_vulnerabilities || 0}`);
    console.log(`  - 신규 코드 스멜: ${result.metrics.new_code_smells || 0}`);
    console.log(`  - 신규 코드 커버리지: ${result.metrics.new_coverage || 0}%`);

    console.log(`\n이슈 통계:`);
    console.log(`  - 총 이슈 수: ${result.issues.total}`);
    Object.entries(result.issues.bySeverity).forEach(([severity, count]) => {
      console.log(`  - ${severity}: ${count}`);
    });

    console.log(`\n보안 핫스팟: ${result.hotspots.total}개`);

    console.log(`\n✅ 결과 저장: ${jsonPath}\n`);
    console.log('='.repeat(60));

    return result;
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 실행
main();
