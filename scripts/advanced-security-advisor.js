const { Client } = require('pg')

// Supabase 연결 정보
const connectionString = 'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:chl1197dbA!@@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function advancedSecurityAdvisor() {
  try {
    console.log('\n🔐 고급 보안 및 성능 점검')
    console.log('='.repeat(70))

    await client.connect()
    console.log('✅ 데이터베이스 연결 성공!\n')

    let issueCount = 0
    let warningCount = 0

    // 1. Primary Key 없는 테이블 확인
    console.log('\n📊 1. Primary Key 확인')
    console.log('-'.repeat(70))

    const noPK = await client.query(`
      SELECT
        t.table_name
      FROM information_schema.tables t
      LEFT JOIN information_schema.table_constraints tc
        ON t.table_name = tc.table_name
        AND tc.constraint_type = 'PRIMARY KEY'
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND tc.constraint_name IS NULL
      ORDER BY t.table_name;
    `)

    if (noPK.rows.length > 0) {
      console.log(`\n⚠️  Primary Key가 없는 테이블: ${noPK.rows.length}개`)
      noPK.rows.forEach(r => console.log(`   - ${r.table_name}`))
      issueCount++
    } else {
      console.log('\n✅ 모든 테이블에 Primary Key가 있습니다.')
    }

    // 2. Foreign Key에 인덱스 없는 경우
    console.log('\n\n📊 2. Foreign Key 인덱스 확인')
    console.log('-'.repeat(70))

    const fkWithoutIndex = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND NOT EXISTS (
          SELECT 1
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = tc.table_name
            AND indexdef LIKE '%' || kcu.column_name || '%'
        )
      ORDER BY tc.table_name, kcu.column_name;
    `)

    if (fkWithoutIndex.rows.length > 0) {
      console.log(`\n⚠️  인덱스 없는 Foreign Key: ${fkWithoutIndex.rows.length}개`)
      console.table(fkWithoutIndex.rows)
      warningCount++
    } else {
      console.log('\n✅ 모든 Foreign Key에 인덱스가 있습니다.')
    }

    // 3. 사용되지 않는 인덱스
    console.log('\n\n📊 3. 사용되지 않는 인덱스 확인')
    console.log('-'.repeat(70))

    const unusedIndexes = await client.query(`
      SELECT
        schemaname,
        relname as tablename,
        indexrelname as indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexrelname NOT LIKE '%pkey'
      ORDER BY pg_relation_size(indexrelid) DESC;
    `)

    if (unusedIndexes.rows.length > 0) {
      console.log(`\n⚠️  사용되지 않는 인덱스: ${unusedIndexes.rows.length}개`)
      console.table(unusedIndexes.rows.slice(0, 10))
      if (unusedIndexes.rows.length > 10) {
        console.log(`\n... 그 외 ${unusedIndexes.rows.length - 10}개 더 있음`)
      }
      warningCount++
    } else {
      console.log('\n✅ 모든 인덱스가 사용되고 있습니다.')
    }

    // 4. 중복 인덱스 확인
    console.log('\n\n📊 4. 중복 인덱스 확인')
    console.log('-'.repeat(70))

    const duplicateIndexes = await client.query(`
      SELECT
        t.tablename,
        array_agg(t.indexname) as index_names,
        t.indexdef
      FROM pg_indexes t
      WHERE t.schemaname = 'public'
      GROUP BY t.tablename, t.indexdef
      HAVING COUNT(*) > 1
      ORDER BY t.tablename;
    `)

    if (duplicateIndexes.rows.length > 0) {
      console.log(`\n⚠️  중복 인덱스: ${duplicateIndexes.rows.length}개`)
      console.table(duplicateIndexes.rows)
      warningCount++
    } else {
      console.log('\n✅ 중복 인덱스가 없습니다.')
    }

    // 5. 큰 테이블 확인 (파티셔닝 고려)
    console.log('\n\n📊 5. 큰 테이블 확인 (100MB 이상)')
    console.log('-'.repeat(70))

    const largeTables = await client.query(`
      SELECT
        schemaname,
        relname as tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS total_size,
        pg_total_relation_size(schemaname||'.'||relname) AS size_bytes,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
        AND pg_total_relation_size(schemaname||'.'||relname) > 100 * 1024 * 1024
      ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC;
    `)

    if (largeTables.rows.length > 0) {
      console.log(`\n⚠️  100MB 이상 큰 테이블: ${largeTables.rows.length}개`)
      console.table(largeTables.rows)
      console.log('\n💡 파티셔닝을 고려해보세요.')
      warningCount++
    } else {
      console.log('\n✅ 100MB 이상의 큰 테이블이 없습니다.')
    }

    // 6. NULL 값이 많은 컬럼 (인덱스 효율성)
    console.log('\n\n📊 6. NULL 비율이 높은 인덱스 컬럼 확인')
    console.log('-'.repeat(70))

    const nullStats = await client.query(`
      SELECT
        schemaname,
        tablename,
        attname as column_name,
        null_frac,
        n_distinct,
        avg_width
      FROM pg_stats
      WHERE schemaname = 'public'
        AND null_frac > 0.5
        AND attname IN (
          SELECT column_name
          FROM information_schema.key_column_usage
          WHERE table_schema = 'public'
        )
      ORDER BY null_frac DESC
      LIMIT 10;
    `)

    if (nullStats.rows.length > 0) {
      console.log(`\n⚠️  NULL 비율 50% 이상 인덱스 컬럼: ${nullStats.rows.length}개`)
      console.table(nullStats.rows)
      console.log('\n💡 Partial index 사용을 고려해보세요.')
      warningCount++
    } else {
      console.log('\n✅ NULL 비율이 높은 인덱스 컬럼이 없습니다.')
    }

    // 7. Extension 확인
    console.log('\n\n📊 7. 설치된 PostgreSQL Extensions')
    console.log('-'.repeat(70))

    const extensions = await client.query(`
      SELECT
        extname,
        extversion,
        extrelocatable,
        extnamespace::regnamespace as schema
      FROM pg_extension
      WHERE extname NOT IN ('plpgsql')
      ORDER BY extname;
    `)

    console.log(`\n설치된 Extension: ${extensions.rows.length}개`)
    console.table(extensions.rows)

    // 8. 테이블 bloat 확인 (대략적)
    console.log('\n\n📊 8. 테이블 Bloat 확인')
    console.log('-'.repeat(70))

    const bloat = await client.query(`
      SELECT
        schemaname,
        relname as tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS total_size,
        n_dead_tup,
        n_live_tup,
        CASE
          WHEN n_live_tup > 0
          THEN ROUND(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 2)
          ELSE 0
        END AS dead_tuple_percent
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
        AND n_dead_tup > 1000
      ORDER BY n_dead_tup DESC
      LIMIT 10;
    `)

    if (bloat.rows.length > 0) {
      console.log(`\n⚠️  Dead tuple이 많은 테이블: ${bloat.rows.length}개`)
      console.table(bloat.rows)
      console.log('\n💡 VACUUM 또는 VACUUM FULL을 실행하세요.')
      warningCount++
    } else {
      console.log('\n✅ Bloat가 심각한 테이블이 없습니다.')
    }

    // 최종 요약
    console.log('\n\n' + '='.repeat(70))
    console.log('📊 보안 및 성능 점검 요약')
    console.log('='.repeat(70))

    console.log(`\n심각한 문제: ${issueCount}개`)
    console.log(`경고 사항: ${warningCount}개`)

    if (issueCount === 0 && warningCount === 0) {
      console.log('\n✅ 모든 항목이 정상입니다!')
    } else {
      console.log('\n⚠️  위의 권고사항을 검토하세요.')
    }

    console.log('\n' + '='.repeat(70))
    console.log('✅ 고급 보안 및 성능 점검 완료!')

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message)
    if (error.detail) console.error('상세:', error.detail)
    process.exit(1)
  } finally {
    await client.end()
  }
}

advancedSecurityAdvisor()
