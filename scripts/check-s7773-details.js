const https = require('https');

const PROJECT_KEY = 'bodu1197_talent';
const ORGANIZATION = 'bodu1197';
const BRANCH = 'master';

// SonarCloud API: S7773 이슈만 조회
function fetchS7773Issues(callback) {
  const params = new URLSearchParams({
    componentKeys: PROJECT_KEY,
    organization: ORGANIZATION,
    branch: BRANCH,
    inNewCodePeriod: 'true',
    rules: 'typescript:S7773',
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

console.log('🔍 typescript:S7773 이슈 조회 중...\n');

fetchS7773Issues((err, data) => {
  if (err) {
    console.error('❌ 오류:', err.message);
    return;
  }

  console.log(`총 S7773 이슈: ${data.total}개\n`);

  // 파일별 그룹화
  const byFile = {};
  data.issues.forEach(issue => {
    const file = issue.component.replace(`${PROJECT_KEY}:`, '');
    if (!byFile[file]) {
      byFile[file] = [];
    }
    byFile[file].push({
      line: issue.line || '?',
      message: issue.message
    });
  });

  console.log('=== 파일별 이슈 ===\n');
  Object.entries(byFile)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10)
    .forEach(([file, issues]) => {
      console.log(`📁 ${file} (${issues.length}개)`);
      issues.slice(0, 3).forEach((issue, idx) => {
        console.log(`  ${idx + 1}. Line ${issue.line}: ${issue.message}`);
      });
      if (issues.length > 3) {
        console.log(`  ... 외 ${issues.length - 3}개`);
      }
      console.log();
    });

  // 첫 번째 이슈의 메시지 확인
  if (data.issues.length > 0) {
    console.log('=== 규칙 설명 ===');
    console.log(data.issues[0].message);
  }
});
