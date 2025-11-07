import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔧 OSTATECZNA NAPRAWA RLS - PROFILES\n');

// 1. Sprawdź obecne polityki
console.log('1️⃣ Obecne polityki na profiles:');
const { data: currentPolicies } = await supabase.rpc('exec_sql_return', {
  query: `
    SELECT policyname, cmd, qual
    FROM pg_policies
    WHERE tablename = 'profiles'
  `
});

if (currentPolicies) {
  for (const policy of currentPolicies) {
    console.log(`  • ${policy.policyname} (${policy.cmd})`);
    console.log(`    USING: ${policy.qual}`);
  }
}

// 2. Disable RLS
console.log('\n2️⃣ Wyłączam RLS...');
await supabase.rpc('exec_sql', {
  query: 'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY'
});
console.log('  ✅ Wyłączone');

// 3. Drop WSZYSTKIE polityki
console.log('\n3️⃣ Usuwam WSZYSTKIE polityki...');
if (currentPolicies) {
  for (const policy of currentPolicies) {
    await supabase.rpc('exec_sql', {
      query: `DROP POLICY IF EXISTS "${policy.policyname}" ON profiles`
    });
    console.log(`  🗑️ ${policy.policyname}`);
  }
}

// 4. Enable RLS z NAJPROSTSZYMI politykami
console.log('\n4️⃣ Tworzę PROSTE polityki...');

const simplePolicies = [
  'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY',
  
  // Każdy widzi wszystkie profile (dla search)
  `CREATE POLICY "profiles_select_all" ON profiles
   FOR SELECT TO authenticated
   USING (true)`,
  
  // Każdy może edytować TYLKO SWÓJ profil
  `CREATE POLICY "profiles_update_own" ON profiles
   FOR UPDATE TO authenticated
   USING (id = auth.uid())`,
  
  // Każdy może usuwać TYLKO SWÓJ profil
  `CREATE POLICY "profiles_delete_own" ON profiles
   FOR DELETE TO authenticated
   USING (id = auth.uid())`,
];

for (const query of simplePolicies) {
  const { error } = await supabase.rpc('exec_sql', { query });
  if (error) {
    console.log(`  ❌ Błąd: ${error.message}`);
  } else {
    console.log(`  ✅ OK`);
  }
}

console.log('\n5️⃣ Test - próba odczytania profilu...');
const { data: testProfile, error: testError } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', 'lenavalentinaaa@gmail.com')
  .single();

if (testError) {
  console.log(`  ❌ NADAL BŁĄD: ${testError.message}`);
} else {
  console.log(`  ✅ Działa! Profile: ${testProfile.email}`);
}

console.log('\n🎉 GOTOWE! Odśwież aplikację.');
