#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCreatedByColumn() {
  console.log('🔍 Sprawdzam kolumnę created_by w project_tasks...\n');

  // Check column definition
  const { data: columns, error: colError } = await supabase
    .from('project_tasks')
    .select('*')
    .limit(1);

  if (colError) {
    console.error('❌ Błąd:', colError.message);
    return;
  }

  // Check if created_by exists in actual data
  const { data: tasks, error: taskError } = await supabase
    .from('project_tasks')
    .select('id, title, created_by, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (taskError) {
    console.error('❌ Błąd:', taskError.message);
    return;
  }

  console.log('📋 Ostatnie 5 zadań:');
  tasks.forEach((task, idx) => {
    const hasCreatedBy = task.created_by ? '✅' : '❌';
    console.log(`  ${idx + 1}. ${hasCreatedBy} ${task.title}`);
    console.log(`     created_by: ${task.created_by || 'NULL'}`);
    console.log(`     created_at: ${task.created_at}`);
  });

  // Check for NULL created_by values
  const { data: nullTasks, count } = await supabase
    .from('project_tasks')
    .select('id', { count: 'exact' })
    .is('created_by', null);

  console.log(`\n📊 Zadania z created_by = NULL: ${count || 0}`);

  if (count > 0) {
    console.log('⚠️  Uwaga: Są zadania bez created_by!');
    console.log('   To może powodować błędy przy INSERT (NOT NULL constraint)');
  } else {
    console.log('✅ Wszystkie zadania mają created_by!');
  }
}

checkCreatedByColumn().catch(console.error);
