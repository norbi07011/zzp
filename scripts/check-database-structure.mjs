import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Sprawdzam strukturę bazy danych...\n');

// 1. WSZYSTKIE TABELE
console.log('1️⃣ WSZYSTKIE TABELE W SCHEMACIE PUBLIC:');
const { data: tables, error: tablesError } = await supabase
  .from('information_schema.tables')
  .select('table_name, table_type')
  .eq('table_schema', 'public')
  .order('table_name');

if (tablesError) {
  console.log('⚠️ Próbuję przez exec_sql...');
  const { data: execData, error: execError } = await supabase.rpc('exec_sql_return', {
    query: `
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
  });
  
  if (execError) {
    console.error('❌', execError.message);
  } else {
    console.log(execData);
  }
} else {
  console.log(tables);
}

console.log('\n2️⃣ CZY ISTNIEJE TABELA EMPLOYERS:');
const { data: employers, error: employersError } = await supabase
  .from('employers')
  .select('*')
  .eq('user_id', '8a17942f-7209-469a-bafc-1a748d195eef')
  .maybeSingle();

if (employersError) {
  console.log('❌ Błąd:', employersError.message);
} else {
  console.log('✅ Employer record:', employers || 'NIE ZNALEZIONO');
}

console.log('\n3️⃣ SPRAWDZAM USERA: lenavalentinaaa@gmail.com');
const { data: profiles, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', 'lenavalentinaaa@gmail.com');

if (profileError) {
  console.log('❌ Błąd:', profileError.message);
} else {
  console.log(profiles || 'Nie znaleziono profilu');
}

console.log('\n3B️⃣ WSZYSTKIE PROFILE (pierwsze 5):');
const { data: allProfiles } = await supabase
  .from('profiles')
  .select('id, email, role')
  .limit(5);
console.log(allProfiles);

console.log('\n4️⃣ KOLUMNY W TABELI PROFILES:');
const { data: columns } = await supabase.rpc('exec_sql_return', {
  query: `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
    ORDER BY ordinal_position
  `
});
console.log(columns);

console.log('\n✅ Sprawdzanie zakończone!');
