import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createProjectFilesManually() {
  console.log('🚀 Ręczne tworzenie project_files przez Supabase client...\n');

  try {
    // Metoda: Ręczne dodanie kolumn do istniejącej tabeli
    // 1. Sprawdź jakie RPC functions istnieją w systemie
    console.log('📋 Sprawdzam dostępne funkcje RPC...');
    
    // Spróbuj różne metody tworzenia tabeli
    console.log('\n🔧 Próba 1: Przez prosty SQL w edge function...');
    
    // Może użyjmy fetch do raw SQL API Supabase
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const baseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
    
    const response = await fetch(`${baseUrl}/rest/v1/rpc/pg_stat_user_tables`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const tables = await response.json();
      console.log('✅ Dostępne tabele:', tables.map(t => t.relname));
      
      if (tables.some(t => t.relname === 'project_files')) {
        console.log('✅ project_files już istnieje!');
      } else {
        console.log('❌ project_files nie istnieje');
      }
    } else {
      console.log('❌ Nie można pobrać listy tabel:', response.statusText);
    }

    // Metoda 2: Spróbuj przez storage API - może bucket wywołuje tworzenie tabeli?
    console.log('\n🔧 Próba 2: Stwórz bucket project-files w storage...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Błąd listowania buckets:', bucketsError.message);
    } else {
      console.log('📦 Istniejące buckets:', buckets.map(b => b.name));
      
      if (!buckets.some(b => b.name === 'project-files')) {
        console.log('📦 Tworzę bucket project-files...');
        const { data: newBucket, error: createError } = await supabase.storage.createBucket('project-files', {
          public: false,
          fileSizeLimit: 50 * 1024 * 1024, // 50MB
          allowedMimeTypes: ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.*']
        });
        
        if (createError) {
          console.log('❌ Błąd tworzenia bucket:', createError.message);
        } else {
          console.log('✅ Bucket project-files utworzony');
        }
      }
    }

    // Metoda 3: Użyj task_attachments jako wzór i skopiuj strukturę
    console.log('\n🔧 Próba 3: Bazuj na task_attachments...');
    
    // Sprawdź dokładną strukturę task_attachments
    const { data: taskAttachments, error: taskError } = await supabase
      .from('task_attachments')
      .select('*')
      .limit(1);
      
    if (taskError) {
      console.log('❌ Błąd dostępu do task_attachments:', taskError.message);
    } else {
      console.log('✅ task_attachments dostępna, struktura:', Object.keys(taskAttachments[0] || {}));
      
      // Sprawdź czy można wstawić testowy rekord
      console.log('\n🧪 Test wstawiania do task_attachments...');
      const { data: insertTest, error: insertError } = await supabase
        .from('task_attachments')
        .insert({
          task_id: 'test-task-id',
          uploaded_by: 'test-user-id',
          file_name: 'test.txt',
          file_size: 1024,
          storage_path: 'test/test.txt',
          description: 'Test file'
        })
        .select()
        .single();
        
      if (insertError) {
        console.log('❌ Błąd wstawiania do task_attachments:', insertError.message);
      } else {
        console.log('✅ Wstawienie do task_attachments działa');
        
        // Usuń testowy rekord
        await supabase.from('task_attachments').delete().eq('id', insertTest.id);
        console.log('🧹 Testowy rekord usunięty');
      }
    }

  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
  }
}

createProjectFilesManually();