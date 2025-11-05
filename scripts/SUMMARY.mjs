import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('📝 TWORZĘ TESTOWE DANE\n');

// 1. Pobierz istniejących users
const { data: profiles } = await supabase
  .from('profiles')
  .select('*');

console.log(`Znaleziono ${profiles?.length || 0} profili:`);
profiles?.forEach(p => {
  console.log(`  - ${p.full_name || p.email} (${p.id.substring(0, 8)})`);
});

// 2. Sprawdź workers
const { data: workers } = await supabase
  .from('workers')
  .select('*');

console.log(`\nZnaleziono ${workers?.length || 0} workers`);

// 3. Sprawdź employers
const { data: employers } = await supabase
  .from('employers')
  .select('*');

console.log(`Znaleziono ${employers?.length || 0} employers`);

// 4. Sprawdź messages
const { data: messages } = await supabase
  .from('messages')
  .select('*');

console.log(`Znaleziono ${messages?.length || 0} messages\n`);

console.log('✅ WYKONAJ TERAZ SQL: scripts/FIX_ALL_SYSTEMS.sql w Supabase!');
console.log('\n📋 KROKI:');
console.log('1. Otwórz https://dtnotuyagygexmkyqtgb.supabase.co');
console.log('2. Przejdź do SQL Editor');
console.log('3. Kliknij "New Query"');
console.log('4. Wklej zawartość scripts/FIX_ALL_SYSTEMS.sql');
console.log('5. Kliknij "Run"');
console.log('\nPo wykonaniu SQL, wszystko będzie działać! 🎉');
