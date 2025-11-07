import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🧪 SYMULACJA LOGOWANIA EMPLOYER\n');
console.log('=' .repeat(80) + '\n');

const EMPLOYER_ID = '8a17942f-7209-469a-bafc-1a748d195eef';

// Dokładnie tak jak robi AuthContext
console.log('KROK 1: Pobierz profile...');
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', EMPLOYER_ID)
  .single();

if (profileError) {
  console.log(`❌ BŁĄD: ${profileError.message}`);
  process.exit(1);
}

console.log(`✅ Profile: ${profile.email} (${profile.role})\n`);

// Dokładnie tak jak robi employerService.getEmployerByUserId
console.log('KROK 2: Pobierz employer (jak employerService)...');
const { data: employer, error: employerError } = await supabase
  .from('employers')
  .select('*')
  .or(`user_id.eq.${EMPLOYER_ID},profile_id.eq.${EMPLOYER_ID}`)
  .maybeSingle();

if (employerError) {
  console.log(`❌ BŁĄD: ${employerError.message}`);
  process.exit(1);
}

if (!employer) {
  console.log('❌ BRAK employer record!');
  process.exit(1);
}

console.log(`✅ Employer: ${employer.company_name}\n`);

// Sprawdź subscription (jak w AuthContext linia 139-144)
console.log('KROK 3: Sprawdź subscription...');
const { data: empSub, error: empSubError } = await supabase
  .from('employers')
  .select('company_name, subscription_tier, subscription_status')
  .eq('profile_id', EMPLOYER_ID)
  .maybeSingle();

if (empSubError) {
  console.log(`❌ BŁĄD subscription: ${empSubError.message}`);
  process.exit(1);
}

console.log(`✅ Company: ${empSub.company_name}`);
console.log(`✅ Subscription: ${empSub.subscription_tier} (${empSub.subscription_status})\n`);

// Buduj User object
const user = {
  id: profile.id,
  email: profile.email,
  name: profile.full_name || 'User',
  fullName: profile.full_name || 'User',
  role: profile.role,
  companyName: empSub.company_name,
  subscription: {
    planId: empSub.subscription_tier === 'basic' ? 'client-basic' : 'client-pro',
    status: empSub.subscription_status === 'active' ? 'ACTIVE' : 'INACTIVE'
  }
};

console.log('KROK 4: User object created:\n');
console.log(JSON.stringify(user, null, 2));

console.log('\n' + '='.repeat(80));
console.log('\n🎉 SYMULACJA UDANA! Logowanie powinno działać!\n');
