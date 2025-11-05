#!/usr/bin/env node

// ============================================
// SCRIPT: Wykonanie migracji przez części
// Purpose: Uruchomienie SQL po kawałkach
// ============================================

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, serviceKey);

async function executeMigrationSteps() {
  console.log('🚀 Uruchamiam migrację po krokach...');
  
  try {
    // Krok 1: Utwórz ENUM dla statusów
    console.log('📝 Krok 1: Tworzę ENUM dla statusów zadań...');
    const { error: enumError } = await supabase.rpc('exec', { 
      sql: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
                CREATE TYPE task_status AS ENUM (
                    'not_started',
                    'in_progress', 
                    'review',
                    'completed',
                    'blocked',
                    'cancelled'
                );
            END IF;
        END $$;
      `
    });
    
    if (enumError) {
      console.error('❌ Błąd ENUM status:', enumError);
      return false;
    }
    
    // Krok 2: Utwórz ENUM dla priorytetów
    console.log('📝 Krok 2: Tworzę ENUM dla priorytetów...');
    const { error: priorityError } = await supabase.rpc('exec', { 
      sql: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
                CREATE TYPE task_priority AS ENUM (
                    'low',
                    'medium',
                    'high', 
                    'urgent'
                );
            END IF;
        END $$;
      `
    });
    
    if (priorityError) {
      console.error('❌ Błąd ENUM priority:', priorityError);
      return false;
    }
    
    console.log('✅ ENUM types utworzone!');
    
    // Krok 3: Sprawdź czy tabele komunikacyjne istnieją
    const { data: projects } = await supabase
      .from('communication_projects')
      .select('id')
      .limit(1);
    
    if (!projects || projects.length === 0) {
      console.log('🏗️ Tworzę przykładowy projekt...');
      
      // Pobierz użytkownika employer
      const { data: employer } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'employer')
        .limit(1);
        
      if (employer && employer.length > 0) {
        const { data: newProject } = await supabase
          .from('communication_projects')
          .insert({
            name: 'Demo Building Project',
            description: 'Projekt demonstracyjny dla systemu zadań',
            created_by: employer[0].id,
            building_address: 'Demo Address 123, Amsterdam'
          })
          .select()
          .single();
          
        if (newProject) {
          // Dodaj członków projektu
          await supabase
            .from('project_members')
            .insert({
              project_id: newProject.id,
              user_id: employer[0].id,
              role: 'employer'
            });
            
          console.log('✅ Projekt demonstracyjny utworzony!');
        }
      }
    }
    
    return true;
    
  } catch (e) {
    console.error('💥 Wyjątek podczas migracji:', e.message);
    return false;
  }
}

// Uruchom migrację
executeMigrationSteps()
  .then(success => {
    if (success) {
      console.log('\n🎯 PRZYGOTOWANIA ZAKOŃCZONE!');
      console.log('Kontynuuję z tabelami zadań...');
    } else {
      console.log('\n❌ Przygotowania nie powiodły się.');
    }
  })
  .catch(console.error);