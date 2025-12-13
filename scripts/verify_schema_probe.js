const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
    console.log('Connecting to:', supabaseUrl);
    console.log('Verifying table existence by probing...\n');

    // Check 1: Food Stores (Should NOT exist)
    console.log('1. Probing "food_stores"...');
    const { error: foodError } = await supabase.from('food_stores').select('*').limit(1);

    let foodGone = false;
    if (foodError) {
        console.log(`   Result: ${foodError.code} - ${foodError.message}`);
        if (foodError.code === '42P01' || foodError.message.includes('does not exist')) {
            console.log('   ✅ CONFIRMED: "food_stores" does not exist.');
            foodGone = true;
        } else {
            console.log('   ⚠️ UNEXPECTED ERROR: Might still exist or other issue.');
        }
    } else {
        console.log('   ❌ FAILED: "food_stores" still exists (query succeeded).');
    }

    // Check 2: Errands (Should EXIST)
    console.log('\n2. Probing "errands"...');
    const { error: errandError } = await supabase.from('errands').select('*').limit(1);

    let errandExists = false;
    if (!errandError) {
        console.log('   ✅ CONFIRMED: "errands" exists (query succeeded).');
        errandExists = true;
    } else {
        console.log(`   ❌ FAILED: "errands" query error: ${errandError.message}`);
    }

    console.log('\n--- VERIFICATION SUMMARY ---');
    if (foodGone && errandExists) {
        console.log('✅ SUCCESS: Database state is correct (Food deleted, Errand active).');
    } else {
        console.log('❌ FAILURE: Database state mismatch.');
    }
}

verifyTables();
