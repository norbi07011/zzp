import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';

console.log('🔑 Testuję klucze API Supabase...\n');

// Test 1: Anon key (public)
console.log('1️⃣ Test ANON KEY (public):');
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

try {
  const supabaseAnon = createClient(supabaseUrl, anonKey);
  const { data, error } = await supabaseAnon.from('profiles').select('id').limit(1);
  
  if (error) {
    console.log(`   ❌ BŁĄD: ${error.message}`);
  } else {
    console.log(`   ✅ DZIAŁA - znaleziono ${data?.length || 0} rekordów`);
  }
} catch (err) {
  console.log(`   ❌ WYJĄTEK: ${err.message}`);
}

// Test 2: Service role key (secret)
console.log('\n2️⃣ Test SERVICE_ROLE KEY (secret):');
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

try {
  const supabaseService = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabaseService.from('profiles').select('id').limit(1);
  
  if (error) {
    console.log(`   ❌ BŁĄD: ${error.message}`);
  } else {
    console.log(`   ✅ DZIAŁA - znaleziono ${data?.length || 0} rekordów`);
  }
} catch (err) {
  console.log(`   ❌ WYJĄTEK: ${err.message}`);
}

// Test 3: Sprawdzenie tabeli project_invites
console.log('\n3️⃣ Test tabeli project_invites (z service key):');

try {
  const supabaseService = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabaseService.from('project_invites').select('id').limit(1);
  
  if (error) {
    if (error.message.includes('does not exist') || error.code === '42P01') {
      console.log('   ❌ Tabela NIE ISTNIEJE - musisz wykonać migrację przez Dashboard');
      console.log('   📋 https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql');
    } else {
      console.log(`   ❌ BŁĄD: ${error.message}`);
    }
  } else {
    console.log(`   ✅ Tabela ISTNIEJE - znaleziono ${data?.length || 0} zaproszeń`);
  }
} catch (err) {
  console.log(`   ❌ WYJĄTEK: ${err.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('Podsumowanie:');
console.log('- Anon key: Do użytku w frontend (React)');
console.log('- Service key: Do użytku w backend (Node.js scripts)');
console.log('- Oba klucze są POPRAWNE jeśli widzisz ✅ powyżej');
console.log('='.repeat(60) + '\n');
