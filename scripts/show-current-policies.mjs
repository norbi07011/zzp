import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 SPRAWDZAM OBECNE RLS POLICIES\n');

const { data: policies, error } = await supabase.rpc('exec_sql_return', {
  query: `
    SELECT 
      tablename, 
      policyname, 
      cmd,
      qual,
      with_check
    FROM pg_policies 
    WHERE tablename IN ('profiles', 'employers', 'workers', 'accountants')
    ORDER BY tablename, policyname
  `
});

if (error) {
  console.log('ERROR:', error.message);
} else if (policies && policies.length > 0) {
  console.log('ZNALEZIONE POLICIES:\n');
  for (const p of policies) {
    console.log(`📋 ${p.tablename}.${p.policyname} (${p.cmd})`);
    if (p.qual) {
      console.log(`   USING: ${p.qual}`);
    }
    if (p.with_check) {
      console.log(`   CHECK: ${p.with_check}`);
    }
    console.log('');
  }
} else {
  console.log('BRAK POLICIES!');
}
