import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔒 SPRAWDZANIE RLS POLICIES\n');
console.log('=' .repeat(80) + '\n');

const tables = ['profiles', 'employers', 'workers', 'accountants'];

for (const table of tables) {
  console.log(`\n📋 ${table.toUpperCase()}\n`);
  
  // Sprawdź czy RLS jest enabled
  const { data: rlsStatus } = await supabase.rpc('exec_sql_return', {
    query: `
      SELECT relname, relrowsecurity
      FROM pg_class
      WHERE relname = '${table}'
    `
  });
  
  if (rlsStatus && rlsStatus[0]) {
    const enabled = rlsStatus[0].relrowsecurity;
    console.log(`  RLS: ${enabled ? '✅ ENABLED' : '❌ DISABLED'}\n`);
  }
  
  // Sprawdź policies
  const { data: policies } = await supabase.rpc('exec_sql_return', {
    query: `
      SELECT 
        policyname,
        cmd,
        roles,
        qual,
        with_check
      FROM pg_policies
      WHERE tablename = '${table}'
      ORDER BY policyname
    `
  });
  
  if (policies && policies.length > 0) {
    console.log('  Policies:');
    for (const policy of policies) {
      console.log(`    • ${policy.policyname}`);
      console.log(`      Command: ${policy.cmd}`);
      console.log(`      Roles: ${policy.roles}`);
      if (policy.qual) {
        console.log(`      USING: ${policy.qual.substring(0, 60)}...`);
      }
      console.log('');
    }
  } else {
    console.log('  ⚠️ BRAK POLICIES!\n');
  }
  
  console.log('-'.repeat(80));
}

console.log('\n✅ SPRAWDZANIE RLS ZAKOŃCZONE!\n');
