const { Client } = require('pg')

// Supabase 연결 정보
const connectionString = 'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:chl1197dbA!@@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkTableStructure() {
  try {
    console.log('\n📊 테이블 구조 확인')
    console.log('='.repeat(70))

    await client.connect()
    console.log('✅ 데이터베이스 연결 성공!\n')

    const tables = ['disputes', 'seller_earnings', 'settlements']

    for (const tableName of tables) {
      console.log(`\n📋 ${tableName.toUpperCase()} 테이블 구조`)
      console.log('-'.repeat(70))

      // 컬럼 정보 조회
      const columns = await client.query(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName])

      console.table(columns.rows)

      // 외래키 정보 조회
      const foreignKeys = await client.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = $1
        ORDER BY kcu.column_name;
      `, [tableName])

      if (foreignKeys.rows.length > 0) {
        console.log('\n🔗 외래키 관계:')
        console.table(foreignKeys.rows)
      }

      // 샘플 데이터 조회 (있는 경우)
      const sampleData = await client.query(`
        SELECT * FROM ${tableName} LIMIT 1;
      `)

      if (sampleData.rows.length > 0) {
        console.log('\n📝 샘플 데이터 (1행):')
        console.table(sampleData.rows)
      } else {
        console.log('\n📝 샘플 데이터: (데이터 없음)')
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('✅ 테이블 구조 확인 완료!')

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message)
    if (error.detail) console.error('상세:', error.detail)
    process.exit(1)
  } finally {
    await client.end()
  }
}

checkTableStructure()
