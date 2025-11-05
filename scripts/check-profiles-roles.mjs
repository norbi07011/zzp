import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfiles() {
  console.log('🔍 Checking profiles in database...');
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, role');
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`✅ Found ${profiles.length} profiles:`);
  profiles.forEach(p => {
    console.log(`   ${p.email} - role: "${p.role}" - id: ${p.id}`);
  });
  
  // Check employers table
  const { data: employers, error: empError } = await supabase
    .from('employers')
    .select('profile_id, id');
  
  if (empError) {
    console.error('❌ Employers error:', empError);
  } else {
    console.log(`\n🏢 Found ${employers.length} employers:`);
    employers.forEach(e => {
      console.log(`   profile_id: ${e.profile_id} - employer_id: ${e.id}`);
    });
  }
}

checkProfiles();