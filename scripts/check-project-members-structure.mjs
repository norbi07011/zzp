import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStructure() {
  console.log('\n===== SPRAWDZAM STRUKTURĘ project_members =====\n');

  // Pobierz przykładowy rekord żeby zobaczyć wszystkie kolumny
  const { data, error } = await supabase
    .from('project_members')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Błąd:', error);
  } else if (data && data.length > 0) {
    console.log('Kolumny w tabeli project_members:');
    const columns = Object.keys(data[0]);
    columns.forEach(col => {
      console.log(`  - ${col}: ${typeof data[0][col]} = ${JSON.stringify(data[0][col])}`);
    });
  } else {
    console.log('Tabela pusta, sprawdzam przez metadata...');
    
    // Spróbuj pobrać wszystkie kolumny bez filtrów
    const { data: all, error: err2 } = await supabase
      .from('project_members')
      .select('*')
      .limit(5);
    
    if (!err2 && all && all.length > 0) {
      console.log('\nZnalezione kolumny:');
      Object.keys(all[0]).forEach(col => console.log(`  - ${col}`));
    }
  }
}

checkStructure();
