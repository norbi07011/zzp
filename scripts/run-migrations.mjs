#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8'

const supabase = createClient(supabaseUrl, serviceKey)

async function runMigrations() {
  console.log('🚀 Uruchamianie migracji bazy danych...\n')
  
  try {
    // 1. Sprawdź obecny stan
    console.log('1️⃣ Sprawdzanie obecnego stanu bazy...')
    
    const { data: currentTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['projects', 'project_invitations', 'project_permissions'])
    
    if (tablesError) {
      console.log('❌ Błąd sprawdzania tabel:', tablesError.message)
    } else {
      console.log('📊 Obecne tabele:', currentTables?.map(t => t.table_name) || [])
    }
    
    // 2. Sprawdź czy projects istnieje
    console.log('\n2️⃣ Sprawdzanie tabeli projects...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title')
      .limit(1)
    
    if (projectsError) {
      console.log('❌ Tabela projects nie istnieje lub niedostępna')
      console.log('🔧 Potrzeba uruchomić migrację CREATE_COMPLETE_PROJECTS_SYSTEM.sql')
      
      console.log('\n📋 RĘCZNE URUCHOMIENIE MIGRACJI:')
      console.log('1. Otwórz Supabase Dashboard: https://supabase.com/dashboard')
      console.log('2. Wybierz projekt: dtnotuyagygexmkyqtgb')
      console.log('3. Przejdź do SQL Editor')
      console.log('4. Skopiuj zawartość: database-migrations/CREATE_COMPLETE_PROJECTS_SYSTEM.sql')
      console.log('5. Wklej i uruchom')
      console.log('6. Powtórz dla: database-migrations/CREATE_ACTIVITY_LOG_NOTIFICATIONS.sql')
      
    } else {
      console.log('✅ Tabela projects istnieje, projektów:', projects?.length || 0)
      
      // 3. Sprawdź activity log
      console.log('\n3️⃣ Sprawdzanie tabeli activity_log...')
      const { data: activityLog, error: activityError } = await supabase
        .from('project_activity_log')
        .select('id')
        .limit(1)
      
      if (activityError) {
        console.log('❌ Tabela project_activity_log nie istnieje')
        console.log('🔧 Potrzeba uruchomić migrację CREATE_ACTIVITY_LOG_NOTIFICATIONS.sql')
      } else {
        console.log('✅ Tabela project_activity_log istnieje')
      }
    }
    
    // 4. Sprawdź ENUM types
    console.log('\n4️⃣ Sprawdzanie ENUM types...')
    const enumTypes = ['project_status', 'invitation_status', 'permission_scope', 'activity_type', 'notification_type']
    
    for (const enumType of enumTypes) {
      try {
        const { data, error } = await supabase.rpc('check_enum_exists', { enum_name: enumType })
        if (error) {
          console.log(`❓ ${enumType}: nie można sprawdzić`)
        } else {
          console.log(`✅ ${enumType}: sprawdzony`)
        }
      } catch (err) {
        console.log(`❓ ${enumType}: RPC nie dostępne`)
      }
    }
    
    console.log('\n🎯 NASTĘPNE KROKI:')
    console.log('Jeśli tabele nie istnieją, uruchom migracje ręcznie w Supabase Dashboard')
    console.log('Pliki do uruchomienia:')
    console.log('  1. database-migrations/CREATE_COMPLETE_PROJECTS_SYSTEM.sql')
    console.log('  2. database-migrations/CREATE_ACTIVITY_LOG_NOTIFICATIONS.sql')
    
  } catch (error) {
    console.error('❌ Błąd:', error.message)
  }
}

runMigrations()