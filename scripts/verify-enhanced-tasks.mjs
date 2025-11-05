import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

console.log('🔍 Weryfikacja rozbudowy systemu Tasks...\n');

async function verifyEnhancedTasks() {
  let allGood = true;

  // Test 1: Sprawdź nowe kolumny
  console.log('1️⃣ Sprawdzam nowe kolumny w project_tasks...');
  
  const { data: task, error: taskError } = await supabase
    .from('project_tasks')
    .select('id, photos, materials, checklist, calculated_cost, hourly_rate, is_template, template_name')
    .limit(1)
    .single();

  if (taskError && !taskError.message.includes('0 rows')) {
    console.log(`   ❌ Błąd: ${taskError.message}`);
    allGood = false;
  } else if (task && 'photos' in task && 'materials' in task && 'checklist' in task) {
    console.log('   ✅ Wszystkie nowe kolumny istnieją!');
  } else {
    console.log('   ⚠️  Kolumny nie zostały jeszcze dodane');
    console.log('   📋 Wykonaj migrację w Supabase Dashboard');
    allGood = false;
  }

  // Test 2: Sprawdź szablony
  console.log('\n2️⃣ Sprawdzam szablony zadań...');
  
  const { data: templates, error: templatesError } = await supabase
    .from('project_tasks')
    .select('template_name, template_category, calculated_cost, materials, checklist')
    .eq('is_template', true);

  if (templatesError) {
    console.log(`   ❌ Błąd: ${templatesError.message}`);
    allGood = false;
  } else if (templates && templates.length > 0) {
    console.log(`   ✅ Znaleziono ${templates.length} szablonów:`);
    templates.forEach(t => {
      const materialsCount = Array.isArray(t.materials) ? t.materials.length : 0;
      const checklistCount = Array.isArray(t.checklist) ? t.checklist.length : 0;
      console.log(`      - ${t.template_name} (${t.template_category})`);
      console.log(`        Materiały: ${materialsCount}, Checklist: ${checklistCount}, Koszt: €${t.calculated_cost || 0}`);
    });
  } else {
    console.log('   ⚠️  Brak szablonów - zostaną utworzone przy migracji');
  }

  // Test 3: Sprawdź funkcje
  console.log('\n3️⃣ Sprawdzam funkcje pomocnicze...');
  
  try {
    // Test calculate_materials_cost
    const { data: costTest, error: costError } = await supabase
      .rpc('calculate_materials_cost', {
        materials_json: [
          { name: 'Test item', quantity: 5, price: 10.50 }
        ]
      });

    if (costError) {
      console.log(`   ❌ Funkcja calculate_materials_cost nie istnieje`);
      console.log(`      ${costError.message}`);
      allGood = false;
    } else {
      console.log(`   ✅ Funkcja calculate_materials_cost działa (test: €${costTest})`);
    }
  } catch (err) {
    console.log(`   ⚠️  Funkcje nie są dostępne przez RPC`);
  }

  // Test 4: Sprawdź widok task_templates
  console.log('\n4️⃣ Sprawdzam widok task_templates...');
  
  const { data: viewTest, error: viewError } = await supabase
    .from('task_templates')
    .select('*')
    .limit(1);

  if (viewError) {
    console.log(`   ❌ Widok task_templates nie istnieje`);
    console.log(`      ${viewError.message}`);
    allGood = false;
  } else {
    console.log('   ✅ Widok task_templates działa!');
  }

  // Podsumowanie
  console.log('\n' + '='.repeat(60));
  if (allGood) {
    console.log('🎉 Wszystko działa! System Tasks został rozbudowany!');
    console.log('\nDostępne funkcjonalności:');
    console.log('  📸 Foto-galeria w zadaniach');
    console.log('  🛠️  Lista materiałów z auto-kalkulacją');
    console.log('  ✅ Checklist kroków do wykonania');
    console.log('  💰 Auto-kalkulacja kosztów (materiały + robocizna)');
    console.log('  📋 System szablonów zadań');
    console.log('  ✍️  Podpis klienta');
  } else {
    console.log('⚠️  System wymaga migracji');
    console.log('\n📋 Wykonaj:');
    console.log('   1. Otwórz: https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql');
    console.log('   2. Skopiuj: database-migrations/20251030_2200_enhance_tasks_rapp_style.sql');
    console.log('   3. Wklej i kliknij RUN');
    console.log('   4. Uruchom ponownie: node scripts/verify-enhanced-tasks.mjs');
  }
  console.log('='.repeat(60) + '\n');

  return allGood;
}

verifyEnhancedTasks();
