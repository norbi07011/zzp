import fetch from 'node-fetch';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

// Simple SQL to create companies table
const createCompaniesSQL = `
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  subscription_plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
`;

console.log('🚀 ATTEMPTING HTTP API MIGRATION...');

async function httpMigration() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        sql: createCompaniesSQL
      })
    });

    const result = await response.text();
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Migration successful');
    } else {
      console.log('❌ Migration failed');
      console.log('Status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ HTTP Migration failed:', error.message);
    console.log('\n📋 MANUAL STEPS REQUIRED:');
    console.log('1. Go to: https://supabase.com/dashboard');  
    console.log('2. Navigate to: SQL Editor');
    console.log('3. Copy and paste content from: quick-migration.sql');
    console.log('4. Click "Run" to execute');
    console.log('5. Then run: node test-supabase.mjs to verify');
  }
}

httpMigration();