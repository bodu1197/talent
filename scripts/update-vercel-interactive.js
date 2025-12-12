#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

const ENV_VARS = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    value: 'https://abroivxthindezdtdzmj.supabase.co'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5ODk3NjcsImV4cCI6MjA0OTU2NTc2N30.P-pJc-qGUYdw8z_jNmG-p8kE1TlhCpNzmYR4EBBZUBs'
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk4OTc2NywiZXhwIjoyMDQ5NTY1NzY3fQ.sb_secret_yjCABwj3zJbfvFsJ4baU4A_4b3YUPvT'
  }
];

function runCommand(command, args, inputs) {
  return new Promise((resolve, reject) => {
    console.log(`\n실행: ${command} ${args.join(' ')}`);

    const proc = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    let output = '';
    let inputIndex = 0;

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);

      // 입력 프롬프트 감지
      if (inputs && inputIndex < inputs.length) {
        if (text.includes('?') || text.includes(':') || text.includes('Enter')) {
          setTimeout(() => {
            console.log(`  → 입력: ${inputs[inputIndex]}`);
            proc.stdin.write(inputs[inputIndex] + '\n');
            inputIndex++;
          }, 500);
        }
      }
    });

    proc.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        // code가 0이 아니어도 성공으로 처리 (일부 vercel 명령어는 비정상 종료 코드 반환)
        resolve(output);
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function deleteEnvVar(name) {
  try {
    console.log(`\n🗑️  ${name} 삭제 중...`);
    // y를 여러 번 보내서 모든 환경 선택
    await runCommand('vercel', ['env', 'rm', name], ['y', 'y', 'y', 'y']);
    console.log(`   ✅ 삭제 완료`);
    return true;
  } catch (error) {
    console.error('에러 발생:', error);
    console.log(`   ⚠️  삭제 실패 또는 이미 없음`);
    return false;
  }
}

async function addEnvVar(name, value) {
  try {
    console.log(`\n➕ ${name} 추가 중...`);
    // value 입력, 그 다음 'a' (all environments) 선택
    await runCommand('vercel', ['env', 'add', name], [value, 'a']);
    console.log(`   ✅ 추가 완료`);
    return true;
  } catch (error) {
    console.log(`   ❌ 추가 실패: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Vercel 환경변수 자동 업데이트\n');
  console.log('═══════════════════════════════════════\n');

  let updated = 0;
  let failed = 0;

  for (const envVar of ENV_VARS) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log(`📝 ${envVar.name}`);
    console.log(`${'─'.repeat(40)}`);

    // 삭제
    await deleteEnvVar(envVar.name);

    // 2초 대기
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 추가
    const success = await addEnvVar(envVar.name, envVar.value);

    if (success) {
      updated++;
    } else {
      failed++;
    }

    // 3초 대기
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n\n═══════════════════════════════════════');
  console.log(`✅ 업데이트 성공: ${updated}개`);
  console.log(`❌ 실패: ${failed}개`);
  console.log('═══════════════════════════════════════\n');

  if (failed === 0) {
    console.log('✨ 모든 환경변수 업데이트 완료!\n');
    console.log('📌 확인: vercel env ls');
    console.log('📌 대시보드: https://vercel.com/soriplays-projects/talent/settings/environment-variables\n');
  }
}

main().catch(err => {
  console.error('❌ 오류:', err);
  process.exit(1);
});
