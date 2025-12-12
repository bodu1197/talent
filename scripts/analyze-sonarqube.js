#!/usr/bin/env node

/**
 * SonarQube 전체 분석 스크립트
 * - 모든 이슈 수집 및 분석
 * - 보안 취약점 확인
 * - 코드 품질 메트릭 조회
 * - 개선 필요 항목 정리
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SONARQUBE_URL = 'http://localhost:9000';
const SONARQUBE_TOKEN = 'sqa_a6454668bd672faa8dde9d8bb366139925a0f817';
const PROJECT_KEY = 'talent';

// API 호출 함수
function apiCall(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, SONARQUBE_URL);
    const auth = Buffer.from(`${SONARQUBE_TOKEN}:`).toString('base64');

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    };

    const protocol = url.protocol === 'https:' ? https : http;

    protocol
      .get(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            console.error('에러 발생:', error);
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

// 모든 이슈 수집
async function fetchAllIssues() {
  console.log('📊 모든 이슈 수집 중...\n');

  const allIssues = [];
  let page = 1;
  let hasMore = true;
  const pageSize = 500;

  while (hasMore) {
    const endpoint = `/api/issues/search?componentKeys=${PROJECT_KEY}&ps=${pageSize}&p=${page}`;
    const _result = await apiCall(endpoint);

    allIssues.push(...result.issues);

    console.log(
      `   페이지 ${page}: ${result.issues.length}개 이슈 수집 (총 ${allIssues.length}/${result.total})`
    );

    hasMore = allIssues.length < result.total;
    page++;
  }

  console.log(`\n✅ 총 ${allIssues.length}개 이슈 수집 완료\n`);
  return allIssues;
}

// 보안 핫스팟 수집
async function fetchSecurityHotspots() {
  console.log('🔐 보안 핫스팟 조회 중...\n');

  try {
    const endpoint = `/api/hotspots/search?projectKey=${PROJECT_KEY}&ps=500`;
    const _result = await apiCall(endpoint);

    console.log(`✅ ${result.hotspots?.length || 0}개 보안 핫스팟 발견\n`);
    return result.hotspots || [];
  } catch (error) {
    console.log(`⚠️  보안 핫스팟 조회 실패: ${error.message}\n`);
    return [];
  }
}

// 코드 품질 메트릭 조회
async function fetchMetrics() {
  console.log('📈 코드 품질 메트릭 조회 중...\n');

  const metrics = [
    'bugs',
    'vulnerabilities',
    'code_smells',
    'coverage',
    'duplicated_lines_density',
    'security_hotspots',
    'ncloc',
    'complexity',
    'cognitive_complexity',
    'sqale_index',
    'reliability_rating',
    'security_rating',
    'sqale_rating',
  ];

  try {
    const endpoint = `/api/measures/component?component=${PROJECT_KEY}&metricKeys=${metrics.join(',')}`;
    const _result = await apiCall(endpoint);

    console.log('✅ 메트릭 조회 완료\n');
    return result.component.measures;
  } catch (error) {
    console.log(`⚠️  메트릭 조회 실패: ${error.message}\n`);
    return [];
  }
}

// 이슈 분석
function analyzeIssues(issues) {
  console.log('🔍 이슈 분석 중...\n');

  const analysis = {
    총_이슈_수: issues.length,
    심각도별: {},
    타입별: {},
    상태별: {},
    룰별: {},
    파일별: {},
    태그별: {},
    영향도별: {
      MAINTAINABILITY: { HIGH: 0, MEDIUM: 0, LOW: 0 },
      RELIABILITY: { HIGH: 0, MEDIUM: 0, LOW: 0 },
      SECURITY: { HIGH: 0, MEDIUM: 0, LOW: 0 },
    },
  };

  issues.forEach((issue) => {
    // 심각도별
    analysis.심각도별[issue.severity] = (analysis.심각도별[issue.severity] || 0) + 1;

    // 타입별
    analysis.타입별[issue.type] = (analysis.타입별[issue.type] || 0) + 1;

    // 상태별
    analysis.상태별[issue.status] = (analysis.상태별[issue.status] || 0) + 1;

    // 룰별 (상위 20개만)
    analysis.룰별[issue.rule] = (analysis.룰별[issue.rule] || 0) + 1;

    // 파일별 (상위 20개만)
    const fileName = issue.component.split(':').pop();
    analysis.파일별[fileName] = (analysis.파일별[fileName] || 0) + 1;

    // 태그별
    issue.tags?.forEach((tag) => {
      analysis.태그별[tag] = (analysis.태그별[tag] || 0) + 1;
    });

    // 영향도별
    issue.impacts?.forEach((impact) => {
      if (analysis.영향도별[impact.softwareQuality]) {
        analysis.영향도별[impact.softwareQuality][impact.severity]++;
      }
    });
  });

  // 상위 항목만 유지
  analysis.룰별 = Object.fromEntries(
    Object.entries(analysis.룰별)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
  );

  analysis.파일별 = Object.fromEntries(
    Object.entries(analysis.파일별)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
  );

  console.log('✅ 이슈 분석 완료\n');
  return analysis;
}

// 핫스팟 분석
function analyzeHotspots(hotspots) {
  if (!hotspots || hotspots.length === 0) {
    return {
      총_핫스팟_수: 0,
      상태별: {},
      카테고리별: {},
      파일별: {},
    };
  }

  const analysis = {
    총_핫스팟_수: hotspots.length,
    상태별: {},
    카테고리별: {},
    파일별: {},
  };

  hotspots.forEach((hotspot) => {
    // 상태별
    analysis.상태별[hotspot.status] = (analysis.상태별[hotspot.status] || 0) + 1;

    // 카테고리별
    analysis.카테고리별[hotspot.securityCategory] =
      (analysis.카테고리별[hotspot.securityCategory] || 0) + 1;

    // 파일별
    const fileName = hotspot.component.split(':').pop();
    analysis.파일별[fileName] = (analysis.파일별[fileName] || 0) + 1;
  });

  return analysis;
}

// 메트릭 분석
function analyzeMetrics(measures) {
  const metrics = {};

  measures.forEach((measure) => {
    metrics[measure.metric] = measure.value;
  });

  return metrics;
}

// 개선 권장사항 생성
function generateRecommendations(issuesAnalysis, hotspotsAnalysis, metrics) {
  const recommendations = [];

  // 심각한 이슈 체크
  const criticalCount =
    (issuesAnalysis.심각도별.CRITICAL || 0) + (issuesAnalysis.심각도별.BLOCKER || 0);
  if (criticalCount > 0) {
    recommendations.push({
      우선순위: 'CRITICAL',
      카테고리: '심각한 버그',
      설명: `${criticalCount}개의 CRITICAL/BLOCKER 이슈가 있습니다.`,
      조치: '즉시 수정 필요',
    });
  }

  // 보안 취약점 체크
  const vulnerabilities = issuesAnalysis.타입별.VULNERABILITY || 0;
  if (vulnerabilities > 0) {
    recommendations.push({
      우선순위: 'HIGH',
      카테고리: '보안 취약점',
      설명: `${vulnerabilities}개의 보안 취약점이 발견되었습니다.`,
      조치: '보안 검토 및 수정 필요',
    });
  }

  // 보안 핫스팟 체크
  if (hotspotsAnalysis.총_핫스팟_수 > 0) {
    const toReview = hotspotsAnalysis.상태별.TO_REVIEW || 0;
    if (toReview > 0) {
      recommendations.push({
        우선순위: 'HIGH',
        카테고리: '보안 핫스팟',
        설명: `${toReview}개의 보안 핫스팟이 검토 대기 중입니다.`,
        조치: '보안 검토 필요',
      });
    }
  }

  // 버그 체크
  const bugs = issuesAnalysis.타입별.BUG || 0;
  if (bugs > 0) {
    recommendations.push({
      우선순위: 'MEDIUM',
      카테고리: '버그',
      설명: `${bugs}개의 버그가 발견되었습니다.`,
      조치: '우선순위에 따라 수정',
    });
  }

  // 코드 스멜 체크
  const codeSmells = issuesAnalysis.타입별.CODE_SMELL || 0;
  if (codeSmells > 100) {
    recommendations.push({
      우선순위: 'MEDIUM',
      카테고리: '코드 품질',
      설명: `${codeSmells}개의 코드 스멜이 발견되었습니다.`,
      조치: '점진적 리팩토링 필요',
    });
  }

  // 커버리지 체크
  const coverage = parseFloat(metrics.coverage || 0);
  if (coverage < 80) {
    recommendations.push({
      우선순위: 'MEDIUM',
      카테고리: '테스트 커버리지',
      설명: `테스트 커버리지가 ${coverage.toFixed(1)}%로 낮습니다.`,
      조치: '단위 테스트 추가 필요 (목표: 80% 이상)',
    });
  }

  // 중복 코드 체크
  const duplication = parseFloat(metrics.duplicated_lines_density || 0);
  if (duplication > 3) {
    recommendations.push({
      우선순위: 'LOW',
      카테고리: '중복 코드',
      설명: `${duplication.toFixed(1)}%의 중복 코드가 있습니다.`,
      조치: '공통 모듈 추출 권장 (목표: 3% 이하)',
    });
  }

  // 접근성 이슈 체크
  const a11yCount = issuesAnalysis.태그별.accessibility || 0;
  if (a11yCount > 0) {
    recommendations.push({
      우선순위: 'MEDIUM',
      카테고리: '접근성 (Accessibility)',
      설명: `${a11yCount}개의 접근성 이슈가 발견되었습니다.`,
      조치: 'WCAG 가이드라인 준수를 위한 개선 필요',
    });
  }

  return recommendations;
}

// 리포트 생성
function generateReport(issuesAnalysis, hotspotsAnalysis, metrics, recommendations, topIssues) {
  const timestamp = new Date().toISOString();

  let report = `# SonarQube 코드 품질 분석 리포트

**생성 시간:** ${timestamp}
**프로젝트:** ${PROJECT_KEY}
**SonarQube URL:** ${SONARQUBE_URL}

---

## 📊 전체 요약

### 주요 지표

| 지표 | 값 |
|------|-----|
| 총 이슈 수 | ${issuesAnalysis.총_이슈_수.toLocaleString()} |
| 버그 (Bugs) | ${issuesAnalysis.타입별.BUG || 0} |
| 취약점 (Vulnerabilities) | ${issuesAnalysis.타입별.VULNERABILITY || 0} |
| 코드 스멜 (Code Smells) | ${issuesAnalysis.타입별.CODE_SMELL || 0} |
| 보안 핫스팟 | ${hotspotsAnalysis.총_핫스팟_수} |
| 코드 라인 수 | ${parseInt(metrics.ncloc || 0).toLocaleString()} |
| 테스트 커버리지 | ${metrics.coverage || 0}% |
| 중복 코드 비율 | ${metrics.duplicated_lines_density || 0}% |
| 기술 부채 | ${Math.round((metrics.sqale_index || 0) / 60)}시간 |

---

## 🔴 심각도별 이슈

| 심각도 | 개수 |
|--------|------|
`;

  Object.entries(issuesAnalysis.심각도별)
    .sort((a, b) => {
      const order = { BLOCKER: 0, CRITICAL: 1, MAJOR: 2, MINOR: 3, INFO: 4 };
      return (order[a[0]] || 99) - (order[b[0]] || 99);
    })
    .forEach(([severity, count]) => {
      const emoji =
        {
          BLOCKER: '🚫',
          CRITICAL: '🔴',
          MAJOR: '🟠',
          MINOR: '🟡',
          INFO: '🔵',
        }[severity] || '⚪';
      report += `| ${emoji} ${severity} | ${count} |\n`;
    });

  report += `\n---

## 📝 타입별 이슈

| 타입 | 개수 |
|------|------|
`;

  Object.entries(issuesAnalysis.타입별).forEach(([type, count]) => {
    const emoji =
      {
        BUG: '🐛',
        VULNERABILITY: '🔓',
        CODE_SMELL: '👃',
        SECURITY_HOTSPOT: '🔥',
      }[type] || '❓';
    report += `| ${emoji} ${type} | ${count} |\n`;
  });

  report += `\n---

## 🎯 영향도 분석

### 유지보수성 (Maintainability)
- 높음 (HIGH): ${issuesAnalysis.영향도별.MAINTAINABILITY.HIGH}
- 중간 (MEDIUM): ${issuesAnalysis.영향도별.MAINTAINABILITY.MEDIUM}
- 낮음 (LOW): ${issuesAnalysis.영향도별.MAINTAINABILITY.LOW}

### 신뢰성 (Reliability)
- 높음 (HIGH): ${issuesAnalysis.영향도별.RELIABILITY.HIGH}
- 중간 (MEDIUM): ${issuesAnalysis.영향도별.RELIABILITY.MEDIUM}
- 낮음 (LOW): ${issuesAnalysis.영향도별.RELIABILITY.LOW}

### 보안성 (Security)
- 높음 (HIGH): ${issuesAnalysis.영향도별.SECURITY.HIGH}
- 중간 (MEDIUM): ${issuesAnalysis.영향도별.SECURITY.MEDIUM}
- 낮음 (LOW): ${issuesAnalysis.영향도별.SECURITY.LOW}

---

## 🏷️ 주요 태그별 이슈

| 태그 | 개수 |
|------|------|
`;

  Object.entries(issuesAnalysis.태그별)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([tag, count]) => {
      report += `| ${tag} | ${count} |\n`;
    });

  report += `\n---

## 📁 이슈가 많은 파일 (Top 20)

| 순위 | 파일명 | 이슈 수 |
|------|--------|---------|
`;

  Object.entries(issuesAnalysis.파일별)
    .slice(0, 20)
    .forEach(([file, count], index) => {
      report += `| ${index + 1} | ${file} | ${count} |\n`;
    });

  report += `\n---

## 🔧 가장 많이 발생한 룰 (Top 20)

| 순위 | 룰 | 발생 횟수 |
|------|-----|----------|
`;

  Object.entries(issuesAnalysis.룰별)
    .slice(0, 20)
    .forEach(([rule, count], index) => {
      report += `| ${index + 1} | ${rule} | ${count} |\n`;
    });

  if (hotspotsAnalysis.총_핫스팟_수 > 0) {
    report += `\n---

## 🔐 보안 핫스팟 분석

### 상태별
`;
    Object.entries(hotspotsAnalysis.상태별).forEach(([status, count]) => {
      report += `- ${status}: ${count}\n`;
    });

    if (Object.keys(hotspotsAnalysis.카테고리별).length > 0) {
      report += `\n### 카테고리별\n`;
      Object.entries(hotspotsAnalysis.카테고리별).forEach(([category, count]) => {
        report += `- ${category}: ${count}\n`;
      });
    }
  }

  report += `\n---

## ⚠️ 개선 권장사항

`;

  recommendations.forEach((rec, index) => {
    const priorityEmoji =
      {
        CRITICAL: '🚨',
        HIGH: '🔴',
        MEDIUM: '🟡',
        LOW: '🔵',
      }[rec.우선순위] || '⚪';

    report += `### ${index + 1}. ${priorityEmoji} ${rec.카테고리} [${rec.우선순위}]

**문제:** ${rec.설명}
**조치:** ${rec.조치}

`;
  });

  report += `---

## 📋 우선 해결 필요 이슈 (Top 20)

`;

  topIssues.slice(0, 20).forEach((issue, index) => {
    const fileName = issue.component.split(':').pop();
    const severity =
      {
        BLOCKER: '🚫',
        CRITICAL: '🔴',
        MAJOR: '🟠',
        MINOR: '🟡',
        INFO: '🔵',
      }[issue.severity] || '⚪';

    const type =
      {
        BUG: '🐛',
        VULNERABILITY: '🔓',
        CODE_SMELL: '👃',
      }[issue.type] || '❓';

    report += `### ${index + 1}. ${severity} ${type} ${fileName}:${issue.line}

**룰:** ${issue.rule}
**메시지:** ${issue.message}
**심각도:** ${issue.severity}
**타입:** ${issue.type}
**예상 수정 시간:** ${issue.effort || 'N/A'}

`;
  });

  report += `---

## 📈 상세 메트릭

| 메트릭 | 값 |
|--------|-----|
`;

  const metricNames = {
    bugs: '버그',
    vulnerabilities: '취약점',
    code_smells: '코드 스멜',
    coverage: '테스트 커버리지 (%)',
    duplicated_lines_density: '중복 코드 비율 (%)',
    security_hotspots: '보안 핫스팟',
    ncloc: '코드 라인 수',
    complexity: '순환 복잡도',
    cognitive_complexity: '인지 복잡도',
    sqale_index: '기술 부채 (분)',
    reliability_rating: '신뢰성 등급',
    security_rating: '보안 등급',
    sqale_rating: '유지보수성 등급',
  };

  Object.entries(metrics).forEach(([key, value]) => {
    const name = metricNames[key] || key;
    report += `| ${name} | ${value} |\n`;
  });

  report += `\n---

## 🎯 다음 단계

1. **즉시 조치 (Critical)**
   - BLOCKER/CRITICAL 이슈 ${(issuesAnalysis.심각도별.BLOCKER || 0) + (issuesAnalysis.심각도별.CRITICAL || 0)}개 수정
   - 보안 취약점 ${issuesAnalysis.타입별.VULNERABILITY || 0}개 검토 및 수정

2. **단기 개선 (1-2주)**
   - 버그 ${issuesAnalysis.타입별.BUG || 0}개 수정
   - 보안 핫스팟 검토
   - 접근성 이슈 ${issuesAnalysis.태그별.accessibility || 0}개 개선

3. **중장기 개선 (1-3개월)**
   - 코드 스멜 점진적 리팩토링
   - 테스트 커버리지 향상 (현재 ${metrics.coverage || 0}% → 목표 80%)
   - 중복 코드 제거 (현재 ${metrics.duplicated_lines_density || 0}% → 목표 3% 이하)

---

**리포트 끝**
`;

  return report;
}

// 메인 함수
async function main() {
  console.log('🚀 SonarQube 코드 품질 분석 시작\n');
  console.log('='.repeat(60));
  console.log('\n');

  try {
    // 1. 모든 이슈 수집
    const issues = await fetchAllIssues();

    // 2. 보안 핫스팟 수집
    const hotspots = await fetchSecurityHotspots();

    // 3. 코드 품질 메트릭 조회
    const metrics = await fetchMetrics();

    console.log('='.repeat(60));
    console.log('\n');

    // 4. 데이터 분석
    const issuesAnalysis = analyzeIssues(issues);
    const hotspotsAnalysis = analyzeHotspots(hotspots);
    const metricsAnalysis = analyzeMetrics(metrics);

    // 5. 개선 권장사항 생성
    const recommendations = generateRecommendations(
      issuesAnalysis,
      hotspotsAnalysis,
      metricsAnalysis
    );

    // 6. 우선순위 이슈 추출 (심각도와 타입 기준)
    const topIssues = issues.sort((a, b) => {
      const severityOrder = { BLOCKER: 0, CRITICAL: 1, MAJOR: 2, MINOR: 3, INFO: 4 };
      const typeOrder = { VULNERABILITY: 0, BUG: 1, CODE_SMELL: 2 };

      const severityDiff = (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
      if (severityDiff !== 0) return severityDiff;

      return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
    });

    // 7. 리포트 생성
    const report = generateReport(
      issuesAnalysis,
      hotspotsAnalysis,
      metricsAnalysis,
      recommendations,
      topIssues
    );

    // 8. 리포트 저장
    const reportPath = path.join(process.cwd(), 'SONARQUBE_ANALYSIS_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf8');

    console.log('📄 리포트 생성 완료!\n');
    console.log(`   파일 위치: ${reportPath}\n`);

    // 9. 요약 출력
    console.log('='.repeat(60));
    console.log('\n📊 분석 요약\n');
    console.log(`총 이슈: ${issuesAnalysis.총_이슈_수.toLocaleString()}`);
    console.log(`  - 버그: ${issuesAnalysis.타입별.BUG || 0}`);
    console.log(`  - 취약점: ${issuesAnalysis.타입별.VULNERABILITY || 0}`);
    console.log(`  - 코드 스멜: ${issuesAnalysis.타입별.CODE_SMELL || 0}`);
    console.log(`보안 핫스팟: ${hotspotsAnalysis.총_핫스팟_수}`);
    console.log(`\n개선 권장사항: ${recommendations.length}개`);
    console.log('\n상세 내용은 리포트 파일을 확인하세요.\n');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 실행
main();
