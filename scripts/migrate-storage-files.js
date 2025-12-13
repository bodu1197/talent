#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * Supabase Storage 파일 마이그레이션
 * 원본 프로젝트의 모든 파일을 새 프로젝트로 복사
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OLD_PROJECT_REF = 'bpvfkkrlyrjkwgwmfrci';
const _OLD_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3MTYsImV4cCI6MjA3Njk1NDcxNn0.luCRwnwQVctX3ewuSjhkQJ6veanWqa2NgivpDI7_Gl4';
const OLD_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const NEW_PROJECT_REF = 'abroivxthindezdtdzmj';
const _NEW_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5ODk3NjcsImV4cCI6MjA0OTU2NTc2N30.P-pJc-qGUYdw8z_jNmG-p8kE1TlhCpNzmYR4EBBZUBs';
const NEW_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk4OTc2NywiZXhwIjoyMDQ5NTY1NzY3fQ.sb_secret_yjCABwj3zJbfvFsJ4baU4A_4b3YUPvT';

const BUCKETS = [
  'profiles',
  'services',
  'portfolio',
  'uploads',
  'food-stores',
  'business-documents',
];

const TEMP_DIR = path.join(__dirname, 'temp_storage');

function makeRequest(method, hostname, path, headers, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method,
      headers,
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => chunks.push(chunk));

      res.on('end', () => {
        const buffer = Buffer.concat(chunks);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          // JSON 응답 시도
          try {
            const text = buffer.toString();
            if (text) {
              resolve(JSON.parse(text));
            } else {
              resolve({ success: true });
            }
          } catch (error) {
            console.error('에러 발생:', error);
            // Binary 데이터
            resolve(buffer);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${buffer.toString()}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      if (Buffer.isBuffer(body)) {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

async function listFiles(bucket, projectRef, apiKey, prefix = '', offset = 0, limit = 1000) {
  try {
    await makeRequest(
      'POST',
      `${projectRef}.supabase.co`,
      `/storage/v1/object/list/${bucket}`,
      {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      {
        prefix: prefix,
        limit: limit,
        offset: offset,
        sortBy: { column: 'name', order: 'asc' },
      }
    );
    return result;
  } catch (error) {
    console.error('에러 발생:', error);
    console.log(`   ⚠️  리스트 조회 실패 (${bucket}): ${error.message}`);
    return [];
  }
}

async function downloadFile(bucket, filePath, projectRef, apiKey) {
  try {
    const buffer = await makeRequest(
      'GET',
      `${projectRef}.supabase.co`,
      `/storage/v1/object/public/${bucket}/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`,
      {
        Authorization: `Bearer ${apiKey}`,
        apikey: apiKey,
      }
    );
    return buffer;
  } catch (error) {
    throw new Error(`다운로드 실패: ${error.message}`);
  }
}

async function uploadFile(bucket, filePath, fileBuffer, projectRef, apiKey) {
  try {
    await makeRequest(
      'POST',
      `${projectRef}.supabase.co`,
      `/storage/v1/object/${bucket}/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`,
      {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/octet-stream',
        apikey: apiKey,
      },
      fileBuffer
    );
    return true;
  } catch (error) {
    throw new Error(`업로드 실패: ${error.message}`);
  }
}

async function migrateBucket(bucketName) {
  console.log(`\n📦 ${bucketName} bucket 마이그레이션 시작...\n`);

  let allFiles = [];
  let offset = 0;
  const limit = 1000;

  // 모든 파일 리스트 가져오기 (페이징)
  console.log(`   📥 파일 리스트 가져오는 중...`);
  while (true) {
    const files = await listFiles(bucketName, OLD_PROJECT_REF, OLD_SERVICE_KEY, '', offset, limit);

    if (!files || files.length === 0) break;

    // 폴더 제외, 파일만 추가
    const actualFiles = files.filter((f) => f.id && f.name);
    allFiles = allFiles.concat(actualFiles);

    console.log(`      ${allFiles.length}개 파일 발견...`);

    if (files.length < limit) break;
    offset += limit;
  }

  if (allFiles.length === 0) {
    console.log(`   ⚪ 파일 없음\n`);
    return { success: 0, failed: 0, skipped: 0 };
  }

  console.log(`\n   총 ${allFiles.length}개 파일 발견\n`);

  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];
    const filePath = file.name;

    try {
      process.stdout.write(`\r   [${i + 1}/${allFiles.length}] ${filePath.substring(0, 50)}...`);

      // 다운로드
      const fileBuffer = await downloadFile(bucketName, filePath, OLD_PROJECT_REF, OLD_SERVICE_KEY);

      // 업로드
      await uploadFile(bucketName, filePath, fileBuffer, NEW_PROJECT_REF, NEW_SERVICE_KEY);

      successCount++;
    } catch (error) {
      if (error.message.includes('Duplicate')) {
        skippedCount++;
      } else {
        failedCount++;
        console.log(`\n   ❌ 실패: ${filePath} - ${error.message}`);
      }
    }
  }

  console.log(`\n\n   ✅ 성공: ${successCount}개`);
  console.log(`   ⏭️  건너뜀: ${skippedCount}개`);
  console.log(`   ❌ 실패: ${failedCount}개\n`);

  return { success: successCount, failed: failedCount, skipped: skippedCount };
}

async function main() {
  console.log('🚀 Storage 파일 마이그레이션 시작...\n');
  console.log('═'.repeat(60));
  console.log(`원본: ${OLD_PROJECT_REF}`);
  console.log(`대상: ${NEW_PROJECT_REF}`);
  console.log('═'.repeat(60));

  // 임시 디렉토리 생성
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  let totalSuccess = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const bucket of BUCKETS) {
    await migrateBucket(bucket);
    totalSuccess += result.success;
    totalFailed += result.failed;
    totalSkipped += result.skipped;

    // 각 버킷 사이 2초 대기
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 전체 요약:');
  console.log(`   ✅ 성공: ${totalSuccess}개`);
  console.log(`   ⏭️  건너뜀 (중복): ${totalSkipped}개`);
  console.log(`   ❌ 실패: ${totalFailed}개`);
  console.log('═'.repeat(60));

  if (totalFailed === 0) {
    console.log('\n✨ 모든 파일 마이그레이션 완료!\n');
  } else {
    console.log('\n⚠️  일부 파일 마이그레이션 실패\n');
  }

  // 임시 디렉토리 삭제
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch {
    // Intentionally empty - temp directory might not exist
  }
}

main().catch((err) => {
  console.error('\n❌ 오류 발생:', err);
  process.exit(1);
});
