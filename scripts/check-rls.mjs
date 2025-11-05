#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔒 Checking RLS policies...\n');

const tables = [
  'projects',
  'project_notifications', 
  'notifications',
  'jobs',
  'messages'
];

for (const table of tables) {
  try {
    // Check if RLS is enabled
    const { data: rlsStatus } = await supabase.rpc('check_rls_status', { table_name: table }).single();
    console.log(`📋 ${table}: RLS ${rlsStatus ? 'ENABLED' : 'DISABLED'}`);
    
    // Try to query the table (should work with service role)
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`   ❌ Query error: ${error.message}`);
    } else {
      console.log(`   ✅ Service role can access (${data.length} rows checked)`);
    }
  } catch (e) {
    console.log(`❌ ${table}: ${e.message}`);
  }
}