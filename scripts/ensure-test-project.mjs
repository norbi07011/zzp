#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestProject() {
  console.log('🔍 Sprawdzam communication_projects...\n');

  // Check existing projects
  const { data: existing, error: checkError } = await supabase
    .from('communication_projects')
    .select('id, name, owner_id, created_at')
    .order('created_at', { ascending: false });

  if (checkError) {
    console.error('❌ Błąd:', checkError.message);
    return;
  }

  if (existing && existing.length > 0) {
    console.log(`✅ Znaleziono ${existing.length} projektów w communication_projects:\n`);
    existing.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Owner: ${p.owner_id}`);
      console.log(`   Utworzono: ${p.created_at}\n`);
    });
    return;
  }

  console.log('❌ BRAK PROJEKTÓW w communication_projects!');
  console.log('📝 Tworzę testowy projekt...\n');

  // Get current user (from existing data)
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email')
    .limit(1)
    .single();

  if (!users) {
    console.log('❌ Brak użytkownika w bazie - musisz się najpierw zalogować!');
    return;
  }

  // Create test project
  const testProject = {
    name: 'Testowy Projekt - Budowa',
    description: 'Projekt testowy do sprawdzenia systemu zadań',
    owner_id: users.id,
    status: 'active',
    start_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: newProject, error: createError } = await supabase
    .from('communication_projects')
    .insert([testProject])
    .select()
    .single();

  if (createError) {
    console.log('❌ Błąd przy tworzeniu projektu:');
    console.log('   Code:', createError.code);
    console.log('   Message:', createError.message);
    return;
  }

  console.log('✅ Projekt utworzony pomyślnie!');
  console.log(`   ID: ${newProject.id}`);
  console.log(`   Nazwa: ${newProject.name}`);
  console.log(`   Owner: ${newProject.owner_id}\n`);

  console.log('🎉 Teraz możesz tworzyć zadania w tym projekcie!');
}

createTestProject().catch(console.error);
