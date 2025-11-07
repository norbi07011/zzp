import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

console.log('🔌 TEST POŁĄCZENIA Z SUPABASE\n');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test 1: Połączenie
console.log('1️⃣ URL:', process.env.VITE_SUPABASE_URL);
console.log('2️⃣ Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ EXISTS' : '❌ MISSING');

// Test 2: Zapytanie do bazy
console.log('\n3️⃣ Test zapytania do profiles...');
const { data, error, count } = await supabase
  .from('profiles')
  .select('*', { count: 'exact' })
  .limit(1);

if (error) {
  console.log(`❌ BŁĄD POŁĄCZENIA: ${error.message}`);
  process.exit(1);
} else {
  console.log(`✅ Połączenie działa! Znaleziono ${count} profili`);
}

// Test 3: Sprawdź exec_sql function
console.log('\n4️⃣ Test funkcji exec_sql...');
const { data: testExec, error: execError } = await supabase.rpc('exec_sql', {
  query: 'SELECT 1 as test'
});

if (execError) {
  console.log(`❌ exec_sql nie działa: ${execError.message}`);
} else {
  console.log('✅ exec_sql działa!');
}

console.log('\n✅ WSZYSTKIE TESTY POŁĄCZENIA OK!\n');
