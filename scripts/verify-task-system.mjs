#!/usr/bin/env node

// ============================================
// SCRIPT: Weryfikacja po migracji
// Purpose: Sprawdzenie czy system zadań działa
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, serviceKey);

async function verifyTaskSystem() {
  console.log('🔍 Weryfikuję system zadań po migracji...\n');
  
  try {
    // 1. Sprawdź czy tabele zostały utworzone
    console.log('📋 SPRAWDZAM TABELE:');
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['project_tasks', 'task_comments', 'task_attachments']);
    
    console.log(`✅ Tabele zadań: ${tables?.map(t => t.table_name).join(', ')}`);
    
    // 2. Sprawdź ENUM types
    console.log('\n🏷️ SPRAWDZAM ENUM TYPES:');
    const { data: enums } = await supabase
      .rpc('exec', {
        sql: `
          SELECT typname as enum_name, 
                 array_agg(enumlabel ORDER BY enumsortorder) as values
          FROM pg_type t 
          JOIN pg_enum e ON t.oid = e.enumtypid 
          WHERE typname IN ('task_status', 'task_priority')
          GROUP BY typname;
        `
      });
    
    console.log('✅ ENUM types:');
    enums?.forEach(e => {
      console.log(`  - ${e.enum_name}: ${e.values.join(', ')}`);
    });
    
    // 3. Sprawdź istniejące projekty
    console.log('\n🏗️ SPRAWDZAM PROJEKTY:');
    const { data: projects } = await supabase
      .from('communication_projects')
      .select('id, name, created_by')
      .limit(5);
    
    console.log(`✅ Projekty komunikacyjne: ${projects?.length || 0}`);
    projects?.forEach(p => {
      console.log(`  - ${p.name} (ID: ${p.id.substring(0,8)}...)`);
    });
    
    // 4. Sprawdź użytkowników
    console.log('\n👥 SPRAWDZAM UŻYTKOWNIKÓW:');
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(5);
    
    console.log(`✅ Użytkownicy: ${users?.length || 0}`);
    users?.forEach(u => {
      console.log(`  - ${u.email} [${u.role}]`);
    });
    
    // 5. Sprawdź zadania
    console.log('\n📝 SPRAWDZAM ZADANIA:');
    const { data: tasks } = await supabase
      .from('project_tasks')
      .select('title, status, priority, created_at')
      .limit(10);
    
    console.log(`✅ Zadania: ${tasks?.length || 0}`);
    tasks?.forEach(t => {
      console.log(`  - ${t.title} [${t.status}/${t.priority}]`);
    });
    
    // 6. Sprawdź project_members
    console.log('\n👨‍💼 SPRAWDZAM CZŁONKÓW PROJEKTÓW:');
    const { data: members } = await supabase
      .from('project_members')
      .select('project_id, user_id, role')
      .limit(5);
    
    console.log(`✅ Członkowie projektów: ${members?.length || 0}`);
    members?.forEach(m => {
      console.log(`  - Projekt: ${m.project_id.substring(0,8)}... | User: ${m.user_id.substring(0,8)}... | Role: ${m.role}`);
    });
    
    // 7. Test wstawienia zadania
    if (projects && projects.length > 0 && users && users.length > 0) {
      console.log('\n🧪 TESTUJĘ TWORZENIE ZADANIA:');
      
      const testProject = projects[0];
      const testUser = users.find(u => u.role === 'employer') || users[0];
      
      const { data: newTask, error: taskError } = await supabase
        .from('project_tasks')
        .insert({
          project_id: testProject.id,
          title: 'Test Task - Verification',
          description: 'Zadanie testowe utworzone podczas weryfikacji systemu',
          status: 'not_started',
          priority: 'medium',
          created_by: testUser.id,
          tags: ['test', 'verification']
        })
        .select()
        .single();
      
      if (taskError) {
        console.log(`❌ Błąd tworzenia zadania: ${taskError.message}`);
      } else {
        console.log(`✅ Zadanie testowe utworzone: ${newTask.title}`);
        
        // Sprawdź czy można pobrać zadanie
        const { data: fetchedTask } = await supabase
          .from('project_tasks')
          .select('*')
          .eq('id', newTask.id)
          .single();
          
        if (fetchedTask) {
          console.log(`✅ Zadanie można pobrać przez API`);
        }
      }
    }
    
    console.log('\n🎯 PODSUMOWANIE:');
    console.log(`- Tabele: ✅ ${tables?.length || 0}/3`);
    console.log(`- Projekty: ${projects?.length || 0}`);
    console.log(`- Użytkownicy: ${users?.length || 0}`);
    console.log(`- Zadania: ${tasks?.length || 0}`);
    console.log(`- Członkowie: ${members?.length || 0}`);
    
    if (tasks && tasks.length > 0) {
      console.log('\n🚀 SYSTEM ZADAŃ DZIAŁA! Można tworzyć interfejs.');
    } else if (projects && projects.length > 0) {
      console.log('\n⚠️ Brak danych testowych - trzeba utworzyć przykładowe zadania.');
    } else {
      console.log('\n⚠️ Brak projektów - trzeba utworzyć przykładowy projekt.');
    }
    
  } catch (e) {
    console.error('💥 Błąd weryfikacji:', e.message);
  }
}

// Uruchom weryfikację
verifyTaskSystem();