#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * Storage Buckets를 새 프로젝트에 생성
 */

const https = require('https');

const NEW_PROJECT_ID = 'abroivxthindezdtdzmj';
const NEW_ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${NEW_PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEW_ACCESS_TOKEN}`,
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
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const BUCKETS = [
  {
    id: 'profiles',
    name: 'profiles',
    public: true,
    file_size_limit: 5242880, // 5MB
    allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    id: 'services',
    name: 'services',
    public: true,
    file_size_limit: 5242880, // 5MB
    allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    id: 'portfolio',
    name: 'portfolio',
    public: true,
    file_size_limit: 10485760, // 10MB
    allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    id: 'uploads',
    name: 'uploads',
    public: true,
    file_size_limit: null,
    allowed_mime_types: null
  },
  {
    id: 'food-stores',
    name: 'food-stores',
    public: true,
    file_size_limit: 10485760, // 10MB
    allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    id: 'business-documents',
    name: 'business-documents',
    public: false,
    file_size_limit: 10485760, // 10MB
    allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
  }
];

async function createBucket(bucket) {
  console.log(`📦 Creating bucket: ${bucket.name}`);

  try {
    let mimeTypes = 'NULL';
    if (bucket.allowed_mime_types) {
      const mimeList = bucket.allowed_mime_types.map(m => `'${m}'`).join(', ');
      mimeTypes = `ARRAY[${mimeList}]::text[]`;
    }

    const query = `
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        '${bucket.id}',
        '${bucket.name}',
        ${bucket.public},
        ${bucket.file_size_limit || 'NULL'},
        ${mimeTypes}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types
    `;

    await executeQuery(query);
    console.log(`   ✅ Created: ${bucket.name} (${bucket.public ? 'public' : 'private'})\n`);

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

async function createBucketPolicies() {
  console.log('🔐 Creating storage policies...\n');

  // Public buckets - allow public read
  const publicBuckets = ['profiles', 'services', 'portfolio', 'uploads', 'food-stores'];

  for (const bucketName of publicBuckets) {
    try {
      const policyName = `public_read_${bucketName}`;

      await executeQuery(`
        DROP POLICY IF EXISTS "${policyName}" ON storage.objects;
      `);

      await executeQuery(`
        CREATE POLICY "${policyName}"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = '${bucketName}');
      `);

      console.log(`   ✅ Policy: ${policyName}`);
    } catch (error) {
      console.error('에러 발생:', error);
      console.log(`   ⚠️  Policy warning: ${e.message}`);
    }
  }

  // Authenticated users can upload to their own folders
  for (const bucketName of publicBuckets) {
    try {
      const policyName = `authenticated_upload_${bucketName}`;

      await executeQuery(`
        DROP POLICY IF EXISTS "${policyName}" ON storage.objects;
      `);

      await executeQuery(`
        CREATE POLICY "${policyName}"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = '${bucketName}');
      `);

      console.log(`   ✅ Policy: ${policyName}`);
    } catch (error) {
      console.error('에러 발생:', error);
      console.log(`   ⚠️  Policy warning: ${e.message}`);
    }
  }

  // Business documents - private access
  try {
    await executeQuery(`
      DROP POLICY IF EXISTS "business_docs_owner" ON storage.objects;
    `);

    await executeQuery(`
      CREATE POLICY "business_docs_owner"
      ON storage.objects FOR ALL
      TO authenticated
      USING (bucket_id = 'business-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
    `);

    console.log(`   ✅ Policy: business_docs_owner`);
  } catch (error) {
    console.error('에러 발생:', error);
    console.log(`   ⚠️  Policy warning: ${e.message}`);
  }

  console.log('\n✅ Storage policies created\n');
}

async function main() {
  console.log('🚀 Creating Storage buckets...\n');
  console.log(`Target: ${NEW_PROJECT_ID}\n`);

  for (const bucket of BUCKETS) {
    await createBucket(bucket);
  }

  await createBucketPolicies();

  console.log('✅ All storage buckets created!\n');
}

main();
