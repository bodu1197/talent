const https = require('https');

const projectKey = 'bodu1197_talent';
const token = 'squ_5efd5a893fcb893c6e0c10086d065f9c21c6ed31';

const options = {
  hostname: 'sonarcloud.io',
  path: `/api/issues/search?componentKeys=${projectKey}&rules=typescript:S6759&statuses=OPEN&sinceLeakPeriod=true&ps=100`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log(`\n=== typescript:S6759 상세 분석 (총 ${result.total}개) ===\n`);

      if (result.issues && result.issues.length > 0) {
        result.issues.forEach((issue, index) => {
          console.log(`\n[${index + 1}] ${issue.component.split(':')[1]}`);
          console.log(`   Line: ${issue.line || 'N/A'}`);
          console.log(`   Message: ${issue.message}`);
          if (issue.flows && issue.flows.length > 0) {
            console.log(`   Context:`);
            issue.flows.forEach(flow => {
              flow.locations.forEach(loc => {
                console.log(`     - ${loc.msg}`);
              });
            });
          }
        });
      } else {
        console.log('이슈 없음');
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  });
});

req.on('error', (err) => console.error('Request error:', err.message));
req.end();
