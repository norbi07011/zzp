#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8'

const supabase = createClient(supabaseUrl, serviceKey)

async function executeInvitationsSystem() {
  console.log('🚀 Wdrażanie systemu zaproszeń i uprawnień...')
  
  try {
    // Czytaj plik SQL
    const sqlContent = fs.readFileSync('./database-migrations/CREATE_INVITATIONS_PERMISSIONS_SYSTEM.sql', 'utf8')
    
    console.log('📋 Wykonywanie migracji SQL...')
    
    // Wykonaj SQL (może być długi, więc podzielimy na części)
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_content: sqlContent 
    })
    
    if (error) {
      console.log('⚠️ RPC nie działa, próbuję bezpośrednio...')
      
      // Spróbuj wykonać bezpośrednio przez raw query
      const { data: directData, error: directError } = await supabase
        .from('pg_stat_activity')
        .select('*')
        .limit(1)
      
      if (directError) {
        console.error('❌ Błąd połączenia:', directError)
        return
      }
      
      console.log('✅ Połączenie OK, ale nie mogę wykonać kompleksowego SQL')
      console.log('📋 Musisz wykonać migrację ręcznie w Supabase Dashboard > SQL Editor')
      console.log('📁 Plik: ./database-migrations/CREATE_INVITATIONS_PERMISSIONS_SYSTEM.sql')
      return
    }
    
    console.log('✅ Migracja wykonana pomyślnie!')
    console.log('📊 Rezultat:', data)
    
    // Sprawdź czy tabele zostały utworzone
    console.log('\n🔍 Sprawdzanie utworzonych tabel...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['project_invitations', 'project_permissions'])
    
    if (tablesError) {
      console.error('❌ Błąd sprawdzania tabel:', tablesError)
    } else {
      console.log('✅ Tabele utworzone:', tables.map(t => t.table_name))
    }
    
  } catch (error) {
    console.error('❌ Błąd wykonania:', error)
  }
}

executeInvitationsSystem()