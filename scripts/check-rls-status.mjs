import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data } = await supabase.rpc('exec_sql_return', {
  query: `
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'employers', 'workers', 'accountants')
  `
});

console.log('RLS Status:');
if (data && data.length > 0) {
  data.forEach(t => console.log(`  ${t.tablename}: ${t.rowsecurity ? 'ENABLED ✅' : 'DISABLED ❌'}`));
} else {
  console.log('  No data returned');
}
