#!/usr/bin/env node

/**
 * SonarCloud 결과 기반 상세 리포트 생성
 */

const fs = require('fs');
const path = require('path');

// JSON 파일 읽기
const jsonPath = path.join(process.cwd(), 'sonarcloud-latest-result.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 리포트 생성
function generateReport() {
  const timestamp = new Date(data.timestamp).toLocaleString('ko-KR');

  let report = `# 돌파구 (Dolpagu) SonarCloud 최신 분석 결과

**스캔 시간**: ${timestamp}
**프로젝트**: ${data.projectKey}
**조직**: ${data.organization}

---

## 📊 전체 품질 현황

### Quality Gate 상태

**${data.qualityGate.status === 'ERROR' ? '🔴 FAIL' : '🟢 PASS'}** ${data.qualityGate.status === 'ERROR' ? '- Coverage 미달' : ''}

| 조건 | 상태 | 목표 | 현재 |
|------|------|------|------|
`;

  data.qualityGate.conditions.forEach((condition) => {
    const status = condition.status === 'ERROR' ? '❌' : '✅';
    const metricName = {
      new_coverage: 'New Coverage',
      new_reliability_rating: 'New Reliability Rating',
      new_security_rating: 'New Security Rating',
      new_maintainability_rating: 'New Maintainability Rating',
      new_duplicated_lines_density: 'New Duplicated Lines',
      new_security_hotspots_reviewed: 'Security Hotspots Reviewed',
    }[condition.metricKey] || condition.metricKey;

    const errorThreshold = condition.errorThreshold || '-';
    const actualValue = condition.actualValue || '0';

    report += `| ${metricName} | ${status} ${condition.status} | ${errorThreshold} | ${actualValue} |\n`;
  });

  report += `
---

## 🎯 핵심 메트릭

### 코드 품질 등급

| 항목 | 등급 | 수치 | 평가 |
|------|------|------|------|
| **Reliability** | ${getRatingBadge(data.metrics.reliability_rating)} | ${data.metrics.reliability_rating} | ${getRatingDescription('reliability', data.metrics.bugs)} |
| **Security** | ${getRatingBadge(data.metrics.security_rating)} | ${data.metrics.security_rating} | ${getRatingDescription('security', data.metrics.vulnerabilities)} |
| **Maintainability** | ${getRatingBadge(data.metrics.sqale_rating)} | ${data.metrics.sqale_rating} | ${getRatingDescription('maintainability', data.metrics.code_smells)} |

### 전체 지표

\`\`\`
📈 코드 라인 수 (NCLOC): ${parseInt(data.metrics.ncloc).toLocaleString()} 라인
🐛 버그: ${data.metrics.bugs}개 ${data.metrics.bugs === '0' ? '✅' : ''}
🔒 보안 취약점: ${data.metrics.vulnerabilities}개 ${data.metrics.vulnerabilities === '0' ? '✅' : ''}
💩 Code Smells: ${data.metrics.code_smells}개
📋 커버리지: ${data.metrics.coverage}% ${data.metrics.coverage === '0.0' ? '❌' : ''}
🔁 중복 코드: ${data.metrics.duplicated_lines_density}%
⏱️ 기술 부채: ${Math.round(data.metrics.sqale_index / 60)}시간
🔥 보안 핫스팟: ${data.metrics.security_hotspots}개
\`\`\`

### 신규 코드 지표 (New Code)

\`\`\`
🐛 신규 버그: ${data.metrics.new_bugs || 0}개
🔒 신규 취약점: ${data.metrics.new_vulnerabilities || 0}개
💩 신규 Code Smells: ${data.metrics.new_code_smells || 0}개
📋 신규 커버리지: ${data.metrics.new_coverage || 0}% ${(data.metrics.new_coverage || 0) === '0.0' ? '❌' : ''}
🔁 신규 중복 코드: ${data.metrics.new_duplicated_lines_density || 0}%
\`\`\`

---

## 🚨 이슈 분석

### 전체 이슈: ${data.issues.total}개

#### 심각도별

| 심각도 | 개수 | 비율 |
|--------|------|------|
`;

  const severityOrder = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO'];
  severityOrder.forEach((severity) => {
    const count = data.issues.bySeverity[severity] || 0;
    if (count > 0) {
      const percentage = ((count / data.issues.total) * 100).toFixed(1);
      const emoji = {
        BLOCKER: '🚫',
        CRITICAL: '🔴',
        MAJOR: '🟠',
        MINOR: '🟡',
        INFO: '🔵',
      }[severity];
      report += `| ${emoji} ${severity} | ${count} | ${percentage}% |\n`;
    }
  });

  report += `
#### 타입별

| 타입 | 개수 | 비율 |
|------|------|------|
`;

  Object.entries(data.issues.byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const percentage = ((count / data.issues.total) * 100).toFixed(1);
      const emoji = {
        BUG: '🐛',
        VULNERABILITY: '🔓',
        CODE_SMELL: '👃',
        SECURITY_HOTSPOT: '🔥',
      }[type];
      report += `| ${emoji} ${type} | ${count} | ${percentage}% |\n`;
    });

  // 태그별 이슈
  if (Object.keys(data.issues.byTag).length > 0) {
    report += `
#### 주요 태그별 이슈

| 태그 | 개수 |
|------|------|
`;
    Object.entries(data.issues.byTag)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([tag, count]) => {
        report += `| ${tag} | ${count} |\n`;
      });
  }

  // 상위 20개 이슈
  report += `
---

## 📋 우선 해결 이슈 (Top 20)

`;

  const topIssues = data.issues.items
    .sort((a, b) => {
      const severityOrder = { BLOCKER: 0, CRITICAL: 1, MAJOR: 2, MINOR: 3, INFO: 4 };
      const typeOrder = { VULNERABILITY: 0, BUG: 1, CODE_SMELL: 2 };

      const severityDiff = (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
      if (severityDiff !== 0) return severityDiff;

      return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
    })
    .slice(0, 20);

  topIssues.forEach((issue, index) => {
    const fileName = issue.component.split(':').pop();
    const severity = {
      BLOCKER: '🚫',
      CRITICAL: '🔴',
      MAJOR: '🟠',
      MINOR: '🟡',
      INFO: '🔵',
    }[issue.severity];

    const type = {
      BUG: '🐛',
      VULNERABILITY: '🔓',
      CODE_SMELL: '👃',
    }[issue.type];

    report += `### ${index + 1}. ${severity} ${type} ${fileName}:${issue.line || '?'}

**룰**: ${issue.rule}
**메시지**: ${issue.message}
**심각도**: ${issue.severity}
**타입**: ${issue.type}
**예상 수정 시간**: ${issue.effort || 'N/A'}
${issue.tags?.length > 0 ? `**태그**: ${issue.tags.join(', ')}` : ''}

`;
  });

  // 파일별 이슈 통계
  const fileStats = {};
  data.issues.items.forEach((issue) => {
    const fileName = issue.component.split(':').pop();
    fileStats[fileName] = (fileStats[fileName] || 0) + 1;
  });

  report += `
---

## 📁 이슈가 많은 파일 (Top 20)

| 순위 | 파일명 | 이슈 수 |
|------|--------|---------|
`;

  Object.entries(fileStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([file, count], index) => {
      report += `| ${index + 1} | ${file} | ${count} |\n`;
    });

  // 개선 권장사항
  report += `
---

## ⚠️ 개선 권장사항

`;

  const recommendations = generateRecommendations(data);
  recommendations.forEach((rec, index) => {
    const priorityEmoji = {
      CRITICAL: '🚨',
      HIGH: '🔴',
      MEDIUM: '🟡',
      LOW: '🔵',
    }[rec.priority];

    report += `### ${index + 1}. ${priorityEmoji} ${rec.category} [${rec.priority}]

**문제**: ${rec.description}
**조치**: ${rec.action}
**예상 소요**: ${rec.effort}
**ROI**: ${rec.roi}

`;
  });

  // 다음 단계
  report += `
---

## 🎯 다음 단계

### Phase 1: 긴급 (이번 주)
${data.metrics.bugs > 0 ? `- 🐛 버그 ${data.metrics.bugs}개 즉시 수정\n` : ''}${data.issues.byTag.accessibility ? `- ♿ 접근성 이슈 ${data.issues.byTag.accessibility}개 수정\n` : ''}- 📋 MAJOR 이슈 우선순위 수정 (상위 20개)

### Phase 2: 단기 (2주 이내)
- 🧪 Jest 설정 및 테스트 작성 시작
- 📈 커버리지 20% 달성 목표
- 🔄 React 성능 이슈 수정

### Phase 3: 중장기 (1개월 이내)
- 📊 커버리지 80% 달성
- ✅ Quality Gate PASS
- 🎯 기술 부채 50% 감소

---

## 📈 예상 개선 효과

| 메트릭 | 현재 | Phase 1 후 | Phase 2 후 | Phase 3 후 |
|--------|------|------------|------------|------------|
| **Bugs** | ${data.metrics.bugs} | 0 ✅ | 0 | 0 |
| **Code Smells** | ${data.metrics.code_smells} | ${Math.max(0, parseInt(data.metrics.code_smells) - 30)} | ${Math.max(0, parseInt(data.metrics.code_smells) - 60)} | <100 |
| **Coverage** | ${data.metrics.coverage}% | ${data.metrics.coverage}% | 20% | 80% ✅ |
| **Quality Gate** | ${data.qualityGate.status === 'ERROR' ? 'FAIL ❌' : 'PASS ✅'} | FAIL | FAIL | PASS ✅ |
| **기술 부채** | ${Math.round(data.metrics.sqale_index / 60)}h | ${Math.round(data.metrics.sqale_index / 60 * 0.9)}h | ${Math.round(data.metrics.sqale_index / 60 * 0.7)}h | <5h |

---

## 📚 참고 링크

- **SonarCloud Dashboard**: https://sonarcloud.io/dashboard?id=${data.projectKey}
- **Issues**: https://sonarcloud.io/project/issues?id=${data.projectKey}
- **Security Hotspots**: https://sonarcloud.io/project/security_hotspots?id=${data.projectKey}

---

**리포트 생성**: ${new Date().toLocaleString('ko-KR')}
**분석 도구**: SonarCloud
`;

  return report;
}

