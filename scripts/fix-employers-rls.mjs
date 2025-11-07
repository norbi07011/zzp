import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔧 Fixing RLS on employers table...\n');

// KROK 1: Disable RLS
console.log('1️⃣ Disabling RLS on employers...');
const { error: disableError } = await supabase.rpc('exec_sql', {
  query: 'ALTER TABLE employers DISABLE ROW LEVEL SECURITY'
});
if (disableError) console.error('❌', disableError.message);
else console.log('✅ RLS disabled');

// KROK 2: Drop old policies
console.log('\n2️⃣ Dropping old policies...');
const policiesToDrop = [
  'Employers can view own profile',
  'Employers can update own profile',
  'Users can view employer profiles',
  'Enable read access for authenticated users',
];

for (const policy of policiesToDrop) {
  const { error } = await supabase.rpc('exec_sql', {
    query: `DROP POLICY IF EXISTS "${policy}" ON employers`
  });
  if (error) console.log(`⚠️ ${policy}:`, error.message);
  else console.log(`✅ Dropped: ${policy}`);
}

// KROK 3: Enable RLS with simple policies
console.log('\n3️⃣ Creating new simple policies...');

const policies = [
  'ALTER TABLE employers ENABLE ROW LEVEL SECURITY',
  `CREATE POLICY "employers_select_own" ON employers
   FOR SELECT TO authenticated
   USING (auth.uid() = user_id OR auth.uid() = profile_id)`,
  `CREATE POLICY "employers_update_own" ON employers
   FOR UPDATE TO authenticated
   USING (auth.uid() = user_id OR auth.uid() = profile_id)`,
  `CREATE POLICY "employers_select_all" ON employers
   FOR SELECT TO authenticated
   USING (true)`,
];

for (const policy of policies) {
  const { error } = await supabase.rpc('exec_sql', { query: policy });
  if (error) console.error('❌', error.message);
  else console.log('✅ Created policy');
}

console.log('\n🎉 FIX COMPLETE! Try logging in again.');
