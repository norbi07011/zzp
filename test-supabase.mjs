// Test połączenia z Supabase - sprawdzenie jakie tabele istnieją
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 CHECKING EXISTING TABLES...');

async function checkTables() {
  const tablesToCheck = [
    'profiles',
    'workers', 
    'employers',
    'companies',
    'appointments',
    'certificates',
    'test_slots',
    'payments',
    'system_settings'
  ];

  console.log('\n📊 TABLE EXISTENCE CHECK:');
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: MISSING (${error.message})`);
      } else {
        console.log(`✅ ${table}: EXISTS`);
      }
    } catch (e) {
      console.log(`❌ ${table}: ERROR (${e.message})`);
    }
  }
  
  console.log('\n🔍 CHECKING DATA IN EXISTING TABLES:');
  
  // Check data in existing tables
  for (const table of ['profiles', 'workers', 'employers']) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(5);
      
      if (!error && data) {
        console.log(`📈 ${table}: ${data.length} records found`);
        if (data.length > 0) {
          console.log(`   Sample record keys:`, Object.keys(data[0]));
        }
      }
    } catch (e) {
      // Skip if table doesn't exist
    }
  }
}

checkTables();