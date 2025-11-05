#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8'

const supabase = createClient(supabaseUrl, serviceKey)

async function checkExistingTables() {
  console.log('🔍 Sprawdzanie które tabele już istnieją...\n')
  
  const expectedTables = [
    'projects',
    'project_invitations', 
    'project_permissions',
    'project_activity_log',
    'project_notifications'
  ]
  
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${tableName}: NIE ISTNIEJE (${error.message})`)
      } else {
        console.log(`✅ ${tableName}: ISTNIEJE (${data ? 'z danymi' : 'pusta'}, count: ${data?.length || 0})`)
      }
    } catch (err) {
      console.log(`❌ ${tableName}: BŁĄD (${err.message})`)
    }
  }
  
  console.log('\n📋 PODSUMOWANIE:')
  console.log('Jeśli tabele nie istnieją, musisz uruchomić migracje w Supabase Dashboard:')
  console.log('')
  console.log('🔗 Link: https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql')
  console.log('')
  console.log('📄 Pliki do uruchomienia:')
  console.log('  1. database-migrations/CREATE_COMPLETE_PROJECTS_SYSTEM.sql')
  console.log('  2. database-migrations/CREATE_ACTIVITY_LOG_NOTIFICATIONS.sql')
  console.log('')
  console.log('Po uruchomieniu migracji uruchom ponownie ten skrypt żeby sprawdzić wyniki')
}

checkExistingTables()