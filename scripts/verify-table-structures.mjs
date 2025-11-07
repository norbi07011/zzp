import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('📊 SPRAWDZANIE STRUKTURY TABEL\n');
console.log('=' .repeat(80) + '\n');

const tables = ['profiles', 'employers', 'workers', 'accountants'];

for (const table of tables) {
  console.log(`📋 TABELA: ${table.toUpperCase()}\n`);
  
  // Sprawdź kolumny
  const { data: columns } = await supabase.rpc('exec_sql_return', {
    query: `
      SELECT 
        column_name, 
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = '${table}'
      ORDER BY ordinal_position
    `
  });
  
  if (columns && columns.length > 0) {
    console.log('  Kolumny:');
    for (const col of columns) {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
      const def = col.column_default ? ` DEFAULT: ${col.column_default}` : '';
      console.log(`    • ${col.column_name}: ${col.data_type} ${nullable}${def}`);
    }
  }
  
  // Sprawdź liczbę rekordów
  const { count } = await supabase
    .from(table)
    .select('*', { count: 'exact' })
    .limit(0);
  
  console.log(`\n  ✅ Liczba rekordów: ${count}\n`);
  
  // Sprawdź RLS policies
  const { data: policies } = await supabase.rpc('exec_sql_return', {
    query: `
      SELECT policyname, cmd
      FROM pg_policies
      WHERE tablename = '${table}'
    `
  });
  
  if (policies && policies.length > 0) {
    console.log('  🔒 RLS Policies:');
    for (const policy of policies) {
      console.log(`    • ${policy.policyname} (${policy.cmd})`);
    }
  } else {
    console.log('  ⚠️ Brak RLS policies!');
  }
  
  console.log('\n' + '-'.repeat(80) + '\n');
}

console.log('✅ SPRAWDZANIE ZAKOŃCZONE!\n');
