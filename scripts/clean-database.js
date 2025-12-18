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
  console.log(`Keeping only user: ${KEEP_USER_ID} (ohyus1197@gmail.com)`);
  console.log('');

  try {
    // Delete buyers except the keep user
    console.log('Deleting buyers...');
    await executeQuery(`DELETE FROM buyers WHERE user_id != '${KEEP_USER_ID}'`);
    console.log('✅ Buyers deleted');

    // Delete sellers except the keep user
    console.log('Deleting sellers...');
    await executeQuery(`DELETE FROM sellers WHERE user_id != '${KEEP_USER_ID}'`);
    console.log('✅ Sellers deleted');

    // Delete profiles except the keep user
    console.log('Deleting profiles...');
    await executeQuery(`DELETE FROM profiles WHERE user_id != '${KEEP_USER_ID}'`);
    console.log('✅ Profiles deleted');

    // Delete auth.users except the keep user
    console.log('Deleting auth.users...');
    await executeQuery(`DELETE FROM auth.users WHERE id != '${KEEP_USER_ID}'`);
    console.log('✅ Auth users deleted');

    console.log('');
    console.log('🎉 Database cleaned successfully!');
    console.log(`Only user ohyus1197@gmail.com (${KEEP_USER_ID}) remains.`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
