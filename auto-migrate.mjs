// Simplified automated migration - create tables directly
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

console.log('🚀 CHECKING IF TABLES CAN BE CREATED...');

async function testTableCreation() {
  try {
    console.log('1. Testing if companies table can be accessed...');
    
    // Try to access companies table
    const { data: companies, error: companiesError } = await supabaseAdmin
      .from('companies')
      .select('count');
    
    if (companiesError) {
      console.log('❌ Companies table missing:', companiesError.message);
      console.log('📋 MANUAL STEP REQUIRED:');
      console.log('   1. Go to https://supabase.com/dashboard');
      console.log('   2. Open SQL Editor');
      console.log('   3. Copy and run the content from quick-migration.sql');
    } else {
      console.log('✅ Companies table already exists');
    }

    // Test other tables
    const tablesToTest = ['appointments', 'test_slots', 'payments', 'system_settings'];
    
    for (const table of tablesToTest) {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: MISSING`);
      } else {
        console.log(`✅ ${table}: EXISTS`);
      }
    }
    
    console.log('\n📝 INSTRUCTIONS:');
    console.log('If any tables are missing, run the SQL from quick-migration.sql');
    console.log('in Supabase Dashboard → SQL Editor');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  }
}

testTableCreation();