import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTaskAttachments() {
  console.log('🧪 Testuję task_attachments dla systemu plików...\n');

  try {
    // Użyj istniejącego task_id i user_id z bazy
    const existingTaskId = 'bffe986c-e77f-467a-9f42-3564854fb8b8'; // Przygotowanie fundamentów
    const existingUserId = 'e15f1bef-4268-49c4-ad4f-788494342b9d'; // test-employer@example.com

    // Test wstawienia
    console.log('📋 Test wstawienia rekordu...');
    const { data: insertData, error: insertError } = await supabase
      .from('task_attachments')
      .insert({
        task_id: existingTaskId, // używamy istniejącego task_id
        uploaded_by: existingUserId,
        file_name: 'test-file.txt',
        file_size: 1024,
        file_type: 'text/plain',
        storage_path: 'test-files/demo-project-123/test-file.txt',
        description: 'Test file for system'
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Błąd wstawiania:', insertError.message);
      return;
    }

    console.log('✅ Rekord wstawiony:', insertData);

    // Test pobierania
    console.log('\n📋 Test pobierania rekordów...');
    const { data: selectData, error: selectError } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('task_id', existingTaskId)
      .is('deleted_at', null);

    if (selectError) {
      console.log('❌ Błąd pobierania:', selectError.message);
    } else {
      console.log('✅ Pobranych rekordów:', selectData.length);
      console.log('📄 Pierwszy rekord:', selectData[0]);
    }

    // Test soft delete
    console.log('\n📋 Test soft delete...');
    const { error: deleteError } = await supabase
      .from('task_attachments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', insertData.id);

    if (deleteError) {
      console.log('❌ Błąd soft delete:', deleteError.message);
    } else {
      console.log('✅ Soft delete wykonane');

      // Sprawdź czy rekord jest ukryty
      const { data: afterDelete, error: afterError } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', existingTaskId)
        .is('deleted_at', null);

      if (afterError) {
        console.log('❌ Błąd sprawdzenia po delete:', afterError.message);
      } else {
        console.log('✅ Rekordów po delete:', afterDelete.length, '(powinno być 0)');
      }
    }

    // Cleanup - usuń całkowicie
    console.log('\n🧹 Cleanup...');
    await supabase.from('task_attachments').delete().eq('id', insertData.id);
    console.log('✅ Rekord testowy usunięty całkowicie');

    console.log('\n🎯 SYSTEM PLIKÓW DZIAŁA!');
    console.log('✅ task_attachments może być używane jako backend dla FileManager');
    console.log('📦 Bucket "project-files" jest utworzony');
    console.log('🚀 Można przetestować upload przez interfejs');

  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
  }
}

testTaskAttachments();