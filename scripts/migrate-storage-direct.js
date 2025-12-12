#!/usr/bin/env node

/**
 * Storage 파일 마이그레이션 (Direct API)
 * Service Role Key로 /storage/v1/object/{bucket}/{path} 직접 호출
 */

const https = require('https');

const OLD_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';
const OLD_ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';
const OLD_PROJECT_REF = 'bpvfkkrlyrjkwgwmfrci';
const OLD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const NEW_PROJECT_REF = 'abroivxthindezdtdzmj';
const NEW_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk4OTc2NywiZXhwIjoyMDQ5NTY1NzY3fQ.sb_secret_yjCABwj3zJbfvFsJ4baU4A_4b3YUPvT';

function executeQuery(projectId, token, query) {
  return new Promise((resolve, reject) => {
    const _data = JSON.stringify({ query });

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

function downloadFile(projectRef, apiKey, bucket, filePath) {
  return new Promise((resolve, reject) => {
    const encodedPath = filePath.split('/').map(p => encodeURIComponent(p)).join('/');

    const options = {
      hostname: `${projectRef}.supabase.co`,
      path: `/storage/v1/object/${bucket}/${encodedPath}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'apikey': apiKey
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return reject(new Error('Redirect not expected'));
      }

      if (res.statusCode !== 200) {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${body.substring(0, 100)}`)));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });

    req.on('error', reject);
    req.end();
  });
}

function uploadFile(projectRef, apiKey, bucket, filePath, buffer) {
  return new Promise((resolve, reject) => {
    const encodedPath = filePath.split('/').map(p => encodeURIComponent(p)).join('/');

    const options = {
      hostname: `${projectRef}.supabase.co`,
      path: `/storage/v1/object/${bucket}/${encodedPath}`,
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
          reject(new Error(`HTTP ${res.statusCode}: ${body.substring(0, 100)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

async function migrateBucket(bucketName) {
  console.log(`\n📦 ${bucketName}\n`);

  const files = await executeQuery(
    OLD_PROJECT_ID,
    OLD_ACCESS_TOKEN,
    `SELECT name FROM storage.objects WHERE bucket_id = '${bucketName}' ORDER BY created_at`
  );

  if (!files || files.length === 0) {
    console.log(`   ⚪ 파일 없음\n`);
    return { success: 0, failed: 0, skipped: 0 };
  }

  console.log(`   ${files.length}개 파일\n`);

  let success = 0, failed = 0, skipped = 0;

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i].name;
    const short = fileName.length > 35 ? '...' + fileName.slice(-32) : fileName;

    try {
      process.stdout.write(`\r   [${i + 1}/${files.length}] ${short.padEnd(40)}`);

      const buffer = await downloadFile(OLD_PROJECT_REF, OLD_SERVICE_KEY, bucketName, fileName);
      await uploadFile(NEW_PROJECT_REF, NEW_SERVICE_KEY, bucketName, fileName, buffer);

      success++;

    } catch (error) {
      const msg = error.message;
      if (msg.includes('duplicate') || msg.includes('Duplicate') || msg.includes('already exists')) {
        skipped++;
      } else if (msg.includes('404')) {
        skipped++;  // 파일이 실제로 없음
      } else {
        failed++;
        console.log(`\n   ❌ ${fileName.substring(0, 40)}: ${msg.substring(0, 60)}`);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 150));
  }

  console.log(`\n\n   ✅ ${success} | ⏭️ ${skipped} | ❌ ${failed}\n`);

  return { success, failed, skipped };
}

async function main() {
  console.log('🚀 Storage 마이그레이션 (Direct API)\n');
  console.log('═'.repeat(60));

  const counts = await executeQuery(
    OLD_PROJECT_ID,
    OLD_ACCESS_TOKEN,
    'SELECT bucket_id, COUNT(*) as count FROM storage.objects GROUP BY bucket_id ORDER BY bucket_id'
  );

  console.log('원본:');
  let total = 0;
  counts.forEach(c => {
    console.log(`   ${c.bucket_id}: ${c.count}`);
    total += parseInt(c.count);
  });
  console.log(`   총 ${total}개`);
  console.log('═'.repeat(60));

  let totalSuccess = 0, totalFailed = 0, totalSkipped = 0;

  for (const { bucket_id } of counts) {
    const _result = await migrateBucket(bucket_id);
    totalSuccess += result.success;
    totalFailed += result.failed;
    totalSkipped += result.skipped;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('═'.repeat(60));
  console.log(`✅ 성공: ${totalSuccess}`);
  console.log(`⏭️  중복/없음: ${totalSkipped}`);
  console.log(`❌ 실패: ${totalFailed}`);
  console.log('═'.repeat(60));

  if (totalFailed === 0 && totalSuccess > 0) {
    console.log('\n✨ 완료!\n');
  } else if (totalSuccess === 0) {
    console.log('\n⚠️  모든 파일 실패. 원본 Storage에 파일이 없을 수 있습니다.\n');
  } else {
    console.log('\n⚠️  일부 실패\n');
  }
}

main().catch(err => {
  console.error('\n❌ 오류:', err);
  process.exit(1);
});
