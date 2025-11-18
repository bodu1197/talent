#!/usr/bin/env node

/**
 * Supabase 데이터베이스 무결성 검사 스크립트
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkDatabase() {
  console.log('🔍 Supabase 데이터베이스 무결성 검사 시작...\n');

  // CONNECTION STRING 확인
  const connectionString = process.env.DATABASE_URL ||
                          process.env.SUPABASE_DB_URL ||
                          process.env.POSTGRES_URL;

  if (!connectionString) {
    console.log('⚠️  DATABASE_URL이 .env.local에 설정되지 않았습니다.');
    console.log('\n다음 중 하나를 .env.local에 추가하세요:');
    console.log('- DATABASE_URL=postgresql://...');
    console.log('- SUPABASE_DB_URL=postgresql://...');
    console.log('\nSupabase 프로젝트 설정에서 Connection String을 확인하세요.\n');
    return;
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 1. 연결 테스트
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('       데이터베이스 연결 테스트         ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const connResult = await pool.query('SELECT current_database(), current_user, version()');
    console.log('✅ 데이터베이스 연결 성공');
    console.log(`   데이터베이스: ${connResult.rows[0].current_database}`);
    console.log(`   사용자: ${connResult.rows[0].current_user}`);
    console.log();

    // 2. 테이블 목록 조회
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('           테이블 목록 조회            ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log(`✅ 총 ${tables.rows.length}개의 테이블 발견:`);
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
    console.log();

    // 3. 주요 테이블 레코드 수 확인
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('        주요 테이블 레코드 수          ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const importantTables = ['profiles', 'services', 'orders', 'sellers', 'categories'];

    for (const tableName of importantTables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`✅ ${tableName.padEnd(20)} : ${countResult.rows[0].count}개 레코드`);
      } catch (error) {
        console.log(`⚠️  ${tableName.padEnd(20)} : 테이블 없음 또는 접근 불가`);
      }
    }
    console.log();

    // 4. Foreign Key 제약조건 확인
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('       Foreign Key 제약조건 확인       ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const fkResult = await pool.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `);

    console.log(`✅ 총 ${fkResult.rows.length}개의 Foreign Key 제약조건`);
    fkResult.rows.slice(0, 10).forEach(row => {
      console.log(`   ${row.table_name}.${row.column_name} → ${row.foreign_table_name}.${row.foreign_column_name}`);
    });
    if (fkResult.rows.length > 10) {
      console.log(`   ... 외 ${fkResult.rows.length - 10}개 더`);
    }
    console.log();

    // 5. 인덱스 확인
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('            인덱스 확인               ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const indexResult = await pool.query(`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    console.log(`✅ 총 ${indexResult.rows.length}개의 인덱스`);
    console.log();

    // 6. 최종 요약
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('           검사 결과 요약              ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ 테이블: ${tables.rows.length}개`);
    console.log(`✅ Foreign Keys: ${fkResult.rows.length}개`);
    console.log(`✅ 인덱스: ${indexResult.rows.length}개`);
    console.log(`✅ 연결 상태: 정상`);
    console.log('\n🎉 데이터베이스 무결성 검사 완료!\n');

  } catch (error) {
    console.error('\n❌ 데이터베이스 오류:', error.message);
    console.error('\n해결 방법:');
    console.error('1. .env.local의 DATABASE_URL 확인');
    console.error('2. Supabase 프로젝트가 활성화되어 있는지 확인');
    console.error('3. 네트워크 연결 확인\n');
  } finally {
    await pool.end();
  }
}

checkDatabase().catch(console.error);
