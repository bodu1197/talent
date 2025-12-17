const fs = require('fs');
const path = require('path');
const https = require('https');

// from MIGRATION_COMPLETE.md
const PROJECT_REF = 'abroivxthindezdtdzmj'; 
const ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee'; 

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Length': Buffer.byteLength(data),
      },
    };

    console.log(`Sending request to ${options.hostname}${options.path}...`);

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`Response status: ${res.statusCode}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
        } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function run() {
    try {
        const sqlPath = path.join(__dirname, '..', 'fix_image_urls_v2.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log(`Executing SQL from ${sqlPath}...`);
        const result = await executeSQL(sql);
        console.log('Update Result:', result);
    } catch (e) {
        console.error('Execution failed:', e);
        process.exit(1);
    }
}

run();
