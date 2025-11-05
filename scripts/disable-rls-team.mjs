#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🚫 Disabling RLS on problematic tables...\n');

const problematicTables = [
  'project_notifications',
  'notifications'
];

for (const table of problematicTables) {
  try {
    // Use raw SQL query
    const { error } = await supabase.rpc('exec', {
      sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
    });

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: RLS disabled`);
    }
  } catch (e) {
    console.log(`💥 ${table}: ${e.message}`);
  }
}

console.log('\n🔧 Testing access after RLS changes...');

// Test table access
for (const table of problematicTables) {
  try {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: accessible`);
    }
  } catch (e) {
    console.log(`💥 ${table}: ${e.message}`);
  }
}