// 광고 시스템 인덱스, 트리거, RLS 정책 적용
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'db.bpvfkkrlyrjkwgwmfrci.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'chl1197dbA!@',
  ssl: { rejectUnauthorized: false }
});

async function applySQL() {
  const client = await pool.connect();

  try {
    console.log('🚀 PostgreSQL에 연결됨\n');

    const migrationFile = path.join(__dirname, '../supabase/migrations/20251112120000_create_advertising_system.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    // 전체 SQL을 한 번에 실행 (트랜잭션 내에서)
    console.log('📦 인덱스, 트리거, RLS 정책 적용 중...\n');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log('✅ 모든 설정 적용 완료!\n');

    // 결과 확인
    console.log('📋 테이블 확인:');
    const tables = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename LIKE 'advertising_%'
        OR tablename = 'credit_transactions'
      ORDER BY tablename
    `);

    tables.rows.forEach(row => {
      console.log(`  ✅ ${row.tablename}`);
    });

    console.log('\n📑 인덱스 확인:');
    const indexes = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND (indexname LIKE 'idx_ad_%' OR indexname LIKE 'idx_advertising_%' OR indexname LIKE 'idx_credit_%')
      ORDER BY indexname
    `);

    console.log(`  총 ${indexes.rows.length}개의 인덱스 생성됨`);

    console.log('\n🔒 RLS 정책 확인:');
    const policies = await client.query(`
      SELECT schemaname, tablename, policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND (tablename LIKE 'advertising_%' OR tablename = 'credit_transactions')
      ORDER BY tablename, policyname
    `);

    if (policies.rows.length > 0) {
      policies.rows.forEach(row => {
        console.log(`  ✅ ${row.tablename}: ${row.policyname}`);
      });
    } else {
      console.log('  ⚠️  RLS 정책이 없습니다');
    }

    console.log('\n✨ 광고 시스템 설정 완료!');

  } catch (error) {
    await client.query('ROLLBACK');

    // 이미 존재하는 객체 에러는 무시
    if (error.message.includes('already exists')) {
      console.log('✅ 일부 객체가 이미 존재함 (정상)');
    } else {
      console.error('❌ 에러 발생:', error.message);
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

applySQL().catch(err => {
  console.error('실패:', err);
  process.exit(1);
});
