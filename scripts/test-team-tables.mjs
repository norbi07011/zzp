import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  console.log('\n===== TEST: Czy tabele istnieją? =====\n');

  // Test 1: project_chat_groups
  console.log('1. project_chat_groups:');
  const { data: chat1, error: err1 } = await supabase
    .from('project_chat_groups')
    .select('*')
    .limit(1);
  
  if (err1) {
    console.log('   ❌ BŁĄD:', err1.message);
  } else {
    console.log('   ✅ Istnieje, rekordów:', chat1?.length || 0);
  }

  // Test 2: team_members
  console.log('\n2. team_members:');
  const { data: chat2, error: err2 } = await supabase
    .from('team_members')
    .select('*')
    .limit(1);
  
  if (err2) {
    console.log('   ❌ BŁĄD:', err2.message);
  } else {
    console.log('   ✅ Istnieje, rekordów:', chat2?.length || 0);
  }

  // Test 3: communication_project_members
  console.log('\n3. communication_project_members:');
  const { data: chat3, error: err3 } = await supabase
    .from('communication_project_members')
    .select('*')
    .limit(1);
  
  if (err3) {
    console.log('   ❌ BŁĄD:', err3.message);
  } else {
    console.log('   ✅ Istnieje, rekordów:', chat3?.length || 0);
  }

  // Test 4: project_members
  console.log('\n4. project_members:');
  const { data: chat4, error: err4 } = await supabase
    .from('project_members')
    .select('*')
    .limit(1);
  
  if (err4) {
    console.log('   ❌ BŁĄD:', err4.message);
  } else {
    console.log('   ✅ Istnieje, rekordów:', chat4?.length || 0);
  }

  // Test 5: project_chat_messages
  console.log('\n5. project_chat_messages:');
  const { data: chat5, error: err5 } = await supabase
    .from('project_chat_messages')
    .select('*')
    .limit(1);
  
  if (err5) {
    console.log('   ❌ BŁĄD:', err5.message);
  } else {
    console.log('   ✅ Istnieje, rekordów:', chat5?.length || 0);
  }
}

testTables();
