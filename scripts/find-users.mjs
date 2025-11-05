import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findUsers() {
  console.log('🔍 Sprawdzam dostępnych użytkowników...\n');

  try {
    // Sprawdź profiles (zwykle tam są user ID)
    console.log('👤 Sprawdzam profiles:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .limit(5);

    if (profilesError) {
      console.log('❌ Błąd profiles:', profilesError.message);
    } else {
      if (profiles.length === 0) {
        console.log('⚠️  Brak profilei w bazie');
      } else {
        console.log('✅ Dostępne profile:');
        profiles.forEach(profile => {
          console.log(`  - ${profile.id}: ${profile.email || 'Brak email'} (${profile.full_name || 'Brak nazwy'}) [${profile.role || 'Brak roli'}]`);
        });
      }
    }

    // Sprawdź auth.users jeśli dostępne
    console.log('\n🔐 Próbuję sprawdzić auth.users...');
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.log('❌ Błąd auth.users:', authError.message);
      } else {
        console.log('✅ Auth users:', authUsers.users.length, 'użytkowników');
        if (authUsers.users.length > 0) {
          authUsers.users.slice(0, 3).forEach(user => {
            console.log(`  - ${user.id}: ${user.email}`);
          });
        }
      }
    } catch (authErr) {
      console.log('❌ Auth API niedostępne:', authErr.message);
    }

    // Sprawdź workers (może tam są user ID)
    console.log('\n👷 Sprawdzam workers:');
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('id, profile_id, first_name, last_name')
      .limit(3);

    if (workersError) {
      console.log('❌ Błąd workers:', workersError.message);
    } else {
      console.log('✅ Workers:', workers.length, 'pracowników');
      workers.forEach(worker => {
        console.log(`  - Worker ID: ${worker.id}, Profile ID: ${worker.profile_id}, Name: ${worker.first_name} ${worker.last_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
  }
}

findUsers();