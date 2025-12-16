const fs = require('fs');
const path = require('path');

const migrationPath = path.join(
  __dirname,
  '../supabase/migrations/20251216_create_chat_favorites.sql'
);
const sql = fs.readFileSync(migrationPath, 'utf8');

const API_URL = 'https://api.supabase.com/v1/projects/bpvfkkrlyrjkwgwmfrci/database/query';
const ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';

async function applyMigration() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));

  if (!response.ok) {
    process.exit(1);
  }
}

applyMigration();
