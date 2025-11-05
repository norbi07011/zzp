#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8'

const supabase = createClient(supabaseUrl, serviceKey)

async function checkTeamTables() {
  console.log('🔍 Sprawdzanie czy istnieją tabele zespołowe...\n')
  
  const teamTables = [
    'projects',
    'project_invitations', 
    'project_permissions',
    'project_activity_log',
    'project_notifications'
  ]
  
  console.log('📋 ISTNIEJĄCE TABELE W BAZIE:')
  
  for (const tableName of teamTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1)
      
      if (error) {
        console.log(`❌ ${tableName}: NIE ISTNIEJE (${error.code})`)
      } else {
        console.log(`✅ ${tableName}: ISTNIEJE, rekordów: ${count}`)
        
        if (data && data.length > 0) {
          console.log(`   📝 Przykładowe kolumny: ${Object.keys(data[0]).join(', ')}`)
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName}: BŁĄD - ${err.message}`)
    }
  }
  
  console.log('\n🔍 Sprawdzanie czy projekt ma już inną strukturę...')
  
  // Sprawdź czy tabela projects ma starą strukturę (z title zamiast name)
  const { data: projectSample } = await supabase
    .from('projects')
    .select('*')
    .limit(1)
  
  if (projectSample && projectSample.length > 0) {
    const project = projectSample[0]
    console.log('\n📋 AKTUALNA STRUKTURA PROJECTS:')
    Object.keys(project).forEach(key => {
      console.log(`   ${key}: ${typeof project[key]}`)
    })
    
    if (project.title && !project.name) {
      console.log('\n⚠️  UWAGA: Tabela projects ma STARĄ strukturę!')
      console.log('   - Ma kolumnę: title (zamiast name)')
      console.log('   - Ma kolumnę: owner_id (zamiast created_by)')
      console.log('')
      console.log('💡 OPCJE:')
      console.log('   1. Dostosować kod do istniejącej struktury')
      console.log('   2. Uruchomić migrację aby dodać nowe kolumny')
      console.log('   3. Utworzyć nowe tabele z prefiksem (np. team_projects)')
    }
  }
}

checkTeamTables()