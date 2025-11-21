const https = require('https');

// 이전 서비스 ID
const oldServiceId = '94799fe1-850a-4755-80f8-f7d720e0f373';
// 새 서비스 ID (가장 최근)
const newServiceId = 'f92e3911-c4ae-45d4-ac57-20c8acb5d672';

const options = {
    hostname: 'api.supabase.com',
    path: '/v1/projects/bpvfkkrlyrjkwgwmfrci/database/query',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f',
        'Content-Type': 'application/json'
    }
};

const postData = JSON.stringify({
    query: `
    SELECT 
      sc.service_id,
      sc.category_id,
      c.name,
      c.level,
      sc.created_at
    FROM service_categories sc
    LEFT JOIN categories c ON sc.category_id = c.id
    WHERE sc.service_id IN ('${oldServiceId}', '${newServiceId}')
    ORDER BY sc.service_id, sc.created_at;
  `
});

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(postData);
req.end();
