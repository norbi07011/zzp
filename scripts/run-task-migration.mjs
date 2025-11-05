#!/usr/bin/env node

// ============================================
// SCRIPT: Wykonanie migracji systemu zadań
// Purpose: Uruchomienie SQL migracji w Supabase
// ============================================

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, serviceKey);

async function executeMigration() {
  console.log('🚀 Uruchamiam migrację systemu zadań...');
  
  try {
    // Wczytaj plik migracji
    const migrationSQL = fs.readFileSync('database-migrations/20251029_1245_create_task_system.sql', 'utf8');
    
    // Wykonaj migrację
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Błąd podczas migracji:', error);
      return false;
    }
    
    console.log('✅ Migracja wykonana pomyślnie!');
    
    // Sprawdź czy tabele zostały utworzone
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['project_tasks', 'task_comments', 'task_attachments']);
    
    console.log(`📋 Utworzone tabele: ${tables?.map(t => t.table_name).join(', ')}`);
    
    // Sprawdź przykładowe dane
    const { data: sampleTasks } = await supabase
      .from('project_tasks')
      .select('title, status, priority')
      .limit(5);
    
    console.log(`📝 Przykładowe zadania: ${sampleTasks?.length || 0}`);
    sampleTasks?.forEach(task => {
      console.log(`  - ${task.title} [${task.status}/${task.priority}]`);
    });
    
    return true;
    
  } catch (e) {
    console.error('💥 Wyjątek podczas migracji:', e.message);
    return false;
  }
}

// Uruchom migrację
executeMigration()
  .then(success => {
    if (success) {
      console.log('\n🎯 SYSTEM ZADAŃ GOTOWY!');
      console.log('Możesz teraz tworzyć interfejs użytkownika.');
    } else {
      console.log('\n❌ Migracja nie powiodła się. Sprawdź błędy powyżej.');
    }
  })
  .catch(console.error);