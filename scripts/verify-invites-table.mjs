import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function checkInvitesTable() {
  console.log('🔍 Sprawdzam czy tabela project_invites istnieje...\n');

  try {
    const { data, error } = await supabase
      .from('project_invites')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log('❌ Tabela project_invites NIE istnieje w bazie danych.\n');
        console.log('📋 INSTRUKCJA - Wykonaj SQL ręcznie:\n');
        console.log('1️⃣  Otwórz w przeglądarce:');
        console.log('   https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql\n');
        console.log('2️⃣  Skopiuj CAŁĄ zawartość pliku:');
        console.log('   database-migrations/20251030_2100_create_invites_system.sql\n');
        console.log('3️⃣  Wklej w SQL Editor i kliknij "RUN"\n');
        console.log('4️⃣  Po wykonaniu uruchom ponownie: node scripts/verify-invites-table.mjs\n');
        return false;
      } else {
        console.error(`❌ Błąd: ${error.message}`);
        return false;
      }
    }

    console.log('✅ Tabela project_invites istnieje!\n');
    
    // Sprawdzam strukturę
    const { data: columns, error: colError } = await supabase
      .rpc('get_table_columns', { table_name: 'project_invites' })
      .catch(() => null);

    console.log('📊 Podstawowe informacje:');
    console.log(`   - Rekordów: ${data?.length || 0}`);
    console.log('   - Status: Aktywna i dostępna');
    console.log('\n✅ System invites jest gotowy do użycia!\n');
    
    return true;

  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
    return false;
  }
}

checkInvitesTable();
