const https = require('http');

const options = {
  hostname: 'localhost',
  port: 9000,
  path: '/api/issues/search?componentKeys=talent&severities=CRITICAL&types=CODE_SMELL&ps=100',
  method: 'GET',
  auth: 'admin:admin'
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log(`Total CRITICAL issues: ${result.total}\n`);

      result.issues.forEach((issue, idx) => {
        const fileName = issue.component.split(':').pop();
        console.log(`${idx + 1}. ${issue.message}`);
        console.log(`   File: ${fileName}`);
        console.log(`   Line: ${issue.line || 'N/A'}`);
        console.log(`   Rule: ${issue.rule}\n`);
      });
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();
