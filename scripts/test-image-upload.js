const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3MTYsImV4cCI6MjA3Njk1NDcxNn0.luCRwnwQVctX3ewuSjhkQJ6veanWqa2NgivpDI7_Gl4'

async function testUpload() {
  console.log('Testing image upload to portfolio bucket...\n')

  // Create a test image buffer (1x1 PNG)
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  )

  const fileName = `test-${Date.now()}.png`
  const filePath = `test/${fileName}`

  // Test 1: Upload with SERVICE_ROLE_KEY (should work - bypasses RLS)
  console.log('Test 1: Upload with SERVICE_ROLE_KEY')
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  const { data: data1, error: error1 } = await supabaseAdmin.storage
    .from('portfolio')
    .upload(filePath, testImageBuffer, {
      contentType: 'image/png',
      upsert: true
    })

  if (error1) {
    console.log('❌ SERVICE_ROLE upload failed:', error1.message)
  } else {
    console.log('✅ SERVICE_ROLE upload success:', data1.path)

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('portfolio')
      .getPublicUrl(filePath)

    console.log('   Public URL:', urlData.publicUrl)

    // Clean up
    await supabaseAdmin.storage.from('portfolio').remove([filePath])
    console.log('   ✅ Test file removed\n')
  }

  // Test 2: Upload with ANON_KEY (requires RLS policy)
  console.log('Test 2: Upload with ANON_KEY (simulates authenticated user)')
  const supabaseAnon = createClient(supabaseUrl, anonKey)

  const fileName2 = `test-anon-${Date.now()}.png`
  const filePath2 = `test/${fileName2}`

  const { data: data2, error: error2 } = await supabaseAnon.storage
    .from('portfolio')
    .upload(filePath2, testImageBuffer, {
      contentType: 'image/png',
      upsert: true
    })

  if (error2) {
    console.log('❌ ANON_KEY upload failed:', error2.message)
    console.log('   This means RLS policies are NOT properly configured!')
    console.log('   Storage policies need to be applied.\n')
  } else {
    console.log('✅ ANON_KEY upload success:', data2.path)
    console.log('   RLS policies are working correctly!\n')

    // Clean up
    await supabaseAdmin.storage.from('portfolio').remove([filePath2])
    console.log('   ✅ Test file removed\n')
  }

  console.log('='.repeat(80))
  console.log('CONCLUSION:')
  if (!error1 && !error2) {
    console.log('✅ Both uploads succeeded - Storage is properly configured!')
  } else if (!error1 && error2) {
    console.log('⚠️  SERVICE_ROLE works but ANON_KEY fails')
    console.log('   Storage policies are missing or incorrect.')
    console.log('   Need to apply storage policies.')
  } else {
    console.log('❌ Both uploads failed - Check bucket configuration')
  }
  console.log('='.repeat(80))
}

testUpload()
