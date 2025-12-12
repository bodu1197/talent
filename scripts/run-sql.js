const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase direct connection string (from dashboard)
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:Dolpagu00!!@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function runSQL() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log('사용법: node scripts/run-sql.js <sql-file-path>');
    process.exit(1);
  }

  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.error('파일을 찾을 수 없습니다:', fullPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(fullPath, 'utf8');
  console.log('SQL 파일 읽기 완료:', fullPath);

  const client = new Client({ connectionString });

  try {
    console.log('데이터베이스 연결 중...');
    await client.connect();
    console.log('연결 성공!');

    console.log('SQL 실행 중...');
    await client.query(sql);
    console.log('✅ SQL 실행 완료!');

    if (result.command) {
      console.log('실행된 명령:', result.command);
    }
  } catch (error) {
    console.error('에러 발생:', error);
    console.error('❌ SQL 실행 실패:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('연결 종료');
  }
}

runSQL();
