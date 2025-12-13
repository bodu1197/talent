const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    console.log('Connecting to Supabase at:', supabaseUrl);

    // Query information_schema for public tables
    const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE')
        .order('table_name');

    if (error) {
        // Fallback: Try RPC if direct access to information_schema is restricted
        console.log('Direct query failed, trying RPC...');
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_tables');

        if (rpcError) {
            console.error('Error fetching tables:', error.message);
            console.error('RPC Error:', rpcError.message);
            return;
        }
        printTables(rpcData);
    } else {
        printTables(data);
    }
}

function printTables(tables) {
    if (!tables || tables.length === 0) {
        console.log('No tables found.');
        return;
    }

    console.log('\n--- Current Database Tables ---');
    const tableNames = tables.map(t => t.table_name || t.tablename); // Handle RPC/Table diffs

    let hasFood = false;
    tableNames.forEach(name => {
        console.log(`- ${name}`);
        if (name.includes('food') || name.includes('restaurant') || name.includes('menu')) {
            hasFood = true;
        }
    });
    console.log('-------------------------------');

    if (hasFood) {
        console.log('\n⚠️ WARNING: "food" related tables still exist!');
    } else {
        console.log('\n✅ SUCCESS: No "food" related tables found.');
    }
}

listTables();
