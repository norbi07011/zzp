import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('👥 WERYFIKACJA UŻYTKOWNIKÓW\n');
console.log('=' .repeat(80) + '\n');

const users = [
  {
    name: 'EMPLOYER (lenavalentinaaa)',
    email: 'lenavalentinaaa@gmail.com',
    id: '8a17942f-7209-469a-bafc-1a748d195eef',
    role: 'employer'
  },
  {
    name: 'WORKER (lunarosexx4)',
    email: 'lunarosexx4@gmail.com',
    id: '7daf8488-988b-4a73-973d-ea2e0e63a5af',
    role: 'worker'
  },
  {
    name: 'ACCOUNTANT (accountant-oct28)',
    email: 'accountant-oct28@gmail.com',
    id: 'f945b1ea-ad0d-4859-b0b7-50364e5559e5',
    role: 'accountant'
  }
];

for (const user of users) {
  console.log(`\n🔍 ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   ID: ${user.id}\n`);
  
  // 1. Sprawdź profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role, full_name')
    .eq('id', user.id)
    .maybeSingle();
  
  if (profileError) {
    console.log(`   ❌ Profiles error: ${profileError.message}`);
  } else if (profile) {
    console.log(`   ✅ Profile: ${profile.full_name || profile.email} (${profile.role})`);
  } else {
    console.log(`   ❌ Profile NOT FOUND!`);
  }
  
  // 2. Sprawdź odpowiednią tabelę role
  if (user.role === 'employer') {
    const { data: emp, error: empError } = await supabase
      .from('employers')
      .select('id, company_name, subscription_tier, subscription_status, user_id, profile_id')
      .or(`user_id.eq.${user.id},profile_id.eq.${user.id}`)
      .maybeSingle();
    
    if (empError) {
      console.log(`   ❌ Employers error: ${empError.message}`);
    } else if (emp) {
      console.log(`   ✅ Employer: ${emp.company_name}`);
      console.log(`   ✅ Subscription: ${emp.subscription_tier} (${emp.subscription_status})`);
      console.log(`   ✅ Keys: user_id=${emp.user_id ? '✓' : '✗'}, profile_id=${emp.profile_id ? '✓' : '✗'}`);
    } else {
      console.log(`   ❌ Employer record NOT FOUND!`);
    }
  }
  
  if (user.role === 'worker') {
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('id, specialization, subscription_tier, subscription_status, user_id, profile_id')
      .or(`user_id.eq.${user.id},profile_id.eq.${user.id}`)
      .maybeSingle();
    
    if (workerError) {
      console.log(`   ❌ Workers error: ${workerError.message}`);
    } else if (worker) {
      console.log(`   ✅ Worker: ${worker.specialization || 'no specialization'}`);
      console.log(`   ✅ Subscription: ${worker.subscription_tier} (${worker.subscription_status})`);
      console.log(`   ✅ Keys: user_id=${worker.user_id ? '✓' : '✗'}, profile_id=${worker.profile_id ? '✓' : '✗'}`);
    } else {
      console.log(`   ❌ Worker record NOT FOUND!`);
    }
  }
  
  if (user.role === 'accountant') {
    const { data: acc, error: accError } = await supabase
      .from('accountants')
      .select('id, company_name, subscription_tier, subscription_status, profile_id')
      .eq('profile_id', user.id)
      .maybeSingle();
    
    if (accError) {
      console.log(`   ❌ Accountants error: ${accError.message}`);
    } else if (acc) {
      console.log(`   ✅ Accountant: ${acc.company_name || 'no company'}`);
      console.log(`   ✅ Subscription: ${acc.subscription_tier} (${acc.subscription_status})`);
      console.log(`   ✅ Keys: profile_id=${acc.profile_id ? '✓' : '✗'}`);
    } else {
      console.log(`   ❌ Accountant record NOT FOUND!`);
    }
  }
  
  console.log('\n' + '-'.repeat(80));
}

console.log('\n✅ WERYFIKACJA ZAKOŃCZONA!\n');
