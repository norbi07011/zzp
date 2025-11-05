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

async function fixRLSPolicies() {
  console.log('🔧 FIXING RLS POLICIES FOR POSTS TABLE\n');

  try {
    const sql = readFileSync('./database-migrations/20251028_1400_fix_posts_rls_policies.sql', 'utf8');
    
    // Split into individual statements, filtering out comments and empty lines
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt.length > 10);
    
    console.log(`Executing ${statements.length} SQL statements...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      console.log(`📝 Statement ${i + 1}:`);
      console.log(statement.substring(0, 100) + '...\n');
      
      try {
        // Execute each statement separately
        const result = await supabase.rpc('sql', { 
          query: statement 
        });
        
        if (result.error) {
          console.log('❌ Error:', result.error.message);
          
          // Continue with other statements even if one fails
          if (!result.error.message.includes('does not exist')) {
            console.log('⚠️ Continuing with remaining statements...\n');
          }
        } else {
          console.log('✅ Success\n');
        }
      } catch (err) {
        console.log('💥 Exception:', err.message);
        console.log('⚠️ Continuing...\n');
      }
    }

    console.log('🎉 RLS Policy fix migration completed!');
    console.log('\nNext: Test creating posts from frontend');

  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
  }
}

fixRLSPolicies();