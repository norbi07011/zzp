#!/usr/bin/env node

// ============================================
// SCRIPT: Tworzenie danych testowych
// Purpose: Utworzenie przykładowego projektu i zadań
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, serviceKey);

async function createTestData() {
  console.log('🏗️ Tworzę dane testowe dla systemu zadań...\n');
  
  try {
    // 1. Pobierz użytkowników
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, role');
    
    const employer = users?.find(u => u.role === 'employer');
    const worker = users?.find(u => u.role === 'worker');
    const accountant = users?.find(u => u.role === 'accountant');
    
    if (!employer) {
      console.log('❌ Brak użytkownika employer');
      return;
    }
    
    console.log(`👨‍💼 Employer: ${employer.email}`);
    console.log(`👨‍🔧 Worker: ${worker?.email || 'BRAK'}`);
    console.log(`📊 Accountant: ${accountant?.email || 'BRAK'}`);
    
    // 2. Utwórz projekt demonstracyjny
    console.log('\n🏗️ Tworzę projekt demonstracyjny...');
    
    const { data: project, error: projectError } = await supabase
      .from('communication_projects')
      .insert({
        name: 'Demo Building Project - Amsterdam',
        description: 'Projekt demonstracyjny dla systemu zarządzania zadaniami budowlanymi. Budowa nowego kompleksu mieszkaniowego.',
        created_by: employer.id
      })
      .select()
      .single();
    
    if (projectError) {
      console.log(`❌ Błąd tworzenia projektu: ${projectError.message}`);
      return;
    }
    
    console.log(`✅ Projekt utworzony: ${project.name}`);
    console.log(`   ID: ${project.id}`);
    
    // 3. Dodaj członków projektu
    console.log('\n👥 Dodaję członków projektu...');
    
    const members = [
      { project_id: project.id, user_id: employer.id, role: 'supervisor' }
    ];
    
    if (worker) {
      members.push({ project_id: project.id, user_id: worker.id, role: 'worker' });
    }
    
    if (accountant) {
      members.push({ project_id: project.id, user_id: accountant.id, role: 'accountant' });
    }
    
    const { data: memberResults, error: memberError } = await supabase
      .from('project_members')
      .insert(members)
      .select();
    
    if (memberError) {
      console.log(`❌ Błąd dodawania członków: ${memberError.message}`);
    } else {
      console.log(`✅ Dodano ${memberResults?.length} członków projektu`);
    }
    
    // 4. Sprawdź czy tabele zadań istnieją
    console.log('\n📋 Sprawdzam tabele zadań...');
    
    // Test czy table project_tasks istnieje
    const { data: taskTest, error: taskTestError } = await supabase
      .from('project_tasks')
      .select('id')
      .limit(1);
    
    if (taskTestError) {
      console.log(`❌ Tabela project_tasks nie istnieje: ${taskTestError.message}`);
      console.log('🔧 Należy ponownie uruchomić migrację w Supabase SQL Editor');
      return;
    }
    
    console.log('✅ Tabela project_tasks istnieje');
    
    // 5. Utwórz zadania testowe
    console.log('\n📝 Tworzę zadania testowe...');
    
    const testTasks = [
      {
        project_id: project.id,
        title: 'Setup building site safety measures',
        description: 'Install safety barriers, warning signs, first aid station and emergency exits according to Dutch safety regulations (Arbowet).',
        status: 'not_started',
        priority: 'high',
        assigned_to: worker?.id || employer.id,
        created_by: employer.id,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // +3 dni
        estimated_hours: 8,
        tags: ['safety', 'setup', 'urgent', 'compliance']
      },
      {
        project_id: project.id,
        title: 'Foundation excavation and inspection',
        description: 'Excavate foundation according to architectural plans. Schedule inspection with gemeente Amsterdam.',
        status: 'not_started',
        priority: 'medium',
        assigned_to: worker?.id || employer.id,
        created_by: employer.id,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 dni
        estimated_hours: 16,
        tags: ['excavation', 'foundation', 'inspection']
      },
      {
        project_id: project.id,
        title: 'Material delivery coordination',
        description: 'Coordinate with suppliers for concrete and steel delivery. Ensure compliance with Amsterdam traffic regulations.',
        status: 'in_progress',
        priority: 'high',
        assigned_to: employer.id,
        created_by: employer.id,
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // +2 dni
        estimated_hours: 4,
        tags: ['logistics', 'materials', 'suppliers']
      },
      {
        project_id: project.id,
        title: 'Building permit verification',
        description: 'Verify all building permits are in order with gemeente Amsterdam. Upload documents to project archive.',
        status: 'review',
        priority: 'urgent',
        assigned_to: accountant?.id || employer.id,
        created_by: employer.id,
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // +1 dzień
        estimated_hours: 2,
        tags: ['permits', 'compliance', 'documentation']
      },
      {
        project_id: project.id,
        title: 'Weekly progress report',
        description: 'Prepare weekly progress report for stakeholders and gemeente. Include photos and safety checklist.',
        status: 'completed',
        priority: 'low',
        assigned_to: employer.id,
        created_by: employer.id,
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // -1 dzień (przeterminowane)
        estimated_hours: 3,
        actual_hours: 2,
        completed_at: new Date().toISOString(),
        progress_percentage: 100,
        tags: ['reporting', 'documentation', 'stakeholders']
      }
    ];
    
    const { data: createdTasks, error: tasksError } = await supabase
      .from('project_tasks')
      .insert(testTasks)
      .select();
    
    if (tasksError) {
      console.log(`❌ Błąd tworzenia zadań: ${tasksError.message}`);
    } else {
      console.log(`✅ Utworzono ${createdTasks?.length} zadań testowych:`);
      createdTasks?.forEach(task => {
        console.log(`   - ${task.title} [${task.status}/${task.priority}]`);
      });
    }
    
    // 6. Dodaj przykładowe komentarze
    if (createdTasks && createdTasks.length > 0) {
      console.log('\n💬 Dodaję przykładowe komentarze...');
      
      const comments = [
        {
          task_id: createdTasks[0].id,
          author_id: employer.id,
          content: 'Pamiętaj o sprawdzeniu wszystkich certyfikatów VCA przed rozpoczęciem prac.'
        },
        {
          task_id: createdTasks[1].id, 
          author_id: worker?.id || employer.id,
          content: 'Grunt wydaje się stabilny, ale będzie potrzebna dodatkowa analiza geotechniczna.'
        }
      ];
      
      const { data: createdComments, error: commentsError } = await supabase
        .from('task_comments')
        .insert(comments)
        .select();
      
      if (commentsError) {
        console.log(`❌ Błąd tworzenia komentarzy: ${commentsError.message}`);
      } else {
        console.log(`✅ Utworzono ${createdComments?.length} komentarzy testowych`);
      }
    }
    
    console.log('\n🎯 PODSUMOWANIE:');
    console.log(`✅ Projekt: ${project.name}`);
    console.log(`✅ Członkowie: ${memberResults?.length || 0}`);
    console.log(`✅ Zadania: ${createdTasks?.length || 0}`);
    console.log(`✅ Komentarze: ${createdTasks ? 2 : 0}`);
    console.log('\n🚀 SYSTEM ZADAŃ GOTOWY DO TESTOWANIA!');
    
  } catch (e) {
    console.error('💥 Błąd tworzenia danych testowych:', e.message);
  }
}

// Uruchom tworzenie danych testowych
createTestData();