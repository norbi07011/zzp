#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔧 Fixing RLS recursion...\n');

try {
  // Execute the SQL fix
  const { error } = await supabase.rpc('exec_sql', {
    query: 'ALTER TABLE projects DISABLE ROW LEVEL SECURITY;'
  });

  if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log('✅ RLS disabled on projects table');
  }

  // Test if projects table is now accessible
  const { data: projects, error: testError } = await supabase
    .from('projects')
    .select('*')
    .limit(1);

  if (testError) {
    console.log('❌ Still error:', testError.message);
  } else {
    console.log('✅ Projects table is now accessible!');
  }

} catch (e) {
  console.log('💥 Script error:', e.message);
}