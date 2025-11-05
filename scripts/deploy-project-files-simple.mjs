import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deployProjectFilesMigration() {
  console.log('🚀 Wdrażam prostą migrację project_files...\n');

  try {
    // Wczytaj plik migracji
    const migrationSQL = readFileSync(
      'database-migrations/20241029_1430_create_project_files_simple.sql', 
      'utf-8'
    );

    console.log('📋 Wykonuję migrację...');
    
    // Wykonaj migrację przez rpc
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.log('❌ Błąd wykonania migracji:', error.message);
      
      // Spróbuj przez bezpośrednie zapytanie SQL (bez RPC)
      console.log('\n🔄 Próba bezpośredniego wykonania...');
      
      // Wykonaj po kawałku
      const sqlCommands = migrationSQL
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      for (let i = 0; i < sqlCommands.length; i++) {
        const command = sqlCommands[i];
        if (command.length < 10) continue; // Skip bardzo krótkie komendy
        
        console.log(`📝 Wykonuję komendę ${i + 1}/${sqlCommands.length}...`);
        
        const { data: cmdData, error: cmdError } = await supabase.rpc('exec_sql', {
          sql: command + ';'
        });
        
        if (cmdError) {
          console.log(`❌ Błąd w komendzie ${i + 1}:`, cmdError.message);
          console.log(`💭 Komenda: ${command.substring(0, 100)}...`);
        } else {
          console.log(`✅ Komenda ${i + 1} wykonana`);
        }
      }
    } else {
      console.log('✅ Migracja wykonana pomyślnie!');
      console.log('📊 Wynik:', data);
    }

    // Sprawdź czy tabela istnieje
    console.log('\n🔍 Sprawdzam czy tabela project_files została utworzona...');
    const { data: testData, error: testError } = await supabase
      .from('project_files')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('❌ project_files nadal niedostępna:', testError.message);
    } else {
      console.log('✅ project_files istnieje i jest dostępna!');
      console.log('📊 Test SELECT przeszedł pomyślnie');
    }

  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
  }
}

deployProjectFilesMigration();