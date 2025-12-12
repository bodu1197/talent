#!/usr/bin/env node

/**
 * CSV 데이터를 안전하게 import
 * - 각 행을 개별 INSERT로 처리
 * - 에러 발생 시에도 계속 진행
 * - 타입 캐스팅 개선
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const NEW_PROJECT_ID = 'abroivxthindezdtdzmj';
const NEW_ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';
const _CSV_DIR = path.join(__dirname, '..', 'csv-export');
const JSON_DIR = path.join(__dirname, '..', 'database-export');

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${NEW_PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEW_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
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
            resolve({ success: true });
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

async function importTableFromJSON(tableName) {
  const jsonPath = path.join(JSON_DIR, `${tableName}.json`);

  if (!fs.existsSync(jsonPath)) {
    console.log(`   ⚠️  ${tableName}.json not found, skipping\n`);
    return;
  }

  try {
    console.log(`📦 Importing ${tableName}...`);

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    if (!data || data.length === 0) {
      console.log(`   ⚠️  No data, skipping\n`);
      return;
    }

    const columns = Object.keys(data[0]);
    let successCount = 0;
    let errorCount = 0;

    // Import each row individually
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        const values = columns.map(col => {
          const value = row[col];

          if (value === null || value === undefined) {
            return 'NULL';
          }

          if (typeof value === 'string') {
            // Escape single quotes
            const escaped = value.replace(/'/g, "''");
            return `'${escaped}'`;
          }

          if (typeof value === 'boolean') {
            return value ? 'true' : 'false';
          }

          if (typeof value === 'object') {
            const json = JSON.stringify(value).replace(/'/g, "''");
            return `'${json}'::jsonb`;
          }

          return value;
        }).join(', ');

        const insertQuery = `
          INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
          VALUES (${values})
        `;

        await executeQuery(insertQuery);
        successCount++;

        if ((i + 1) % 10 === 0 || i === data.length - 1) {
          process.stdout.write(`\r   📦 Progress: ${i + 1}/${data.length} (${successCount} success, ${errorCount} errors)`);
        }

      } catch (error) {
        console.error('에러 발생:', error);
        errorCount++;
        // Continue with next row
      }
    }

    console.log(`\n   ✅ Completed: ${successCount}/${data.length} rows imported\n`);

  } catch (error) {
    console.log(`\n   ❌ Error: ${error.message}\n`);
  }
}

const TABLE_ORDER = [
  'users',
  'categories',
  'company_info',
  'notices',
  'admins',
  'profiles',
  'buyers',
  'sellers',
  'helper_profiles',
  'user_wallets',
  'service_categories',
  'category_visits',
  'services',
  'seller_portfolio',
  'seller_earnings',
  'food_stores',
  'service_revisions',
  'service_revision_categories',
  'service_packages',
  'service_favorites',
  'service_views',
  'service_view_logs',
  'portfolio_items',
  'portfolio_services',
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
  'chat_rooms',
  'chat_messages',
  'chat_favorites',
  'conversations',
  'messages',
  'errands',
  'errand_applications',
  'errand_stops',
  'errand_locations',
  'errand_messages',
  'errand_reviews',
  'errand_settlements',
  'errand_disputes',
  'errand_chat_messages',
  'food_menu_categories',
  'food_menu_option_groups',
  'food_menu_option_items',
  'food_menus',
  'food_orders',
  'food_reviews',
  'food_carts',
  'food_store_favorites',
  'advertising_subscriptions',
  'advertising_campaigns',
  'advertising_impressions',
  'advertising_payments',
  'advertising_credits',
  'premium_placements',
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
  'reports'
];

async function disableRLS() {
  console.log('🔓 Disabling RLS...\n');

  const tables = TABLE_ORDER;

  for (const table of tables) {
    try {
      await executeQuery(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY`);
    } catch (error) {
      console.error('에러 발생:', error);
      // Ignore errors
    }
  }

  console.log('✅ RLS disabled\n');
}

async function enableRLS() {
  console.log('\n🔒 Re-enabling RLS...\n');

  const tables = TABLE_ORDER;

  for (const table of tables) {
    try {
      await executeQuery(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
    } catch (error) {
      console.error('에러 발생:', error);
      // Ignore errors
    }
  }

  console.log('✅ RLS re-enabled\n');
}

async function main() {
  console.log('🚀 Importing data to new Supabase project...\n');
  console.log(`Target: ${NEW_PROJECT_ID}\n`);

  await disableRLS();

  for (const tableName of TABLE_ORDER) {
    await importTableFromJSON(tableName);
  }

  await enableRLS();

  console.log('═══════════════════════════════════════');
  console.log('✅ Import completed!');
  console.log('═══════════════════════════════════════\n');
}

main();
