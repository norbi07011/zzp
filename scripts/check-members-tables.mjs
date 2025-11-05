import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMembersTables() {
  console.log('\n===== SPRAWDZAM TABELE MEMBERS =====\n');

  // Sprawdź wszystkie tabele z "member" w nazwie
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .ilike('table_name', '%member%')
    .order('table_name');

  if (tablesError) {
    console.error('Błąd przy pobieraniu tabel:', tablesError);
  } else {
    console.log('Tabele zawierające "member":');
    tables.forEach(t => console.log(`  - ${t.table_name}`));
  }

  // Sprawdź kolumny communication_project_members
  console.log('\n===== KOLUMNY communication_project_members =====\n');
  const { data: cols1, error: cols1Error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_schema', 'public')
    .eq('table_name', 'communication_project_members')
    .order('ordinal_position');

  if (cols1Error) {
    console.error('Błąd:', cols1Error);
  } else if (cols1 && cols1.length > 0) {
    cols1.forEach(c => console.log(`  ${c.column_name} (${c.data_type}) ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`));
  } else {
    console.log('  Tabela communication_project_members NIE ISTNIEJE');
  }

  // Sprawdź czy istnieje project_members
  console.log('\n===== KOLUMNY project_members =====\n');
  const { data: cols2, error: cols2Error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_schema', 'public')
    .eq('table_name', 'project_members')
    .order('ordinal_position');

  if (cols2Error) {
    console.error('Błąd:', cols2Error);
  } else if (cols2 && cols2.length > 0) {
    cols2.forEach(c => console.log(`  ${c.column_name} (${c.data_type}) ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`));
  } else {
    console.log('  Tabela project_members NIE ISTNIEJE');
  }

  // Sprawdź team_members
  console.log('\n===== KOLUMNY team_members =====\n');
  const { data: cols3, error: cols3Error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_schema', 'public')
    .eq('table_name', 'team_members')
    .order('ordinal_position');

  if (cols3Error) {
    console.error('Błąd:', cols3Error);
  } else if (cols3 && cols3.length > 0) {
    cols3.forEach(c => console.log(`  ${c.column_name} (${c.data_type}) ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`));
  } else {
    console.log('  Tabela team_members NIE ISTNIEJE');
  }

  // Sprawdź project_chat_groups
  console.log('\n===== KOLUMNY project_chat_groups =====\n');
  const { data: cols4, error: cols4Error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_schema', 'public')
    .eq('table_name', 'project_chat_groups')
    .order('ordinal_position');

  if (cols4Error) {
    console.error('Błąd:', cols4Error);
  } else if (cols4 && cols4.length > 0) {
    cols4.forEach(c => console.log(`  ${c.column_name} (${c.data_type}) ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`));
  } else {
    console.log('  Tabela project_chat_groups NIE ISTNIEJE');
  }
}

checkMembersTables();
