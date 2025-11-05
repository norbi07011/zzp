import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n🧹 Usuwam duplikaty szablonów...\n');

// Pobierz wszystkie szablony
const { data: templates, error } = await supabase
  .from('project_tasks')
  .select('id, template_name, template_category, created_at')
  .eq('is_template', true)
  .order('created_at', { ascending: true });

if (error) {
  console.error('❌ Błąd:', error.message);
  process.exit(1);
}

console.log(`📋 Znaleziono ${templates.length} szablonów\n`);

// Grupuj po nazwie i kategorii
const groups = {};
templates.forEach(t => {
  const key = `${t.template_name}-${t.template_category}`;
  if (!groups[key]) {
    groups[key] = [];
  }
  groups[key].push(t);
});

// Usuń duplikaty (zachowaj pierwszy, usuń resztę)
let deletedCount = 0;
for (const [key, group] of Object.entries(groups)) {
  if (group.length > 1) {
    console.log(`🔍 ${group[0].template_name}: ${group.length} duplikatów`);
    
    // Zachowaj pierwszy (najstarszy), usuń resztę
    const toDelete = group.slice(1);
    
    for (const duplicate of toDelete) {
      const { error: deleteError } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', duplicate.id);
      
      if (deleteError) {
        console.log(`   ❌ Błąd usuwania ${duplicate.id}: ${deleteError.message}`);
      } else {
        console.log(`   ✅ Usunięto duplikat ${duplicate.id}`);
        deletedCount++;
      }
    }
  }
}

console.log(`\n📊 Podsumowanie:`);
console.log(`   Usunięto: ${deletedCount} duplikatów`);

// Sprawdź końcowy stan
const { data: finalTemplates } = await supabase
  .from('project_tasks')
  .select('template_name, template_category, calculated_cost')
  .eq('is_template', true);

console.log(`\n✅ Pozostało ${finalTemplates.length} unikalnych szablonów:\n`);
finalTemplates.forEach(t => {
  console.log(`   • ${t.template_name} (${t.template_category}) - €${t.calculated_cost}`);
});

console.log('\n✅ Gotowe!\n');
