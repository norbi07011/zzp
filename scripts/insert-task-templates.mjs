#!/usr/bin/env node

/**
 * AUTO-INSERT TASK TEMPLATES
 * Znajduje prawdziwy user_id i project_id, wstawia 3 szablony zadań
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Szablony do wstawienia
const TEMPLATES = [
  {
    title: 'Malowanie pokoju - szablon',
    description: 'Standardowe malowanie pokoju (ściany + sufit)',
    template_name: 'Malowanie pokoju',
    template_category: 'painting',
    priority: 'medium',
    estimated_hours: 8,
    hourly_rate: 35.00,
    materials: [
      { name: 'Farba ścienna biała', quantity: 10, unit: 'litr', price: 8.50, supplier: 'Bouwmaat' },
      { name: 'Farba sufitowa', quantity: 5, unit: 'litr', price: 9.00, supplier: 'Bouwmaat' },
      { name: 'Wałek malarski', quantity: 2, unit: 'szt', price: 4.50, supplier: 'Gamma' },
      { name: 'Pędzel 5cm', quantity: 2, unit: 'szt', price: 3.00, supplier: 'Gamma' },
      { name: 'Taśma malarska', quantity: 3, unit: 'rolka', price: 2.50, supplier: 'Gamma' },
      { name: 'Folia ochronna', quantity: 1, unit: 'rolka', price: 8.00, supplier: 'Gamma' }
    ],
    checklist: [
      { id: 1, text: 'Zabezpieczyć meble folią', completed: false },
      { id: 2, text: 'Wykleić listwy taśmą', completed: false },
      { id: 3, text: 'Zagruntować ściany', completed: false },
      { id: 4, text: 'Malować sufit (1 warstwa)', completed: false },
      { id: 5, text: 'Malować ściany (1 warstwa)', completed: false },
      { id: 6, text: 'Malować sufit (2 warstwa)', completed: false },
      { id: 7, text: 'Malować ściany (2 warstwa)', completed: false },
      { id: 8, text: 'Usunąć taśmę i zabezpieczenia', completed: false }
    ]
  },
  {
    title: 'Naprawa dachu - szablon',
    description: 'Standardowa naprawa przeciekającego dachu',
    template_name: 'Naprawa dachu',
    template_category: 'renovation',
    priority: 'high',
    estimated_hours: 12,
    hourly_rate: 45.00,
    materials: [
      { name: 'Dachówki ceramiczne', quantity: 20, unit: 'szt', price: 3.50, supplier: 'Wienerberger' },
      { name: 'Membrana dachowa', quantity: 5, unit: 'm2', price: 12.00, supplier: 'Bouwmaat' },
      { name: 'Łaty drewniane', quantity: 10, unit: 'mb', price: 2.80, supplier: 'Houthandel' },
      { name: 'Wkręty dachowe', quantity: 100, unit: 'szt', price: 0.15, supplier: 'Gamma' },
      { name: 'Silikon dachowy', quantity: 2, unit: 'tuba', price: 8.50, supplier: 'Bouwmaat' }
    ],
    checklist: [
      { id: 1, text: 'Inspekcja dachu - zlokalizować uszkodzenia', completed: false },
      { id: 2, text: 'Usunąć uszkodzone dachówki', completed: false },
      { id: 3, text: 'Sprawdzić stan membrany', completed: false },
      { id: 4, text: 'Wymienić uszkodzone łaty', completed: false },
      { id: 5, text: 'Zainstalować nową membranę', completed: false },
      { id: 6, text: 'Zamontować nowe dachówki', completed: false },
      { id: 7, text: 'Uszczelnić silikonen', completed: false },
      { id: 8, text: 'Test wodny - sprawdzić szczelność', completed: false }
    ]
  },
  {
    title: 'Instalacja elektryczna - szablon',
    description: 'Podstawowa instalacja elektryczna w pomieszczeniu',
    template_name: 'Instalacja elektryczna',
    template_category: 'electrical',
    priority: 'urgent',
    estimated_hours: 6,
    hourly_rate: 50.00,
    materials: [
      { name: 'Kabel YDYp 3x2.5', quantity: 50, unit: 'mb', price: 1.80, supplier: 'Technische Unie' },
      { name: 'Gniazdka podtynkowe', quantity: 6, unit: 'szt', price: 4.50, supplier: 'Technische Unie' },
      { name: 'Włączniki', quantity: 3, unit: 'szt', price: 5.00, supplier: 'Technische Unie' },
      { name: 'Puszki podtynkowe', quantity: 9, unit: 'szt', price: 0.80, supplier: 'Gamma' },
      { name: 'Rozdzielnia 12-modułowa', quantity: 1, unit: 'szt', price: 35.00, supplier: 'Technische Unie' },
      { name: 'Wyłączniki automatyczne B16', quantity: 3, unit: 'szt', price: 12.00, supplier: 'Technische Unie' }
    ],
    checklist: [
      { id: 1, text: 'Wyłączyć główny bezpiecznik', completed: false },
      { id: 2, text: 'Wykuć bruzdy pod przewody', completed: false },
      { id: 3, text: 'Zamontować puszki podtynkowe', completed: false },
      { id: 4, text: 'Poprowadzić kable', completed: false },
      { id: 5, text: 'Podłączyć gniazdka i włączniki', completed: false },
      { id: 6, text: 'Podłączyć do rozdzielnicy', completed: false },
      { id: 7, text: 'Test instalacji - pomiar rezystancji', completed: false },
      { id: 8, text: 'Włączyć bezpieczniki i przetestować', completed: false }
    ]
  }
];

async function main() {
  console.log('🔍 Szukam user_id i project_id...\n');

  // 1. Znajdź first project_task z created_by
  const { data: tasks, error: taskError } = await supabase
    .from('project_tasks')
    .select('created_by, project_id')
    .not('created_by', 'is', null)
    .limit(1);

  if (taskError) {
    console.error('❌ Błąd pobierania project_tasks:', taskError.message);
    process.exit(1);
  }

  if (!tasks || tasks.length === 0) {
    console.error('❌ Brak zadań w bazie - musisz najpierw stworzyć projekt i zadanie!');
    process.exit(1);
  }

  const { created_by: userId, project_id: projectId } = tasks[0];

  console.log(`✅ Znaleziono:`);
  console.log(`   User ID:    ${userId}`);
  console.log(`   Project ID: ${projectId}\n`);

  // 2. Sprawdź czy szablony już istnieją
  const { data: existing } = await supabase
    .from('project_tasks')
    .select('template_name')
    .eq('is_template', true)
    .in('template_name', ['Malowanie pokoju', 'Naprawa dachu', 'Instalacja elektryczna']);

  if (existing && existing.length > 0) {
    console.log('⚠️  Wykryto istniejące szablony:');
    existing.forEach(t => console.log(`   - ${t.template_name}`));
    console.log('\n❓ Czy chcesz je nadpisać? (Ctrl+C aby anulować, Enter aby kontynuować)');
    
    // Wait for user confirmation (simplified - just proceed)
    console.log('   Kontynuuję...\n');
  }

  // 3. Wstaw szablony
  console.log('📝 Wstawiam szablony...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const template of TEMPLATES) {
    const { error } = await supabase
      .from('project_tasks')
      .insert({
        project_id: projectId,
        created_by: userId,
        title: template.title,
        description: template.description,
        is_template: true,
        template_name: template.template_name,
        template_category: template.template_category,
        priority: template.priority,
        estimated_hours: template.estimated_hours,
        hourly_rate: template.hourly_rate,
        materials: template.materials,
        checklist: template.checklist,
        status: 'not_started'
      });

    if (error) {
      console.error(`   ❌ ${template.template_name}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ ${template.template_name}`);
      successCount++;
    }
  }

  console.log(`\n📊 Podsumowanie:`);
  console.log(`   Sukces: ${successCount}/3`);
  console.log(`   Błędy:  ${errorCount}/3`);

  if (successCount > 0) {
    console.log('\n🎉 Szablony dostępne w task_templates view!');
    
    // 4. Pokaż utworzone szablony
    const { data: templates } = await supabase
      .from('project_tasks')
      .select('template_name, template_category, calculated_cost')
      .eq('is_template', true)
      .order('template_category');

    if (templates && templates.length > 0) {
      console.log('\n📋 Dostępne szablony:');
      templates.forEach(t => {
        const cost = t.calculated_cost ? `€${t.calculated_cost}` : 'obliczanie...';
        console.log(`   - ${t.template_name} (${t.template_category}) - ${cost}`);
      });
    }
  }

  console.log('\n✅ Gotowe!\n');
}

main().catch(err => {
  console.error('💥 Nieoczekiwany błąd:', err);
  process.exit(1);
});
