#!/usr/bin/env node

/**
 * Vercel 환경변수 자동 업데이트 스크립트
 * 새 Supabase 프로젝트로 환경변수 변경
 */

const https = require('https');
const readline = require('readline');

const PROJECT_ID = 'prj_C7fdPEM6tV4ywMDxOX1JGmfLX4HF';
const TEAM_ID = 'team_sA8Fyd7y54t3sueJ23R3wEv6';

// 새 Supabase 환경변수
const NEW_ENV_VARS = {
  'NEXT_PUBLIC_SUPABASE_URL': 'https://abroivxthindezdtdzmj.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5ODk3NjcsImV4cCI6MjA0OTU2NTc2N30.P-pJc-qGUYdw8z_jNmG-p8kE1TlhCpNzmYR4EBBZUBs',
  'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk4OTc2NywiZXhwIjoyMDQ5NTY1NzY3fQ.sb_secret_yjCABwj3zJbfvFsJ4baU4A_4b3YUPvT'
};

function makeVercelRequest(method, path, token, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            console.error('에러 발생:', error);
            resolve({ success: true });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getExistingEnvs(token) {
  try {
    await makeVercelRequest(
      'GET',
      `/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
      token
    );
    return result.envs || [];
  } catch (error) {
    console.log(`⚠️  환경변수 조회 실패: ${error.message}`);
    return [];
  }
}

async function deleteEnvVar(token, envId) {
  try {
    await makeVercelRequest(
      'DELETE',
      `/v9/projects/${PROJECT_ID}/env/${envId}?teamId=${TEAM_ID}`,
      token
    );
    return true;
  } catch (error) {
    console.log(`⚠️  삭제 실패: ${error.message}`);
    return false;
  }
}

async function createEnvVar(token, key, value) {
  try {
    await makeVercelRequest(
      'POST',
      `/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
      token,
      {
        key: key,
        value: value,
        type: 'encrypted',
        target: ['production', 'preview', 'development']
      }
    );
    return true;
  } catch (error) {
    console.error('에러 발생:', error);
    console.log(`⚠️  생성 실패 (${key}): ${error.message}`);
    return false;
  }
}

async function promptForToken() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\n🔑 Vercel API 토큰을 입력하세요: ', (token) => {
      rl.close();
      resolve(token.trim());
    });
  });
}

async function main() {
  console.log('🚀 Vercel 환경변수 업데이트 중...\n');
  console.log(`프로젝트: talent (${PROJECT_ID})\n`);

  // 토큰 확인
  let token = process.env.VERCEL_TOKEN;

  if (!token) {
    console.log('⚠️  VERCEL_TOKEN 환경변수가 없습니다.');
    console.log('\n📋 Vercel API 토큰 발급 방법:');
    console.log('1. https://vercel.com/account/tokens 접속');
    console.log('2. "Create" 버튼 클릭');
    console.log('3. Token Name 입력 (예: "Migration Token")');
    console.log('4. Scope: Full Account 선택');
    console.log('5. Create 클릭 후 토큰 복사\n');

    token = await promptForToken();

    if (!token) {
      console.log('\n❌ 토큰이 입력되지 않았습니다.\n');
      return;
    }
  }

  console.log('✅ 토큰 확인 완료\n');

  // 기존 환경변수 조회
  console.log('📥 기존 환경변수 조회 중...');
  const existingEnvs = await getExistingEnvs(token);
  console.log(`   찾은 환경변수: ${existingEnvs.length}개\n`);

  let updated = 0;
  let created = 0;
  let failed = 0;

  for (const [key, value] of Object.entries(NEW_ENV_VARS)) {
    console.log(`🔧 ${key} 업데이트 중...`);

    // 기존 환경변수 찾기
    const existing = existingEnvs.find(env => env.key === key);

    if (existing) {
      // 삭제 후 재생성
      console.log(`   기존 값 삭제 중...`);
      const deleted = await deleteEnvVar(token, existing.id);

      if (!deleted) {
        failed++;
        continue;
      }
    }

    // 새 값 생성
    console.log(`   새 값 생성 중...`);
    const success = await createEnvVar(token, key, value);

    if (success) {
      if (existing) {
        updated++;
        console.log(`   ✅ 업데이트 완료\n`);
      } else {
        created++;
        console.log(`   ✅ 생성 완료\n`);
      }
    } else {
      failed++;
    }
  }

  console.log('═════════════════════════════════════');
  console.log(`✅ 업데이트: ${updated}개`);
  console.log(`➕ 신규 생성: ${created}개`);
  console.log(`❌ 실패: ${failed}개`);
  console.log('═════════════════════════════════════\n');

  if (failed === 0) {
    console.log('✨ Vercel 환경변수 업데이트 완료!\n');
    console.log('📌 다음 단계:');
    console.log('   1. Vercel 대시보드에서 확인: https://vercel.com/dolpagu/talent/settings/environment-variables');
    console.log('   2. 프로덕션 재배포 (자동 배포되지 않는 경우)\n');
  } else {
    console.log('⚠️  일부 환경변수 업데이트에 실패했습니다.');
    console.log('   Vercel 대시보드에서 수동으로 확인해주세요.\n');
  }
}

main().catch(err => {
  console.error('❌ 오류 발생:', err.message);
  process.exit(1);
});
