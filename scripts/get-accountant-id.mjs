import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  console.log('Fetching accountant data...\n');

  const { data, error } = await supabase
    .from('accountants')
    .select('id, full_name, email, company_name')
    .eq('email', 'accountant-oct28@gmail.com')
    .single();
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } else {
    console.log('✅ Accountant found!');
    console.log('─────────────────────────────────────');
    console.log('ID:', data.id);
    console.log('Full Name:', data.full_name);
    console.log('Company:', data.company_name);
    console.log('Email:', data.email);
    console.log('─────────────────────────────────────');
    console.log('\n🔗 Profile URL:');
    console.log('http://localhost:3003/accountant/profile/' + data.id);
  }
})();
