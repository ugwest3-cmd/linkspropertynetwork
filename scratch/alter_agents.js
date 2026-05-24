const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: 'ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS photo TEXT;'
  });
  
  if (error) {
    console.error('Error (might not have rpc configured):', error.message);
    console.log('Will fall back to REST if needed, but standard supabase js cant alter tables directly without RPC. Need to use postgres driver or run in dashboard.');
  } else {
    console.log('Success:', data);
  }
}

main();
