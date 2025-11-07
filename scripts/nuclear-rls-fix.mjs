import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔧 NUCLEAR FIX - Wszystkie tabele RLS...\n');

const tables = ['profiles', 'employers', 'workers', 'accountants'];

for (const table of tables) {
  console.log(`\n📋 Fixing ${table}...`);
  
  // 1. Disable RLS
  await supabase.rpc('exec_sql', {
    query: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY`
  });
  console.log(`✅ RLS disabled on ${table}`);
  
  // 2. Drop ALL policies
  const { data: policies } = await supabase.rpc('exec_sql_return', {
    query: `
      SELECT policyname 
      FROM pg_policies 
      WHERE tablename = '${table}'
    `
  });
  
  if (policies && policies.length > 0) {
    for (const policy of policies) {
      await supabase.rpc('exec_sql', {
        query: `DROP POLICY IF EXISTS "${policy.policyname}" ON ${table}`
      });
      console.log(`  🗑️ Dropped: ${policy.policyname}`);
    }
  }
  
  // 3. Enable RLS with simple policy
  await supabase.rpc('exec_sql', {
    query: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`
  });
  
  await supabase.rpc('exec_sql', {
    query: `
      CREATE POLICY "${table}_select_all" ON ${table}
      FOR SELECT TO authenticated
      USING (true)
    `
  });
  
  await supabase.rpc('exec_sql', {
    query: `
      CREATE POLICY "${table}_update_own" ON ${table}
      FOR UPDATE TO authenticated
      USING (auth.uid() = id OR auth.uid() = user_id OR auth.uid() = profile_id)
    `
  });
  
  console.log(`✅ ${table} fixed with simple policies`);
}

console.log('\n🎉 WSZYSTKO NAPRAWIONE! Odśwież stronę!');
