#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8'

const supabase = createClient(supabaseUrl, serviceKey)

async function checkProjectsTableStructure() {
  console.log('🔍 Sprawdzanie struktury tabeli projects...\n')
  
  // Sprawdź kolumny tabeli projects
  const { data: columns, error } = await supabase.rpc('get_table_columns', {
    table_name: 'projects'
  })
  
  if (error) {
    console.log('❌ RPC nie działa, próbuję bezpośrednio...')
    
    // Spróbuj pobrać pojedynczy rekord z projects żeby zobaczyć strukturę
    const { data: sample, error: sampleError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)
    
    if (sampleError) {
      console.log(`❌ Błąd: ${sampleError.message}`)
      return
    }
    
    if (sample && sample.length > 0) {
      console.log('✅ Struktura tabeli projects (z przykładowych danych):')
      console.log(JSON.stringify(sample[0], null, 2))
    } else {
      console.log('📋 Tabela projects istnieje ale jest pusta')
      
      // Sprawdź strukturę używając INSERT z błędnymi danymi
      console.log('🔧 Testuję strukturę przez próbny INSERT...')
      const { error: insertError } = await supabase
        .from('projects')
        .insert({ test: 'value' })
      
      if (insertError) {
        console.log(`📋 Dostępne kolumny w projects (z błędu INSERT):`)
        console.log(insertError.message)
      }
    }
  } else {
    console.log('✅ Kolumny tabeli projects:')
    console.log(columns)
  }
}

checkProjectsTableStructure()