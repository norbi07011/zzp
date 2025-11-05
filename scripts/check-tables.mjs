import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak VITE_SUPABASE_URL lub SUPABASE_SERVICE_KEY w .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Sprawdzam tabele w bazie Supabase...\n');

async function checkTables() {
  try {
    // Query do sprawdzenia wszystkich tabel
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    });

    if (error) {
      console.log('⚠️  RPC nie działa, próbuję bezpośredniego query...\n');
      
      // Alternatywnie - sprawdzam czy konkretne tabele istnieją
      const tablesToCheck = [
        'profiles',
        'workers',
        'employers',
        'posts',
        'messages',
        'reviews',
        'jobs',
        'applications'
      ];
      
      console.log('Sprawdzam standardowe tabele:\n');
      
      for (const tableName of tablesToCheck) {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${tableName}: NIE ISTNIEJE (${error.message})`);
        } else {
          console.log(`✅ ${tableName}: ISTNIEJE (${count || 0} rekordów)`);
        }
      }
      
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  BRAK TABEL W BAZIE!\n');
      console.log('Najprawdopodobniej baza jest pusta lub nie masz uprawnień.\n');
      return;
    }

    console.log(`✅ Znaleziono ${data.length} tabel:\n`);
    data.forEach((row, i) => {
      console.log(`${i + 1}. ${row.table_name}`);
    });
    
  } catch (err) {
    console.error('❌ Błąd:', err.message);
  }
}

checkTables();
