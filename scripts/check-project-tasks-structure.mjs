import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking project_tasks table structure...\n');

async function checkTableStructure() {
  try {
    // 1. Check columns
    console.log('📊 STEP 1: Checking columns in project_tasks');
    const { data: columns, error: colError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name, 
          data_type, 
          udt_name,
          column_default,
          is_nullable
        FROM information_schema.columns
        WHERE table_name = 'project_tasks'
        ORDER BY ordinal_position;
      `
    });

    if (colError) {
      // Try alternative method
      console.log('⚠️ RPC not available, using direct query...\n');
      
      const { data: tasks, error: taskError } = await supabase
        .from('project_tasks')
        .select('*')
        .limit(1);
      
      if (taskError) {
        console.error('❌ Error:', taskError);
        return;
      }
      
      if (tasks && tasks.length > 0) {
        console.log('✅ Sample row from project_tasks:');
        console.log(JSON.stringify(tasks[0], null, 2));
        console.log('\n📋 Column names:');
        Object.keys(tasks[0]).forEach(key => {
          console.log(`  - ${key}: ${typeof tasks[0][key]}`);
        });
      }
    } else {
      console.log('✅ Columns found:', columns);
    }

    // 2. Check for ENUM types
    console.log('\n📊 STEP 2: Checking for ENUM types (priority, status, etc.)');
    const { data: enums, error: enumError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          t.typname AS enum_name,
          array_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname LIKE '%task%' OR t.typname LIKE '%priority%' OR t.typname LIKE '%status%'
        GROUP BY t.typname
        ORDER BY t.typname;
      `
    });

    if (!enumError && enums) {
      console.log('✅ ENUM types found:');
      enums.forEach(e => {
        console.log(`  - ${e.enum_name}: [${e.enum_values.join(', ')}]`);
      });
    } else {
      console.log('⚠️ Could not fetch ENUM types directly');
    }

    // 3. Check existing columns that we plan to add
    console.log('\n📊 STEP 3: Checking if new columns already exist');
    const newColumns = [
      'photos', 'materials', 'checklist', 
      'calculated_cost', 'hourly_rate', 
      'is_template', 'template_name', 'template_category',
      'before_photos', 'after_photos', 
      'client_signature_url', 'client_signed_at'
    ];

    const { data: existingCols, error: existError } = await supabase
      .from('project_tasks')
      .select(newColumns.join(','))
      .limit(1);

    if (existError) {
      console.log('⚠️ Some columns do not exist yet (expected before migration):');
      console.log('  Error:', existError.message);
    } else {
      console.log('✅ These new columns ALREADY exist:');
      if (existingCols && existingCols.length > 0) {
        Object.keys(existingCols[0]).forEach(col => {
          console.log(`  - ${col}`);
        });
      }
    }

    // 4. Check if communication_projects exists
    console.log('\n📊 STEP 4: Checking communication_projects table');
    const { data: projects, error: projError } = await supabase
      .from('communication_projects')
      .select('id')
      .limit(1);

    if (projError) {
      console.error('❌ communication_projects table error:', projError.message);
    } else if (projects && projects.length > 0) {
      console.log('✅ communication_projects exists, first project ID:', projects[0].id);
    } else {
      console.log('⚠️ communication_projects exists but is EMPTY');
    }

    // 5. Check for estimated_hours column
    console.log('\n📊 STEP 5: Checking estimated_hours column');
    const { data: hoursCheck, error: hoursError } = await supabase
      .from('project_tasks')
      .select('estimated_hours')
      .limit(1);

    if (hoursError) {
      console.log('⚠️ estimated_hours column does NOT exist');
    } else {
      console.log('✅ estimated_hours column exists');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkTableStructure().then(() => {
  console.log('\n✅ Structure check complete!');
  process.exit(0);
});
