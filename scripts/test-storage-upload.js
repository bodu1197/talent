const { createClient } = require('@supabase/supabase-js');

const PROJECT_URL = 'https://abroivxthindezdtdzmj.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUzODkyNywiZXhwIjoyMDgxMTE0OTI3fQ.6dk7o_z9Bp5MoG06obd4dk6fl_nRFiTJjLysfd-7Xo8';

const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

async function testUpload() {
  console.log('🧪 Testing File Upload to "profiles" bucket...');

  const fileName = `test-upload-${Date.now()}.txt`;
  const fileContent = 'Hello, Supabase Storage! This is a test file.';

  const { data, error } = await supabase.storage
    .from('profiles')
    .upload(fileName, fileContent, {
      contentType: 'text/plain',
      upsert: true
    });

  if (error) {
    console.error('❌ Upload Failed:', error);
  } else {
    console.log('✅ Upload Successful!', data);
    
    // Check Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);
    
    console.log('🔗 Public URL:', publicUrl);
    
    // Verify Access
    console.log('🔍 Verifying access...');
    const https = require('https');
    https.get(publicUrl, (res) => {
        console.log(`📡 GET Response Code: ${res.statusCode}`);
        if(res.statusCode === 200) console.log('✅ File is globally accessible!');
        else console.log('❌ File access failed.');
    });
  }
}

testUpload();
