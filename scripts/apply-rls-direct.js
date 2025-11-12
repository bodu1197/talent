const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyPolicy(description, sql) {
  console.log(`\n${description}...`)
  try {
    const { data, error } = await supabase.rpc('query', { query: sql })
    if (error) {
      if (error.message.includes('already exists') || error.message.includes('already enabled')) {
        console.log('   ⚠️  Already exists, skipping')
        return true
      }
      console.error(`   ❌ Error: ${error.message}`)
      return false
    }
    console.log('   ✅ Success')
    return true
  } catch (err) {
    console.error(`   ❌ Exception: ${err.message}`)
    return false
  }
}

async function applyAllPolicies() {
  console.log('🚀 Applying RLS policies to core tables...\n')

  let success = 0
  let failed = 0

  // 1. USERS TABLE
  console.log('\n═══════════════════════════════════════')
  console.log('1️⃣  USERS TABLE')
  console.log('═══════════════════════════════════════')

  if (await applyPolicy('Enable RLS on users', 'ALTER TABLE users ENABLE ROW LEVEL SECURITY')) success++; else failed++;

  if (await applyPolicy('Users can view own profile', `
    CREATE POLICY "Users can view own profile"
      ON users FOR SELECT
      TO authenticated
      USING (id = auth.uid())
  `)) success++; else failed++;

  if (await applyPolicy('Users can update own profile', `
    CREATE POLICY "Users can update own profile"
      ON users FOR UPDATE
      TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid())
  `)) success++; else failed++;

  if (await applyPolicy('Users can insert own profile', `
    CREATE POLICY "Users can insert own profile"
      ON users FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid())
  `)) success++; else failed++;

  // 2. SELLERS TABLE
  console.log('\n═══════════════════════════════════════')
  console.log('2️⃣  SELLERS TABLE')
  console.log('═══════════════════════════════════════')

  if (await applyPolicy('Enable RLS on sellers', 'ALTER TABLE sellers ENABLE ROW LEVEL SECURITY')) success++; else failed++;

  if (await applyPolicy('Sellers can view own profile', `
    CREATE POLICY "Sellers can view own profile"
      ON sellers FOR SELECT
      TO authenticated
      USING (user_id = auth.uid())
  `)) success++; else failed++;

  if (await applyPolicy('Sellers can update own profile', `
    CREATE POLICY "Sellers can update own profile"
      ON sellers FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid())
  `)) success++; else failed++;

  if (await applyPolicy('Sellers can create own profile', `
    CREATE POLICY "Sellers can create own profile"
      ON sellers FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid())
  `)) success++; else failed++;

  // 3. SELLER_PROFILES TABLE
  console.log('\n═══════════════════════════════════════')
  console.log('3️⃣  SELLER_PROFILES TABLE')
  console.log('═══════════════════════════════════════')

  if (await applyPolicy('Enable RLS on seller_profiles', 'ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY')) success++; else failed++;

  if (await applyPolicy('Anyone can view public seller profiles', `
    CREATE POLICY "Anyone can view public seller profiles"
      ON seller_profiles FOR SELECT
      TO authenticated, anon
      USING (is_verified = true)
  `)) success++; else failed++;

  if (await applyPolicy('Sellers can view own profile (seller_profiles)', `
    CREATE POLICY "Sellers can view own profile"
      ON seller_profiles FOR SELECT
      TO authenticated
      USING (user_id = auth.uid())
  `)) success++; else failed++;

  if (await applyPolicy('Sellers can update own profile (seller_profiles)', `
    CREATE POLICY "Sellers can update own profile"
      ON seller_profiles FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid())
  `)) success++; else failed++;

  if (await applyPolicy('Sellers can insert own profile (seller_profiles)', `
    CREATE POLICY "Sellers can insert own profile"
      ON seller_profiles FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid())
  `)) success++; else failed++;

  // 4. ORDERS TABLE
  console.log('\n═══════════════════════════════════════')
  console.log('4️⃣  ORDERS TABLE')
  console.log('═══════════════════════════════════════')

  if (await applyPolicy('Enable RLS on orders', 'ALTER TABLE orders ENABLE ROW LEVEL SECURITY')) success++; else failed++;

  if (await applyPolicy('Users can view own orders', `
    CREATE POLICY "Users can view own orders"
      ON orders FOR SELECT
      TO authenticated
      USING (buyer_id = auth.uid() OR seller_id = auth.uid())
  `)) success++; else failed++;

  if (await applyPolicy('Buyers can create orders', `
    CREATE POLICY "Buyers can create orders"
      ON orders FOR INSERT
      TO authenticated
      WITH CHECK (buyer_id = auth.uid())
  `)) success++; else failed++;

  if (await applyPolicy('Users can update own orders', `
    CREATE POLICY "Users can update own orders"
      ON orders FOR UPDATE
      TO authenticated
      USING (buyer_id = auth.uid() OR seller_id = auth.uid())
      WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid())
  `)) success++; else failed++;

  // 5. SERVICES TABLE
  console.log('\n═══════════════════════════════════════')
  console.log('5️⃣  SERVICES TABLE')
  console.log('═══════════════════════════════════════')

  if (await applyPolicy('Enable RLS on services', 'ALTER TABLE services ENABLE ROW LEVEL SECURITY')) success++; else failed++;

  if (await applyPolicy('Anyone can view active services', `
    CREATE POLICY "Anyone can view active services"
      ON services FOR SELECT
      TO authenticated, anon
      USING (status = 'active' AND deleted_at IS NULL)
  `)) success++; else failed++;

  if (await applyPolicy('Sellers can view own services', `
    CREATE POLICY "Sellers can view own services"
      ON services FOR SELECT
      TO authenticated
      USING (seller_id = auth.uid())
  `)) success++; else failed++;

  if (await applyPolicy('Sellers can insert own services', `
    CREATE POLICY "Sellers can insert own services"
      ON services FOR INSERT
      TO authenticated
      WITH CHECK (seller_id = auth.uid())
  `)) success++; else failed++;

  if (await applyPolicy('Sellers can update own services', `
    CREATE POLICY "Sellers can update own services"
      ON services FOR UPDATE
      TO authenticated
      USING (seller_id = auth.uid())
      WITH CHECK (seller_id = auth.uid())
  `)) success++; else failed++;

  if (await applyPolicy('Sellers can delete own services', `
    CREATE POLICY "Sellers can delete own services"
      ON services FOR DELETE
      TO authenticated
      USING (seller_id = auth.uid())
  `)) success++; else failed++;

  // 6. SERVICE_PACKAGES TABLE
  console.log('\n═══════════════════════════════════════')
  console.log('6️⃣  SERVICE_PACKAGES TABLE')
  console.log('═══════════════════════════════════════')

  if (await applyPolicy('Enable RLS on service_packages', 'ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY')) success++; else failed++;

  if (await applyPolicy('Anyone can view service packages', `
    CREATE POLICY "Anyone can view service packages"
      ON service_packages FOR SELECT
      TO authenticated, anon
      USING (
        EXISTS (
          SELECT 1 FROM services
          WHERE services.id = service_packages.service_id
          AND services.status = 'active'
          AND services.deleted_at IS NULL
        )
      )
  `)) success++; else failed++;

  if (await applyPolicy('Sellers can view own service packages', `
    CREATE POLICY "Sellers can view own service packages"
      ON service_packages FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM services
          WHERE services.id = service_packages.service_id
          AND services.seller_id = auth.uid()
        )
      )
  `)) success++; else failed++;

  if (await applyPolicy('Sellers can manage own service packages', `
    CREATE POLICY "Sellers can manage own service packages"
      ON service_packages FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM services
          WHERE services.id = service_packages.service_id
          AND services.seller_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM services
          WHERE services.id = service_packages.service_id
          AND services.seller_id = auth.uid()
        )
      )
  `)) success++; else failed++;

  // 7. REVIEWS TABLE
  console.log('\n═══════════════════════════════════════')
  console.log('7️⃣  REVIEWS TABLE')
  console.log('═══════════════════════════════════════')

  if (await applyPolicy('Enable RLS on reviews', 'ALTER TABLE reviews ENABLE ROW LEVEL SECURITY')) success++; else failed++;

  if (await applyPolicy('Anyone can view public reviews', `
    CREATE POLICY "Anyone can view public reviews"
      ON reviews FOR SELECT
      TO authenticated, anon
      USING (is_visible = true AND moderated = false)
  `)) success++; else failed++;

  if (await applyPolicy('Users can view own reviews', `
    CREATE POLICY "Users can view own reviews"
      ON reviews FOR SELECT
      TO authenticated
      USING (buyer_id = auth.uid() OR seller_id = auth.uid())
  `)) success++; else failed++;

  if (await applyPolicy('Buyers can create reviews', `
    CREATE POLICY "Buyers can create reviews"
      ON reviews FOR INSERT
      TO authenticated
      WITH CHECK (
        buyer_id = auth.uid() AND
        EXISTS (
          SELECT 1 FROM orders
          WHERE orders.id = reviews.order_id
          AND orders.buyer_id = auth.uid()
          AND orders.status = 'completed'
        )
      )
  `)) success++; else failed++;

  if (await applyPolicy('Buyers can update own reviews', `
    CREATE POLICY "Buyers can update own reviews"
      ON reviews FOR UPDATE
      TO authenticated
      USING (buyer_id = auth.uid())
      WITH CHECK (buyer_id = auth.uid())
  `)) success++; else failed++;

  // 8. SELLER_EARNINGS TABLE
  console.log('\n═══════════════════════════════════════')
  console.log('8️⃣  SELLER_EARNINGS TABLE')
  console.log('═══════════════════════════════════════')

  if (await applyPolicy('Enable RLS on seller_earnings', 'ALTER TABLE seller_earnings ENABLE ROW LEVEL SECURITY')) success++; else failed++;

  if (await applyPolicy('Sellers can view own earnings', `
    CREATE POLICY "Sellers can view own earnings"
      ON seller_earnings FOR SELECT
      TO authenticated
      USING (seller_id = auth.uid())
  `)) success++; else failed++;

  // 9. PAYMENTS TABLE
  console.log('\n═══════════════════════════════════════')
  console.log('9️⃣  PAYMENTS TABLE')
  console.log('═══════════════════════════════════════')

  if (await applyPolicy('Enable RLS on payments', 'ALTER TABLE payments ENABLE ROW LEVEL SECURITY')) success++; else failed++;

  if (await applyPolicy('Users can view own payments', `
    CREATE POLICY "Users can view own payments"
      ON payments FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM orders
          WHERE orders.id = payments.order_id
          AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
        )
      )
  `)) success++; else failed++;

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('📊 FINAL SUMMARY')
  console.log('═'.repeat(60))
  console.log(`✅ Successful: ${success}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📋 Total: ${success + failed}`)
  console.log('═'.repeat(60))

  if (failed === 0) {
    console.log('\n🎉 All RLS policies applied successfully!')
    console.log('✅ Your database is now secured with row-level security\n')
  } else {
    console.log(`\n⚠️  ${failed} policies failed to apply`)
    console.log('Please review the errors above\n')
  }
}

applyAllPolicies().catch(console.error)
