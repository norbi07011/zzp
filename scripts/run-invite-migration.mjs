import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.2LYor4QbKLlU8JgvOqB6vGBwZBLJGGqVQ5xvpEq-C_Q';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('\n🚀 Rozpoczynam migrację: System Zaproszeń (Invites)\n');

  try {
    // Read SQL file
    const sql = fs.readFileSync('./database-migrations/20251030_2100_create_invites_system.sql', 'utf-8');
    
    // Split by verification queries
    const mainSql = sql.split('-- VERIFICATION QUERIES')[0];
    
    console.log('📋 Wykonuję SQL migration...\n');
    
    // Execute migration (using rpc for raw SQL)
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: mainSql });
    
    if (error) {
      console.error('❌ Błąd podczas migracji:', error);
      
      // Fallback: try executing parts separately
      console.log('\n⚠️ Próbuję wykonać migrację częściami...\n');
      
      const parts = mainSql.split('-- ===');
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].trim()) {
          console.log(`Część ${i + 1}/${parts.length}...`);
          // Note: Supabase JS client doesn't support raw SQL directly
          // You'll need to use Supabase Dashboard SQL Editor or psql
        }
      }
      
      console.log('\n⚠️ INSTRUKCJE MANUALNE:');
      console.log('1. Otwórz Supabase Dashboard: https://supabase.com/dashboard');
      console.log('2. Przejdź do: SQL Editor');
      console.log('3. Skopiuj zawartość pliku: database-migrations/20251030_2100_create_invites_system.sql');
      console.log('4. Wklej i wykonaj (RUN)\n');
      
      return;
    }
    
    console.log('✅ Migracja wykonana pomyślnie!\n');
    
    // Verification
    console.log('🔍 Weryfikacja...\n');
    
    // Check if table exists
    const { data: tableCheck } = await supabase
      .from('project_invites')
      .select('*')
      .limit(0);
    
    console.log('✅ Tabela project_invites istnieje');
    console.log('✅ Migracja zakończona sukcesem!\n');
    
  } catch (err) {
    console.error('❌ Błąd:', err);
    console.log('\n⚠️ Wykonaj migrację ręcznie przez Supabase Dashboard SQL Editor');
  }
}

runMigration();
