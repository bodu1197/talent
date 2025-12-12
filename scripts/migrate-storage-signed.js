#!/usr/bin/env node

/**
 * Storage 파일 마이그레이션 (Signed URL 방식)
 * Service Role Key로 Signed URL 생성 후 다운로드
 */

const https = require('https');

const OLD_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';
const OLD_ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';
const OLD_PROJECT_REF = 'bpvfkkrlyrjkwgwmfrci';
const OLD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const NEW_PROJECT_REF = 'abroivxthindezdtdzmj';
const NEW_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk4OTc2NywiZXhwIjoyMDQ5NTY1NzY3fQ.sb_secret_yjCABwj3zJbfvFsJ4baU4A_4b3YUPvT';

function executeQuery(projectId, token, _query) {
  return new Promise((resolve, reject) => {

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
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

function createSignedUrl(projectRef, apiKey, bucket, filePath) {
  return new Promise((resolve, reject) => {

    const options = {
      hostname: `${projectRef}.supabase.co`,
      path: `/storage/v1/object/sign/${bucket}/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'apikey': apiKey
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = JSON.parse(body);
            resolve(result.signedURL);
          } catch (error) {
            console.error('에러 발생:', error);
            reject(new Error('Failed to parse signed URL response'));
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

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function uploadFile(projectRef, apiKey, bucket, filePath, buffer) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${projectRef}.supabase.co`,
      path: `/storage/v1/object/${bucket}/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': buffer.length,
        'apikey': apiKey
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(true);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

async function migrateBucket(bucketName) {
  console.log(`\n📦 ${bucketName} 마이그레이션...\n`);

  const files = await executeQuery(
    OLD_PROJECT_ID,
    OLD_ACCESS_TOKEN,
    `SELECT id, name, bucket_id
     FROM storage.objects
     WHERE bucket_id = '${bucketName}'
     ORDER BY created_at`
  );

  if (!files || files.length === 0) {
    console.log(`   ⚪ 파일 없음\n`);
    return { success: 0, failed: 0, skipped: 0 };
  }

  console.log(`   ${files.length}개 파일 발견\n`);

  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = file.name;

    try {
      const displayName = fileName.length > 35 ? '...' + fileName.substring(fileName.length - 32) : fileName;
      process.stdout.write(`\r   [${i + 1}/${files.length}] ${displayName.padEnd(40)}`);

      // 1. Signed URL 생성
      const signedUrl = await createSignedUrl(OLD_PROJECT_REF, OLD_SERVICE_KEY, bucketName, fileName);
      const fullUrl = `https://${OLD_PROJECT_REF}.supabase.co${signedUrl}`;

      // 2. 다운로드
      const fileBuffer = await downloadFile(fullUrl);

      // 3. 업로드
      await uploadFile(NEW_PROJECT_REF, NEW_SERVICE_KEY, bucketName, fileName, fileBuffer);

      successCount++;

    } catch (error) {
      if (error.message.includes('duplicate') || error.message.includes('already exists') || error.message.includes('Duplicate')) {
        skippedCount++;
      } else {
        failedCount++;
        const shortName = fileName.substring(0, 50);
        console.log(`\n   ❌ ${shortName}: ${error.message}`);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n\n   ✅ 성공: ${successCount}`);
  console.log(`   ⏭️  중복: ${skippedCount}`);
  console.log(`   ❌ 실패: ${failedCount}\n`);

  return { success: successCount, failed: failedCount, skipped: skippedCount };
}

async function main() {
  console.log('🚀 Storage 파일 마이그레이션 (Signed URL)\n');
  console.log('═'.repeat(60));

  const counts = await executeQuery(
    OLD_PROJECT_ID,
    OLD_ACCESS_TOKEN,
    'SELECT bucket_id, COUNT(*) as count FROM storage.objects GROUP BY bucket_id ORDER BY bucket_id'
  );

  console.log('원본 Storage:');
  let total = 0;
  counts.forEach(c => {
    console.log(`   ${c.bucket_id}: ${c.count}개`);
    total += parseInt(c.count);
  });
  console.log(`   총 ${total}개`);
  console.log('═'.repeat(60));

  let totalSuccess = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  const buckets = counts.map(c => c.bucket_id);

  for (const bucket of buckets) {
    await migrateBucket(bucket);
    totalSuccess += result.success;
    totalFailed += result.failed;
    totalSkipped += result.skipped;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('═'.repeat(60));
  console.log('📊 최종 결과:');
  console.log(`   ✅ 성공: ${totalSuccess}개`);
  console.log(`   ⏭️  중복: ${totalSkipped}개`);
  console.log(`   ❌ 실패: ${totalFailed}개`);
  console.log('═'.repeat(60));

  if (totalFailed === 0) {
    console.log('\n✨ 전체 파일 마이그레이션 완료!\n');
  } else {
    console.log('\n⚠️  일부 실패. 재실행 권장.\n');
  }
}

main().catch(err => {
  console.error('\n❌ 오류:', err);
  process.exit(1);
});
