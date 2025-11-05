import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n🔍 Sprawdzam strukturę tabeli project_tasks...\n');

// Sprawdź czy nowe kolumny istnieją
const { data, error } = await supabase
  .from('project_tasks')
  .select('*')
  .limit(1);

if (error) {
  console.error('❌ Błąd:', error.message);
  process.exit(1);
}

const task = data[0] || {};

// Lista kolumn RAPP.NL
const requiredColumns = [
  'photos',
  'materials', 
  'checklist',
  'calculated_cost',
  'hourly_rate',
  'is_template',
  'template_name',
  'template_category',
  'before_photos',
  'after_photos',
  'client_signature_url',
  'client_signed_at'
];

console.log('📋 Kolumny RAPP.NL:\n');

let missingColumns = [];

requiredColumns.forEach(col => {
  const exists = col in task;
  const status = exists ? '✅' : '❌';
  console.log(`   ${status} ${col}`);
  if (!exists) missingColumns.push(col);
});

console.log('\n');

if (missingColumns.length > 0) {
  console.log('⚠️  BRAKUJĄCE KOLUMNY:');
  missingColumns.forEach(col => console.log(`   - ${col}`));
  console.log('\n❌ Musisz wykonać migrację SQL!\n');
  console.log('📄 Plik: database-migrations/20251030_2200_01_schema_rapp_style.sql');
  console.log('🔧 Kopiuj zawartość do Supabase Dashboard → SQL Editor → RUN\n');
} else {
  console.log('✅ Wszystkie kolumny RAPP.NL istnieją!\n');
  
  // Sprawdź szablony
  const { data: templates, error: templatesError } = await supabase
    .from('project_tasks')
    .select('template_name, template_category, calculated_cost')
    .eq('is_template', true);
  
  if (!templatesError && templates.length > 0) {
    console.log(`📋 Znaleziono ${templates.length} szablonów:\n`);
    templates.forEach(t => {
      console.log(`   • ${t.template_name} (${t.template_category}) - €${t.calculated_cost}`);
    });
    console.log('\n✅ Baza danych gotowa do użycia!\n');
  } else {
    console.log('⚠️  Brak szablonów - uruchom: node scripts/insert-task-templates.mjs\n');
  }
}
