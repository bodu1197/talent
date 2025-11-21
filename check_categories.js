const https = require('https');

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
    query: 'SELECT sc.*, c.name as category_name FROM service_categories sc LEFT JOIN categories c ON sc.category_id = c.id ORDER BY sc.created_at DESC LIMIT 10;'
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