// 등급 뱃지 생성
function getRatingBadge(rating) {
  const badges = {
    1: '🟢 A',
    2: '🟡 B',
    3: '🟠 C',
    4: '🔴 D',
    5: '🔴 E',
  };
  return badges[rating] || '⚪ ?';
}

// 등급 설명 생성
function getRatingDescription(type, count) {
  if (type === 'reliability') {
    return count === '0' ? '버그 0개 (우수)' : `버그 ${count}개 존재`;
  } else if (type === 'security') {
    return count === '0' ? '취약점 0개 (우수)' : `취약점 ${count}개 존재`;
  } else if (type === 'maintainability') {
    return '기술 부채 관리 양호';
  }
  return '-';
}

// 개선 권장사항 생성
function generateRecommendations(data) {
  const recommendations = [];

  // 커버리지 체크
  if (parseFloat(data.metrics.coverage) < 80) {
    recommendations.push({
      priority: 'CRITICAL',
      category: '테스트 커버리지',
      description: `현재 커버리지 ${data.metrics.coverage}% (목표: 80%)`,
      action: 'Jest 설정 및 핵심 로직부터 테스트 작성 시작',
      effort: '40-60시간 (전체 프로젝트)',
      roi: '★★★★★',
    });
  }

  // 버그 체크
  if (parseInt(data.metrics.bugs) > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: '버그 수정',
      description: `${data.metrics.bugs}개의 버그 존재`,
      action: '즉시 수정 필요',
      effort: '1-2시간',
      roi: '★★★★★',
    });
  }

  // 보안 취약점 체크
  if (parseInt(data.metrics.vulnerabilities) > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: '보안 취약점',
      description: `${data.metrics.vulnerabilities}개의 보안 취약점 발견`,
      action: '보안 검토 및 즉시 수정',
      effort: '2-4시간',
      roi: '★★★★★',
    });
  }

  // 접근성 이슈
  if (data.issues.byTag.accessibility) {
    recommendations.push({
      priority: 'MEDIUM',
      category: '접근성 (Accessibility)',
      description: `${data.issues.byTag.accessibility}개의 접근성 이슈`,
      action: 'Form label과 input 연결, WCAG 가이드라인 준수',
      effort: '2-3시간',
      roi: '★★★★☆',
    });
  }

  // React 성능 이슈
  if (data.issues.byTag['react']) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'React 성능',
      description: `${data.issues.byTag['react']}개의 React 성능 이슈`,
      action: 'Array key 수정, Component 정의 위치 최적화',
      effort: '3-4시간',
      roi: '★★★★☆',
    });
  }

  // 코드 스멜
  if (parseInt(data.metrics.code_smells) > 100) {
    recommendations.push({
      priority: 'MEDIUM',
      category: '코드 품질',
      description: `${data.metrics.code_smells}개의 Code Smell`,
      action: '점진적 리팩토링 및 코드 정리',
      effort: '지속적',
      roi: '★★★☆☆',
    });
  }

  // 중복 코드
  if (parseFloat(data.metrics.duplicated_lines_density) > 3) {
    recommendations.push({
      priority: 'LOW',
      category: '중복 코드',
      description: `${data.metrics.duplicated_lines_density}%의 중복 코드`,
      action: '공통 모듈 추출 및 리팩토링',
      effort: '4-6시간',
      roi: '★★★☆☆',
    });
  }

  return recommendations;
}

// 메인 실행
const report = generateReport();
const reportPath = path.join(process.cwd(), 'SONARCLOUD_LATEST_REPORT.md');
fs.writeFileSync(reportPath, report, 'utf8');

console.log('✅ 리포트 생성 완료!');
console.log(`📄 파일 위치: ${reportPath}`);
