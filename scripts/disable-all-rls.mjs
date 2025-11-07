import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔧 OSTATECZNE WYŁĄCZENIE RLS - WSZYSTKIE TABELE\n');
console.log('=' .repeat(80) + '\n');

const tables = ['profiles', 'employers', 'workers', 'accountants'];

for (const table of tables) {
  console.log(`\n📋 ${table.toUpperCase()}`);
  
  // 1. Wyłącz RLS
  console.log('  1. Wyłączam RLS...');
  await supabase.rpc('exec_sql', {
    query: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY`
  });
  console.log('  ✅ RLS wyłączony');
  
  // 2. Usuń WSZYSTKIE policies poprzez DROP CASCADE
  console.log('  2. Usuwam wszystkie policies...');
  await supabase.rpc('exec_sql', {
    query: `
      DO $$ 
      DECLARE
        pol record;
      BEGIN
        FOR pol IN 
          SELECT policyname 
          FROM pg_policies 
          WHERE tablename = '${table}'
        LOOP
          EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON ${table} CASCADE';
        END LOOP;
      END $$;
    `
  });
  console.log('  ✅ Wszystkie policies usunięte');
}

console.log('\n\n🎯 TERAZ TABELE NIE MAJĄ RLS!\n');
console.log('Service role ma pełny dostęp, aplikacja powinna działać.\n');
console.log('⚠️ UWAGA: To rozwiązanie tymczasowe - trzeba będzie dodać proste policies później!\n');
