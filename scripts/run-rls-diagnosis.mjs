import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function diagnoseRLSPolicies() {
  console.log('🔍 DIAGNOSING RLS POLICIES FOR POSTS TABLE\n');

  try {
    const sql = readFileSync('./scripts/diagnose-rls-policies.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      console.log(`🔎 Query ${i + 1}:`);
      console.log(statement.substring(0, 100) + '...\n');
      
      try {
        const { data, error } = await supabase.rpc('exec_sql_query', { 
          query: statement 
        });
        
        if (error) {
          console.log('❌ Error:', error.message);
        } else {
          console.log('✅ Results:');
          if (Array.isArray(data)) {
            data.forEach((row, idx) => {
              console.log(`  ${idx + 1}.`, row);
            });
          } else {
            console.log('  ', data);
          }
        }
      } catch (err) {
        console.log('💥 Exception:', err.message);
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
  }
}

diagnoseRLSPolicies();