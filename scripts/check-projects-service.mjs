#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔍 Checking projects table with service role...\n');

try {
  // Use service role to bypass RLS
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .limit(5);

  if (error) {
    console.log('❌ Service role error:', error.message);
  } else {
    console.log(`✅ Projects found: ${projects.length}`);
    if (projects.length > 0) {
      console.log('First project:', projects[0]);
    } else {
      console.log('📝 No projects in database - table is empty');
    }
  }

  // Check if table structure exists
  const { data: columns } = await supabase.rpc('get_table_columns', { table_name: 'projects' });
  console.log('\n📋 Table structure exists:', !!columns);

} catch (e) {
  console.log('💥 Critical error:', e.message);
}

console.log('\n💡 Possible solutions:');
console.log('1. Create some test projects');
console.log('2. Modify hook to handle empty state gracefully');
console.log('3. Fix RLS policies properly');