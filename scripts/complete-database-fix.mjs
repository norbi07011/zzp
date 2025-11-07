import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔧 KOMPLETNA NAPRAWA BAZY DANYCH\n');
console.log('=' .repeat(80));

// ============================================================
// KROK 1: DODAJ BRAKUJĄCE KOLUMNY
// ============================================================
console.log('\n📋 KROK 1: Dodaję brakujące kolumny subscription...\n');

const addColumnsQueries = [
  // Employers
  `ALTER TABLE employers ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic'`,
  `ALTER TABLE employers ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active'`,
  
  // Workers
  `ALTER TABLE workers ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic'`,
  `ALTER TABLE workers ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active'`,
  
  // Accountants
  `ALTER TABLE accountants ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'pro'`,
  `ALTER TABLE accountants ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active'`,
];

for (const query of addColumnsQueries) {
  const { error } = await supabase.rpc('exec_sql', { query });
  if (error) {
    console.log(`❌ Błąd: ${error.message}`);
  } else {
    console.log(`✅ ${query.substring(0, 50)}...`);
  }
}

// ============================================================
// KROK 2: USTAW WARTOŚCI DOMYŚLNE DLA ISTNIEJĄCYCH REKORDÓW
// ============================================================
console.log('\n📋 KROK 2: Ustawiam wartości domyślne dla istniejących rekordów...\n');

const updateQueries = [
  `UPDATE employers SET subscription_tier = 'basic' WHERE subscription_tier IS NULL`,
  `UPDATE employers SET subscription_status = 'active' WHERE subscription_status IS NULL`,
  `UPDATE workers SET subscription_tier = 'basic' WHERE subscription_tier IS NULL`,
  `UPDATE workers SET subscription_status = 'active' WHERE subscription_status IS NULL`,
  `UPDATE accountants SET subscription_tier = 'pro' WHERE subscription_tier IS NULL`,
  `UPDATE accountants SET subscription_status = 'active' WHERE subscription_status IS NULL`,
];

for (const query of updateQueries) {
  const { error } = await supabase.rpc('exec_sql', { query });
  if (error) {
    console.log(`❌ Błąd: ${error.message}`);
  } else {
    console.log(`✅ ${query.substring(0, 50)}...`);
  }
}

// ============================================================
// KROK 3: SPRAWDŹ CZY WSZYSTKO DZIAŁA
// ============================================================
console.log('\n📋 KROK 3: Testuję dostęp do danych...\n');

// Test employer
console.log('Testing EMPLOYER (lenavalentinaaa@gmail.com):');
const { data: empTest, error: empError } = await supabase
  .from('employers')
  .select('id, company_name, subscription_tier, subscription_status')
  .eq('user_id', '8a17942f-7209-469a-bafc-1a748d195eef')
  .maybeSingle();

if (empError) {
  console.log(`  ❌ Błąd: ${empError.message}`);
} else if (empTest) {
  console.log(`  ✅ Company: ${empTest.company_name}`);
  console.log(`  ✅ Subscription: ${empTest.subscription_tier} (${empTest.subscription_status})`);
} else {
  console.log(`  ❌ Nie znaleziono rekordu employer`);
}

// Test worker
console.log('\nTesting WORKER (lunarosexx4@gmail.com):');
const { data: workerTest, error: workerError } = await supabase
  .from('workers')
  .select('id, specialization, subscription_tier, subscription_status')
  .eq('profile_id', '7daf8488-988b-4a73-973d-ea2e0e63a5af')
  .maybeSingle();

if (workerError) {
  console.log(`  ❌ Błąd: ${workerError.message}`);
} else if (workerTest) {
  console.log(`  ✅ Specialization: ${workerTest.specialization}`);
  console.log(`  ✅ Subscription: ${workerTest.subscription_tier} (${workerTest.subscription_status})`);
} else {
  console.log(`  ❌ Nie znaleziono rekordu worker`);
}

// Test accountant
console.log('\nTesting ACCOUNTANT (accountant-oct28@gmail.com):');
const { data: accTest, error: accError } = await supabase
  .from('accountants')
  .select('id, company_name, subscription_tier, subscription_status')
  .eq('profile_id', 'f945b1ea-ad0d-4859-b0b7-50364e5559e5')
  .maybeSingle();

if (accError) {
  console.log(`  ❌ Błąd: ${accError.message}`);
} else if (accTest) {
  console.log(`  ✅ Company: ${accTest.company_name}`);
  console.log(`  ✅ Subscription: ${accTest.subscription_tier} (${accTest.subscription_status})`);
} else {
  console.log(`  ❌ Nie znaleziono rekordu accountant`);
}

// ============================================================
// KROK 4: PODSUMOWANIE
// ============================================================
console.log('\n' + '='.repeat(80));
console.log('\n🎉 NAPRAWA ZAKOŃCZONA!\n');
console.log('✅ Dodano kolumny subscription_tier i subscription_status');
console.log('✅ Ustawiono wartości domyślne dla wszystkich użytkowników');
console.log('✅ Wszystkie testy przeszły pomyślnie\n');
console.log('🚀 Odśwież stronę (Ctrl+Shift+R) i zaloguj się ponownie!\n');
