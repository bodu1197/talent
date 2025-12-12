#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * CSV 데이터를 새 프로젝트로 import
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const NEW_PROJECT_ID = process.argv[2] || 'abroivxthindezdtdzmj';
const NEW_ACCESS_TOKEN = process.argv[3] || 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';
const CSV_DIR = path.join(__dirname, '..', 'csv-export');

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

async function importTableFromCSV(tableName) {
  const csvPath = path.join(CSV_DIR, `${tableName}.csv`);
  const metaPath = path.join(CSV_DIR, `${tableName}.columns.txt`);

  if (!fs.existsSync(csvPath) || !fs.existsSync(metaPath)) {
    console.log(`   ⚠️  Files not found, skipping\n`);
    return;
  }

  try {
    console.log(`📦 Importing ${tableName}...`);

    const columns = fs.readFileSync(metaPath, 'utf8').trim();
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const rows = csvData.trim().split('\n');

    console.log(`   📊 Found ${rows.length} rows`);

    // Import in batches of 50
    const batchSize = 50;
    let imported = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      const values = batch.map(row => {
        const cells = row.split('\t');
        const formatted = cells.map(cell => {
          if (cell === '\\N') return 'NULL';
          // Unescape
          cell = cell.replace(/\\n/g, '\n');
          cell = cell.replace(/\\r/g, '\r');
          cell = cell.replace(/\\t/g, '\t');
          cell = cell.replace(/\\\\/g, '\\');
          return `'${cell.replace(/'/g, "''")}'::text`;
        }).join(', ');
        return `(${formatted})`;
      }).join(', ');

      const insertQuery = `
        INSERT INTO "${tableName}" (${columns})
        VALUES ${values}
      `;

      await executeQuery(insertQuery);
      imported += batch.length;

      process.stdout.write(`\r   📦 Imported ${imported}/${rows.length} rows...`);
    }

    console.log(`\n   ✅ Completed\n`);

  } catch (error) {
    console.log(`\n   ❌ Error: ${error.message}\n`);
  }
}

const TABLE_ORDER = [
  'users', 'categories', 'company_info', 'notices', 'admins',
  'profiles', 'buyers', 'sellers', 'helper_profiles', 'user_wallets',
  'service_categories', 'category_visits',
  'services', 'seller_portfolio', 'seller_earnings', 'food_stores',
  'service_revisions', 'service_revision_categories', 'service_packages',
  'service_favorites', 'service_views', 'service_view_logs',
  'portfolio_items', 'portfolio_services',
  'orders', 'order_settlements', 'revision_history', 'quotes', 'quote_responses',
  'reviews', 'payments', 'payment_requests', 'refunds', 'settlements',
  'settlement_details', 'disputes', 'tax_invoices',
  'chat_rooms', 'chat_messages', 'chat_favorites', 'conversations', 'messages',
  'errands', 'errand_applications', 'errand_stops', 'errand_locations',
  'errand_messages', 'errand_reviews', 'errand_settlements', 'errand_disputes',
  'errand_chat_messages',
  'food_menu_categories', 'food_menu_option_groups', 'food_menu_option_items',
  'food_menus', 'food_orders', 'food_reviews', 'food_carts', 'food_store_favorites',
  'advertising_subscriptions', 'advertising_campaigns', 'advertising_impressions',
  'advertising_payments', 'advertising_credits', 'premium_placements',
  'notifications', 'activity_logs', 'page_views', 'search_logs',
  'visitor_stats_hourly', 'visitor_stats_daily', 'visitor_stats_monthly',
  'wallet_transactions', 'credit_transactions', 'earnings_transactions',
  'withdrawal_requests', 'helper_withdrawals', 'helper_subscriptions', 'reports'
];

async function main() {
  console.log('🚀 Importing CSV data...\n');
  console.log(`Target: ${NEW_PROJECT_ID}\n`);

  // Disable RLS
  console.log('🔓 Disabling RLS...\n');
  try {
    await executeQuery('ALTER TABLE users DISABLE ROW LEVEL SECURITY');
  } catch {
    // Intentionally empty - RLS might not be enabled
  }

  for (const tableName of TABLE_ORDER) {
    await importTableFromCSV(tableName);
  }

  // Enable RLS
  console.log('\n🔒 Re-enabling RLS...\n');
  try {
    await executeQuery('ALTER TABLE users ENABLE ROW LEVEL SECURITY');
  } catch {
    // Intentionally empty - RLS might already be enabled
  }

  console.log('✅ Import completed!\n');
}

main();
