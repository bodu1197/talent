const https = require('https');

const url = 'https://abroivxthindezdtdzmj.supabase.co/storage/v1/object/public/services/service-thumbnails/ccf26cba-d1d5-4aae-b5d9-0fe85449f086-1762151580171.webp';

console.log(`Checking availability of: ${url}`);

const req = https.request(url, { method: 'HEAD' }, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    if (res.statusCode === 200) {
        console.log('✅ Image exists!');
    } else if (res.statusCode === 404) {
        console.log('❌ Image not found (404). The file is missing in the new storage bucket.');
    } else {
        console.log(`⚠️  Unexpected status: ${res.statusCode}`);
    }
});

req.on('error', (e) => {
    console.error('Network error:', e.message);
});

req.end();
