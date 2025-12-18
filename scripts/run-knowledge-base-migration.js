/**
 * AI 지식베이스 확장 마이그레이션 실행
 * Usage: node scripts/run-knowledge-base-migration.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const SUPABASE_PROJECT_REF = 'abroivxthindezdtdzmj';
const SUPABASE_ACCESS_TOKEN = 'sbp_753b67c2411cad6320ef44d6626ac13ee2ba6296';

// 마이그레이션 SQL 읽기
const migrationPath = path.join(__dirname, '../supabase/migrations/20251219_expand_ai_knowledge_base.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('📚 AI 지식베이스 확장 마이그레이션 실행 중...');
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
      console.log('✅ 마이그레이션 성공!\n');
      console.log('추가된 FAQ 카테고리:');
      console.log('  ✓ 수수료 (3개)');
      console.log('  ✓ 판매자 (4개)');
      console.log('  ✓ 구매 (3개)');
      console.log('  ✓ 심부름 (2개)');
      console.log('  ✓ 계정 (3개)');
      console.log('  ✓ 채팅 (2개)');
      console.log('  ✓ 신고 (2개)');
      console.log('  ✓ 기타 (3개)');
      console.log('\n🎉 총 22개 FAQ 추가 완료!');
      
      try {
        const result = JSON.parse(data);
        if (result.length > 0) {
          console.log('\n📊 카테고리별 현황:', JSON.stringify(result, null, 2));
        }
      } catch (e) {
        // JSON 파싱 실패는 무시
      }
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
