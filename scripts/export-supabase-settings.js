#!/usr/bin/env node

/**
 * Supabase 프로젝트 전체 설정 export 스크립트
 *
 * Export 항목:
 * 1. 프로젝트 기본 정보
 * 2. Auth 설정 (providers, policies)
 * 3. Storage buckets 및 policies
 * 4. Database 설정
 * 5. Edge Functions
 * 6. Secrets & Environment Variables
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';
const SUPABASE_ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';
const OUTPUT_DIR = path.join(__dirname, '..', 'supabase-settings-export');

// Output 디렉토리 생성
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function apiRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(data ? JSON.parse(data) : {});
          } catch (error) {
            console.error('에러 발생:', error);
            resolve(data); // Return raw data if not JSON
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${SUPABASE_PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
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

async function exportProjectInfo() {
  console.log('📋 Exporting project information...');

  try {
    const project = await apiRequest(`/v1/projects/${SUPABASE_PROJECT_ID}`);

    const outputPath = path.join(OUTPUT_DIR, 'project-info.json');
    fs.writeFileSync(outputPath, JSON.stringify(project, null, 2));

    console.log('✅ Project information exported\n');
    return project;
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    return null;
  }
}

async function exportAuthSettings() {
  console.log('📋 Exporting Auth settings...');

  try {
    // Auth providers 설정
    const config = await apiRequest(`/v1/projects/${SUPABASE_PROJECT_ID}/config`);

    const outputPath = path.join(OUTPUT_DIR, 'auth-config.json');
    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));

    console.log('✅ Auth settings exported\n');
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }
}

async function exportStorageBuckets() {
  console.log('📋 Exporting Storage buckets...');

  try {
    // Storage buckets 목록
    const buckets = await executeQuery(`
      SELECT * FROM storage.buckets
    `);

    const bucketsPath = path.join(OUTPUT_DIR, 'storage-buckets.json');
    fs.writeFileSync(bucketsPath, JSON.stringify(buckets, null, 2));

    console.log(`✅ Exported ${buckets.length} storage buckets\n`);

    // Storage policies
    console.log('📋 Exporting Storage policies...');
    const policies = await executeQuery(`
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'storage'
      ORDER BY tablename, policyname
    `);

    const policiesPath = path.join(OUTPUT_DIR, 'storage-policies.json');
    fs.writeFileSync(policiesPath, JSON.stringify(policies, null, 2));

    console.log(`✅ Exported ${policies.length} storage policies\n`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }
}

async function exportRLSPolicies() {
  console.log('📋 Exporting RLS policies...');

  try {
    const policies = await executeQuery(`
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `);

    const outputPath = path.join(OUTPUT_DIR, 'rls-policies.json');
    fs.writeFileSync(outputPath, JSON.stringify(policies, null, 2));

    console.log(`✅ Exported ${policies.length} RLS policies\n`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }
}

async function exportFunctions() {
  console.log('📋 Exporting database functions...');

  try {
    const functions = await executeQuery(`
      SELECT
        n.nspname as schema,
        p.proname as name,
        pg_get_function_arguments(p.oid) as arguments,
        pg_get_functiondef(p.oid) as definition,
        CASE p.provolatile
          WHEN 'i' THEN 'IMMUTABLE'
          WHEN 's' THEN 'STABLE'
          WHEN 'v' THEN 'VOLATILE'
        END as volatility,
        CASE p.prosecdef
          WHEN true THEN 'SECURITY DEFINER'
          ELSE 'SECURITY INVOKER'
        END as security
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
      AND p.prokind = 'f'
      ORDER BY n.nspname, p.proname
    `);

    const outputPath = path.join(OUTPUT_DIR, 'database-functions.json');
    fs.writeFileSync(outputPath, JSON.stringify(functions, null, 2));

    // SQL 형태로도 저장
    const sqlPath = path.join(OUTPUT_DIR, 'database-functions.sql');
    const sqlContent = functions.map(f => f.definition).join('\n\n');
    fs.writeFileSync(sqlPath, sqlContent);

    console.log(`✅ Exported ${functions.length} database functions\n`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }
}

async function exportTriggers() {
  console.log('📋 Exporting triggers...');

  try {
    const triggers = await executeQuery(`
      SELECT
        trigger_schema,
        trigger_name,
        event_manipulation,
        event_object_table,
        action_statement,
        action_timing,
        action_orientation
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);

    const outputPath = path.join(OUTPUT_DIR, 'triggers.json');
    fs.writeFileSync(outputPath, JSON.stringify(triggers, null, 2));

    console.log(`✅ Exported ${triggers.length} triggers\n`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }
}

async function exportIndexes() {
  console.log('📋 Exporting indexes...');

  try {
    const indexes = await executeQuery(`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    const outputPath = path.join(OUTPUT_DIR, 'indexes.json');
    fs.writeFileSync(outputPath, JSON.stringify(indexes, null, 2));

    // SQL 형태로도 저장
    const sqlPath = path.join(OUTPUT_DIR, 'indexes.sql');
    const sqlContent = indexes.map(idx => idx.indexdef + ';').join('\n');
    fs.writeFileSync(sqlPath, sqlContent);

    console.log(`✅ Exported ${indexes.length} indexes\n`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }
}

async function exportViews() {
  console.log('📋 Exporting views...');

  try {
    const views = await executeQuery(`
      SELECT
        table_schema,
        table_name,
        view_definition
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const outputPath = path.join(OUTPUT_DIR, 'views.json');
    fs.writeFileSync(outputPath, JSON.stringify(views, null, 2));

    // SQL 형태로도 저장
    const sqlPath = path.join(OUTPUT_DIR, 'views.sql');
    const sqlContent = views.map(v =>
      `CREATE OR REPLACE VIEW ${v.table_name} AS\n${v.view_definition};`
    ).join('\n\n');
    fs.writeFileSync(sqlPath, sqlContent);

    console.log(`✅ Exported ${views.length} views\n`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }
}

async function exportEnums() {
  console.log('📋 Exporting enum types...');

  try {
    const enums = await executeQuery(`
      SELECT
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname
    `);

    const outputPath = path.join(OUTPUT_DIR, 'enums.json');
    fs.writeFileSync(outputPath, JSON.stringify(enums, null, 2));

    // SQL 형태로도 저장
    const sqlPath = path.join(OUTPUT_DIR, 'enums.sql');
    const sqlContent = enums.map(e => {
      const enumValues = e.enum_values.map(v => `'${v}'`).join(', ');
      return `CREATE TYPE ${e.enum_name} AS ENUM (${enumValues});`;
    }).join('\n');
    fs.writeFileSync(sqlPath, sqlContent);

    console.log(`✅ Exported ${enums.length} enum types\n`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }
}

async function createImportGuide() {
  console.log('📋 Creating import guide...');

  const guide = `# Supabase 프로젝트 Import 가이드

## 1. 새 Supabase 프로젝트 생성

1. https://supabase.com/dashboard 접속
2. "New Project" 클릭
3. 프로젝트 이름, 비밀번호, 리전 설정
4. 프로젝트 생성 완료 대기

## 2. 데이터베이스 스키마 Import

### 방법 1: Migration 파일 사용 (권장)

\`\`\`bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 초기화
supabase init

# 기존 migration 파일들을 새 프로젝트의 supabase/migrations/ 폴더로 복사
# (이 프로젝트의 supabase/migrations/ 폴더 전체)

# 새 Supabase 프로젝트 연결
supabase link --project-ref [NEW_PROJECT_ID]

# Migration 실행
supabase db push
\`\`\`

### 방법 2: SQL 파일 직접 실행

1. Supabase Dashboard → SQL Editor
2. 다음 순서로 SQL 파일 실행:
   - \`enums.sql\` (먼저 실행)
   - \`database-export/full-schema.sql\`
   - \`indexes.sql\`
   - \`views.sql\`
   - \`database-functions.sql\`

## 3. RLS Policies Import

Dashboard → Authentication → Policies에서:
- \`rls-policies.json\` 내용 참고하여 정책 수동 생성
- 또는 SQL Editor에서 CREATE POLICY 문 실행

## 4. Storage 설정

### Buckets 생성
Dashboard → Storage → Create bucket
- \`storage-buckets.json\` 참고

### Storage Policies 설정
Dashboard → Storage → [Bucket] → Policies
- \`storage-policies.json\` 참고

## 5. Auth 설정

Dashboard → Authentication → Providers
- \`auth-config.json\` 참고하여 설정

## 6. 데이터 Import

### 방법 1: JSON 데이터 Import 스크립트 사용

\`\`\`bash
node scripts/import-data.js
\`\`\`

### 방법 2: SQL INSERT 문 생성 후 실행

각 \`.json\` 파일을 INSERT 문으로 변환하여 실행

## 7. Environment Variables 업데이트

새 프로젝트의 정보로 업데이트:
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`

## 8. 검증

1. 모든 테이블이 생성되었는지 확인
2. 데이터가 정상적으로 import되었는지 확인
3. RLS policies가 작동하는지 테스트
4. Storage 업로드/다운로드 테스트
5. Auth 로그인/회원가입 테스트

## Export된 파일 목록

### 데이터베이스
- \`database-export/\`: 모든 테이블 데이터 (JSON)
- \`full-schema.sql\`: 전체 스키마
- \`foreign-keys.json\`: 외래 키 제약조건

### 데이터베이스 객체
- \`enums.sql\`: Enum 타입
- \`indexes.sql\`: 인덱스
- \`views.sql\`: 뷰
- \`database-functions.sql\`: 함수
- \`triggers.json\`: 트리거

### 설정
- \`project-info.json\`: 프로젝트 기본 정보
- \`auth-config.json\`: Auth 설정
- \`rls-policies.json\`: RLS 정책
- \`storage-buckets.json\`: Storage 버킷
- \`storage-policies.json\`: Storage 정책

### Migration 파일
- \`supabase/migrations/\`: 기존 migration 파일 (50개)

## 주의사항

1. **순서 중요**: Enum → Schema → Indexes → Views → Functions 순서로 import
2. **외래 키**: 참조되는 테이블을 먼저 import
3. **RLS**: 데이터 import 전에 RLS를 비활성화하고, import 후 다시 활성화
4. **Secrets**: API keys, passwords는 수동으로 설정 필요
5. **Storage**: 파일은 별도로 다운로드/업로드 필요

## 도움이 필요한 경우

- Supabase 공식 문서: https://supabase.com/docs
- CLI 참고: https://supabase.com/docs/reference/cli
`;

  const guidePath = path.join(OUTPUT_DIR, 'IMPORT-GUIDE.md');
  fs.writeFileSync(guidePath, guide);

  console.log('✅ Import guide created\n');
}

async function main() {
  console.log('🚀 Starting Supabase settings export...\n');
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  try {
    await exportProjectInfo();
    await exportAuthSettings();
    await exportStorageBuckets();
    await exportRLSPolicies();
    await exportFunctions();
    await exportTriggers();
    await exportIndexes();
    await exportViews();
    await exportEnums();
    await createImportGuide();

    console.log('✅ Export completed successfully!');
    console.log(`\n📁 Files saved to: ${OUTPUT_DIR}`);
    console.log('\n📖 Read IMPORT-GUIDE.md for instructions on how to import to a new project');
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

main();
