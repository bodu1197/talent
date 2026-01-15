/**
 * Supabase Management API로 AI 챗봇 마이그레이션 실행
 * Usage: node scripts/run-chatbot-migration.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_ID || 'abroivxthindezdtdzmj';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

// 마이그레이션 SQL 읽기 (ai_support_ 테이블)
const migrationPath = path.join(__dirname, '../supabase/migrations/20251219_create_chatbot_tables.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('🤖 AI 고객지원 챗봇 마이그레이션 실행 중...');
console.log('📝 테이블: ai_support_sessions, ai_support_messages, ai_support_knowledge');

console.log('🤖 AI 챗봇 마이그레이션 SQL 실행 중...');
console.log('---');
console.log(sql.substring(0, 300) + '...');
console.log('---\n');

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
      console.log('생성된 테이블:');
      console.log('  ✓ chat_sessions (세션 관리)');
      console.log('  ✓ chat_messages (메시지 기록)');
      console.log('  ✓ chat_knowledge_base (FAQ 지식베이스)\n');
      console.log('기본 FAQ 6개가 추가되었습니다.\n');
      console.log('🎉 챗봇 데이터베이스 설정 완료!');
      
      try {
        const result = JSON.parse(data);
        if (result.length > 0) {
          console.log('\n📊 상세 결과:', JSON.stringify(result, null, 2));
        }
      } catch (e) {
        // JSON 파싱 실패는 무시 (성공 응답일 수 있음)
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
