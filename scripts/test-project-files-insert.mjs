import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestRecord() {
  console.log('🧪 Próbuję utworzyć rekord testowy w project_files...\n');

  try {
    // Spróbuj wstawić rekord testowy
    const { data: insertData, error: insertError } = await supabase
      .from('project_files')
      .insert({
        project_id: 'test-project-id',
        original_name: 'test-file.txt',
        storage_path: 'test-path/test-file.txt',
        file_size: 1024,
        file_type: 'document',
        mime_type: 'text/plain',
        uploaded_by: 'test-user-id'
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Błąd wstawiania:', insertError.message);
      console.log('💡 Szczegóły błędu:', insertError);
    } else {
      console.log('✅ Rekord testowy utworzony!');
      console.log('📄 Dane:', insertData);
      
      // Teraz spróbuj go pobrać
      console.log('\n🔍 Sprawdzam czy mogę pobrać rekord...');
      const { data: selectData, error: selectError } = await supabase
        .from('project_files')
        .select('*')
        .eq('id', insertData.id)
        .single();

      if (selectError) {
        console.log('❌ Błąd pobierania:', selectError.message);
      } else {
        console.log('✅ Rekord pobrany:', selectData);
        
        // Usuń rekord testowy
        console.log('\n🧹 Usuwam rekord testowy...');
        const { error: deleteError } = await supabase
          .from('project_files')
          .delete()
          .eq('id', insertData.id);

        if (deleteError) {
          console.log('❌ Błąd usuwania:', deleteError.message);
        } else {
          console.log('✅ Rekord testowy usunięty');
        }
      }
    }

  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
  }
}

createTestRecord();