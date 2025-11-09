const https = require('https')
const fs = require('fs')
const path = require('path')

// Supabase Management API를 사용하여 SQL 실행
// 프로젝트 ref: bpvfkkrlyrjkwgwmfrci

const PROJECT_REF = 'bpvfkkrlyrjkwgwmfrci'

// SQL 파일 읽기
const migrationPath = path.join(__dirname, '../supabase/migrations/20251109010000_refactor_chat_rooms_for_any_users.sql')
const sqlContent = fs.readFileSync(migrationPath, 'utf8')

console.log('📄 Migration SQL to execute:')
console.log('=' .repeat(80))
console.log(sqlContent)
console.log('=' .repeat(80))
console.log('\n⚠️  This migration will:')
console.log('1. Create new chat_rooms table with user1_id/user2_id structure')
console.log('2. Copy existing data from old buyer_id/seller_id structure')
console.log('3. Drop old table and replace with new one')
console.log('4. Enable universal user-to-user chat\n')

console.log('💡 To execute this migration, please:')
console.log('1. Go to: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new')
console.log('2. Copy and paste the SQL above')
console.log('3. Click "Run" to execute\n')

console.log('Or run this SQL directly in your Supabase SQL Editor.')
