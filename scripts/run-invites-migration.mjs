import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.2LYor4QbKLlU8JgvOqB6vGBwZBLJGGqVQ5xvpEq-C_Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Rozpoczynam migrację invites system...\n');

  try {
    // Czytam plik SQL
    const sqlContent = readFileSync('database-migrations/20251030_2100_create_invites_system.sql', 'utf8');
    
    // Dzielę na pojedyncze komendy (oddzielone średnikami)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => 
        cmd.length > 0 && 
        !cmd.startsWith('--') && 
        !cmd.match(/^\/\*/) &&
        cmd !== 'BEGIN' &&
        cmd !== 'COMMIT'
      );

    console.log(`📝 Znaleziono ${commands.length} komend SQL\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i].trim();
      
      // Pomijam komentarze i puste linie
      if (!cmd || cmd.startsWith('--')) continue;

      // Wyświetlam skróconą wersję komendy
      const preview = cmd.substring(0, 80).replace(/\n/g, ' ') + (cmd.length > 80 ? '...' : '');
      console.log(`[${i + 1}/${commands.length}] ${preview}`);

      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: cmd + ';' 
        });

        if (error) {
          // Próba bezpośredniego wykonania przez REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ sql_query: cmd + ';' })
          });

          if (!response.ok) {
            console.error(`❌ Błąd: ${error?.message || response.statusText}`);
            errorCount++;
            
            // Jeśli to błąd typu "już istnieje", kontynuujemy
            if (error?.message?.includes('already exists') || 
                error?.message?.includes('already exists')) {
              console.log('⚠️  Obiekt już istnieje, pomijam...\n');
              continue;
            }
          } else {
            console.log('✅ OK\n');
            successCount++;
          }
        } else {
          console.log('✅ OK\n');
          successCount++;
        }

      } catch (err) {
        console.error(`❌ Błąd wykonania: ${err.message}\n`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Sukces: ${successCount} komend`);
    console.log(`❌ Błędy: ${errorCount} komend`);
    console.log('='.repeat(60) + '\n');

    // Weryfikacja - sprawdzam czy tabela została utworzona
    console.log('🔍 Weryfikacja: Sprawdzam czy tabela project_invites istnieje...');
    
    const { data: tableCheck, error: tableError } = await supabase
      .from('project_invites')
      .select('id')
      .limit(1);

    if (tableError) {
      if (tableError.message.includes('does not exist')) {
        console.error('❌ BŁĄD: Tabela project_invites NIE została utworzona!');
        console.log('\n📋 Musisz wykonać SQL ręcznie przez Supabase Dashboard:');
        console.log('https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql\n');
      } else {
        console.error(`❌ Błąd weryfikacji: ${tableError.message}`);
      }
    } else {
      console.log('✅ Tabela project_invites istnieje i działa!\n');
      console.log('🎉 Migracja zakończona pomyślnie!');
    }

  } catch (error) {
    console.error('❌ KRYTYCZNY BŁĄD:', error.message);
    console.log('\n📋 Nie mogę wykonać migracji przez API.');
    console.log('Musisz skopiować zawartość pliku:');
    console.log('database-migrations/20251030_2100_create_invites_system.sql');
    console.log('\nI wkleić tutaj:');
    console.log('https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql');
    console.log('\nNastępnie kliknij "RUN"\n');
  }
}

runMigration();
