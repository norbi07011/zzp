#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8'

const supabase = createClient(supabaseUrl, serviceKey)

async function loadTestData() {
  console.log('🚀 Ładowanie danych testowych...\n')
  
  // 1. Utwórz projekt testowy
  console.log('📝 Tworzenie projektu testowego...')
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      name: 'ZZP Werkplaats Development',
      description: 'Główny projekt rozwoju platformy ZZP Werkplaats',
      status: 'active',
      created_by: '11111111-1111-1111-1111-111111111111' // Przykładowy UUID
    })
    .select()
    .single()
  
  if (projectError) {
    console.log(`❌ Błąd tworzenia projektu: ${projectError.message}`)
    return
  }
  
  console.log(`✅ Projekt utworzony: ${project.name} (ID: ${project.id})`)
  
  // 2. Dodaj uprawnienia właściciela
  console.log('🔑 Dodawanie uprawnień właściciela...')
  const { error: permError } = await supabase
    .from('project_permissions')
    .insert({
      project_id: project.id,
      user_id: project.created_by,
      permission_scope: 'admin',
      granted_by: project.created_by
    })
  
  if (permError) {
    console.log(`❌ Błąd uprawnień: ${permError.message}`)
  } else {
    console.log('✅ Uprawnienia administratora dodane')
  }
  
  // 3. Dodaj wpis do aktywności
  console.log('📊 Dodawanie wpisu aktywności...')
  const { error: activityError } = await supabase
    .from('project_activity_log')
    .insert({
      project_id: project.id,
      user_id: project.created_by,
      activity_type: 'project_created',
      details: { project_name: project.name, description: project.description }
    })
  
  if (activityError) {
    console.log(`❌ Błąd aktywności: ${activityError.message}`)
  } else {
    console.log('✅ Wpis aktywności dodany')
  }
  
  // 4. Sprawdź wyniki
  console.log('\n📋 FINALNE SPRAWDZENIE:')
  
  const { data: projects } = await supabase.from('projects').select('*')
  const { data: permissions } = await supabase.from('project_permissions').select('*')
  const { data: activities } = await supabase.from('project_activity_log').select('*')
  
  console.log(`✅ Projektów: ${projects?.length || 0}`)
  console.log(`✅ Uprawnień: ${permissions?.length || 0}`)
  console.log(`✅ Aktywności: ${activities?.length || 0}`)
  
  console.log('\n🎯 GOTOWE! Baza danych ma dane testowe i jest gotowa do testowania!')
}

loadTestData()