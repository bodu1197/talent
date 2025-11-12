const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://bpvfkkrlyrjkwgwmfrci.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'
);

async function exportSchema() {
  let sql = `-- ============================================
-- Supabase Schema Export
-- Generated: ${new Date().toISOString()}
-- Project: bpvfkkrlyrjkwgwmfrci.supabase.co
-- ============================================

`;

  console.log('📋 데이터베이스 구조 분석 중...');

  // 알려진 테이블 목록 (이전에 확인한 인덱스 목록에서)
  const tables = [
    'activity_logs', 'admins', 'advertising_campaigns', 'buyers',
    'categories', 'category_visits', 'chat_favorites', 'chat_messages', 'chat_rooms',
    'conversations', 'coupons', 'disputes', 'earnings_transactions',
    'favorites', 'messages', 'notifications', 'orders',
    'payment_requests', 'payments', 'portfolio_items', 'portfolio_services',
    'premium_placements', 'quote_responses', 'quotes', 'refunds', 'reports',
    'reviews', 'schema_migrations', 'search_logs', 'seller_earnings',
    'seller_portfolio', 'sellers', 'service_categories', 'service_favorites',
    'service_revision_categories', 'service_revisions', 'service_tags',
    'service_view_logs', 'service_views', 'services', 'settlement_details',
    'settlements', 'tags', 'user_coupons', 'user_wallets', 'users',
    'wallet_transactions', 'withdrawal_requests'
  ];

  sql += `-- ============================================\n`;
  sql += `-- Tables (${tables.length} total)\n`;
  sql += `-- ============================================\n\n`;

  let successCount = 0;
  let failCount = 0;

  for (const tableName of tables) {
    try {
      // 각 테이블의 샘플 데이터 1개 가져오기
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        sql += `-- Table: ${tableName} (접근 불가: ${error.message})\n\n`;
        failCount++;
        continue;
      }

      sql += `-- ============================================\n`;
      sql += `-- Table: ${tableName}\n`;
      sql += `-- Records: ${count || 0}\n`;
      sql += `-- ============================================\n\n`;

      if (data && data.length > 0) {
        const sample = data[0];
        const columns = Object.keys(sample);

        sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;

        const colDefs = columns.map(col => {
          const value = sample[col];
          let type = 'text';

          if (value === null) {
            type = 'text';
          } else if (typeof value === 'number') {
            type = Number.isInteger(value) ? 'integer' : 'numeric';
          } else if (typeof value === 'boolean') {
            type = 'boolean';
          } else if (value instanceof Date || /^\d{4}-\d{2}-\d{2}/.test(value)) {
            type = 'timestamp with time zone';
          } else if (typeof value === 'object') {
            type = 'jsonb';
          } else if (typeof value === 'string' && value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/)) {
            type = 'uuid';
          }

          return `  ${col} ${type}`;
        });

        sql += colDefs.join(',\n');
        sql += '\n);\n\n';

        // 샘플 데이터도 주석으로 추가
        sql += `-- Sample data:\n-- ${JSON.stringify(sample, null, 2).split('\n').join('\n-- ')}\n\n`;
      } else {
        sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
        sql += `  -- No data available to infer schema\n`;
        sql += `);\n\n`;
      }

      successCount++;
      console.log(`✅ ${tableName} (${count || 0} records)`);

    } catch (error) {
      sql += `-- Table: ${tableName} (오류: ${error.message})\n\n`;
      failCount++;
      console.log(`❌ ${tableName}: ${error.message}`);
    }
  }

  // 파일 저장
  const filename = `database/supabase-schema-${new Date().toISOString().split('T')[0]}.sql`;
  fs.mkdirSync('database', { recursive: true });
  fs.writeFileSync(filename, sql);

  console.log(`\n✅ 스키마 저장 완료: ${filename}`);
  console.log(`📊 성공: ${successCount}개, 실패: ${failCount}개`);

  return filename;
}

exportSchema().catch(console.error);
