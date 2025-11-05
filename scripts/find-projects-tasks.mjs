import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findProjectsAndTasks() {
  console.log('🔍 Sprawdzam dostępne projekty i taski...\n');

  try {
    // Sprawdź projekty
    console.log('📋 Dostępne projekty:');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, status')
      .limit(5);

    if (projectsError) {
      console.log('❌ Błąd pobierania projektów:', projectsError.message);
    } else {
      if (projects.length === 0) {
        console.log('⚠️  Brak projektów w bazie');
      } else {
        projects.forEach(project => {
          console.log(`  - ${project.id}: ${project.title} (${project.status})`);
        });
      }
    }

    // Sprawdź taski/zadania (może project_tasks?)
    console.log('\n📋 Sprawdzam tabele z taskami...');
    
    // Spróbuj project_tasks
    const { data: projectTasks, error: ptError } = await supabase
      .from('project_tasks')
      .select('id, title, project_id')
      .limit(3);

    if (ptError) {
      console.log('❌ project_tasks:', ptError.message);
    } else {
      console.log('✅ project_tasks dostępne:', projectTasks.length, 'rekordów');
      if (projectTasks.length > 0) {
        console.log('📄 Przykładowe taski:');
        projectTasks.forEach(task => {
          console.log(`  - ${task.id}: ${task.title} (projekt: ${task.project_id})`);
        });
      }
    }

    // Spróbuj tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title')
      .limit(3);

    if (tasksError) {
      console.log('❌ tasks:', tasksError.message);
    } else {
      console.log('✅ tasks dostępne:', tasks.length, 'rekordów');
      if (tasks.length > 0) {
        console.log('📄 Przykładowe taski:');
        tasks.forEach(task => {
          console.log(`  - ${task.id}: ${task.title || 'Bez tytułu'}`);
        });
      }
    }

    // Sprawdź structure constraint dla task_attachments
    console.log('\n🔍 Sprawdzam foreign key dla task_attachments...');
    const { data: fkInfo, error: fkError } = await supabase
      .rpc('get_foreign_keys', { table_name: 'task_attachments' });

    if (fkError) {
      console.log('❌ Nie można sprawdzić FK:', fkError.message);
    } else {
      console.log('🔗 Foreign keys:', fkInfo);
    }

  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
  }
}

findProjectsAndTasks();