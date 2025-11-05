import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  console.log('� Checking if Feed System tables exist...\n');

  const tables = ['posts', 'post_likes', 'post_comments', 'comment_likes', 'post_shares', 'post_views'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    
    if (error) {
      console.log(`❌ ${table}: NOT FOUND (${error.code})`);
    } else {
      console.log(`✅ ${table}: EXISTS`);
    }
  }

  console.log('\n� INSTRUKCJA:');
  console.log('1. Otwórz Supabase Dashboard: https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/editor');
  console.log('2. Kliknij "SQL Editor"');
  console.log('3. Skopiuj zawartość pliku: scripts/CREATE_FEED_SYSTEM.sql');
  console.log('4. Wklej i wykonaj w SQL Editor');
  console.log('5. Sprawdź czy wszystkie tabele zostały utworzone');
}

checkTables();
