/**
 * Supabase Management API로 마이그레이션 실행
 * Usage: node scripts/run-chat-rooms-migration.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Supabase 설정 (CLAUDE.md 참조)
const SUPABASE_PROJECT_REF = 'abroivxthindezdtdzmj';
const SUPABASE_ACCESS_TOKEN = 'sbp_753b67c2411cad6320ef44d6626ac13ee2ba6296';

// 마이그레이션 SQL 읽기
const migrationPath = path.join(__dirname, '../supabase/migrations/20251217_fix_chat_rooms_service_fk.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('마이그레이션 SQL 실행 중...');
console.log('---');
console.log(sql.substring(0, 200) + '...');
console.log('---');

// Management API 호출
const requestData = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestData),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ 마이그레이션 성공!');
      try {
        const result = JSON.parse(data);
        console.log('결과:', JSON.stringify(result, null, 2));
      } catch (e) {
        console.log('응답:', data);
      }
    } else {
      console.error(`❌ 마이그레이션 실패 (${res.statusCode})`);
      console.error('응답:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('요청 오류:', e.message);
});

req.write(requestData);
req.end();
