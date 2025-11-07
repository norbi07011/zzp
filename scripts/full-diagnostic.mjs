import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 PEŁNA DIAGNOSTYKA SYSTEMU\n');
console.log('=' .repeat(80));

// ============================================================
// 1. SPRAWDZENIE TABEL I ICH ZAWARTOŚCI
// ============================================================
console.log('\n📊 1. STRUKTURA BAZY DANYCH\n');

const tables = ['profiles', 'employers', 'workers', 'accountants'];

for (const table of tables) {
  console.log(`\n📋 Tabela: ${table}`);
  
  // Sprawdź czy tabela istnieje i ile ma rekordów
  const { data, error, count } = await supabase
    .from(table)
    .select('*', { count: 'exact' })
    .limit(0);
  
  if (error) {
    console.log(`  ❌ Błąd: ${error.message}`);
    continue;
  }
  
  console.log(`  ✅ Rekordy: ${count || 0}`);
  
  // Sprawdź RLS
  const { data: rlsData } = await supabase.rpc('exec_sql_return', {
    query: `
      SELECT tablename, 
             COUNT(*) as policy_count
      FROM pg_policies
      WHERE tablename = '${table}'
      GROUP BY tablename
    `
  });
  
  if (rlsData && rlsData.length > 0) {
    console.log(`  🔒 RLS policies: ${rlsData[0].policy_count}`);
  }
}

// ============================================================
// 2. SPRAWDZENIE UŻYTKOWNIKÓW
// ============================================================
console.log('\n\n👥 2. UŻYTKOWNICY W SYSTEMIE\n');

const { data: allProfiles } = await supabase
  .from('profiles')
  .select('id, email, role, full_name')
  .order('created_at');

if (allProfiles) {
  console.log(`Znaleziono ${allProfiles.length} profili:\n`);
  for (const profile of allProfiles) {
    console.log(`  📧 ${profile.email}`);
    console.log(`     Role: ${profile.role}`);
    console.log(`     ID: ${profile.id}`);
    
    // Sprawdź czy ma powiązany rekord
    if (profile.role === 'employer') {
      const { data: emp } = await supabase
        .from('employers')
        .select('id, company_name')
        .or(`user_id.eq.${profile.id},profile_id.eq.${profile.id}`)
        .maybeSingle();
      
      if (emp) {
        console.log(`     ✅ Employer: ${emp.company_name}`);
      } else {
        console.log(`     ❌ BRAK rekordu w employers!`);
      }
    }
    
    if (profile.role === 'worker') {
      const { data: worker } = await supabase
        .from('workers')
        .select('id, specialization')
        .or(`user_id.eq.${profile.id},profile_id.eq.${profile.id}`)
        .maybeSingle();
      
      if (worker) {
        console.log(`     ✅ Worker: ${worker.specialization || 'brak specjalizacji'}`);
      } else {
        console.log(`     ❌ BRAK rekordu w workers!`);
      }
    }
    
    if (profile.role === 'accountant') {
      const { data: acc } = await supabase
        .from('accountants')
        .select('id, company_name')
        .eq('profile_id', profile.id)
        .maybeSingle();
      
      if (acc) {
        console.log(`     ✅ Accountant: ${acc.company_name || 'no company name'}`);
      } else {
        console.log(`     ❌ BRAK rekordu w accountants!`);
      }
    }
    
    console.log('');
  }
}

// ============================================================
// 3. SPRAWDZENIE RLS POLICIES
// ============================================================
console.log('\n\n🔒 3. RLS POLICIES SZCZEGÓŁOWO\n');

const { data: policies } = await supabase.rpc('exec_sql_return', {
  query: `
    SELECT 
      tablename,
      policyname,
      cmd,
      roles,
      qual
    FROM pg_policies
    WHERE tablename IN ('profiles', 'employers', 'workers', 'accountants')
    ORDER BY tablename, policyname
  `
});

if (policies) {
  let currentTable = '';
  for (const policy of policies) {
    if (policy.tablename !== currentTable) {
      currentTable = policy.tablename;
      console.log(`\n📋 ${currentTable}:`);
    }
    console.log(`  • ${policy.policyname} (${policy.cmd})`);
  }
}

// ============================================================
// 4. TEST DOSTĘPU DLA KAŻDEGO UŻYTKOWNIKA
// ============================================================
console.log('\n\n🧪 4. TEST DOSTĘPU UŻYTKOWNIKÓW\n');

for (const profile of allProfiles || []) {
  console.log(`\nTestuję: ${profile.email} (${profile.role})`);
  
  // Próba pobrania własnego profilu
  const { data: ownProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profile.id)
    .maybeSingle();
  
  if (profileError) {
    console.log(`  ❌ Nie może odczytać własnego profilu: ${profileError.message}`);
  } else if (ownProfile) {
    console.log(`  ✅ Może odczytać własny profil`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('\n✅ DIAGNOSTYKA ZAKOŃ