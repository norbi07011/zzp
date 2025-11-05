import { supabaseServiceRole } from '../lib/supabase-service-role.js';
import fs from 'fs';

async function deployFixedFilesTables() {
  console.log('🔧 Naprawianie tabel plików...');
  
  try {
    // Wczytaj SQL z pliku
    const sqlContent = fs.readFileSync('./FIX_PROJECT_FILES_TABLE.sql', 'utf8');
    
    // Podziel na poszczególne komendy SQL
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Znaleziono ${sqlCommands.length} komend SQL`);
    
    // Wykonaj każdą komendę
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      if (command.toLowerCase().includes('select')) {
        console.log(`\n🔍 Wykonuję zapytanie ${i + 1}/${sqlCommands.length}:`);
        const { data, error } = await supabaseServiceRole.rpc('exec_sql', {
          sql_query: command + ';'
        });
        
        if (error) {
          console.error(`❌ Błąd w zapytaniu ${i + 1}:`, error);
        } else {
          console.log('✅ Wynik:', data);
        }
      } else {
        console.log(`\n⚙️ Wykonuję komendę ${i + 1}/${sqlCommands.length}:`);
        const { data, error } = await supabaseServiceRole.rpc('exec_sql', {
          sql_query: command + ';'
        });
        
        if (error) {
          console.error(`❌ Błąd w komendzie ${i + 1}:`, error);
          if (error.message && !error.message.includes('already exists')) {
            throw error;
          }
        } else {
          console.log('✅ Komenda wykonana pomyślnie');
        }
      }
    }
    
    console.log('\n🎉 Migracja zakończona!');
    
    // Test końcowy - sprawdź czy tabele istnieją
    console.log('\n🧪 Test końcowy - sprawdzanie tabel...');
    const { data: tables, error: testError } = await supabaseServiceRole
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['project_files', 'event_attachments', 'task_attachments'])
      .eq('table_schema', 'public');
    
    if (testError) {
      console.error('❌ Błąd testu:', testError);
    } else {
      console.log('✅ Istniejące tabele plików:', tables?.map(t => t.table_name) || []);
    }
    
  } catch (error) {
    console.error('💥 Błąd migracji:', error);
    process.exit(1);
  }
}

deployFixedFilesTables();