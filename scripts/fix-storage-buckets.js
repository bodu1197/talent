const { createClient } = require('@supabase/supabase-js');

const PROJECT_URL = 'https://abroivxthindezdtdzmj.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUzODkyNywiZXhwIjoyMDgxMTE0OTI3fQ.6dk7o_z9Bp5MoG06obd4dk6fl_nRFiTJjLysfd-7Xo8';

const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function makeBucketsPublic() {
  console.log('🔄 Checking Storage Buckets...');

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Failed to list buckets:', error.message);
      return;
    }

    console.log(`📊 Found ${buckets.length} buckets.`);

    const targetBuckets = ['profiles', 'services', 'portfolios', 'chat-attachments', 'reviews', 'business-registration'];

    for (const bucketName of targetBuckets) {
      const bucket = buckets.find(b => b.name === bucketName);
      
      if (!bucket) {
        console.log(`⚠️  Bucket '${bucketName}' not found. Creating it...`);
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
        });
        if (createError) console.error(`   ❌ Failed to create '${bucketName}':`, createError.message);
        else console.log(`   ✅ Created public bucket '${bucketName}'`);
        continue;
      }

      console.log(`🔍 Checking '${bucketName}' (Current Public Status: ${bucket.public})`);

      console.log(`   🛠  Updating '${bucketName}' to allow ALL file types...`);
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true,
        allowedMimeTypes: null, // Allow ALL types
        fileSizeLimit: 10485760, // Increase limit to 10MB just in case
      });

      if (updateError) {
        console.error(`   ❌ Failed to update '${bucketName}':`, updateError.message);
      } else {
        console.log(`   ✅ Successfully updated '${bucketName}' (Public: true, Types: All).`);
      }
    }
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

makeBucketsPublic();
