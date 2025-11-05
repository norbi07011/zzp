import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Konfiguracja Supabase
const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDAzMDMzOSwiZXhwIjoyMDQ1NjA2MzM5fQ.VIyy8RnNOiHUk9gOVhIHckrGcM6vhKkp5vJ2jFeDGf0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Rozpoczynam migrację systemu plików...');
  
  try {
    // Przeczytaj plik migracji
    const migrationPath = path.join(__dirname, '..', 'database-migrations', 'CREATE_FILES_SYSTEM.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📂 Plik migracji załadowany, rozmiar:', migrationSQL.length, 'znaków');
    
    // Podziel na pojedyncze polecenia SQL (po średnikach)
    const sqlCommands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log('📝 Znaleziono', sqlCommands.length, 'poleceń SQL');
    
    // Wykonaj każde polecenie osobno
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      
      // Pomijaj komentarze i puste linie
      if (command.startsWith('--') || command.trim() === '') {
        continue;
      }
      
      try {
        console.log(`⚡ Wykonuję polecenie ${i + 1}/${sqlCommands.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command + ';'
        });
        
        if (error) {
          console.error(`❌ Błąd w poleceniu ${i + 1}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Polecenie ${i + 1} wykonane pomyślnie`);
          successCount++;
        }
        
        // Małe opóźnienie między poleceniami
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (cmdError) {
        console.error(`❌ Błąd wykonania polecenia ${i + 1}:`, cmdError.message);
        errorCount++;
      }
    }
    
    console.log('\n🎯 PODSUMOWANIE MIGRACJI:');
    console.log(`✅ Pomyślne: ${successCount}`);
    console.log(`❌ Błędy: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('🚀 Migracja zakończona pomyślnie!');
      
      // Sprawdź utworzone tabele
      console.log('\n📊 Sprawdzam utworzone tabele...');
      
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['project_files', 'task_attachments', 'event_attachments']);
      
      if (tablesError) {
        console.error('❌ Błąd sprawdzania tabel:', tablesError.message);
      } else {
        console.log('✅ Utworzone tabele:', tables.map(t => t.table_name).join(', '));
      }
      
    } else {
      console.log('⚠️  Migracja zakończona z błędami');
    }
    
  } catch (error) {
    console.error('💥 Krytyczny błąd migracji:', error.message);
    process.exit(1);
  }
}

// Uruchom migrację
runMigration();