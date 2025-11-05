#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🚫 Testing problematic tables...\n');

// Test tables that were failing in console
const problematicTables = [
  'projects',
  'project_notifications', 
  'notifications',
  'project_chat_groups',
  'project_messages'
];

for (const table of problematicTables) {
  try {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: accessible (${data.length} rows)`);
    }
  } catch (e) {
    console.log(`💥 ${table}: ${e.message}`);
  }
}

console.log('\n💡 Quick fix: Temporarily disable RLS on problematic tables');
console.log('   Run: ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;');