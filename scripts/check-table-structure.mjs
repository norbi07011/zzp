#!/usr/bin/env node

// ============================================
// SCRIPT: Sprawdzenie struktury tabel
// Purpose: Analiza istniejących kolumn
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkTableStructure() {
  console.log('🔍 Sprawdzam strukturę istniejących tabel...\n');
  
  try {
    // Sprawdź wszystkie tabele komunikacyjne
    const tables = [
      'communication_projects',
      'project_members',
      'project_communication_rooms',
      'project_messages',
      'project_tasks',
      'task_comments',
      'task_attachments'
    ];
    
    for (const tableName of tables) {
      console.log(`📋 TABELA: ${tableName}`);
      
      // Test czy tabela istnieje
      const { data: testData, error: testError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log(`   ❌ Nie istnieje: ${testError.message}\n`);
        continue;
      }
      
      console.log(`   ✅ Istnieje`);
      
      // Sprawdź strukturę przez information_schema
      try {
        const { data: columns } = await supabase
          .rpc('exec', {
            sql: `
              SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
              FROM information_schema.columns 
              WHERE table_name = '${tableName}' 
                AND table_schema = 'public'
              ORDER BY ordinal_position;
            `
          });
        
        if (columns && columns.length > 0) {
          console.log('   Kolumny:');
          columns.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
            const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
            console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
          });
        }
      } catch (e) {
        // Jeśli nie można pobrać przez information_schema, sprawdź przez insert
        console.log('   (Nie można pobrać struktury przez information_schema)');
      }
      
      console.log('');
    }
    
    // Sprawdź także tabele użytkowników
    console.log('👥 TABELE UŻYTKOWNIKÓW:');
    const userTables = ['profiles', 'workers', 'employers', 'accountants'];
    
    for (const tableName of userTables) {
      const { data: testData, error: testError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log(`   ❌ ${tableName}: nie istnieje`);
      } else {
        console.log(`   ✅ ${tableName}: istnieje (${testData?.length || 0} rekordów testowych)`);
      }
    }
    
  } catch (e) {
    console.error('💥 Błąd sprawdzania struktury:', e.message);
  }
}

// Uruchom sprawdzenie
checkTableStructure();