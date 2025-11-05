import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceSchemaRefresh() {
  console.log('🔄 Próbuję wymusić refresh schema cache...\n');

  try {
    // Metoda 1: Sprawdź czy PostgREST ma funkcję refresh
    console.log('📋 Próba 1: Restart PostgREST cache...');
    const { data: refresh1, error: refresh1Error } = await supabase
      .rpc('pgrst_reload_schema');

    if (refresh1Error) {
      console.log('❌ pgrst_reload_schema nie działa:', refresh1Error.message);
    } else {
      console.log('✅ pgrst_reload_schema wykonana');
    }

    // Metoda 2: Próba dostępu przez raw SQL
    console.log('\n📋 Próba 2: Raw SQL przez rpc...');
    const { data: rawSql, error: rawError } = await supabase
      .rpc('exec_sql', { 
        sql: 'SELECT * FROM project_files LIMIT 1;' 
      });

    if (rawError) {
      console.log('❌ Raw SQL nie działa:', rawError.message);
    } else {
      console.log('✅ Raw SQL wykonane:', rawSql);
    }

    // Metoda 3: Sprawdź czy tabela istnieje w pg_tables
    console.log('\n📋 Próba 3: Sprawdzenie przez pg_tables...');
    const { data: pgTables, error: pgError } = await supabase
      .rpc('exec_sql', { 
        sql: "SELECT schemaname, tablename FROM pg_tables WHERE tablename LIKE '%project_files%';" 
      });

    if (pgError) {
      console.log('❌ pg_tables nie działa:', pgError.message);
    } else {
      console.log('✅ pg_tables wynik:', pgTables);
    }

    // Metoda 4: Sprawdź przez RPC z prostym SELECT
    console.log('\n📋 Próba 4: Własne RPC z SELECT...');
    const { data: customRpc, error: customError } = await supabase
      .rpc('get_table_info', {
        table_name: 'project_files'
      });

    if (customError) {
      console.log('❌ Custom RPC nie działa:', customError.message);
    } else {
      console.log('✅ Custom RPC wynik:', customRpc);
    }

  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
  }
}

forceSchemaRefresh();