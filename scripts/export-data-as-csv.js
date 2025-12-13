#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * 데이터를 CSV 형식으로 export
 * CSV는 JSON보다 안정적이고 PostgreSQL COPY 명령어와 호환됩니다
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';
const SUPABASE_ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';
const OUTPUT_DIR = path.join(__dirname, '..', 'csv-export');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${SUPABASE_PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
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

function escapeCSV(value) {
  if (value === null || value === undefined) {
    return '\\N'; // PostgreSQL NULL
  }

  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }

  value = String(value);

  // Escape special characters
  value = value.replace(/\\/g, '\\\\');
  value = value.replace(/\n/g, '\\n');
  value = value.replace(/\r/g, '\\r');
  value = value.replace(/\t/g, '\\t');

  return value;
}

async function exportTableAsCSV(tableName) {
  try {
    console.log(`📦 Exporting ${tableName}...`);

    // Get row count
    const countResult = await executeQuery(`SELECT COUNT(*) as count FROM "${tableName}"`);
    const rowCount = parseInt(countResult[0].count);

    if (rowCount === 0) {
      console.log(`   ⚠️  Empty table, skipping\n`);
      return;
    }

    // Get data
    await executeQuery(`SELECT * FROM "${tableName}"`);

    if (!data || data.length === 0) {
      console.log(`   ⚠️  No data, skipping\n`);
      return;
    }

    // Get column names
    const columns = Object.keys(data[0]);

    // Create CSV content
    const rows = data.map((row) => {
      return columns.map((col) => escapeCSV(row[col])).join('\t');
    });

    const csvContent = rows.join('\n');

    // Write to file
    const outputPath = path.join(OUTPUT_DIR, `${tableName}.csv`);
    fs.writeFileSync(outputPath, csvContent);

    // Create metadata file with column names
    const metaPath = path.join(OUTPUT_DIR, `${tableName}.columns.txt`);
    fs.writeFileSync(metaPath, columns.join(','));

    console.log(`   ✅ Exported ${rowCount} rows\n`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
  }
}

async function main() {
  console.log('🚀 Exporting data as CSV...\n');

  try {
    // Get all tables
    const tables = await executeQuery(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename NOT IN ('schema_migrations')
      ORDER BY tablename
    `);

    console.log(`Found ${tables.length} tables\n`);

    for (const { tablename } of tables) {
      await exportTableAsCSV(tablename);
    }

    // Create import script
    console.log('📋 Creating import script...');

    const importScript = `#!/usr/bin/env node

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
      path: \`/v1/projects/\${NEW_PROJECT_ID}/database/query\`,
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${NEW_ACCESS_TOKEN}\`,
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
          reject(new Error(\`HTTP \${res.statusCode}: \${body}\`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function importTableFromCSV(tableName) {
  const csvPath = path.join(CSV_DIR, \`\${tableName}.csv\`);
  const metaPath = path.join(CSV_DIR, \`\${tableName}.columns.txt\`);

  if (!fs.existsSync(csvPath) || !fs.existsSync(metaPath)) {
    console.log(\`   ⚠️  Files not found, skipping\\n\`);
    return;
  }

  try {
    console.log(\`📦 Importing \${tableName}...\`);

    const columns = fs.readFileSync(metaPath, 'utf8').trim();
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const rows = csvData.trim().split('\\n');

    console.log(\`   📊 Found \${rows.length} rows\`);

    // Import in batches of 50
    const batchSize = 50;
    let imported = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      const values = batch.map(row => {
        const cells = row.split('\\t');
        const formatted = cells.map(cell => {
          if (cell === '\\\\N') return 'NULL';
          // Unescape
          cell = cell.replace(/\\\\n/g, '\\n');
          cell = cell.replace(/\\\\r/g, '\\r');
          cell = cell.replace(/\\\\t/g, '\\t');
          cell = cell.replace(/\\\\\\\\/g, '\\\\');
          return \`'\${cell.replace(/'/g, "''")}'::text\`;
        }).join(', ');
        return \`(\${formatted})\`;
      }).join(', ');

      const insertQuery = \`
        INSERT INTO "\${tableName}" (\${columns})
        VALUES \${values}
      \`;

      await executeQuery(insertQuery);
      imported += batch.length;

      process.stdout.write(\`\\r   📦 Imported \${imported}/\${rows.length} rows...\`);
    }

    console.log(\`\\n   ✅ Completed\\n\`);

  } catch (error) {
    console.log(\`\\n   ❌ Error: \${error.message}\\n\`);
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
  console.log('🚀 Importing CSV data...\\n');
  console.log(\`Target: \${NEW_PROJECT_ID}\\n\`);

  // Disable RLS
  console.log('🔓 Disabling RLS...\\n');
  try {
    await executeQuery('ALTER TABLE users DISABLE ROW LEVEL SECURITY');
  } catch (_error) {}

  for (const tableName of TABLE_ORDER) {
    await importTableFromCSV(tableName);
  }

  // Enable RLS
  console.log('\\n🔒 Re-enabling RLS...\\n');
  try {
    await executeQuery('ALTER TABLE users ENABLE ROW LEVEL SECURITY');
  } catch (_error) {}

  console.log('✅ Import completed!\\n');
}

main();
`;

    fs.writeFileSync(path.join(__dirname, 'import-csv-data.js'), importScript);
    console.log('   ✅ Import script created\n');

    console.log('✅ CSV export completed!\n');
    console.log(`📁 Output: ${OUTPUT_DIR}`);
    console.log('\n📝 To import:');
    console.log('   node scripts/import-csv-data.js [PROJECT_ID] [ACCESS_TOKEN]');
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

main();
