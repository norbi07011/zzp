#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8'

const supabase = createClient(supabaseUrl, serviceKey)

async function createInvitationsSystemStep() {
  console.log('🔧 Tworzenie systemu zaproszeń - krok po kroku...')
  
  try {
    // Krok 1: Sprawdź czy projekty istnieją
    console.log('1️⃣ Sprawdzanie tabeli projects...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title')
      .limit(5)
    
    if (projectsError) {
      console.log('❌ Tabela projects nie istnieje:', projectsError.message)
      console.log('🔨 Tworzę podstawową tabelę projects...')
      
      // Utwórz tabelę projects jeśli nie istnieje
      const createProjectsSQL = `
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          owner_id UUID NOT NULL REFERENCES auth.users(id),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
      
      console.log('📋 Informacja: Potrzebuję utworzyć tabelę projects w Supabase Dashboard')
      console.log('SQL do wykonania:')
      console.log(createProjectsSQL)
      
    } else {
      console.log('✅ Tabela projects istnieje, projektów:', projects?.length || 0)
    }
    
    // Krok 2: Sprawdź czy można tworzyć tabele
    console.log('\n2️⃣ Sprawdzanie uprawnień do tworzenia tabel...')
    
    const { data: testInsert, error: insertError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (insertError) {
      console.log('❌ Problem z dostępem do bazy:', insertError.message)
    } else {
      console.log('✅ Dostęp do bazy OK')
    }
    
    console.log('\n📝 INSTRUKCJE RĘCZNE:')
    console.log('1. Przejdź do Supabase Dashboard > SQL Editor')
    console.log('2. Wykonaj plik: database-migrations/CREATE_INVITATIONS_PERMISSIONS_SYSTEM.sql')
    console.log('3. Uruchom ponownie ten skrypt żeby sprawdzić rezultat')
    
  } catch (error) {
    console.error('❌ Błąd:', error)
  }
}

createInvitationsSystemStep()