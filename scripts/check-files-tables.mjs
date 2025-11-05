import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDAzMDMzOSwiZXhwIjoyMDQ1NjA2MzM5fQ.VIyy8RnNOiHUk9gOVhIHckrGcM6vhKkp5vJ2jFeDGf0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFilesTables() {
  console.log('🔍 Sprawdzam tabele systemu plików...\n');
  
  try {
    // 1. Sprawdź tabele
    const { data: tables, error: tablesError } = await supabase.rpc('exec', {
      sql: `
      SELECT table_name, 
             CASE WHEN EXISTS (
               SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = t.table_name
             ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
      FROM (VALUES ('project_files'), ('task_attachments'), ('event_attachments')) as t(table_name);
      `
    });
    
    if (tablesError) {
      console.error('❌ Błąd sprawdzania tabel:', tablesError.message);
      return;
    }
    
    console.log('📋 TABELE:');
    console.table(tables);
    
    // 2. Sprawdź typy ENUM
    const { data: enums, error: enumsError } = await supabase.rpc('exec', {
      sql: `
      SELECT t.typname as enum_type,
             array_agg(e.enumlabel ORDER BY e.enumsortorder) as possible_values
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname IN ('file_type', 'file_status')
      GROUP BY t.typname
      ORDER BY t.typname;
      `
    });
    
    if (!enumsError && enums) {
      console.log('\n🎯 TYPY ENUM:');
      enums.forEach(enumType => {
        console.log(`✅ ${enumType.enum_type}:`, enumType.possible_values.join(', '));
      });
    }
    
    // 3. Sprawdź kolumny project_files
    const { data: columns, error: columnsError } = await supabase.rpc('exec', {
      sql: `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'project_files'
      ORDER BY ordinal_position;
      `
    });
    
    if (!columnsError && columns) {
      console.log('\n📊 KOLUMNY project_files:');
      console.table(columns);
    }
    
    // 4. Sprawdź RLS
    const { data: policies, error: policiesError } = await supabase.rpc('exec', {
      sql: `
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies
      WHERE tablename IN ('project_files', 'task_attachments', 'event_attachments')
      ORDER BY tablename, policyname;
      `
    });
    
    if (!policiesError && policies) {
      console.log('\n🔒 RLS POLICIES:');
      console.table(policies);
    }
    
    console.log('\n🎉 SPRAWDZENIE ZAKOŃCZONE!');
    
  } catch (error) {
    console.error('💥 Błąd sprawdzania:', error.message);
  }
}

checkFilesTables();