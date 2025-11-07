import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔧 NAPRAWIAM BRAKUJĄCE REKORDY\n');

// ============================================================
// 1. ZNAJDŹ UŻYTKOWNIKÓW BEZ REKORDÓW
// ============================================================

const { data: profiles } = await supabase
  .from('profiles')
  .select('id, email, role, full_name');

for (const profile of profiles || []) {
  console.log(`\nSprawdzam: ${profile.email} (${profile.role})`);
  
  if (profile.role === 'employer') {
    const { data: emp } = await supabase
      .from('employers')
      .select('id')
      .or(`user_id.eq.${profile.id},profile_id.eq.${profile.id}`)
      .maybeSingle();
    
    if (!emp) {
      console.log('  ❌ BRAK rekordu employers - TWORZĘ...');
      
      const { error } = await supabase
        .from('employers')
        .insert({
          profile_id: profile.id,
          user_id: profile.id,
          company_name: 'Firma ' + profile.full_name,
          kvk_number: '00000000',
          email: profile.email,
          subscription_tier: 'basic',
          subscription_status: 'active',
        });
      
      if (error) {
        console.log(`  ❌ Błąd tworzenia: ${error.message}`);
      } else {
        console.log('  ✅ Rekord employers utworzony!');
      }
    } else {
      console.log('  ✅ Rekord employers istnieje');
    }
  }
  
  if (profile.role === 'worker') {
    const { data: worker } = await supabase
      .from('workers')
      .select('id')
      .or(`user_id.eq.${profile.id},profile_id.eq.${profile.id}`)
      .maybeSingle();
    
    if (!worker) {
      console.log('  ❌ BRAK rekordu workers - TWORZĘ...');
      
      const { error } = await supabase
        .from('workers')
        .insert({
          profile_id: profile.id,
          user_id: profile.id,
          kvk_number: '',
          specialization: 'construction',
          hourly_rate: 0,
          years_experience: 0,
          location_city: '',
          radius_km: 25,
          skills: [],
          certifications: [],
          rating: 0,
          rating_count: 0,
          verified: false,
          subscription_tier: 'basic',
          subscription_status: 'active',
        });
      
      if (error) {
        console.log(`  ❌ Błąd tworzenia: ${error.message}`);
      } else {
        console.log('  ✅ Rekord workers utworzony!');
      }
    } else {
      console.log('  ✅ Rekord workers istnieje');
    }
  }
  
  if (profile.role === 'accountant') {
    const { data: acc } = await supabase
      .from('accountants')
      .select('id')
      .eq('profile_id', profile.id)
      .maybeSingle();
    
    if (!acc) {
      console.log('  ❌ BRAK rekordu accountants - TWORZĘ...');
      
      const { error } = await supabase
        .from('accountants')
        .insert({
          profile_id: profile.id,
          full_name: profile.full_name,
          company_name: profile.full_name + ' Accounting',
          email: profile.email,
          kvk_number: '00000000',
          rating: 0,
          rating_count: 0,
          total_clients: 0,
          years_experience: 0,
          is_verified: false,
          is_active: true,
        });
      
      if (error) {
        console.log(`  ❌ Błąd tworzenia: ${error.message}`);
      } else {
        console.log('  ✅ Rekord accountants utworzony!');
      }
    } else {
      console.log('  ✅ Rekord accountants istnieje');
    }
  }
}

console.log('\n✅ NAPRAWIONE! Sprawdź ponownie diagnostykę.');
