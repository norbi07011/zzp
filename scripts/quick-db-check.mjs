#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw'

console.log('🔧 Supabase URL:', supabaseUrl)
console.log('🔧 Using ANON key')

if (!supabaseKey) {
  console.error('❌ Brak kluczy Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function quickDbCheck() {
  console.log('🔍 Szybkie sprawdzenie bazy danych...\n')
  
  try {
    // Test connection
    console.log('1️⃣ Test połączenia z bazą danych...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (profilesError) {
      console.log('❌ Błąd połączenia z profiles:', profilesError.message)
    } else {
      console.log('✅ Połączenie z bazą OK, profiles accessible')
    }

    // Check key tables
    console.log('\n2️⃣ Sprawdzanie kluczowych tabel...')
    
    const tables = ['profiles', 'workers', 'employers', 'project_tasks', 'project_events']
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ ${table}: BŁĄD - ${error.message}`)
        } else {
          console.log(`✅ ${table}: ${count} rekordów`)
        }
      } catch (err) {
        console.log(`❌ ${table}: BŁĄD - ${err.message}`)
      }
    }

    console.log('\n3️⃣ Status uwierzytelniania...')
    const { data: user } = await supabase.auth.getUser()
    console.log('User status:', user?.user ? 'Zalogowany' : 'Niezalogowany')

  } catch (error) {
    console.error('❌ Krytyczny błąd:', error)
  }
}

quickDbCheck()