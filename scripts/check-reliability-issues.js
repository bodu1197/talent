const https = require('https');

const PROJECT_KEY = 'bodu1197_talent';
const ORGANIZATION = 'bodu1197';
const BRANCH = 'master';

// SonarCloud API: Issues 조회 (Reliability만)
function fetchIssues(callback) {
  const params = new URLSearchParams({
    componentKeys: PROJECT_KEY,
    organization: ORGANIZATION,
    types: 'BUG',
    branch: BRANCH,
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

console.log('🔍 SonarCloud Reliability (BUG) 이슈 조회 중...\n');

fetchIssues((err, data) => {
  if (err) {
    console.error('❌ 오류:', err.message);
    return;
  }

  console.log(`총 BUG 이슈: ${data.total}개`);
  console.log(`조회된 이슈: ${data.issues.length}개\n`);

  if (data.issues.length === 0) {
    console.log('✅ BUG 이슈가 없습니다!');
    return;
  }

  // 파일별 그룹화
  const byFile = {};
  data.issues.forEach(issue => {
    const file = issue.component.replace(`${PROJECT_KEY}:`, '');
    if (!byFile[file]) {
      byFile[file] = [];
    }
    byFile[file].push({
      rule: issue.rule,
      line: issue.line || '?',
      message: issue.message,
      severity: issue.severity,
      status: issue.status
    });
  });

  console.log('=== BUG 이슈 상세 ===\n');
  Object.entries(byFile)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([file, issues]) => {
      console.log(`📁 ${file} (${issues.length}개)`);
      issues.forEach((issue, idx) => {
        console.log(`  ${idx + 1}. [${issue.severity}] ${issue.rule}`);
        console.log(`     Line ${issue.line}: ${issue.message}`);
        console.log(`     Status: ${issue.status}`);
      });
      console.log();
    });
});
