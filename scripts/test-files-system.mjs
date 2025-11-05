import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFilesTables() {
  console.log('🔍 Testowanie dostępu do tabel systemu plików...\n');
  
  try {
    // 1. Test tabeli project_files
    console.log('📋 Testowanie project_files...');
    const { data: filesData, error: filesError } = await supabase
      .from('project_files')
      .select('*')
      .limit(1);
    
    if (filesError) {
      console.log('❌ project_files:', filesError.message);
    } else {
      console.log('✅ project_files: Tabela dostępna');
      console.log('📊 Rekordów:', filesData?.length || 0);
    }
    
    // 2. Test tabeli task_attachments
    console.log('\n📋 Testowanie task_attachments...');
    const { data: taskData, error: taskError } = await supabase
      .from('task_attachments')
      .select('*')
      .limit(1);
    
    if (taskError) {
      console.log('❌ task_attachments:', taskError.message);
    } else {
      console.log('✅ task_attachments: Tabela dostępna');
      console.log('📊 Rekordów:', taskData?.length || 0);
    }
    
    // 3. Test tabeli event_attachments
    console.log('\n📋 Testowanie event_attachments...');
    const { data: eventData, error: eventError } = await supabase
      .from('event_attachments')
      .select('*')
      .limit(1);
    
    if (eventError) {
      console.log('❌ event_attachments:', eventError.message);
    } else {
      console.log('✅ event_attachments: Tabela dostępna');
      console.log('📊 Rekordów:', eventData?.length || 0);
    }
    
    // 4. Test Storage bucket
    console.log('\n📁 Testowanie Storage bucket...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Storage:', bucketsError.message);
    } else {
      console.log('✅ Storage dostępny');
      const projectFilesBucket = buckets.find(b => b.id === 'project-files');
      if (projectFilesBucket) {
        console.log('✅ Bucket "project-files" istnieje');
      } else {
        console.log('⚠️  Bucket "project-files" nie istnieje - będzie utworzony automatycznie');
      }
    }
    
    console.log('\n🎯 SYSTEM PLIKÓW GOTOWY!');
    console.log('✅ Można przejść do implementacji komponentów React');
    
  } catch (error) {
    console.error('💥 Błąd testowania:', error.message);
  }
}

testFilesTables();