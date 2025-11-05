import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24ta2V5IiwiaWF0IjoxNzU5Nzg1MzMwLCJleHAiOjIwNzUzNjEzMzB9.fzHqVCTmAzHKhf1RMZCHwYRaQm-Fv7aHy0wD7r7K3Tw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
  console.log('🔍 SPRAWDZAM KOMPLETNĄ STRUKTURĘ BAZY DANYCH...\n');

  console.log('📊 TABELE ZWIĄZANE Z PROJEKTAMI:\n');
  
  // Sprawdź projects
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .limit(1);
    
  if (!projectsError && projectsData && projectsData.length > 0) {
    console.log('✅ Tabela: projects');
    console.log('   Kolumny:', Object.keys(projectsData[0]).join(', '));
  } else {
    console.log('⚠️  Tabela: projects - brak danych lub błąd');
  }

  // Sprawdź project_tasks
  const { data: tasksData, error: tasksError } = await supabase
    .from('project_tasks')
    .select('*')
    .limit(1);
    
  if (!tasksError && tasksData && tasksData.length > 0) {
    console.log('\n✅ Tabela: project_tasks');
    console.log('   Kolumny:', Object.keys(tasksData[0]).join(', '));
  } else {
    console.log('\n⚠️  Tabela: project_tasks - brak danych lub błąd');
  }

  // Sprawdź project_members
  const { data: membersData, error: membersError } = await supabase
    .from('project_members')
    .select('*')
    .limit(1);
    
  if (!membersError && membersData && membersData.length > 0) {
    console.log('\n✅ Tabela: project_members');
    console.log('   Kolumny:', Object.keys(membersData[0]).join(', '));
  } else {
    console.log('\n⚠️  Tabela: project_members - brak danych lub błąd');
  }

  // Sprawdź project_notifications
  const { data: notifData, error: notifError } = await supabase
    .from('project_notifications')
    .select('*')
    .limit(1);
    
  if (!notifError && notifData && notifData.length > 0) {
    console.log('\n✅ Tabela: project_notifications');
    console.log('   Kolumny:', Object.keys(notifData[0]).join(', '));
  } else {
    console.log('\n⚠️  Tabela: project_notifications - brak danych lub błąd');
  }

  // Sprawdź jakie tabele już istnieją
  console.log('\n\n🔍 SPRAWDZAM KTÓRE TABELE JUŻ ISTNIEJĄ...\n');
  
  const tablesToCheck = [
    'project_events',
    'project_event_attendees', 
    'chat_channels',
    'chat_channel_members',
    'chat_messages',
    'task_checklist_items',
    'task_dependencies',
    'task_comments',
    'project_files',
    'project_documents',
    'project_resources',
    'project_milestones',
    'project_budgets',
    'project_timesheets',
    'project_automation_rules',
    'team_availability',
    'team_permissions'
  ];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(0);
    
    if (error) {
      console.log(`❌ ${table} - NIE ISTNIEJE`);
    } else {
      console.log(`✅ ${table} - ISTNIEJE`);
    }
  }

  // Sprawdź ENUM types
  console.log('\n\n🔍 SPRAWDZAM ENUM TYPES...\n');
  
  const enumTypes = [
    'task_status',
    'task_priority',
    'event_type',
    'channel_type',
    'resource_status',
    'automation_trigger'
  ];

  // Nie możemy bezpośrednio sprawdzić ENUM przez Supabase client
  // ale możemy spróbować utworzyć tabelę testową
  console.log('ℹ️  ENUM types trzeba sprawdzić w Supabase SQL Editor:');
  console.log('SELECT typname FROM pg_type WHERE typtype = \'e\' ORDER BY typname;');

  console.log('\n\n✅ ANALIZA ZAKOŃCZONA!\n');
  console.log('📋 TERAZ WKLEJ TEN OUTPUT I POKAŻĘ CI DOKŁADNĄ MIGRACJĘ\n');
}

checkDatabaseStructure().catch(console.error);
