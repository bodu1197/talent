/**
 * 분쟁 조정 마이그레이션 실행
 * Usage: node scripts/run-dispute-migration.js
 */

const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

// Supabase 설정
const SUPABASE_PROJECT_REF = 'abroivxthindezdtdzmj';
const SUPABASE_ACCESS_TOKEN = 'sbp_753b67c2411cad6320ef44d6626ac13ee2ba6296';

// 마이그레이션 SQL 읽기
const migrationPath = path.join(__dirname, '../supabase/migrations/20251219_create_dispute_tables.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('⚖️ 분쟁 조정 시스템 마이그레이션 실행 중...');
console.log('---');
console.log('테이블:');
console.log('  - disputes (분쟁)');
console.log('  - dispute_evidences (증거)');
console.log('  - dispute_messages (메시지)');
console.log('');

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
      console.log('✅ 마이그레이션 성공!\n');
      console.log('⚖️ AI 분쟁 조정 시스템 준비 완료!');
      console.log('');
      console.log('생성된 기능:');
      console.log('  ✓ 분쟁 테이블 (disputes)');
      console.log('  ✓ 증거 테이블 (dispute_evidences)');
      console.log('  ✓ 메시지 타임라인 (dispute_messages)');
      console.log('  ✓ 사건번호 자동 생성 (예: 2024-0001)');
      console.log('  ✓ RLS 정책 (당사자만 조회 가능)');
    } else {
      console.error(`❌ 마이그레이션 실패 (${res.statusCode})`);
      console.error('응답:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ 요청 오류:', e.message);
});

req.write(requestData);
req.end();
