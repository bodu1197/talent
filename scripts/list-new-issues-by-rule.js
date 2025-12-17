const https = require('https');

const projectKey = 'bodu1197_talent';
const token = 'squ_5efd5a893fcb893c6e0c10086d065f9c21c6ed31';

// 이슈별로 그룹화하기 위한 Map
const issuesByRule = new Map();

function fetchIssues(page = 1) {
  const options = {
    hostname: 'sonarcloud.io',
    path: `/api/issues/search?componentKeys=${projectKey}&statuses=OPEN&sinceLeakPeriod=true&ps=100&p=${page}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 401) {
        console.error('인증 실패: API 토큰을 확인하세요');
        return;
      }

      try {
        const result = JSON.parse(data);

        // 이슈를 룰별로 분류
        result.issues.forEach(issue => {
          const rule = issue.rule;
          if (!issuesByRule.has(rule)) {
            issuesByRule.set(rule, []);
          }
          issuesByRule.get(rule).push({
            file: issue.component.split(':')[1],
            line: issue.line,
            message: issue.message
          });
        });

        // 더 많은 페이지가 있으면 재귀 호출
        const totalPages = Math.ceil(result.total / 100);
        if (page < totalPages) {
          fetchIssues(page + 1);
        } else {
          // 모든 페이지 로드 완료 - 출력
          printResults();
        }
      } catch (err) {
        console.error('Error:', err.message);
      }
    });
  });

  req.on('error', (err) => console.error('Request error:', err.message));
  req.end();
}

function printResults() {
  console.log(`\n총 ${issuesByRule.size}개 룰, ${Array.from(issuesByRule.values()).reduce((sum, arr) => sum + arr.length, 0)}개 이슈\n`);

  // 룰을 이슈 개수 순으로 정렬
  const sortedRules = Array.from(issuesByRule.entries())
    .sort((a, b) => b[1].length - a[1].length);

  sortedRules.forEach(([rule, issues]) => {
    console.log(`\n=== ${rule} (${issues.length}개) ===`);
    issues.slice(0, 5).forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.file}:${issue.line}`);
      console.log(`   ${issue.message}`);
    });
    if (issues.length > 5) {
      console.log(`   ... 외 ${issues.length - 5}개 더`);
    }
  });
}

fetchIssues();
