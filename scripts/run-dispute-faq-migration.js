/**
 * 분쟁 FAQ 마이그레이션 실행
 */

const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_ID || 'abroivxthindezdtdzmj';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

const migrationPath = path.join(__dirname, '../supabase/migrations/20251219_add_dispute_faq.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('📚 분쟁 FAQ 마이그레이션 실행 중...');

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
      console.log('✅ 분쟁 FAQ 추가 완료!');
      console.log('\n추가된 FAQ:');
      console.log('  ✓ 분쟁 조정 신청 방법');
      console.log('  ✓ AI 심판관 설명');
      console.log('  ✓ 환불 규정');
      console.log('  ✓ 판매자 무응답 대처');
      console.log('  ✓ 수정 횟수 초과');
      console.log('  ✓ 디자인 불만');
      console.log('  ✓ 판결 이의 신청');
    } else {
      console.error(`❌ 실패 (${res.statusCode}): ${data}`);
    }
  });
});

req.on('error', (e) => console.error('❌ 오류:', e.message));
req.write(requestData);
req.end();
