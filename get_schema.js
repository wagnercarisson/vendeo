const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Missing env variables');
    process.exit(1);
}
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { data, error } = await supabase.rpc('get_table_columns_by_name', { table_name: 'campaigns' });
    if (error) {
        // Fallback: just fetch one row and print keys
        const { data: row } = await supabase.from('campaigns').select('*').limit(1);
        if (row && row.length > 0) {
            console.log("Columns:", Object.keys(row[0]));
        } else {
            console.log("No rows to infer columns, or error:", error);
        }
    } else {
         console.log(data);
    }
}
run();
