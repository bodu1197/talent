const https = require('https');

const PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'abroivxthindezdtdzmj';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!TOKEN) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

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
  console.log('Syncing users and profiles tables...');
  console.log('');

  try {
    // profiles의 데이터를 users로 복사
    console.log('Updating users table with profiles data...');
    const updateQuery = `
      UPDATE users u
      SET
        name = p.name,
        profile_image = p.profile_image,
        updated_at = now()
      FROM profiles p
      WHERE u.id = p.user_id
    `;

    await executeQuery(updateQuery);
    console.log('✅ Users table updated with profiles data');

    // 결과 확인
    console.log('');
    console.log('Verifying sync...');
    const verifyQuery = `
      SELECT
        u.id,
        u.name as users_name,
        u.profile_image as users_img,
        p.name as profiles_name,
        p.profile_image as profiles_img
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LIMIT 5
    `;

    const result = await executeQuery(verifyQuery);
    console.log('');
    console.log('Sample data after sync:');
    console.table(result);

    console.log('');
    console.log('🎉 Sync completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
