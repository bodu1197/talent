#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * 마이그레이션 검증 스크립트
 * - 원본과 새 프로젝트의 데이터 비교
 */

const https = require('https');

const OLD_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';
const OLD_ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';
const NEW_PROJECT_ID = 'abroivxthindezdtdzmj';
const NEW_ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';

function executeQuery(projectId, token, _query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
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

const IMPORTANT_TABLES = [
  'users',
  'profiles',
  'buyers',
  'sellers',
  'categories',
  'services',
  'service_categories',
  'orders',
  'payments',
  'chat_rooms',
  'chat_messages',
  'reviews',
  'notifications',
  'errands',
  'food_stores',
  'food_menus',
];

async function verifyTable(tableName) {
  try {
    const oldResult = await executeQuery(
      OLD_PROJECT_ID,
      OLD_ACCESS_TOKEN,
      `SELECT COUNT(*) as count FROM "${tableName}"`
    );
    const newResult = await executeQuery(
      NEW_PROJECT_ID,
      NEW_ACCESS_TOKEN,
      `SELECT COUNT(*) as count FROM "${tableName}"`
    );

    const oldCount = parseInt(oldResult[0].count);
    const newCount = parseInt(newResult[0].count);
    const match = oldCount === newCount;

    let status = '⚠️';
    if (match) {
      status = '✅';
    } else if (oldCount === 0) {
      status = '⚪';
    }

    const diff = newCount - oldCount;
    let diffStr = '';
    if (diff > 0) {
      diffStr = `+${diff}`;
    } else if (diff < 0) {
      diffStr = `${diff}`;
    }

    console.log(
      `${status} ${tableName.padEnd(25)} | 원본: ${String(oldCount).padStart(5)} | 새: ${String(newCount).padStart(5)} ${diffStr}`
    );

    return { tableName, oldCount, newCount, match };
  } catch (error) {
    console.error('에러 발생:', error);
    console.log(`❌ ${tableName.padEnd(25)} | Error: ${error.message}`);
    return { tableName, oldCount: 0, newCount: 0, match: false, error: true };
  }
}

async function verifyDatabaseObjects() {
  console.log('\n📊 데이터베이스 객체 검증\n');

  const objectTypes = [
    {
      name: 'Tables',
      query: "SELECT COUNT(*) as count FROM pg_tables WHERE schemaname = 'public'",
    },
    {
      name: 'Functions',
      query:
        "SELECT COUNT(*) as count FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.prokind = 'f'",
    },
    {
      name: 'Triggers',
      query:
        "SELECT COUNT(*) as count FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname = 'public' AND NOT t.tgisinternal",
    },
    {
      name: 'RLS Policies',
      query: "SELECT COUNT(*) as count FROM pg_policies WHERE schemaname = 'public'",
    },
    { name: 'Storage Buckets', query: 'SELECT COUNT(*) as count FROM storage.buckets' },
  ];

  for (const obj of objectTypes) {
    try {
      const oldResult = await executeQuery(OLD_PROJECT_ID, OLD_ACCESS_TOKEN, obj.query);
      const newResult = await executeQuery(NEW_PROJECT_ID, NEW_ACCESS_TOKEN, obj.query);

      const oldCount = parseInt(oldResult[0].count);
      const newCount = parseInt(newResult[0].count);
      const match = oldCount === newCount;

      const status = match ? '✅' : '⚠️';
      console.log(
        `${status} ${obj.name.padEnd(20)} | 원본: ${String(oldCount).padStart(4)} | 새: ${String(newCount).padStart(4)}`
      );
    } catch (error) {
      console.error('에러 발생:', error);
      console.log(`❌ ${obj.name.padEnd(20)} | Error: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🔍 Supabase 마이그레이션 검증\n');
  console.log('═'.repeat(70));
  console.log(`원본 프로젝트: ${OLD_PROJECT_ID}`);
  console.log(`새 프로젝트:   ${NEW_PROJECT_ID}`);
  console.log('═'.repeat(70));

  await verifyDatabaseObjects();

  console.log('\n📋 주요 테이블 데이터 검증\n');
  console.log('상태 | 테이블명                   | 원본 rows | 새 rows');
  console.log('-'.repeat(70));

  const results = [];
  for (const tableName of IMPORTANT_TABLES) {
    await verifyTable(tableName);
    results.push(result);
  }

  console.log('═'.repeat(70));

  const matched = results.filter((r) => r.match).length;
  const total = results.filter((r) => !r.error).length;
  const empty = results.filter((r) => r.oldCount === 0).length;

  console.log(`\n📈 요약:`);
  console.log(`   ✅ 일치: ${matched}/${total} 테이블`);
  console.log(`   ⚪ 빈 테이블: ${empty}개`);
  console.log(`   ⚠️  불일치: ${total - matched - empty}개`);

  if (matched === total || matched + empty === total) {
    console.log('\n✨ 마이그레이션 검증 완료! 모든 데이터가 성공적으로 이동되었습니다.\n');
  } else {
    console.log('\n⚠️  일부 테이블에서 데이터 불일치가 발견되었습니다.\n');
  }
}

main();
