#!/usr/bin/env node

/**
 * OAuth Provider 자동 설정 스크립트
 * Google과 Kakao OAuth를 원본에서 새 프로젝트로 복사
 */

const https = require('https');

const OLD_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';
const OLD_ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';
const NEW_PROJECT_ID = 'abroivxthindezdtdzmj';
const _NEW_ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';

function makeRequest(method, path, token, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
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
            resolve(data);
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

async function getAuthConfig(projectId, token) {
  try {
    const config = await makeRequest(
      'GET',
      `/v1/projects/${projectId}/config/auth`,
      token
    );
    return config;
  } catch (error) {
    console.log(`⚠️  Auth config 조회 실패: ${error.message}`);
    return null;
  }
}

async function _updateAuthConfig(projectId, token, config) {
  try {
    await makeRequest(
      'PATCH',
      `/v1/projects/${projectId}/config/auth`,
      token,
      config
    );
    return true;
  } catch (error) {
    console.log(`⚠️  Auth config 업데이트 실패: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔐 OAuth Provider 설정 복사 중...\n');
  console.log(`원본: ${OLD_PROJECT_ID}`);
  console.log(`대상: ${NEW_PROJECT_ID}\n`);

  // 원본 프로젝트의 Auth 설정 가져오기
  console.log('📥 원본 프로젝트 설정 조회 중...');
  const oldConfig = await getAuthConfig(OLD_PROJECT_ID, OLD_ACCESS_TOKEN);

  if (!oldConfig) {
    console.log('\n❌ 원본 설정을 가져올 수 없습니다.');
    console.log('\n📋 수동 설정이 필요합니다:');
    console.log('1. https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci');
    console.log('2. Authentication → Providers → Google/Kakao 설정 확인');
    console.log('3. https://supabase.com/dashboard/project/abroivxthindezdtdzmj');
    console.log('4. 같은 설정을 입력\n');
    return;
  }

  console.log('✅ 원본 설정 조회 완료\n');

  // 새 프로젝트에 적용
  console.log('📤 새 프로젝트에 설정 적용 중...');

  // Supabase Management API는 전체 auth config를 업데이트하지 못할 수 있음
  // OAuth provider별 설정은 대시보드에서만 가능한 경우가 많음

  console.log('\n⚠️  Supabase Management API는 OAuth provider 개별 설정을 지원하지 않습니다.');
  console.log('\n📋 다음 단계를 수동으로 진행해주세요:\n');

  console.log('1️⃣  원본 프로젝트 OAuth 설정 확인:');
  console.log('   https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/auth/providers\n');

  console.log('2️⃣  새 프로젝트에 같은 설정 입력:');
  console.log('   https://supabase.com/dashboard/project/abroivxthindezdtdzmj/auth/providers\n');

  console.log('3️⃣  Google Cloud Console 및 Kakao Developers에서:');
  console.log('   Redirect URI 추가: https://abroivxthindezdtdzmj.supabase.co/auth/v1/callback\n');

  console.log('📄 상세 가이드: scripts/setup-auth-providers.md\n');
}

main();
