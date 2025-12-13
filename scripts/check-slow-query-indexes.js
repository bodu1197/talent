/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const { Client } = require('pg');

// Supabase 연결 정보
const connectionString =
  'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:chl1197dbA!@@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkSlowQueryIndexes() {
  try {
    console.log('\n🔍 느린 쿼리 인덱스 분석');
    console.log('='.repeat(70));

    await client.connect();
    console.log('✅ 데이터베이스 연결 성공!\n');

    const tables = ['categories', 'chat_rooms'];

    for (const tableName of tables) {
      console.log(`\n📊 ${tableName} 테이블 인덱스`);
      console.log('-'.repeat(70));

      // 테이블의 모든 인덱스 조회
      const indexes = await client.query(
        `
        SELECT
          i.relname as index_name,
          a.attname as column_name,
          ix.indisunique as is_unique,
          ix.indisprimary as is_primary,
          pg_get_indexdef(i.oid) as index_definition
        FROM
          pg_class t,
          pg_class i,
          pg_index ix,
          pg_attribute a
        WHERE
          t.oid = ix.indrelid
          AND i.oid = ix.indexrelid
          AND a.attrelid = t.oid
          AND a.attnum = ANY(ix.indkey)
          AND t.relkind = 'r'
          AND t.relname = $1
        ORDER BY
          i.relname,
          a.attnum;
      `,
        [tableName]
      );

      if (indexes.rows.length > 0) {
        console.log(`\n✅ ${indexes.rows.length}개 인덱스 발견:\n`);

        // 인덱스별로 그룹화
        const indexGroups = {};
        indexes.rows.forEach((row) => {
          if (!indexGroups[row.index_name]) {
            indexGroups[row.index_name] = {
              columns: [],
              is_unique: row.is_unique,
              is_primary: row.is_primary,
              definition: row.index_definition,
            };
          }
          indexGroups[row.index_name].columns.push(row.column_name);
        });

        Object.keys(indexGroups).forEach((indexName) => {
          const info = indexGroups[indexName];
          console.log(`📌 ${indexName}`);
          console.log(`   컬럼: ${info.columns.join(', ')}`);
          console.log(`   UNIQUE: ${info.is_unique}`);
          console.log(`   PRIMARY: ${info.is_primary}`);
          console.log(`   정의: ${info.definition}`);
          console.log();
        });
      } else {
        console.log('❌ 인덱스를 찾을 수 없습니다');
      }
    }

    // 성능 분석
    console.log('\n' + '='.repeat(70));
    console.log('📈 성능 분석 및 권장사항');
    console.log('='.repeat(70));

    console.log('\n🔍 느린 쿼리 Top 3:');
    console.log('1. realtime.list_changes: 12,506초 (94.7%) - Realtime 구독 과다');
    console.log('2. categories 조회: 528초 (4.0%) - 63,397회 호출');
    console.log('3. chat_rooms 조회: 6초 (0.05%) - 6,910회 호출');

    console.log('\n💡 최적화 권장사항:');
    console.log('\n1. 우선순위 1 (심각): Realtime 구독 최적화');
    console.log('   - 현재: 2,034,594회 호출 (비정상적!)');
    console.log('   - 조치: 불필요한 Realtime 구독 제거');
    console.log('   - 예상 효과: 전체 성능 95% 향상');

    console.log('\n2. 우선순위 2 (중요): categories 테이블 인덱스');
    console.log('   - 쿼리: WHERE is_active = true ORDER BY display_order');
    console.log('   - 현재: 63,397회 호출, 평균 8.34ms');
    console.log('   - 권장: CREATE INDEX idx_categories_is_active_display_order');
    console.log('     ON categories(is_active, display_order)');
    console.log('   - 예상 효과: 8.34ms → 1-2ms (75% 향상)');

    console.log('\n3. 우선순위 3 (보통): categories slug 인덱스');
    console.log('   - 쿼리: WHERE slug = ? AND is_active = true');
    console.log('   - 현재: 81,138회 호출, 평균 0.075ms');
    console.log('   - 확인 필요: slug에 UNIQUE 인덱스 있는지');

    console.log('\n4. 우선순위 4 (보통): chat_rooms seller_id 인덱스');
    console.log('   - 쿼리: WHERE seller_id = ?');
    console.log('   - 현재: 6,910회 호출, 평균 0.87ms');
    console.log('   - 확인 필요: seller_id FK 인덱스 있는지');

    console.log('\n' + '='.repeat(70));
    console.log('✅ 인덱스 분석 완료!');
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    if (error.detail) console.error('상세:', error.detail);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkSlowQueryIndexes();
