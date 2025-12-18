const https = require('https');

const PROJECT_ID = 'abroivxthindezdtdzmj';
const TOKEN = 'sbp_753b67c2411cad6320ef44d6626ac13ee2ba6296';
const KEEP_USER_ID = 'ccf26cba-d1d5-4aae-b5d9-0fe85449f086'; // ohyus1197@gmail.com

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log(`Cleaning users table, keeping only: ${KEEP_USER_ID} (ohyus1197@gmail.com)`);
  console.log('');

  try {
    // Delete from users table except the keep user
    console.log('Deleting from users table...');
    const result = await executeQuery(`DELETE FROM users WHERE id != '${KEEP_USER_ID}'`);
    console.log('✅ Users table cleaned');

    // Verify
    console.log('');
    console.log('Verifying...');
    const { count } = (await executeQuery('SELECT COUNT(*) as count FROM users'))[0];
    console.log(`✅ Remaining users in users table: ${count}`);

    if (count === 1) {
      console.log('🎉 Success! Only ohyus1197@gmail.com remains.');
    } else {
      console.log('⚠️ Warning: Expected 1 user, but found', count);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
