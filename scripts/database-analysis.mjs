#!/usr/bin/env node

// ============================================
// SCRIPT: Sprawdzenie struktury bazy danych
// Purpose: Diagnoza aktualnego stanu Supabase
// ============================================

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, serviceKey);

async function analyzeDatabase() {
  const results = {
    timestamp: new Date().toISOString(),
    communication_tables: {},
    user_tables: {},
    task_tables: {},
    event_tables: {},
    sample_data: {}
  };

  console.log('🔍 Analizuję strukturę bazy danych...');

  // Sprawdź tabele komunikacyjne
  const communicationTables = [
    'communication_projects',
    'project_members', 
    'project_communication_rooms',
    'project_messages',
    'building_notifications',
    'progress_reports',
    'safety_alerts'
  ];

  for (const tableName of communicationTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);
      
      if (!error) {
        results.communication_tables[tableName] = {
          exists: true,
          sample_count: data?.length || 0,
          sample_data: data?.slice(0, 2) || []
        };
        console.log(`✅ ${tableName}: ${data?.length || 0} rekordów`);
      } else {
        results.communication_tables[tableName] = {
          exists: false,
          error: error.message
        };
        console.log(`❌ ${tableName}: nie istnieje`);
      }
    } catch (e) {
      results.communication_tables[tableName] = {
        exists: false,
        error: e.message
      };
      console.log(`❌ ${tableName}: błąd - ${e.message}`);
    }
  }

  // Sprawdź tabele użytkowników
  const userTables = ['profiles', 'workers', 'employers', 'accountants'];
  
  for (const tableName of userTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(3);
      
      if (!error) {
        results.user_tables[tableName] = {
          exists: true,
          sample_count: data?.length || 0,
          sample_data: data?.slice(0, 1) || []
        };
        console.log(`✅ ${tableName}: ${data?.length || 0} rekordów`);
      } else {
        results.user_tables[tableName] = {
          exists: false,
          error: error.message
        };
        console.log(`❌ ${tableName}: nie istnieje`);
      }
    } catch (e) {
      results.user_tables[tableName] = {
        exists: false,
        error: e.message
      };
      console.log(`❌ ${tableName}: błąd - ${e.message}`);
    }
  }

  // Sprawdź czy istnieją tabele zadań/eventów
  try {
    const { data: allTables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    const taskTables = allTables?.filter(t => 
      t.table_name.includes('task') || 
      t.table_name.includes('todo') ||
      t.table_name.includes('assignment')
    ) || [];

    const eventTables = allTables?.filter(t => 
      t.table_name.includes('event') || 
      t.table_name.includes('calendar') ||
      t.table_name.includes('meeting')
    ) || [];

    results.task_tables = taskTables.map(t => t.table_name);
    results.event_tables = eventTables.map(t => t.table_name);

    console.log(`📋 Tabele zadań: ${taskTables.length}`);
    console.log(`📅 Tabele eventów: ${eventTables.length}`);

  } catch (e) {
    console.log(`❌ Błąd sprawdzania tabel: ${e.message}`);
  }

  // Zapisz wyniki
  if (!fs.existsSync('.tmp')) {
    fs.mkdirSync('.tmp');
  }

  fs.writeFileSync('.tmp/database-analysis.json', JSON.stringify(results, null, 2));
  
  console.log('\n📊 PODSUMOWANIE ANALIZY:');
  console.log(`- Tabele komunikacyjne: ${Object.keys(results.communication_tables).filter(k => results.communication_tables[k].exists).length}/7`);
  console.log(`- Tabele użytkowników: ${Object.keys(results.user_tables).filter(k => results.user_tables[k].exists).length}/4`);
  console.log(`- Tabele zadań: ${results.task_tables.length}`);
  console.log(`- Tabele eventów: ${results.event_tables.length}`);
  console.log('\n💾 Wyniki zapisane w .tmp/database-analysis.json');
  
  return results;
}

// Uruchom analizę
analyzeDatabase().catch(console.error);