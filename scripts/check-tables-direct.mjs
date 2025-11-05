import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Używamy service role

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTablesDirectly() {
  console.log('🔍 Sprawdzanie tabel bezpośrednio przez SQL...\n');

  try {
    // Sprawdź istniejącą tabelę która na pewno istnieje
    console.log('📋 Test dostępu do istniejącej tabeli (profiles):');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.log('❌ Błąd dostępu do profiles:', profilesError.message);
    } else {
      console.log('✅ profiles dostępna, rekordów:', profiles?.length || 0);
    }

    // Sprawdź project_files bezpośrednio
    console.log('\n📋 Test dostępu do project_files:');
    const { data: projectFiles, error: projectFilesError } = await supabase
      .from('project_files')
      .select('*')
      .limit(1);

    if (projectFilesError) {
      console.log('❌ Błąd dostępu do project_files:', projectFilesError.message);
    } else {
      console.log('✅ project_files dostępna! Rekordów:', projectFiles?.length || 0);
    }

    // Sprawdź task_attachments (ta tabela działała w teście)
    console.log('\n� Test dostępu do task_attachments:');
    const { data: taskFiles, error: taskError } = await supabase
      .from('task_attachments')
      .select('*')
      .limit(1);

    if (taskError) {
      console.log('❌ Błąd dostępu do task_attachments:', taskError.message);
    } else {
      console.log('✅ task_attachments dostępna, rekordów:', taskFiles?.length || 0);
    }

    // Sprawdź event_attachments
    console.log('\n📋 Test dostępu do event_attachments:');
    const { data: eventFiles, error: eventError } = await supabase
      .from('event_attachments')
      .select('*')
      .limit(1);

    if (eventError) {
      console.log('❌ Błąd dostępu do event_attachments:', eventError.message);
    } else {
      console.log('✅ event_attachments dostępna, rekordów:', eventFiles?.length || 0);
    }

  } catch (error) {
    console.error('❌ Błąd podczas sprawdzania:', error.message);
  }
}

checkTablesDirectly();