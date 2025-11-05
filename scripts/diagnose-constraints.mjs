#!/usr/bin/env node

// ============================================
// SCRIPT: Diagnoza constraint errors
// Purpose: Sprawdzenie dozwolonych wartości
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, serviceKey);

async function diagnoseConstraints() {
  console.log('🔍 Diagnoza constraint errors...\n');
  
  try {
    // Sprawdź constraint dla project_members.role
    console.log('📋 SPRAWDZAM CONSTRAINTS DLA project_members:');
    
    const { data: constraints } = await supabase
      .rpc('exec', {
        sql: `
          SELECT 
            conname as constraint_name,
            pg_get_constraintdef(oid) as constraint_definition
          FROM pg_constraint 
          WHERE conrelid = 'project_members'::regclass
            AND contype = 'c';
        `
      });
    
    if (constraints) {
      constraints.forEach(c => {
        console.log(`✅ ${c.constraint_name}:`);
        console.log(`   ${c.constraint_definition}\n`);
      });
    }
    
    // Sprawdź czy istnieją ENUM types dla ról
    console.log('🏷️ SPRAWDZAM ENUM TYPES DLA RÓL:');
    
    const { data: roleEnums } = await supabase
      .rpc('exec', {
        sql: `
          SELECT typname as enum_name, 
                 array_agg(enumlabel ORDER BY enumsortorder) as values
          FROM pg_type t 
          JOIN pg_enum e ON t.oid = e.enumtypid 
          WHERE typname LIKE '%role%'
          GROUP BY typname;
        `
      });
    
    if (roleEnums && roleEnums.length > 0) {
      roleEnums.forEach(e => {
        console.log(`✅ ${e.enum_name}: ${e.values.join(', ')}`);
      });
    } else {
      console.log('❌ Brak ENUM types dla ról');
    }
    
    // Sprawdź istniejące project_members jeśli jakieś są
    console.log('\n👥 ISTNIEJĄCY project_members:');
    
    const { data: existingMembers } = await supabase
      .from('project_members')
      .select('*')
      .limit(5);
    
    if (existingMembers && existingMembers.length > 0) {
      existingMembers.forEach(m => {
        console.log(`✅ Project: ${m.project_id?.substring(0,8)}... | User: ${m.user_id?.substring(0,8)}... | Role: ${m.role}`);
      });
    } else {
      console.log('❌ Brak istniejących członków projektów');
    }
    
    // Test wstawienia z różnymi rolami
    console.log('\n🧪 TESTUJĘ RÓŻNE ROLE:');
    
    const testRoles = ['employer', 'worker', 'supervisor', 'accountant', 'admin', 'member'];
    
    for (const role of testRoles) {
      console.log(`Testując rolę: ${role}`);
      // Tylko test - nie wykonujemy rzeczywistego wstawienia
    }
    
  } catch (e) {
    console.error('💥 Błąd diagnozy:', e.message);
  }
}

// Uruchom diagnozę
diagnoseConstraints();