const fs = require('fs');
const https = require('https');

// Read migration file
const sqlContent = fs.readFileSync(
  'C:\\Users\\ohyus\\talent\\supabase\\migrations\\20251213150000_add_all_missing_fk_indexes.sql',
  'utf8'
);

// Prepare request
const data = JSON.stringify({
  query: sqlContent,
});

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: '/v1/projects/bpvfkkrlyrjkwgwmfrci/database/query',
  method: 'POST',
  headers: {
    Authorization: 'Bearer sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f',
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

console.log('Executing migration file...');

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', responseData);

    if (res.statusCode === 200) {
      console.log('\n✅ Migration executed successfully!');
    } else {
      console.error('\n❌ Migration failed!');
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

req.write(data);
req.end();
