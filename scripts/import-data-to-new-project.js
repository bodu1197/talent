#!/usr/bin/env node

/**
 * 새 Supabase 프로젝트로 데이터 Import 스크립트
 *
 * 사용법:
 * node scripts/import-data-to-new-project.js [NEW_PROJECT_ID] [NEW_ACCESS_TOKEN]
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const NEW_PROJECT_ID = process.argv[2] || 'abroivxthindezdtdzmj';
const NEW_ACCESS_TOKEN = process.argv[3] || 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';
const DATA_DIR = path.join(__dirname, '..', 'database-export');

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const _data = JSON.stringify({ query });

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${NEW_PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEW_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            console.error('에러 발생:', error);
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 테이블 import 순서 (외래 키 의존성 순서)
const TABLE_ORDER = [
  // 1. 독립 테이블 (외래 키 없음)
  'users',
  'categories',
  'company_info',
  'tags',
  'notices',
  'admins',

  // 2. users에 의존
  'profiles',
  'buyers',
  'sellers',
  'helper_profiles',
  'user_wallets',

  // 3. categories에 의존
  'service_categories',
  'category_visits',

  // 4. sellers에 의존
  'services',
  'seller_portfolio',
  'seller_earnings',
  'food_stores',

  // 5. services에 의존
  'service_revisions',
  'service_revision_categories',
  'service_packages',
  'service_favorites',
  'service_views',
  'service_view_logs',
  'portfolio_items',
  'portfolio_services',

  // 6. 주문 관련
  'orders',
  'order_settlements',
  'revision_history',
  'quotes',
  'quote_responses',
  'reviews',
  'payments',
  'payment_requests',
  'refunds',
  'settlements',
  'settlement_details',
  'disputes',
  'tax_invoices',

  // 7. 채팅
  'chat_rooms',
  'chat_messages',
  'chat_favorites',
  'conversations',
  'messages',

  // 8. 심부름
  'errands',
  'errand_applications',
  'errand_stops',
  'errand_locations',
  'errand_messages',
  'errand_reviews',
  'errand_settlements',
  'errand_disputes',
  'errand_chat_messages',

  // 9. 음식 배달
  'food_menu_categories',
  'food_menu_option_groups',
  'food_menu_option_items',
  'food_menus',
  'food_orders',
  'food_reviews',
  'food_carts',
  'food_store_favorites',

  // 10. 광고
  'advertising_subscriptions',
  'advertising_campaigns',
  'advertising_impressions',
  'advertising_payments',
  'advertising_credits',
  'premium_placements',

  // 11. 기타
  'notifications',
  'activity_logs',
  'page_views',
  'search_logs',
  'visitor_stats_hourly',
  'visitor_stats_daily',
  'visitor_stats_monthly',
  'wallet_transactions',
  'credit_transactions',
  'earnings_transactions',
  'withdrawal_requests',
  'helper_withdrawals',
  'helper_subscriptions',
  'reports',
  'schema_migrations'
];

async function disableRLS() {
  console.log('🔓 Disabling RLS for import...');

  try {
    const tables = await executeQuery(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    for (const { tablename } of tables) {
      try {
        await executeQuery(`ALTER TABLE "${tablename}" DISABLE ROW LEVEL SECURITY`);
      } catch (error) {
        console.error('에러 발생:', error);
        // 일부 테이블은 RLS가 없을 수 있음
      }
    }

    console.log('✅ RLS disabled\n');
  } catch (error) {
    console.error(`⚠️  Warning: ${error.message}\n`);
  }
}

async function enableRLS() {
  console.log('🔒 Re-enabling RLS...');

  try {
    const tables = await executeQuery(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    for (const { tablename } of tables) {
      try {
        await executeQuery(`ALTER TABLE "${tablename}" ENABLE ROW LEVEL SECURITY`);
      } catch (error) {
        console.error('에러 발생:', error);
        // Ignore errors
      }
    }

    console.log('✅ RLS re-enabled\n');
  } catch (error) {
    console.error(`⚠️  Warning: ${error.message}\n`);
  }
}

async function importTable(tableName) {
  const filePath = path.join(DATA_DIR, `${tableName}.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  No data file found, skipping\n`);
    return;
  }

  try {
    const _data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!data || data.length === 0) {
      console.log(`   ⚠️  Empty data, skipping\n`);
      return;
    }

    // INSERT 문 생성
    const columns = Object.keys(data[0]);
    const values = data.map(row => {
      const rowValues = columns.map(col => {
        const value = row[col];
        if (value === null) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
        return value;
      });
      return `(${rowValues.join(', ')})`;
    });

    // 배치 처리 (한 번에 100개씩)
    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize);
      const insertQuery = `
        INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
        VALUES ${batch.join(', ')}
      `;

      await executeQuery(insertQuery);
      imported += batch.length;

      process.stdout.write(`\r   📦 Imported ${imported}/${data.length} rows...`);
    }

    console.log(`\n   ✅ Completed\n`);
  } catch (error) {
    console.log(`\n   ❌ Error: ${error.message}\n`);
  }
}

async function main() {
  console.log('🚀 Starting data import...\n');
  console.log(`Target project: ${NEW_PROJECT_ID}\n`);

  try {
    await disableRLS();

    for (const tableName of TABLE_ORDER) {
      console.log(`📋 Importing ${tableName}...`);
      await importTable(tableName);
    }

    await enableRLS();

    console.log('✅ Import completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

main();
