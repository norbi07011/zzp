#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  console.log('🔍 Sprawdzam strukturę tabeli project_tasks...\n');

  // Get column info using simple SELECT
  const { data: sampleRow, error: sampleError } = await supabase
    .from('project_tasks')
    .select('*')
    .limit(1)
    .single();

  if (sampleError && sampleError.code !== 'PGRST116') { // Not "no rows" error
    console.error('❌ Błąd:', sampleError.message);
    return;
  }

  console.log('📋 Kolumny w project_tasks:');
  if (sampleRow) {
    const columns = Object.keys(sampleRow);
    columns.sort();
    
    columns.forEach(col => {
      const value = sampleRow[col];
      const type = typeof value;
      console.log(`  • ${col} (${type}): ${value === null ? 'NULL' : JSON.stringify(value).substring(0, 50)}`);
    });
  }

  console.log('\n🔍 Sprawdzam kluczowe kolumny dla formularza:');
  
  const checkCols = [
    'created_by',
    'due_date', 
    'estimated_hours',
    'hourly_rate',
    'materials',
    'checklist',
    'photos'
  ];

  checkCols.forEach(col => {
    if (sampleRow && col in sampleRow) {
      console.log(`  ✅ ${col} - exists`);
    } else {
      console.log(`  ❌ ${col} - MISSING!`);
    }
  });

  // Try to create a minimal task to see what fails
  console.log('\n🧪 Test tworzenia minimalnego zadania...');
  
  const testTask = {
    project_id: '00000000-0000-0000-0000-000000000000', // Fake UUID
    title: 'TEST',
    status: 'not_started',
    priority: 'medium',
    is_subtask: false,
    progress_percentage: 0,
    is_recurring: false,
    requires_photo_proof: false,
    risk_level: 'low',
    created_by: 'e15f1bef-4268-49c4-ad4f-788494342b9d' // Real user from test
  };

  const { data: testData, error: testError } = await supabase
    .from('project_tasks')
    .insert([testTask])
    .select();

  if (testError) {
    console.log('❌ Błąd przy INSERT:');
    console.log('   Code:', testError.code);
    console.log('   Message:', testError.message);
    console.log('   Details:', testError.details);
    console.log('   Hint:', testError.hint);
  } else {
    console.log('✅ INSERT zadziałał!');
    console.log('   Created task ID:', testData[0].id);
    
    // Clean up test task
    await supabase
      .from('project_tasks')
      .delete()
      .eq('id', testData[0].id);
    console.log('   (Test task deleted)');
  }
}

checkColumns().catch(console.error);
