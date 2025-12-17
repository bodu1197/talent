const https = require('https');

const PROJECT_KEY = 'bodu1197_talent';
const ORGANIZATION = 'bodu1197';
const BRANCH = 'master';

// SonarCloud API: New Code Issues 조회
function fetchNewCodeIssues(callback) {
  const params = new URLSearchParams({
    componentKeys: PROJECT_KEY,
    organization: ORGANIZATION,
    branch: BRANCH,
    inNewCodePeriod: 'true',
    ps: 500,
    resolved: 'false'
  });

  const options = {
    hostname: 'sonarcloud.io',
    path: `/api/issues/search?${params.toString()}`,
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        callback(null, json);
      } catch (e) {
        callback(e);
      }
    });
  });

  req.on('error', callback);
  req.end();
}

console.log('🔍 SonarCloud New Code 이슈 조회 중...\n');

fetchNewCodeIssues((err, data) => {
  if (err) {
    console.error('❌ 오류:', err.message);
    return;
  }

  console.log(`총 New Code 이슈: ${data.total}개`);
  console.log(`조회된 이슈: ${data.issues.length}개\n`);

  // 타입별 그룹화
  const byType = {};
  data.issues.forEach(issue => {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
  });

  console.log('=== 타입별 이슈 ===');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`${type}: ${count}개`);
  });
  console.log();

  // Severity별 그룹화
  const bySeverity = {};
  data.issues.forEach(issue => {
    bySeverity[issue.severity] = (bySeverity[issue.severity] || 0) + 1;
  });

  console.log('=== Severity별 이슈 ===');
  Object.entries(bySeverity).forEach(([severity, count]) => {
    console.log(`${severity}: ${count}개`);
  });
  console.log();

  // Status별 그룹화
  const byStatus = {};
  data.issues.forEach(issue => {
    byStatus[issue.status] = (byStatus[issue.status] || 0) + 1;
  });

  console.log('=== Status별 이슈 ===');
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`${status}: ${count}개`);
  });
  console.log();

  // 룰별 상위 10개
  const byRule = {};
  data.issues.forEach(issue => {
    byRule[issue.rule] = (byRule[issue.rule] || 0) + 1;
  });

  console.log('=== 룰별 이슈 (Top 10) ===');
  Object.entries(byRule)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([rule, count]) => {
      console.log(`${rule}: ${count}개`);
    });
});
