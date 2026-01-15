/**
 * Supabase 설정 로더
 * 환경 변수 또는 config.js에서 자동으로 설정을 가져옵니다
 */

const path = require('path');
const fs = require('fs');

function getConfig() {
  const configPath = path.join(__dirname, 'config.js');

  let SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
  let SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

  // 환경 변수가 없으면 config.js에서 로드
  if (!SUPABASE_ACCESS_TOKEN && fs.existsSync(configPath)) {
    const config = require('./config');
    SUPABASE_PROJECT_ID = config.SUPABASE_PROJECT_ID;
    SUPABASE_ACCESS_TOKEN = config.SUPABASE_ACCESS_TOKEN;
  }

  // 기본값 설정
  SUPABASE_PROJECT_ID = SUPABASE_PROJECT_ID || 'abroivxthindezdtdzmj';

  // 토큰이 없으면 에러
  if (!SUPABASE_ACCESS_TOKEN) {
    console.error('❌ Error: SUPABASE_ACCESS_TOKEN is required');
    console.error('');
    console.error('해결 방법:');
    console.error('  1. PowerShell에서 실행: .\\setup-env.ps1');
    console.error('  2. 또는 환경 변수 직접 설정:');
    console.error('     $env:SUPABASE_ACCESS_TOKEN="your_token"');
    process.exit(1);
  }

  return {
    PROJECT_ID: SUPABASE_PROJECT_ID,
    TOKEN: SUPABASE_ACCESS_TOKEN,
  };
}

module.exports = getConfig;
